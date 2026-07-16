import { App, PluginSettingTab, Setting, SettingDefinitionItem } from 'obsidian';
import BirthdayReminderPlugin from './main';
import { getLocale, Language, LocaleMessages } from './locales';

// 配色方案类型
export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  warning: string;
  success: string;
}

// 配色方案对象
const _colorSchemes = {
  default: {
    name: '默认',
    primary: 'var(--interactive-accent)',
    secondary: 'var(--background-primary-alt)',
    accent: 'var(--text-accent)',
    warning: 'rgba(255, 100, 100, 0.3)',
    success: 'rgba(100, 255, 100, 0.2)'
  },
  warm: {
    name: '温暖橙',
    primary: '#ff9800',
    secondary: '#fff3e0',
    accent: '#f57c00',
    warning: 'rgba(255, 152, 0, 0.2)',
    success: 'rgba(76, 175, 80, 0.2)'
  },
  cool: {
    name: '清新蓝',
    primary: '#2196f3',
    secondary: '#e3f2fd',
    accent: '#1976d2',
    warning: 'rgba(33, 150, 243, 0.2)',
    success: 'rgba(76, 175, 80, 0.2)'
  },
  nature: {
    name: '自然绿',
    primary: '#4caf50',
    secondary: '#e8f5e9',
    accent: '#2e7d32',
    warning: 'rgba(76, 175, 80, 0.2)',
    success: 'rgba(76, 175, 80, 0.2)'
  },
  purple: {
    name: '优雅紫',
    primary: '#9c27b0',
    secondary: '#f3e5f5',
    accent: '#7b1fa2',
    warning: 'rgba(156, 39, 176, 0.2)',
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
  reminderDays: [7, 30],
  language: 'zh-cn',
  birthdayProperty: 'birthday',
};

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
    new Setting(containerEl)
      .setName(locale.settingsBirthdayProperty)
      .setDesc(`${locale.settingsBirthdayPropertyDesc}\n\n示例：\nbirthday: 1990-05-20\ndate_of_birth: 1990-05-20`)
      .addText(text => text
        .setPlaceholder(locale.settingsBirthdayPropertyPlaceholder)
        .setValue(settings.birthdayProperty)
        .onChange(async (value) => {
          const newValue = value.trim();
          settings.birthdayProperty = newValue || 'birthday';
          await this.plugin.saveSettings();
        }));

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
          await this.plugin.saveSettings();
        });
      });

    // Color Preview
    const previewSetting = new Setting(containerEl)
      .setName('配色预览')
      .setDesc('');

    const previewEl = previewSetting.controlEl.createDiv({ cls: 'birthday-color-preview-box' });
    const row1 = previewEl.createDiv({ cls: 'birthday-color-preview-row' });
    row1.createSpan({ cls: 'birthday-color-preview-primary', text: 'Primary' });
    row1.createSpan({ cls: 'birthday-color-preview-secondary', text: 'Secondary' });
    row1.createSpan({ cls: 'birthday-color-preview-accent', text: 'Accent' });
    previewEl.createDiv({ cls: 'birthday-color-preview-warning', text: 'Warning' });
    previewEl.createDiv({ cls: 'birthday-color-preview-success', text: 'Success' });

    // Language
    new Setting(containerEl)
      .setName(locale.settingsLanguage)
      .setDesc(locale.settingsLanguageDesc)
      .addDropdown(dropdown => {
        dropdown.addOption('zh-cn', '中文');
        dropdown.addOption('en-us', 'English');
        dropdown.setValue(settings.language);
        dropdown.onChange(async (value) => {
          settings.language = value;
          await this.plugin.saveSettings();
        });
      });

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

  getSettingDefinitions(): SettingDefinitionItem<string>[] {
    // 保留新API实现以备将来使用
    // 目前主要使用传统的display()方法
    return [];
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
