// locales.ts - 多语言支持

export interface LocaleMessages {
  // 视图标题
  viewTitle: string;
  
  // 统计卡片
  statsTotal: string;
  statsToday: string;
  statsWeek: string;
  statsMonth: string;
  
  // 侧边栏统计卡片（简写）
  statsTotalShort: string;
  statsTodayShort: string;
  statsWeekShort: string;
  statsMonthShort: string;
  
  // 区域标题
  sectionToday: string;
  sectionWeek: string;
  sectionMonth: string;
  sectionLater: string;
  sectionCalendar: string;
  
  // 生日卡片
  birthdayLabel: string;
  nextBirthdayLabel: string;
  daysRemaining: string;
  todayBirthday: string;
  lunarPrefix: string;
  
  // 年龄单位
  ageUnit: string;
  ageUnitEn: string;
  
  // 日历
  calendarWeekdays: string[];
  prevMonth: string;
  todayButton: string;
  nextMonth: string;
  
  // 空状态
  emptyMessageWithProperty: string;
  emptyMessageWithPropertyAndPath: string;
  
  // 设置面板
  settingsTitle: string;
  settingsTargetPath: string;
  settingsTargetPathDesc: string;
  settingsTargetPathPlaceholder: string;
  settingsBirthdayProperty: string;
  settingsBirthdayPropertyDesc: string;
  settingsBirthdayPropertyPlaceholder: string;
  settingsVisibleMonths: string;
  settingsVisibleMonthsDesc: string;
  settingsColorScheme: string;
  settingsColorSchemeDesc: string;
  settingsEnableLunar: string;
  settingsEnableLunarDesc: string;
  settingsEnableZodiac: string;
  settingsEnableZodiacDesc: string;
  settingsEnableCalendar: string;
  settingsEnableCalendarDesc: string;
  settingsShowStatistics: string;
  settingsShowStatisticsDesc: string;
  settingsHighlightToday: string;
  settingsHighlightTodayDesc: string;
  settingsLanguage: string;
  settingsLanguageDesc: string;
  
  // 配色方案名称
  colorSchemeDefault: string;
  colorSchemeWarm: string;
  colorSchemeCool: string;
  colorSchemeNature: string;
  colorSchemePurple: string;
}

// 中文语言包
const zhCN: LocaleMessages = {
  viewTitle: '生日提醒',
  
  statsTotal: '总人数',
  statsToday: '今日生日',
  statsWeek: '7天内生日',
  statsMonth: '30天内生日',
  
  statsTotalShort: '总',
  statsTodayShort: '今日',
  statsWeekShort: '7天',
  statsMonthShort: '30天',
  
  sectionToday: '🎂 今日生日',
  sectionWeek: '📅 最近一周生日提醒',
  sectionMonth: '📆 最近一个月生日提醒',
  sectionLater: '🔮 更远的生日',
  sectionCalendar: '📅 生日日历',
  
  birthdayLabel: '生日',
  nextBirthdayLabel: '下一',
  daysRemaining: '天',
  todayBirthday: '🎉 今天！',
  lunarPrefix: '农历',
  
  ageUnit: '岁',
  ageUnitEn: 'years old',
  
  calendarWeekdays: ['日', '一', '二', '三', '四', '五', '六'],
  prevMonth: '◀ 上月',
  todayButton: '今天',
  nextMonth: '下月 ▶',
  
  emptyMessageWithProperty: '📌 请在笔记中添加 {property}: YYYY-MM-DD 属性',
  emptyMessageWithPropertyAndPath: '📌 请在 {path} 目录下的笔记中添加 {property}: YYYY-MM-DD 属性',
  
  settingsTitle: '生日提醒设置',
  settingsTargetPath: '目标文件夹',
  settingsTargetPathDesc: '包含人员笔记的文件夹路径（留空表示所有文件夹）',
  settingsTargetPathPlaceholder: '例如: 07Relations/',
  settingsBirthdayProperty: '生日属性名称',
  settingsBirthdayPropertyDesc: '笔记中用于存储生日的 frontmatter 属性名',
  settingsBirthdayPropertyPlaceholder: 'birthday',
  settingsVisibleMonths: '显示月数',
  settingsVisibleMonthsDesc: '日历视图中显示的月份数量（1-6个月）',
  settingsColorScheme: '配色方案',
  settingsColorSchemeDesc: '选择生日提醒面板的主题配色',
  settingsEnableLunar: '显示农历',
  settingsEnableLunarDesc: '在生日卡片中显示农历日期（使用 solarlunar 库精确转换）',
  settingsEnableZodiac: '显示生肖星座',
  settingsEnableZodiacDesc: '在生日卡片中显示生肖和星座',
  settingsEnableCalendar: '显示日历视图',
  settingsEnableCalendarDesc: '是否显示月份日历',
  settingsShowStatistics: '显示统计卡片',
  settingsShowStatisticsDesc: '顶部显示统计信息',
  settingsHighlightToday: '高亮今日生日',
  settingsHighlightTodayDesc: '今日生日的卡片特殊高亮显示',
  settingsLanguage: '语言',
  settingsLanguageDesc: '选择界面语言',
  
  colorSchemeDefault: '默认',
  colorSchemeWarm: '温暖橙',
  colorSchemeCool: '清新蓝',
  colorSchemeNature: '自然绿',
  colorSchemePurple: '优雅紫',
};

// 英文语言包
const enUS: LocaleMessages = {
  viewTitle: 'Birthday Reminder',
  
  statsTotal: 'Total',
  statsToday: 'Today',
  statsWeek: 'Next 7 Days',
  statsMonth: 'Next 30 Days',
  
  statsTotalShort: 'Total',
  statsTodayShort: 'Today',
  statsWeekShort: '7d',
  statsMonthShort: '30d',
  
  sectionToday: '🎂 Today\'s Birthdays',
  sectionWeek: '📅 Next 7 Days',
  sectionMonth: '📆 Next 30 Days',
  sectionLater: '🔮 Later Birthdays',
  sectionCalendar: '📅 Birthday Calendar',
  
  birthdayLabel: 'Birthday',
  nextBirthdayLabel: 'Next',
  daysRemaining: 'd',
  todayBirthday: '🎉 Today!',
  lunarPrefix: 'Lunar',
  
  ageUnit: 'years old',
  ageUnitEn: 'years old',
  
  calendarWeekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  prevMonth: '◀ Prev',
  todayButton: 'Today',
  nextMonth: 'Next ▶',
  
  emptyMessageWithProperty: '📌 Please add {property}: YYYY-MM-DD in frontmatter of notes',
  emptyMessageWithPropertyAndPath: '📌 Please add {property}: YYYY-MM-DD in frontmatter of notes under {path}',
  
  settingsTitle: 'Birthday Reminder Settings',
  settingsTargetPath: 'Target Folder',
  settingsTargetPathDesc: 'Folder path containing person notes (leave empty for all folders)',
  settingsTargetPathPlaceholder: 'e.g., 07Relations/',
  settingsBirthdayProperty: 'Birthday Property Name',
  settingsBirthdayPropertyDesc: 'Frontmatter property name for birthday in notes',
  settingsBirthdayPropertyPlaceholder: 'birthday',
  settingsVisibleMonths: 'Visible Months',
  settingsVisibleMonthsDesc: 'Number of months to display in calendar view (1-6 months)',
  settingsColorScheme: 'Color Scheme',
  settingsColorSchemeDesc: 'Choose theme color for birthday reminder panel',
  settingsEnableLunar: 'Show Lunar Calendar',
  settingsEnableLunarDesc: 'Show lunar calendar dates in birthday cards (using solarlunar library)',
  settingsEnableZodiac: 'Show Zodiac & Animal',
  settingsEnableZodiacDesc: 'Show zodiac sign and Chinese animal in birthday cards',
  settingsEnableCalendar: 'Show Calendar View',
  settingsEnableCalendarDesc: 'Display monthly calendar view',
  settingsShowStatistics: 'Show Statistics',
  settingsShowStatisticsDesc: 'Display statistics cards at the top',
  settingsHighlightToday: 'Highlight Today\'s Birthdays',
  settingsHighlightTodayDesc: 'Highlight birthday cards for today\'s birthdays',
  settingsLanguage: 'Language',
  settingsLanguageDesc: 'Choose interface language',
  
  colorSchemeDefault: 'Default',
  colorSchemeWarm: 'Warm Orange',
  colorSchemeCool: 'Cool Blue',
  colorSchemeNature: 'Nature Green',
  colorSchemePurple: 'Elegant Purple',
};

// 语言映射
export const locales = {
  'zh-cn': zhCN,
  'en-us': enUS,
};

export type Language = keyof typeof locales;
export const defaultLanguage: Language = 'zh-cn';

// 获取当前语言包
export function getLocale(lang: Language): LocaleMessages {
  return locales[lang] || locales[defaultLanguage];
}