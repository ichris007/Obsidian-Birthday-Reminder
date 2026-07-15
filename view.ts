import { ItemView, WorkspaceLeaf } from 'obsidian';
import BirthdayReminderPlugin from './main';
import { COLOR_SCHEMES } from './settings';
import { solarToLunar, getAnimal, getZodiac, getGanZhi } from './lunar';
import { getLocale, Language, LocaleMessages } from './locales';

export const VIEW_TYPE = 'birthday-reminder-view';

interface BirthdayData {
  name: string;
  path: string;
  birthday: string;
  nextBirthday: string;
  daysRemaining: number;
  age: number;
  lunarInfo: string | null;
  animal: string | null;
  zodiac: string | null;
  ganZhi: string | null;
  isToday: boolean;
  monthDay: string;
  birthMonth: number;
  birthDay: number;
}

export class BirthdayReminderView extends ItemView {
  plugin: BirthdayReminderPlugin;
  container: HTMLElement;
  refreshInterval: number;
  currentMonthOffset: number = 0;
  private resizeObserver: ResizeObserver | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: BirthdayReminderPlugin) {
    super(leaf);
    this.plugin = plugin;
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
    return getLocale(this.plugin.settings.language as Language);
  }

  async onOpen() {
    this.container = this.contentEl;
    this.container.empty();
    this.container.addClass('birthday-reminder-view');
    
    await this.render();
    
    // 添加窗口大小变化监听
    this.resizeObserver = new ResizeObserver(() => {
      this.updateLayoutMode();
    });
    this.resizeObserver.observe(this.container);
    
    // 每小时刷新一次
    this.refreshInterval = window.setInterval(() => this.render(), 3600000);
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
  
  // 更新布局模式
  updateLayoutMode() {
    // 移除旧的模式类
    this.container.removeClass('birthday-sidebar-mode');
    this.container.removeClass('birthday-full-mode');
    // 添加新的模式类
    this.container.addClass(this.getModeClass());
    
    // 重新渲染以适应新布局
    this.render();
  }

  async render() {
    this.container.empty();
    
    // 添加模式类
    this.container.addClass('birthday-reminder-view');
    this.container.addClass(this.getModeClass());
    
    const settings = this.plugin.settings;
    const scheme = COLOR_SCHEMES[settings.colorScheme];
    const locale = this.getLocale();
    const birthdayProp = settings.birthdayProperty;
    const currentLanguage = settings.language;
    const isEnglish = currentLanguage === 'en-us';
    
    // 应用配色 CSS 变量
    this.container.style.setProperty('--birthday-primary', scheme.primary);
    this.container.style.setProperty('--birthday-secondary', scheme.secondary);
    this.container.style.setProperty('--birthday-accent', scheme.accent);
    this.container.style.setProperty('--birthday-warning', scheme.warning);
    this.container.style.setProperty('--birthday-success', scheme.success);
    
    // 获取所有有 birthday 属性的文件
    const files = this.app.vault.getMarkdownFiles();
    const birthdayData: BirthdayData[] = [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const file of files) {
      const cache = this.app.metadataCache.getFileCache(file);
      if (!cache) continue;

      const frontmatter = cache.frontmatter as Record<string, unknown> | undefined;
      if (!frontmatter) continue;

      const birthday = frontmatter[birthdayProp];
      if (typeof birthday !== 'string' && !(birthday instanceof Date)) continue;

      const birthDate = birthday instanceof Date ? birthday : new Date(birthday as string);
      if (isNaN(birthDate.getTime())) continue;

      // 检查路径
      if (settings.targetPath && !file.path.startsWith(settings.targetPath)) continue;
      
      // 计算下一个生日
      const currentYear = today.getFullYear();
      let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      if (nextBirthday < today) {
        nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
      }
      
      const daysRemaining = Math.ceil((nextBirthday.getTime() - today.getTime()) / 86400000);
      const age = nextBirthday.getFullYear() - birthDate.getFullYear();
      
      // 农历转换（根据语言格式化）
      let lunarInfo: string | null = null;
      if (settings.enableLunar) {
        const lunar = solarToLunar(birthDate, currentLanguage);
        if (lunar) {
          if (isEnglish) {
            // 英文格式: "Apr 26th"
            lunarInfo = `${lunar.monthName} ${lunar.dayName}`;
          } else {
            // 中文格式: "四月廿六"
            lunarInfo = `${lunar.monthName}月${lunar.dayName}`;
            if (lunar.isLeap) lunarInfo = `闰${lunarInfo}`;
          }
        }
      }
      
      // 生肖星座（根据语言）
      let animal: string | null = null;
      let zodiac: string | null = null;
      let ganZhi: string | null = null;
      if (settings.enableZodiac) {
        animal = getAnimal(birthDate.getFullYear(), currentLanguage);
        zodiac = getZodiac(birthDate.getMonth() + 1, birthDate.getDate(), currentLanguage);
        ganZhi = getGanZhi(birthDate.getFullYear());
      }
      
      birthdayData.push({
        name: file.name.replace(/\.md$/, ''),
        path: file.path,
        birthday: birthDate.toISOString().split('T')[0],
        nextBirthday: `${nextBirthday.getFullYear()}-${String(nextBirthday.getMonth() + 1).padStart(2, '0')}-${String(nextBirthday.getDate()).padStart(2, '0')}`,
        daysRemaining,
        age,
        lunarInfo,
        animal,
        zodiac,
        ganZhi,
        isToday: daysRemaining === 0,
        monthDay: `${birthDate.getMonth() + 1}-${birthDate.getDate()}`,
        birthMonth: birthDate.getMonth(),
        birthDay: birthDate.getDate()
      });
    }
    
    // 排序
    birthdayData.sort((a, b) => a.daysRemaining - b.daysRemaining);
    
    // 分组
    const todayBirthdays = birthdayData.filter(b => b.isToday);
    const upcomingWeek = birthdayData.filter(b => b.daysRemaining > 0 && b.daysRemaining <= 7);
    const upcomingMonth = birthdayData.filter(b => b.daysRemaining > 7 && b.daysRemaining <= 30);
    const later = birthdayData.filter(b => b.daysRemaining > 30);
    
    // 统计卡片
    if (settings.showStatistics) {
      this.renderStatistics(todayBirthdays.length, upcomingWeek.length, upcomingMonth.length, birthdayData.length);
    }
    
    // 今日生日
    if (todayBirthdays.length > 0) {
      this.renderSection('today', todayBirthdays, true);
    }
    
    // 一周内
    if (upcomingWeek.length > 0) {
      this.renderSection('week', upcomingWeek, true);
    }
    
    // 一个月内
    if (upcomingMonth.length > 0) {
      this.renderSection('month', upcomingMonth, true);
    }
    
    // 更远的生日
    if (later.length > 0) {
      this.renderSection('later', later.slice(0, 20), true);
    }
    
    // 日历视图
    if (settings.enableCalendar) {
      this.renderCalendar(birthdayData, settings.visibleMonths);
    }
    
    if (birthdayData.length === 0) {
      const emptyEl = this.container.createDiv({ cls: 'birthday-empty' });
      let message = '';
      if (settings.targetPath) {
        message = locale.emptyMessageWithPropertyAndPath
          .replace('{path}', settings.targetPath)
          .replace('{property}', birthdayProp);
      } else {
        message = locale.emptyMessageWithProperty
          .replace('{property}', birthdayProp);
      }
      emptyEl.setText(message);
    }
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
  
  renderSection(sectionKey: string, items: BirthdayData[], showExtra: boolean) {
    const locale = this.getLocale();
    const section = this.container.createDiv({ cls: 'birthday-section' });
    const isSidebar = this.isSidebarMode();
    const isEnglish = this.plugin.settings.language === 'en-us';
    
    // 根据 sectionKey 获取标题文本
    let titleText = '';
    switch(sectionKey) {
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
      
      if (item.isToday && this.plugin.settings.highlightToday) {
        itemEl.addClass('birthday-item-today');
      } else if (item.daysRemaining <= 7) {
        itemEl.addClass('birthday-item-warning');
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
      if (isSidebar) {
        nameDiv.addClass('birthday-name-compact');
      } else {
        nameDiv.addClass('birthday-name-full');
      }
      
      if (showExtra && (item.animal || item.zodiac || item.lunarInfo)) {
        const infoDiv = nameDiv.createDiv({ cls: 'birthday-info' });
        const infoParts = [];
        if (item.animal) infoParts.push(item.animal);
        if (item.zodiac) infoParts.push(item.zodiac);
        if (item.lunarInfo) {
          if (isEnglish) {
            // 英文格式: "Lunar Apr 26th"
            infoParts.push(`${locale.lunarPrefix} ${item.lunarInfo}`);
          } else {
            // 中文格式: "农历四月廿六"
            infoParts.push(`${locale.lunarPrefix}${item.lunarInfo}`);
          }
        }
        infoDiv.setText(infoParts.join(' · '));
      }
      
      if (!isSidebar) {
        // 全窗口模式：创建独立元素
        content.createSpan({ cls: 'birthday-date', text: `${locale.birthdayLabel}：${item.birthday}` });

        content.createSpan({ cls: 'birthday-next', text: `${locale.nextBirthdayLabel}：${item.nextBirthday}` });

        const daysSpan = content.createSpan({ cls: 'birthday-days' });
        if (item.daysRemaining <= 7) {
          daysSpan.addClass('birthday-days-urgent');
        }
        daysSpan.setText(item.isToday ? locale.todayBirthday : `${item.daysRemaining}${locale.daysRemaining}`);

        // 年龄显示 - 根据语言显示单位
        const ageText = isEnglish ? `${item.age} ${locale.ageUnitEn}` : `${item.age}${locale.ageUnit}`;
        content.createSpan({ cls: 'birthday-age', text: ageText });
      } else {
        // 侧边栏模式：创建行容器
        const dateRow = content.createDiv({ cls: 'birthday-date-row' });
        dateRow.createSpan({ cls: 'birthday-date', text: `${locale.birthdayLabel}：${item.birthday}` });
        dateRow.createSpan({ cls: 'birthday-next', text: `${locale.nextBirthdayLabel}：${item.nextBirthday}` });

        // 创建天数和年龄的行容器
        const daysAgeRow = content.createDiv({ cls: 'birthday-days-age-row' });
        const daysSpan = daysAgeRow.createSpan({ cls: 'birthday-days' });
        if (item.daysRemaining <= 7) {
          daysSpan.addClass('birthday-days-urgent');
        }
        daysSpan.setText(item.isToday ? locale.todayBirthday : `${item.daysRemaining}${locale.daysRemaining}`);

        // 年龄显示 - 根据语言显示单位
        const ageText = isEnglish ? `${item.age} ${locale.ageUnitEn}` : `${item.age}${locale.ageUnit}`;
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
        const monthTitle = monthEl.createEl('h3', { cls: 'birthday-calendar-month-title', text: `${year}年${month + 1}月` });
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