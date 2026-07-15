import { App, PluginSettingTab, SettingDef } from 'obsidian';
import BirthdayReminderPlugin from './main';
import { getLocale, Language, LocaleMessages } from './locales';

export interface BirthdayReminderSettings {
  targetPath: string;
  visibleMonths: number;
  colorScheme: string;
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

// 配色方案
export const COLOR_SCHEMES: Record<string, { name: string; primary: string; secondary: string; accent: string; warning: string; success: string }> = {
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

export class BirthdayReminderSettingTab extends PluginSettingTab<BirthdayReminderPlugin> {
  constructor(app: App, plugin: BirthdayReminderPlugin) {
    super(app, plugin);
  }

  private getLocale(): LocaleMessages {
    return getLocale(this.plugin.settings.language as Language);
  }

  private getColorSchemeName(key: keyof typeof COLOR_SCHEMES): string {
    const locale = this.getLocale();
    const names: Record<keyof typeof COLOR_SCHEMES, string> = {
      default: locale.colorSchemeDefault,
      warm: locale.colorSchemeWarm,
      cool: locale.colorSchemeCool,
      nature: locale.colorSchemeNature,
      purple: locale.colorSchemePurple,
    };
    return names[key] ?? key;
  }

  async getSettingDefinitions(): Promise<SettingDef[]> {
    const locale = this.getLocale();
    const settings = this.plugin.settings;

    const definitions: SettingDef[] = [];

    // Helper function to create elements with proper document context
    const createEl = (containerEl: HTMLElement, tag: string, className?: string, textContent?: string): HTMLElement => {
      const el = containerEl.ownerDocument.createElement(tag);
      if (className) el.className = className;
      if (textContent) el.textContent = textContent;
      return el;
    };

    // Header
    definitions.push({
      type: 'header',
      name: locale.settingsTitle,
    });

    // Target Path
    definitions.push({
      type: 'text',
      name: locale.settingsTargetPath,
      description: locale.settingsTargetPathDesc,
      value: settings.targetPath,
      placeholder: locale.settingsTargetPathPlaceholder,
      onChange: (value: string) => {
        settings.targetPath = value;
        void this.plugin.saveSettings();
      },
    });

    // Birthday Property
    definitions.push({
      type: 'text',
      name: locale.settingsBirthdayProperty,
      description: locale.settingsBirthdayPropertyDesc,
      value: settings.birthdayProperty,
      placeholder: locale.settingsBirthdayPropertyPlaceholder,
      onChange: (value: string) => {
        const newValue = value.trim();
        settings.birthdayProperty = newValue || 'birthday';
        void this.plugin.saveSettings();
      },
    });

    // Birthday Property Examples (container)
    definitions.push({
      type: 'container',
      name: (containerEl: HTMLElement) => {
        const exampleEl = createEl(containerEl, 'div', 'setting-item-description');
        const exampleText1 = createEl(containerEl, 'span', undefined, `${locale.settingsBirthdayPropertyDesc} `);
        const code1 = createEl(containerEl, 'span', 'code-example', `${locale.settingsBirthdayPropertyPlaceholder}: 1990-05-20`);
        const exampleText2 = createEl(containerEl, 'span', undefined, ` - date_of_birth: `);
        const code2 = createEl(containerEl, 'span', 'code-example', `date_of_birth: 1990-05-20`);
        exampleEl.append(exampleText1, code1, exampleText2, code2);
        return exampleEl;
      },
    });

    // Visible Months
    definitions.push({
      type: 'slider',
      name: locale.settingsVisibleMonths,
      description: locale.settingsVisibleMonthsDesc,
      value: settings.visibleMonths,
      min: 1,
      max: 6,
      step: 1,
      onChange: (value: number) => {
        settings.visibleMonths = value;
        void this.plugin.saveSettings();
      },
    });

    // Color Scheme
    definitions.push({
      type: 'dropdown',
      name: locale.settingsColorScheme,
      description: locale.settingsColorSchemeDesc,
      value: settings.colorScheme,
      options: (Object.keys(COLOR_SCHEMES) as Array<keyof typeof COLOR_SCHEMES>).map(key => ({
        value: key,
        label: this.getColorSchemeName(key),
      })),
      onChange: (value: string) => {
        settings.colorScheme = value;
        void this.plugin.saveSettings();
      },
    });

    // Color Preview
    definitions.push({
      type: 'container',
      name: (containerEl: HTMLElement) => {
        const previewEl = createEl(containerEl, 'div', 'birthday-color-preview-box');

        const row1 = createEl(previewEl, 'div', 'birthday-color-preview-row');
        createEl(row1, 'span', 'birthday-color-preview-primary', locale.colorSchemeDefault);
        createEl(row1, 'span', 'birthday-color-preview-secondary', locale.colorSchemeDefault);
        createEl(row1, 'span', 'birthday-color-preview-accent', locale.colorSchemeDefault);

        createEl(previewEl, 'div', 'birthday-color-preview-warning', locale.colorSchemeDefault);
        createEl(previewEl, 'div', 'birthday-color-preview-success', locale.colorSchemeDefault);

        return previewEl;
      },
    });

    // Language
    definitions.push({
      type: 'dropdown',
      name: locale.settingsLanguage,
      description: locale.settingsLanguageDesc,
      value: settings.language,
      options: [
        { value: 'zh-cn', label: '中文' },
        { value: 'en-us', label: 'English' },
      ],
      onChange: async (value: string) => {
        settings.language = value;
        try {
          await this.plugin.saveSettings();
        } catch (error) {
          console.error('Failed to save settings:', error);
        }
      },
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
      definitions.push({
        type: 'toggle',
        name,
        description: desc,
        value: settings[key],
        onChange: (value: boolean) => {
          settings[key] = value;
          void this.plugin.saveSettings();
        },
      });
    }

    return definitions;
  }
}