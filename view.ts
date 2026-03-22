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

  async onClose() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  refresh() {
    this.render();
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
      const frontmatter = cache?.frontmatter;
      const birthday = frontmatter?.[birthdayProp];
      
      if (!birthday) continue;
      
      // 检查路径
      if (settings.targetPath && !file.path.startsWith(settings.targetPath)) continue;
      
      const birthDate = new Date(birthday);
      if (isNaN(birthDate.getTime())) continue;
      
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
        if (isEnglish) {
          // 英文格式: "Apr 26th"
          lunarInfo = `${lunar.monthName} ${lunar.dayName}`;
        } else {
          // 中文格式: "四月廿六"
          lunarInfo = `${lunar.monthName}月${lunar.dayName}`;
          if (lunar.isLeap) lunarInfo = `闰${lunarInfo}`;
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
        birthday: birthday,
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
        numSpan.style.color = 'var(--birthday-accent)';
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
      titleEl.style.fontSize = '14px';
      titleEl.style.marginBottom = '8px';
    }
    
    for (const item of items) {
      const itemEl = section.createDiv({ cls: 'birthday-item' });
      if (isSidebar) {
        itemEl.addClass('birthday-item-compact');
        itemEl.style.padding = '6px 8px';
      }
      
      if (item.isToday && this.plugin.settings.highlightToday) {
        itemEl.addClass('birthday-item-today');
      } else if (item.daysRemaining <= 7) {
        itemEl.addClass('birthday-item-warning');
      }
      
      itemEl.addEventListener('click', () => {
        this.app.workspace.openLinkText(item.path, '', false);
      });
      
      const content = itemEl.createDiv({ cls: 'birthday-item-content' });
      
      if (isSidebar) {
        // 侧边栏模式：垂直布局
        content.style.flexDirection = 'column';
        content.style.alignItems = 'flex-start';
        content.style.gap = '4px';
      } else {
        // 全窗口模式：水平布局
        content.style.display = 'flex';
        content.style.flexDirection = 'row';
        content.style.alignItems = 'center';
        content.style.justifyContent = 'space-between';
        content.style.flexWrap = 'wrap';
        content.style.gap = '12px';
      }
      
      // 姓名区域
      const nameDiv = content.createDiv({ cls: 'birthday-name' });
      nameDiv.createSpan({ text: item.name });
      if (isSidebar) {
        nameDiv.style.fontWeight = 'bold';
        nameDiv.style.fontSize = '13px';
      } else {
        nameDiv.style.minWidth = '120px';
        nameDiv.style.flex = '2';
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
        if (isSidebar) {
          infoDiv.style.fontSize = '10px';
        } else {
          infoDiv.style.fontSize = '12px';
        }
      }
      
      if (!isSidebar) {
        // 全窗口模式：创建独立元素
        const birthdaySpan = content.createSpan({ cls: 'birthday-date', text: `${locale.birthdayLabel}：${item.birthday}` });
        birthdaySpan.style.minWidth = '100px';
        
        const nextSpan = content.createSpan({ cls: 'birthday-next', text: `${locale.nextBirthdayLabel}：${item.nextBirthday}` });
        nextSpan.style.minWidth = '100px';
        nextSpan.style.textAlign = 'center';
        
        const daysSpan = content.createSpan({ cls: 'birthday-days' });
        daysSpan.style.color = item.daysRemaining <= 7 ? 'var(--birthday-accent)' : 'inherit';
        daysSpan.style.fontWeight = 'bold';
        daysSpan.style.minWidth = '70px';
        daysSpan.style.textAlign = 'center';
        daysSpan.setText(item.isToday ? locale.todayBirthday : `${item.daysRemaining}${locale.daysRemaining}`);
        
        // 年龄显示 - 根据语言显示单位
        const ageText = isEnglish ? `${item.age} ${locale.ageUnitEn}` : `${item.age}${locale.ageUnit}`;
        const ageSpan = content.createSpan({ cls: 'birthday-age', text: ageText });
        ageSpan.style.minWidth = '60px';
        ageSpan.style.textAlign = 'right';
      } else {
        // 侧边栏模式：创建行容器
        const dateRow = content.createDiv();
        dateRow.style.display = 'flex';
        dateRow.style.gap = '8px';
        dateRow.style.flexWrap = 'wrap';
        
        const birthdaySpan = dateRow.createSpan({ cls: 'birthday-date', text: `${locale.birthdayLabel}：${item.birthday}` });
        birthdaySpan.style.fontSize = '11px';
        
        const nextSpan = dateRow.createSpan({ cls: 'birthday-next', text: `${locale.nextBirthdayLabel}：${item.nextBirthday}` });
        nextSpan.style.fontSize = '11px';
        
        // 创建天数和年龄的行容器
        const daysAgeRow = content.createDiv();
        daysAgeRow.style.display = 'flex';
        daysAgeRow.style.gap = '12px';
        daysAgeRow.style.marginTop = '4px';
        
        const daysSpan = daysAgeRow.createSpan({ cls: 'birthday-days' });
        daysSpan.style.color = item.daysRemaining <= 7 ? 'var(--birthday-accent)' : 'inherit';
        daysSpan.style.fontSize = '12px';
        daysSpan.setText(item.isToday ? locale.todayBirthday : `${item.daysRemaining}${locale.daysRemaining}`);
        
        // 年龄显示 - 根据语言显示单位
        const ageText = isEnglish ? `${item.age} ${locale.ageUnitEn}` : `${item.age}${locale.ageUnit}`;
        const ageSpan = daysAgeRow.createSpan({ cls: 'birthday-age', text: ageText });
        ageSpan.style.fontSize = '11px';
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
    const titleEl = navEl.createEl('h2', { text: locale.sectionCalendar });
    if (isSidebar) {
      titleEl.style.fontSize = '16px';
    }
    
    const navButtons = navEl.createDiv();
    const prevBtn = navButtons.createEl('button', { cls: 'birthday-button', text: locale.prevMonth });
    const todayBtn = navButtons.createEl('button', { cls: 'birthday-button', text: locale.todayButton });
    const nextBtn = navButtons.createEl('button', { cls: 'birthday-button', text: locale.nextMonth });
    
    if (isSidebar) {
      prevBtn.style.padding = '2px 6px';
      todayBtn.style.padding = '2px 6px';
      nextBtn.style.padding = '2px 6px';
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
          monthTitle.style.fontSize = '14px';
          monthTitle.style.marginBottom = '8px';
        }
        
        const gridEl = monthEl.createDiv({ cls: 'birthday-calendar-grid' });
        if (isSidebar) {
          gridEl.style.gap = '4px';
        }
        
        // 星期标题
        const weekdays = locale.calendarWeekdays;
        weekdays.forEach(weekday => {
          const weekdayEl = gridEl.createDiv({ cls: 'birthday-calendar-weekday', text: weekday });
          if (isSidebar) {
            weekdayEl.style.fontSize = '10px';
            weekdayEl.style.padding = '2px';
          }
        });
        
        // 获取上个月的最后一天
        const prevMonthDate = new Date(year, month, 0);
        const prevMonthYear = prevMonthDate.getFullYear();
        const prevMonth = prevMonthDate.getMonth();
        const prevMonthDays = prevMonthDate.getDate();
        
        // 填充月初空白
        for (let i = 0; i < firstDayOfWeek; i++) {
          const dayNum = prevMonthDays - firstDayOfWeek + i + 1;
          const monthDayKey = `${prevMonth + 1}-${dayNum}`;
          const birthdays = monthDayMap.get(monthDayKey) || [];
          
          const dayEl = gridEl.createDiv({ cls: 'birthday-calendar-day birthday-calendar-day-other' });
          if (isSidebar) {
            dayEl.style.padding = '4px';
            dayEl.style.minHeight = '50px';
          }
          
          const dayNumEl = dayEl.createDiv({ cls: 'birthday-calendar-day-number' });
          dayNumEl.setText(String(dayNum));
          dayNumEl.style.opacity = '0.6';
          if (isSidebar) {
            dayNumEl.style.fontSize = '10px';
          }
          
          const maxShow = isSidebar ? 1 : 2;
          for (const b of birthdays.slice(0, maxShow)) {
            const birthdayEl = dayEl.createDiv({ cls: 'birthday-calendar-day-birthday' });
            birthdayEl.setText(`🎂 ${b.name}`);
            birthdayEl.style.opacity = '0.8';
            if (isSidebar) {
              birthdayEl.style.fontSize = '8px';
              birthdayEl.style.padding = '1px 2px';
            }
            birthdayEl.addEventListener('click', (e) => {
              e.stopPropagation();
              this.app.workspace.openLinkText(b.path, '', false);
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
            dayEl.style.padding = '4px';
            dayEl.style.minHeight = '50px';
          }
          if (isToday) dayEl.addClass('birthday-calendar-day-today');
          
          const dayNumEl = dayEl.createDiv({ cls: 'birthday-calendar-day-number' });
          dayNumEl.setText(String(d));
          if (isSidebar) {
            dayNumEl.style.fontSize = '10px';
          }
          if (birthdays.length > 0) {
            dayNumEl.style.color = 'var(--birthday-accent)';
            dayNumEl.style.fontWeight = 'bold';
          }
          
          const maxShow = isSidebar ? 2 : 3;
          for (const b of birthdays.slice(0, maxShow)) {
            const birthdayEl = dayEl.createDiv({ cls: 'birthday-calendar-day-birthday' });
            birthdayEl.setText(`🎂 ${b.name}`);
            if (isSidebar) {
              birthdayEl.style.fontSize = '8px';
              birthdayEl.style.padding = '1px 2px';
            }
            birthdayEl.addEventListener('click', (e) => {
              e.stopPropagation();
              this.app.workspace.openLinkText(b.path, '', false);
            });
          }
          
          if (birthdays.length > maxShow) {
            const moreEl = dayEl.createDiv({ cls: 'birthday-calendar-day-birthday' });
            moreEl.style.textAlign = 'center';
            moreEl.style.color = 'var(--text-muted)';
            moreEl.setText(`+${birthdays.length - maxShow}`);
            if (isSidebar) {
              moreEl.style.fontSize = '8px';
            }
            moreEl.title = birthdays.slice(maxShow).map(b => b.name).join(', ');
          }
        }
        
        // 计算需要填充的下个月天数
        const totalCells = firstDayOfWeek + daysInMonth;
        const remainingCells = Math.ceil(totalCells / 7) * 7 - totalCells;
        
        // 填充下个月日期
        if (remainingCells > 0) {
          const nextMonthDate = new Date(year, month + 1, 1);
          const nextMonthYear = nextMonthDate.getFullYear();
          const nextMonth = nextMonthDate.getMonth();
          
          for (let d = 1; d <= remainingCells; d++) {
            const monthDayKey = `${nextMonth + 1}-${d}`;
            const birthdays = monthDayMap.get(monthDayKey) || [];
            
            const dayEl = gridEl.createDiv({ cls: 'birthday-calendar-day birthday-calendar-day-other' });
            if (isSidebar) {
              dayEl.style.padding = '4px';
              dayEl.style.minHeight = '50px';
            }
            
            const dayNumEl = dayEl.createDiv({ cls: 'birthday-calendar-day-number' });
            dayNumEl.setText(String(d));
            dayNumEl.style.opacity = '0.6';
            if (isSidebar) {
              dayNumEl.style.fontSize = '10px';
            }
            
            const maxShow = isSidebar ? 1 : 2;
            for (const b of birthdays.slice(0, maxShow)) {
              const birthdayEl = dayEl.createDiv({ cls: 'birthday-calendar-day-birthday' });
              birthdayEl.setText(`🎂 ${b.name}`);
              birthdayEl.style.opacity = '0.8';
              if (isSidebar) {
                birthdayEl.style.fontSize = '8px';
              }
              birthdayEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.app.workspace.openLinkText(b.path, '', false);
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