import { App, PluginSettingTab, Setting } from 'obsidian';
import BirthdayReminderPlugin from './main';
import { getLocale, Language, LocaleMessages } from './locales';

// 配色方案类型
export interface ColorScheme {
  name: string;
  primary: string;
  accent: string;
  success: string;
}

// 配色方案对象（只用真正被样式消费的三个颜色，避免留下死变量）
const _colorSchemes = {
  default: {
    name: '默认',
    primary: 'var(--interactive-accent)',
    accent: 'var(--text-accent)',
    success: 'rgba(100, 255, 100, 0.2)'
  },
  warm: {
    name: '温暖橙',
    primary: '#ff9800',
    accent: '#f57c00',
    success: 'rgba(76, 175, 80, 0.2)'
  },
  cool: {
    name: '清新蓝',
    primary: '#2196f3',
    accent: '#1976d2',
    success: 'rgba(76, 175, 80, 0.2)'
  },
  nature: {
    name: '自然绿',
    primary: '#4caf50',
    accent: '#2e7d32',
    success: 'rgba(76, 175, 80, 0.2)'
  },
  purple: {
    name: '优雅紫',
    primary: '#9c27b0',
    accent: '#7b1fa2',
    success: 'rgba(76, 175, 80, 0.2)'
  }
};

export type ColorSchemeKey = keyof typeof _colorSchemes;

export const COLOR_SCHEMES: Record<ColorSchemeKey, ColorScheme> = _colorSchemes;

export interface BirthdayReminderSettings {
  targetPath: string;
  visibleMonths: number;
  colorScheme: ColorSchemeKey;
  enableLunar: boolean;
  enableZodiac: boolean;
  enableCalendar: boolean;
  showStatistics: boolean;
  highlightToday: boolean;
  reminderDays: number[];
  language: string;
  birthdayProperty: string;
  /** 农历生日属性名，留空则关闭农历生日支持 */
  lunarProperty: string;
  /** 别名属性名，留空则搜索只匹配姓名 */
  aliasProperty: string;
  notifyEnabled: boolean;
  /** 每日提醒时间，24 小时制 HH:mm */
  notifyTime: string;
  /** 最近一次提醒的日期（YYYY-MM-DD），用于当天去重 */
  lastNotifiedDate: string;
}

export const DEFAULT_SETTINGS: BirthdayReminderSettings = {
  targetPath: '',
  visibleMonths: 3,
  colorScheme: 'default',
  enableLunar: true,
  enableZodiac: true,
  enableCalendar: true,
  showStatistics: true,
  highlightToday: true,
  reminderDays: [1, 3, 7],
  language: 'zh-cn',
  birthdayProperty: 'birthday',
  lunarProperty: 'lunar_birthday',
  aliasProperty: 'aliases',
  notifyEnabled: false,
  notifyTime: '09:00',
  lastNotifiedDate: '',
};

/** "1,3,7" → [1,3,7]，非法项直接丢弃 */
export function parseReminderDays(value: string): number[] {
  const days = value
    .split(/[,，\s]+/)
    .map((part) => Number(part.trim()))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 365);
  return Array.from(new Set(days)).sort((a, b) => a - b);
}

export class BirthdayReminderSettingTab extends PluginSettingTab {
  plugin: BirthdayReminderPlugin;

  constructor(app: App, plugin: BirthdayReminderPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  // 使用传统的display()方法，确保兼容性
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    const settings = this.plugin.settings;
    const locale = this.getLocale();

    // ---------- 数据源 ----------
    new Setting(containerEl).setName(locale.settingsSourceSection).setHeading();

    // Target Path
    new Setting(containerEl)
      .setName(locale.settingsTargetPath)
      .setDesc(locale.settingsTargetPathDesc)
      .addText(text => text
        .setPlaceholder(locale.settingsTargetPathPlaceholder)
        .setValue(settings.targetPath)
        .onChange(async (value) => {
          settings.targetPath = value;
          await this.plugin.saveSettings();
        }));

    // Birthday Property
    const exampleLabel = settings.language === 'zh-cn' ? '示例：' : 'Examples:';
    new Setting(containerEl)
      .setName(locale.settingsBirthdayProperty)
      .setDesc(`${locale.settingsBirthdayPropertyDesc}\n\n${exampleLabel}\nbirthday: 1990-05-20\ndate_of_birth: 1990-05-20`)
      .addText(text => text
        .setPlaceholder(locale.settingsBirthdayPropertyPlaceholder)
        .setValue(settings.birthdayProperty)
        .onChange(async (value) => {
          const newValue = value.trim();
          settings.birthdayProperty = newValue || 'birthday';
          await this.plugin.saveSettings();
        }));

    // Lunar Birthday Property
    new Setting(containerEl)
      .setName(locale.settingsLunarProperty)
      .setDesc(`${locale.settingsLunarPropertyDesc}\n\nlunar_birthday: 1990-04-26\nlunar_birthday: 2023-02L-01`)
      .addText(text => text
        .setPlaceholder(locale.settingsLunarPropertyPlaceholder)
        .setValue(settings.lunarProperty)
        .onChange(async (value) => {
          settings.lunarProperty = value.trim();
          await this.plugin.saveSettings();
        }));

    // Alias Property：搜索时一并匹配
    new Setting(containerEl)
      .setName(locale.settingsAliasProperty)
      .setDesc(locale.settingsAliasPropertyDesc)
      .addText(text => text
        .setPlaceholder(locale.settingsAliasPropertyPlaceholder)
        .setValue(settings.aliasProperty)
        .onChange(async (value) => {
          settings.aliasProperty = value.trim();
          await this.plugin.saveSettings();
        }));

    // ---------- 提醒 ----------
    new Setting(containerEl).setName(locale.settingsNotifySection).setHeading();

    new Setting(containerEl)
      .setName(locale.settingsNotifyEnabled)
      .setDesc(locale.settingsNotifyEnabledDesc)
      .addToggle(toggle => toggle
        .setValue(settings.notifyEnabled)
        .onChange(async (value) => {
          settings.notifyEnabled = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(locale.settingsNotifyTime)
      .setDesc(locale.settingsNotifyTimeDesc)
      .addText(text => text
        .setPlaceholder(locale.settingsNotifyTimePlaceholder)
        .setValue(settings.notifyTime)
        .onChange(async (value) => {
          settings.notifyTime = value.trim() || '09:00';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(locale.settingsReminderDays)
      .setDesc(locale.settingsReminderDaysDesc)
      .addText(text => text
        .setPlaceholder(locale.settingsReminderDaysPlaceholder)
        .setValue(settings.reminderDays.join(','))
        .onChange(async (value) => {
          settings.reminderDays = parseReminderDays(value);
          await this.plugin.saveSettings();
        }));

    // ---------- 显示 ----------
    new Setting(containerEl).setName(locale.settingsDisplaySection).setHeading();

    // Language
    new Setting(containerEl)
      .setName(locale.settingsLanguage)
      .setDesc(locale.settingsLanguageDesc)
      .addDropdown(dropdown => {
        // 语言选项标签使用该语言的本体名称
        dropdown.addOption('zh-cn', '中文');
        dropdown.addOption('en-us', 'English');
        dropdown.setValue(settings.language);
        dropdown.onChange(async (value) => {
          settings.language = value;
          await this.plugin.saveSettings();
          // 语言切换后重新渲染设置界面
          this.display();
        });
      });

    // Visible Months
    new Setting(containerEl)
      .setName(locale.settingsVisibleMonths)
      .setDesc(locale.settingsVisibleMonthsDesc)
      .addSlider(slider => slider
        .setLimits(1, 6, 1)
        .setValue(settings.visibleMonths)
        .onChange(async (value) => {
          settings.visibleMonths = value;
          await this.plugin.saveSettings();
        }));

    // Color Scheme
    const colorOptions: Record<string, string> = {};
    (Object.keys(COLOR_SCHEMES) as Array<ColorSchemeKey>).forEach(key => {
      colorOptions[key] = this.getColorSchemeName(key);
    });
    new Setting(containerEl)
      .setName(locale.settingsColorScheme)
      .setDesc(locale.settingsColorSchemeDesc)
      .addDropdown(dropdown => {
        Object.entries(colorOptions).forEach(([value, label]) => {
          dropdown.addOption(value, label);
        });
        dropdown.setValue(settings.colorScheme);
        dropdown.onChange(async (value) => {
          settings.colorScheme = value as ColorSchemeKey;
          updateColorPreview(); // 更新预览颜色
          await this.plugin.saveSettings();
        });
      });

    // Color Preview (放在配色方案下方)
    const previewSetting = new Setting(containerEl)
      .setName(locale.colorPreview)
      .setDesc(''); // 可以留空或添加描述

    const previewEl = previewSetting.controlEl.createDiv({ cls: 'birthday-color-preview-box' });
    const row1 = previewEl.createDiv({ cls: 'birthday-color-preview-row' });
    // 三个样例的颜色全部由 CSS 变量驱动，JS 只负责写 -base
    row1.createSpan({ cls: 'birthday-color-preview-primary', text: 'Primary' });
    row1.createSpan({ cls: 'birthday-color-preview-accent', text: 'Accent' });
    previewEl.createDiv({ cls: 'birthday-color-preview-success', text: 'Success' });

    // 根据当前配色方案更新预览颜色
    const updateColorPreview = () => {
      const scheme = COLOR_SCHEMES[settings.colorScheme];
      if (!scheme) return;
      // 只写 -base，压暗/提亮交给 CSS：预览与视图必须用同一套混色，否则「预览一个色、显示另一个色」
      previewEl.toggleClass('is-custom', settings.colorScheme !== 'default');
      previewEl.style.setProperty('--preview-primary-base', scheme.primary);
      previewEl.style.setProperty('--preview-accent-base', scheme.accent);
      previewEl.style.setProperty('--preview-success', scheme.success);
    };
    updateColorPreview();

    // Toggles
    const toggles = [
      { key: 'enableLunar', name: locale.settingsEnableLunar, desc: locale.settingsEnableLunarDesc },
      { key: 'enableZodiac', name: locale.settingsEnableZodiac, desc: locale.settingsEnableZodiacDesc },
      { key: 'enableCalendar', name: locale.settingsEnableCalendar, desc: locale.settingsEnableCalendarDesc },
      { key: 'showStatistics', name: locale.settingsShowStatistics, desc: locale.settingsShowStatisticsDesc },
      { key: 'highlightToday', name: locale.settingsHighlightToday, desc: locale.settingsHighlightTodayDesc },
    ] as const;

    for (const { key, name, desc } of toggles) {
      new Setting(containerEl)
        .setName(name)
        .setDesc(desc)
        .addToggle(toggle => toggle
          .setValue(settings[key])
          .onChange(async (value) => {
            settings[key] = value;
            await this.plugin.saveSettings();
          }));
    }
  }

  private getLocale(): LocaleMessages {
    return getLocale(this.plugin.settings.language as Language);
  }

  private getColorSchemeName(key: ColorSchemeKey): string {
    const locale = this.getLocale();
    const names: Record<ColorSchemeKey, string> = {
      default: locale.colorSchemeDefault,
      warm: locale.colorSchemeWarm,
      cool: locale.colorSchemeCool,
      nature: locale.colorSchemeNature,
      purple: locale.colorSchemePurple,
    };
    return names[key];
  }
}
