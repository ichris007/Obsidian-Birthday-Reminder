import { ItemView, WorkspaceLeaf } from 'obsidian';
import BirthdayReminderPlugin from './main';
import { COLOR_SCHEMES } from './settings';
import type { BirthdayReminderSettings } from './settings';
import type { BirthdayData } from './birthdays';
import { collectBirthdays } from './birthdays';
import { getLocale, Language, LocaleMessages } from './locales';

export const VIEW_TYPE = 'birthday-reminder-view';

type SortMode = 'days' | 'name' | 'age';

/** 「更远的生日」默认折叠到这个数量，避免列表过长 */
const LATER_LIMIT = 20;

export class BirthdayReminderView extends ItemView {
  private readonly plugin: BirthdayReminderPlugin;
  container!: HTMLElement;
  refreshInterval: number = 0;
  currentMonthOffset: number = 0;

  private resizeObserver: ResizeObserver | null = null;
  private listEl: HTMLElement | null = null;
  private items: BirthdayData[] = [];
  private searchQuery = '';
  private sortMode: SortMode = 'days';
  private expandedLater = false;
  /** 本次搜索里「靠别名才命中」的条目：path → 命中的别名 */
  private aliasHits = new Map<string, string>();

  constructor(leaf: WorkspaceLeaf, plugin: BirthdayReminderPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  private get settings(): Readonly<BirthdayReminderSettings> {
    return this.plugin.settings;
  }

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    const locale = this.getLocale();
    return locale.viewTitle;
  }

  getIcon(): string {
    return 'cake';
  }

  private getLocale(): LocaleMessages {
    return getLocale(this.settings.language as Language);
  }

  async onOpen() {
    this.container = this.contentEl;
    this.container.empty();
    this.container.addClass('birthday-reminder-view');

    await this.render();

    // 添加窗口大小变化监听
    this.resizeObserver = new ResizeObserver(() => {
      void this.updateLayoutMode();
    });
    this.resizeObserver.observe(this.container);

    // 每小时刷新一次
    this.refreshInterval = window.setInterval(() => {
      void this.render();
    }, 3600000);
  }

  async onClose(): Promise<void> {
    if (this.refreshInterval) {
      window.clearInterval(this.refreshInterval);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  refresh(): void {
    this.render().catch((error) => {
      console.error('Failed to refresh birthday view:', error);
    });
  }

  // 检测是否为侧边栏模式（宽度小于450px认为是侧边栏）
  isSidebarMode(): boolean {
    const width = this.container?.clientWidth || 0;
    return width < 450;
  }

  // 获取当前模式的CSS类名
  getModeClass(): string {
    return this.isSidebarMode() ? 'birthday-sidebar-mode' : 'birthday-full-mode';
  }

  // 更新布局模式：只有「侧栏 ↔ 全窗」真正切换时才重渲染，拖分隔条不再连续重建
  async updateLayoutMode(): Promise<void> {
    const nextMode = this.getModeClass();
    if (this.container.hasClass(nextMode)) return;

    this.container.removeClass('birthday-sidebar-mode');
    this.container.removeClass('birthday-full-mode');
    this.container.addClass(nextMode);

    await this.render();
  }

  async render() {
    this.container.empty();

    // 添加模式类
    this.container.addClass('birthday-reminder-view');
    this.container.addClass(this.getModeClass());
    this.applyColorScheme();

    const settings = this.settings;
    const locale = this.getLocale();

    // 全库扫描一次，统计、列表、日历共用同一份数据
    this.items = collectBirthdays(this.app, settings, this.plugin.birthdaySnapshots);

    if (settings.showStatistics) {
      const todayCount = this.items.filter(item => item.daysRemaining === 0).length;
      const weekCount = this.items.filter(item => item.daysRemaining > 0 && item.daysRemaining <= 7).length;
      const monthCount = this.items.filter(item => item.daysRemaining > 7 && item.daysRemaining <= 30).length;
      this.renderStatistics(todayCount, weekCount, monthCount, this.items.length);
    }

    this.renderControls(locale);

    this.listEl = this.container.createDiv({ cls: 'birthday-list' });
    this.renderList();

    // 日历视图
    if (settings.enableCalendar) {
      this.renderCalendar(this.items, settings.visibleMonths);
    }

    if (this.items.length === 0) {
      this.renderEmptyState(locale, settings);
    }
  }

  /** 应用配色变量；非默认配色在暗色主题下由 CSS 提亮 */
  private applyColorScheme(): void {
    const settings = this.settings;
    const scheme = COLOR_SCHEMES[settings.colorScheme] ?? COLOR_SCHEMES.default;

    // 只写 -base，派生变量交给 styles.css，暗色主题才能安全地做提亮
    this.container.style.setProperty('--birthday-primary-base', scheme.primary);
    this.container.style.setProperty('--birthday-accent-base', scheme.accent);
    this.container.style.setProperty('--birthday-success', scheme.success);
    this.container.toggleClass('birthday-scheme-custom', settings.colorScheme !== 'default');
  }

  private renderControls(locale: LocaleMessages): void {
    const isSidebar = this.isSidebarMode();
    const controls = this.container.createDiv({ cls: 'birthday-controls' });
    if (isSidebar) controls.addClass('birthday-controls-compact');

    const searchWrap = controls.createDiv({ cls: 'birthday-search-wrap' });
    const search = searchWrap.createEl('input', { cls: 'birthday-search' });
    // 用 text 而不是 search：移动端 WebKit 会给 type=search 加一个原生清除按钮，
    // 和下面自绘的 × 叠在一起会变成两个叉
    search.type = 'text';
    search.placeholder = locale.searchPlaceholder;
    search.value = this.searchQuery;

    const clear = searchWrap.createEl('button', {
      cls: 'birthday-search-clear',
      attr: { type: 'button', 'aria-label': locale.clearSearch, title: locale.clearSearch },
    });
    clear.setText('×');

    const syncClear = (): void => {
      clear.toggleClass('is-visible', this.searchQuery.length > 0);
    };
    syncClear();

    search.addEventListener('input', () => {
      this.searchQuery = search.value;
      syncClear();
      this.renderList();
    });

    clear.addEventListener('click', () => {
      this.searchQuery = '';
      search.value = '';
      syncClear();
      this.renderList();
      // 清空后把焦点还给输入框，方便接着输入
      search.focus();
    });

    const sort = controls.createEl('select', { cls: 'birthday-sort' });
    const options: Array<[SortMode, string]> = [
      ['days', locale.sortByDays],
      ['name', locale.sortByName],
      ['age', locale.sortByAge],
    ];
    for (const [value, label] of options) {
      const option = sort.createEl('option', { text: label });
      option.value = value;
    }
    sort.value = this.sortMode;
    sort.addEventListener('change', () => {
      this.sortMode = sort.value as SortMode;
      this.renderList();
    });
  }

  /** 姓名或任一别名包含关键词即命中；靠别名命中的记进 aliasHits 供列表标注 */
  private matchesQuery(item: BirthdayData, query: string): boolean {
    if (item.name.toLowerCase().includes(query)) return true;
    for (const alias of item.aliases) {
      if (alias.toLowerCase().includes(query)) {
        this.aliasHits.set(item.path, alias);
        return true;
      }
    }
    return false;
  }

  private sortItems(items: BirthdayData[]): BirthdayData[] {
    const sorted = [...items];
    if (this.sortMode === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name, this.settings.language));
    } else if (this.sortMode === 'age') {
      sorted.sort((a, b) => b.age - a.age || a.daysRemaining - b.daysRemaining);
    } else {
      sorted.sort((a, b) => a.daysRemaining - b.daysRemaining);
    }
    return sorted;
  }

  private renderList(): void {
    const listEl = this.listEl;
    if (!listEl) return;
    listEl.empty();

    const locale = this.getLocale();
    const query = this.searchQuery.trim().toLowerCase();
    // 每次重画都重建命中表，避免上一次搜索的别名提示残留
    this.aliasHits.clear();
    const visible = query
      ? this.items.filter(item => this.matchesQuery(item, query))
      : this.items;

    if (visible.length === 0) {
      if (query) listEl.createDiv({ cls: 'birthday-empty', text: locale.noMatch });
      return;
    }

    const sorted = this.sortItems(visible);
    const todayBirthdays = sorted.filter(item => item.daysRemaining === 0);
    const upcomingWeek = sorted.filter(item => item.daysRemaining > 0 && item.daysRemaining <= 7);
    const upcomingMonth = sorted.filter(item => item.daysRemaining > 7 && item.daysRemaining <= 30);
    const later = sorted.filter(item => item.daysRemaining > 30);

    if (todayBirthdays.length > 0) this.renderSection(listEl, 'today', todayBirthdays);
    if (upcomingWeek.length > 0) this.renderSection(listEl, 'week', upcomingWeek);
    if (upcomingMonth.length > 0) this.renderSection(listEl, 'month', upcomingMonth);

    if (later.length > 0) {
      const shown = this.expandedLater ? later : later.slice(0, LATER_LIMIT);
      this.renderSection(listEl, 'later', shown);
      if (later.length > LATER_LIMIT) this.renderLaterToggle(listEl, later.length);
    }
  }

  private renderLaterToggle(parent: HTMLElement, total: number): void {
    const locale = this.getLocale();
    const label = this.expandedLater
      ? locale.collapseLater
      : locale.showAllLater.replace('{count}', String(total));
    const button = parent.createEl('button', { cls: 'birthday-more-button', text: label });
    button.addEventListener('click', () => {
      this.expandedLater = !this.expandedLater;
      this.renderList();
    });
  }

  private renderEmptyState(locale: LocaleMessages, settings: Readonly<BirthdayReminderSettings>): void {
    const emptyEl = this.container.createDiv({ cls: 'birthday-empty' });
    let message = '';
    if (settings.targetPath) {
      message = locale.emptyMessageWithPropertyAndPath
        .replace('{path}', settings.targetPath)
        .replace('{property}', settings.birthdayProperty);
    } else {
      message = locale.emptyMessageWithProperty
        .replace('{property}', settings.birthdayProperty);
    }
    emptyEl.setText(message);
  }

  renderStatistics(today: number, week: number, month: number, total: number) {
    const locale = this.getLocale();
    const statsEl = this.container.createDiv({ cls: 'birthday-stats' });
    const isSidebar = this.isSidebarMode();
    if (isSidebar) {
      statsEl.addClass('birthday-stats-compact');
    }

    const stats = [
      { number: total, label: isSidebar ? locale.statsTotalShort : locale.statsTotal },
      { number: today, label: isSidebar ? locale.statsTodayShort : locale.statsToday, accent: true },
      { number: week, label: isSidebar ? locale.statsWeekShort : locale.statsWeek },
      { number: month, label: isSidebar ? locale.statsMonthShort : locale.statsMonth }
    ];

    for (const stat of stats) {
      const card = statsEl.createDiv({ cls: 'birthday-stat-card' });
      if (isSidebar) {
        card.addClass('birthday-stat-card-compact');
      }
      const numSpan = card.createSpan({ cls: 'birthday-stat-number' });
      if (stat.accent) {
        numSpan.addClass('birthday-stat-number-accent');
      }
      numSpan.setText(String(stat.number));
      const labelSpan = card.createDiv({ cls: 'birthday-stat-label' });
      labelSpan.setText(stat.label);
    }
  }

  renderSection(parent: HTMLElement, sectionKey: string, items: BirthdayData[]) {
    const locale = this.getLocale();
    const section = parent.createDiv({ cls: 'birthday-section' });
    const isSidebar = this.isSidebarMode();
    const isEnglish = this.settings.language === 'en-us';

    // 根据 sectionKey 获取标题文本
    let titleText = '';
    switch (sectionKey) {
      case 'today':
        titleText = locale.sectionToday;
        break;
      case 'week':
        titleText = locale.sectionWeek;
        break;
      case 'month':
        titleText = locale.sectionMonth;
        break;
      case 'later':
        titleText = locale.sectionLater;
        break;
      default:
        titleText = '';
    }

    if (isSidebar) {
      section.addClass('birthday-section-compact');
    }

    const titleEl = section.createEl('h2', { cls: 'birthday-section-title', text: titleText });
    if (isSidebar) {
      titleEl.addClass('birthday-section-title-compact');
    }

    for (const item of items) {
      const itemEl = section.createDiv({ cls: 'birthday-item' });
      if (isSidebar) {
        itemEl.addClass('birthday-item-compact');
      }

      if (item.isToday && this.settings.highlightToday) {
        itemEl.addClass('birthday-item-today');
      } else if (item.daysRemaining <= 7) {
        itemEl.addClass('birthday-item-warning');
      }

      if (item.calendar === 'lunar') {
        itemEl.addClass('birthday-item-lunar');
      }

      itemEl.addEventListener('click', () => {
        void this.app.workspace.openLinkText(item.path, '', false);
      });

      const content = itemEl.createDiv({ cls: 'birthday-item-content' });

      if (isSidebar) {
        content.addClass('birthday-item-content-compact');
      } else {
        content.addClass('birthday-item-content-full');
      }

      // 姓名区域
      const nameDiv = content.createDiv({ cls: 'birthday-name' });
      nameDiv.createSpan({ text: item.name });
      if (item.calendar === 'lunar') {
        nameDiv.createSpan({ cls: 'birthday-badge', text: locale.lunarPrefix });
      }
      // 只按别名命中时标出是哪个别名，避免「这人我搜不到却出现在结果里」
      const aliasHit = this.aliasHits.get(item.path);
      if (aliasHit) {
        nameDiv.createSpan({
          cls: 'birthday-badge birthday-badge-alias',
          text: locale.aliasHint.replace('{alias}', aliasHit),
        });
      }
      if (isSidebar) {
        nameDiv.addClass('birthday-name-compact');
      } else {
        nameDiv.addClass('birthday-name-full');
      }

      if (item.animal || item.zodiac || item.lunarInfo) {
        const infoDiv = nameDiv.createDiv({ cls: 'birthday-info' });
        const infoParts = [];
        if (item.animal) infoParts.push(item.animal);
        if (item.zodiac) infoParts.push(item.zodiac);
        if (item.lunarInfo) {
          infoParts.push(isEnglish ? `${locale.lunarPrefix} ${item.lunarInfo}` : `${locale.lunarPrefix}${item.lunarInfo}`);
        }
        infoDiv.setText(infoParts.join(' · '));
      }

      // 农历生日的原始日期要标出来，避免和公历混淆
      const birthdayText = item.calendar === 'lunar'
        ? `${locale.lunarPrefix} ${item.birthday}`
        : item.birthday;
      const ageText = isEnglish ? `${item.age} ${locale.ageUnitEn}` : `${item.age}${locale.ageUnit}`;

      if (!isSidebar) {
        // 全窗口模式：创建独立元素
        content.createSpan({ cls: 'birthday-date', text: `${locale.birthdayLabel}：${birthdayText}` });
        content.createSpan({ cls: 'birthday-next', text: `${locale.nextBirthdayLabel}：${item.nextBirthday}` });

        const daysSpan = content.createSpan({ cls: 'birthday-days' });
        if (item.daysRemaining <= 7) {
          daysSpan.addClass('birthday-days-urgent');
        }
        daysSpan.setText(item.isToday ? locale.todayBirthday : `${item.daysRemaining}${locale.daysRemaining}`);

        content.createSpan({ cls: 'birthday-age', text: ageText });
      } else {
        // 侧边栏模式：创建行容器
        const dateRow = content.createDiv({ cls: 'birthday-date-row' });
        dateRow.createSpan({ cls: 'birthday-date', text: `${locale.birthdayLabel}：${birthdayText}` });
        dateRow.createSpan({ cls: 'birthday-next', text: `${locale.nextBirthdayLabel}：${item.nextBirthday}` });

        // 创建天数和年龄的行容器
        const daysAgeRow = content.createDiv({ cls: 'birthday-days-age-row' });
        const daysSpan = daysAgeRow.createSpan({ cls: 'birthday-days' });
        if (item.daysRemaining <= 7) {
          daysSpan.addClass('birthday-days-urgent');
        }
        daysSpan.setText(item.isToday ? locale.todayBirthday : `${item.daysRemaining}${locale.daysRemaining}`);

        daysAgeRow.createSpan({ cls: 'birthday-age', text: ageText });
      }
    }
  }

  renderCalendar(birthdayData: BirthdayData[], visibleMonths: number) {
    const locale = this.getLocale();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isSidebar = this.isSidebarMode();

    // 创建按月索引的 Map
    const monthDayMap = new Map<string, BirthdayData[]>();
    for (const item of birthdayData) {
      const key = item.monthDay;
      if (!monthDayMap.has(key)) monthDayMap.set(key, []);
      monthDayMap.get(key)!.push(item);
    }

    const calendarEl = this.container.createDiv({ cls: 'birthday-calendar' });

    // 导航栏
    const navEl = calendarEl.createDiv({ cls: 'birthday-calendar-nav' });
    const titleEl = navEl.createEl('h2', { cls: 'birthday-calendar-title', text: locale.sectionCalendar });
    if (isSidebar) {
      titleEl.addClass('birthday-calendar-title-compact');
    }

    const navButtons = navEl.createDiv({ cls: 'birthday-calendar-nav-buttons' });
    const prevBtn = navButtons.createEl('button', { cls: 'birthday-button', text: locale.prevMonth });
    const todayBtn = navButtons.createEl('button', { cls: 'birthday-button', text: locale.todayButton });
    const nextBtn = navButtons.createEl('button', { cls: 'birthday-button', text: locale.nextMonth });

    if (isSidebar) {
      prevBtn.addClass('birthday-button-compact');
      todayBtn.addClass('birthday-button-compact');
      nextBtn.addClass('birthday-button-compact');
    }

    let currentOffset = this.currentMonthOffset;

    const renderCalendarMonths = () => {
      // 清除现有月份内容
      const existingMonths = calendarEl.querySelectorAll('.birthday-calendar-month');
      existingMonths.forEach(el => el.remove());

      const startDate = new Date(today.getFullYear(), today.getMonth() + currentOffset, 1);

      for (let m = 0; m < visibleMonths; m++) {
        const targetDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1);
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay();

        const monthEl = calendarEl.createDiv({ cls: 'birthday-calendar-month' });
        const monthTitle = monthEl.createEl('h3', {
          cls: 'birthday-calendar-month-title',
          text: locale.monthTitlePattern
            .replace('{year}', String(year))
            .replace('{month}', String(month + 1))
        });
        if (isSidebar) {
          monthTitle.addClass('birthday-calendar-month-title-compact');
        }

        const gridEl = monthEl.createDiv({ cls: 'birthday-calendar-grid' });

        // 星期标题
        const weekdays = locale.calendarWeekdays;
        weekdays.forEach(weekday => {
          const weekdayEl = gridEl.createDiv({ cls: 'birthday-calendar-weekday', text: weekday });
          if (isSidebar) {
            weekdayEl.addClass('birthday-calendar-weekday-compact');
          }
        });

        // 获取上个月的最后一天
        const prevMonthDate = new Date(year, month, 0);
        const prevMonth = prevMonthDate.getMonth();
        const prevMonthDays = prevMonthDate.getDate();

        // 填充月初空白
        for (let i = 0; i < firstDayOfWeek; i++) {
          const dayNum = prevMonthDays - firstDayOfWeek + i + 1;
          const monthDayKey = `${prevMonth + 1}-${dayNum}`;
          const birthdays = monthDayMap.get(monthDayKey) || [];

          const dayEl = gridEl.createDiv({ cls: 'birthday-calendar-day birthday-calendar-day-other' });
          if (isSidebar) {
            dayEl.addClass('birthday-calendar-day-other-compact');
          }

          const dayNumEl = dayEl.createDiv({ cls: 'birthday-calendar-day-number' });
          dayNumEl.setText(String(dayNum));
          dayNumEl.addClass('birthday-calendar-day-number-other');
          if (isSidebar) {
            dayNumEl.addClass('birthday-calendar-day-number-compact');
          }

          const maxShow = isSidebar ? 1 : 2;
          for (const b of birthdays.slice(0, maxShow)) {
            const birthdayEl = dayEl.createDiv({ cls: 'birthday-calendar-day-birthday' });
            birthdayEl.setText(`🎂 ${b.name}`);
            birthdayEl.addClass('birthday-calendar-day-birthday-other');
            if (isSidebar) {
              birthdayEl.addClass('birthday-calendar-day-birthday-compact');
            }
            birthdayEl.addEventListener('click', (e) => {
              e.stopPropagation();
              void this.app.workspace.openLinkText(b.path, '', false);
            });
          }
        }

        // 填充当前月份日期
        for (let d = 1; d <= daysInMonth; d++) {
          const monthDayKey = `${month + 1}-${d}`;
          const birthdays = monthDayMap.get(monthDayKey) || [];
          const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

          const dayEl = gridEl.createDiv({ cls: 'birthday-calendar-day' });
          if (isSidebar) {
            dayEl.addClass('birthday-calendar-day-compact');
          }
          if (isToday) dayEl.addClass('birthday-calendar-day-today');

          const dayNumEl = dayEl.createDiv({ cls: 'birthday-calendar-day-number' });
          dayNumEl.setText(String(d));
          if (isSidebar) {
            dayNumEl.addClass('birthday-calendar-day-number-compact');
          }
          if (birthdays.length > 0) {
            dayNumEl.addClass('birthday-calendar-day-number-has-birthday');
          }

          const maxShow = isSidebar ? 2 : 3;
          for (const b of birthdays.slice(0, maxShow)) {
            const birthdayEl = dayEl.createDiv({ cls: 'birthday-calendar-day-birthday' });
            birthdayEl.setText(`🎂 ${b.name}`);
            birthdayEl.addEventListener('click', (e) => {
              e.stopPropagation();
              void this.app.workspace.openLinkText(b.path, '', false);
            });
          }

          if (birthdays.length > maxShow) {
            const moreEl = dayEl.createDiv({ cls: 'birthday-calendar-day-more' });
            moreEl.setText(`+${birthdays.length - maxShow}`);
            moreEl.title = birthdays.slice(maxShow).map(b => b.name).join(', ');
          }
        }

        // 计算需要填充的下个月天数
        const totalCells = firstDayOfWeek + daysInMonth;
        const remainingCells = Math.ceil(totalCells / 7) * 7 - totalCells;

        // 填充下个月日期
        if (remainingCells > 0) {
          const nextMonthDate = new Date(year, month + 1, 1);
          const nextMonth = nextMonthDate.getMonth();

          for (let d = 1; d <= remainingCells; d++) {
            const monthDayKey = `${nextMonth + 1}-${d}`;
            const birthdays = monthDayMap.get(monthDayKey) || [];

            const dayEl = gridEl.createDiv({ cls: 'birthday-calendar-day birthday-calendar-day-other' });
            if (isSidebar) {
              dayEl.addClass('birthday-calendar-day-other-compact');
            }

            const dayNumEl = dayEl.createDiv({ cls: 'birthday-calendar-day-number' });
            dayNumEl.setText(String(d));
            dayNumEl.addClass('birthday-calendar-day-number-other');
            if (isSidebar) {
              dayNumEl.addClass('birthday-calendar-day-number-compact');
            }

            const maxShow = isSidebar ? 1 : 2;
            for (const b of birthdays.slice(0, maxShow)) {
              const birthdayEl = dayEl.createDiv({ cls: 'birthday-calendar-day-birthday' });
              birthdayEl.setText(`🎂 ${b.name}`);
              birthdayEl.addClass('birthday-calendar-day-birthday-other');
              if (isSidebar) {
                birthdayEl.addClass('birthday-calendar-day-birthday-compact');
              }
              birthdayEl.addEventListener('click', (e) => {
                e.stopPropagation();
                void this.app.workspace.openLinkText(b.path, '', false);
              });
            }
          }
        }
      }
    };

    renderCalendarMonths();

    // 导航事件
    prevBtn.addEventListener('click', () => {
      currentOffset -= visibleMonths;
      this.currentMonthOffset = currentOffset;
      renderCalendarMonths();
    });

    todayBtn.addEventListener('click', () => {
      currentOffset = 0;
      this.currentMonthOffset = 0;
      renderCalendarMonths();
    });

    nextBtn.addEventListener('click', () => {
      currentOffset += visibleMonths;
      this.currentMonthOffset = currentOffset;
      renderCalendarMonths();
    });
  }
}
