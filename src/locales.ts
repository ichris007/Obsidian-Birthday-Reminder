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
  
  // 列表交互
  searchPlaceholder: string;
  sortByDays: string;
  sortByName: string;
  sortByAge: string;
  noMatch: string;
  /** 清空搜索按钮的无障碍标签 */
  clearSearch: string;
  /** 命中别名时的提示，支持 {alias} 占位符 */
  aliasHint: string;
  showAllLater: string;
  collapseLater: string;

  // 日历
  calendarWeekdays: string[];
  /** 月历标题模板，支持 {year} 与 {month} 占位符 */
  monthTitlePattern: string;
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

  // 设置分组标题
  settingsSourceSection: string;
  settingsDisplaySection: string;
  settingsNotifySection: string;

  // 农历生日
  settingsLunarProperty: string;
  settingsLunarPropertyDesc: string;
  settingsLunarPropertyPlaceholder: string;

  // 别名（搜索命中）
  settingsAliasProperty: string;
  settingsAliasPropertyDesc: string;
  settingsAliasPropertyPlaceholder: string;

  // 提醒
  settingsNotifyEnabled: string;
  settingsNotifyEnabledDesc: string;
  settingsNotifyTime: string;
  settingsNotifyTimeDesc: string;
  settingsNotifyTimePlaceholder: string;
  settingsReminderDays: string;
  settingsReminderDaysDesc: string;
  settingsReminderDaysPlaceholder: string;

  // 提醒文案
  notifyTitle: string;
  notifyTodayLabel: string;
  notifyDaysSuffix: string;
  notifyMore: string;
  notifyNothing: string;

  // 命令与图标
  commandShowPanel: string;
  commandCheckReminders: string;
  ribbonTooltip: string;

  // 配色方案名称
  colorSchemeDefault: string;
  colorSchemeWarm: string;
  colorSchemeCool: string;
  colorSchemeNature: string;
  colorSchemePurple: string;

  // 配色预览
  colorPreview: string;
  colorPreviewDesc?: string;
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
  
  searchPlaceholder: '搜索姓名或别名…',
  sortByDays: '按剩余天数',
  sortByName: '按姓名',
  sortByAge: '按年龄',
  noMatch: '没有匹配的人',
  clearSearch: '清除搜索',
  aliasHint: '别名：{alias}',
  showAllLater: '显示全部（{count}）',
  collapseLater: '收起',

  calendarWeekdays: ['日', '一', '二', '三', '四', '五', '六'],
  monthTitlePattern: '{year}年{month}月',
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

  settingsSourceSection: '数据源',
  settingsDisplaySection: '显示',
  settingsNotifySection: '提醒',

  settingsLunarProperty: '农历生日属性',
  settingsLunarPropertyDesc: '笔记中记录农历生日的属性名，格式 YYYY-MM-DD，闰月写成 2023-02L-01。留空则关闭农历生日',
  settingsLunarPropertyPlaceholder: 'lunar_birthday',

  settingsAliasProperty: '别名属性',
  settingsAliasPropertyDesc: '笔记中记录别名的属性名，搜索时姓名和别名都会被匹配。支持 YAML 列表或逗号分隔的一行文本，留空则只按姓名搜索',
  settingsAliasPropertyPlaceholder: 'aliases',

  settingsNotifyEnabled: '启用每日提醒',
  settingsNotifyEnabledDesc: '到点后发一条系统通知，汇总今天和即将到来的生日',
  settingsNotifyTime: '提醒时间',
  settingsNotifyTimeDesc: '每天在这个时间之后检查一次（24 小时制）',
  settingsNotifyTimePlaceholder: '09:00',
  settingsReminderDays: '提前提醒天数',
  settingsReminderDaysDesc: '在生日前几天一起提醒，逗号分隔。当天生日始终提醒',
  settingsReminderDaysPlaceholder: '1,3,7',

  notifyTitle: '生日提醒',
  notifyTodayLabel: '今天',
  notifyDaysSuffix: '天后',
  notifyMore: '等 {count} 人',
  notifyNothing: '今天没有需要提醒的生日',

  commandShowPanel: '显示生日提醒面板',
  commandCheckReminders: '检查今日生日提醒',
  ribbonTooltip: '生日提醒',
  
  colorSchemeDefault: '默认',
  colorSchemeWarm: '温暖橙',
  colorSchemeCool: '清新蓝',
  colorSchemeNature: '自然绿',
  colorSchemePurple: '优雅紫',

  colorPreview: '配色预览',
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
  
  searchPlaceholder: 'Search name or alias…',
  sortByDays: 'By days left',
  sortByName: 'By name',
  sortByAge: 'By age',
  noMatch: 'No matching person',
  clearSearch: 'Clear search',
  aliasHint: 'Alias: {alias}',
  showAllLater: 'Show all ({count})',
  collapseLater: 'Collapse',

  calendarWeekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  monthTitlePattern: '{month}/{year}',
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

  settingsSourceSection: 'Data source',
  settingsDisplaySection: 'Display',
  settingsNotifySection: 'Reminders',

  settingsLunarProperty: 'Lunar birthday property',
  settingsLunarPropertyDesc: 'Frontmatter property for lunar birthdays, format YYYY-MM-DD, leap month as 2023-02L-01. Leave empty to disable',
  settingsLunarPropertyPlaceholder: 'lunar_birthday',

  settingsAliasProperty: 'Alias property',
  settingsAliasPropertyDesc: 'Frontmatter property holding aliases; both name and alias are matched when searching. Accepts a YAML list or a comma-separated line. Leave empty to search names only',
  settingsAliasPropertyPlaceholder: 'aliases',

  settingsNotifyEnabled: 'Enable daily reminder',
  settingsNotifyEnabledDesc: 'Send a system notification summarizing today and upcoming birthdays',
  settingsNotifyTime: 'Reminder time',
  settingsNotifyTimeDesc: 'Check once a day after this time (24-hour)',
  settingsNotifyTimePlaceholder: '09:00',
  settingsReminderDays: 'Remind ahead of time',
  settingsReminderDaysDesc: 'Extra days to remind in advance, comma separated. Today is always included',
  settingsReminderDaysPlaceholder: '1,3,7',

  notifyTitle: 'Birthday Reminder',
  notifyTodayLabel: 'Today',
  notifyDaysSuffix: 'd away',
  notifyMore: 'and {count} more',
  notifyNothing: 'No birthdays to remind today',

  commandShowPanel: 'Show birthday panel',
  commandCheckReminders: "Check today's birthday reminders",
  ribbonTooltip: 'Birthday Reminder',
  
  colorSchemeDefault: 'Default',
  colorSchemeWarm: 'Warm Orange',
  colorSchemeCool: 'Cool Blue',
  colorSchemeNature: 'Nature Green',
  colorSchemePurple: 'Elegant Purple',

  colorPreview: 'Color Preview',
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