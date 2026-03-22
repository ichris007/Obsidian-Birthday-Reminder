import { App, PluginSettingTab, Setting } from 'obsidian';
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

export class BirthdayReminderSettingTab extends PluginSettingTab {
  plugin: BirthdayReminderPlugin;

  constructor(app: App, plugin: BirthdayReminderPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  private getLocale(): LocaleMessages {
    return getLocale(this.plugin.settings.language as Language);
  }

  private getColorSchemeName(key: string): string {
    const locale = this.getLocale();
    const names: Record<string, string> = {
      default: locale.colorSchemeDefault,
      warm: locale.colorSchemeWarm,
      cool: locale.colorSchemeCool,
      nature: locale.colorSchemeNature,
      purple: locale.colorSchemePurple,
    };
    return names[key] || key;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    const locale = this.getLocale();

    containerEl.createEl('h2', { text: locale.settingsTitle });

    new Setting(containerEl)
      .setName(locale.settingsTargetPath)
      .setDesc(locale.settingsTargetPathDesc)
      .addText(text => text
        .setPlaceholder(locale.settingsTargetPathPlaceholder)
        .setValue(this.plugin.settings.targetPath)
        .onChange(async (value) => {
          this.plugin.settings.targetPath = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(locale.settingsBirthdayProperty)
      .setDesc(locale.settingsBirthdayPropertyDesc)
      .addText(text => text
        .setPlaceholder(locale.settingsBirthdayPropertyPlaceholder)
        .setValue(this.plugin.settings.birthdayProperty)
        .onChange(async (value) => {
          const newValue = value.trim();
          this.plugin.settings.birthdayProperty = newValue || 'birthday';
          await this.plugin.saveSettings();
        }));

    // 添加提示示例
    const exampleEl = containerEl.createDiv({ cls: 'setting-item-description' });
    exampleEl.style.marginBottom = '16px';
    exampleEl.style.fontSize = '12px';
    exampleEl.style.color = 'var(--text-muted)';
    exampleEl.innerHTML = `
      💡 ${locale.settingsBirthdayPropertyDesc}<br>
      - ${locale.settingsBirthdayPropertyPlaceholder}: <code>birthday: 1990-05-20</code><br>
      - date_of_birth: <code>date_of_birth: 1990-05-20</code>
    `;

    new Setting(containerEl)
      .setName(locale.settingsVisibleMonths)
      .setDesc(locale.settingsVisibleMonthsDesc)
      .addSlider(slider => slider
        .setLimits(1, 6, 1)
        .setValue(this.plugin.settings.visibleMonths)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.visibleMonths = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(locale.settingsColorScheme)
      .setDesc(locale.settingsColorSchemeDesc)
      .addDropdown(dropdown => {
        Object.entries(COLOR_SCHEMES).forEach(([key, scheme]) => {
          dropdown.addOption(key, this.getColorSchemeName(key));
        });
        dropdown.setValue(this.plugin.settings.colorScheme);
        dropdown.onChange(async (value) => {
          this.plugin.settings.colorScheme = value;
          await this.plugin.saveSettings();
          this.display();
        });
      });

    // 预览配色
    const scheme = COLOR_SCHEMES[this.plugin.settings.colorScheme];
    const previewEl = containerEl.createDiv({ cls: 'birthday-color-preview' });
    previewEl.style.cssText = `
      margin: 16px 0;
      padding: 12px;
      background: var(--background-primary);
      border-radius: 8px;
      border: 1px solid var(--background-modifier-border);
    `;
    previewEl.innerHTML = `
      <div style="display: flex; gap: 12px; margin-bottom: 8px;">
        <span style="background: ${scheme.primary}; color: white; padding: 2px 8px; border-radius: 4px;">${locale.colorSchemeDefault}</span>
        <span style="background: ${scheme.secondary}; padding: 2px 8px; border-radius: 4px;">${locale.colorSchemeDefault}</span>
        <span style="color: ${scheme.accent}; font-weight: bold;">${locale.colorSchemeDefault}</span>
      </div>
      <div style="background: ${scheme.warning}; padding: 4px; border-radius: 4px;">${locale.colorSchemeDefault}</div>
      <div style="background: ${scheme.success}; padding: 4px; border-radius: 4px; margin-top: 4px;">${locale.colorSchemeDefault}</div>
    `;

    new Setting(containerEl)
      .setName(locale.settingsLanguage)
      .setDesc(locale.settingsLanguageDesc)
      .addDropdown(dropdown => {
        dropdown.addOption('zh-cn', '中文');
        dropdown.addOption('en-us', 'English');
        dropdown.setValue(this.plugin.settings.language);
        dropdown.onChange(async (value) => {
          this.plugin.settings.language = value;
          await this.plugin.saveSettings();
          this.display();
        });
      });

    new Setting(containerEl)
      .setName(locale.settingsEnableLunar)
      .setDesc(locale.settingsEnableLunarDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableLunar)
        .onChange(async (value) => {
          this.plugin.settings.enableLunar = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(locale.settingsEnableZodiac)
      .setDesc(locale.settingsEnableZodiacDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableZodiac)
        .onChange(async (value) => {
          this.plugin.settings.enableZodiac = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(locale.settingsEnableCalendar)
      .setDesc(locale.settingsEnableCalendarDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableCalendar)
        .onChange(async (value) => {
          this.plugin.settings.enableCalendar = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(locale.settingsShowStatistics)
      .setDesc(locale.settingsShowStatisticsDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showStatistics)
        .onChange(async (value) => {
          this.plugin.settings.showStatistics = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(locale.settingsHighlightToday)
      .setDesc(locale.settingsHighlightTodayDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.highlightToday)
        .onChange(async (value) => {
          this.plugin.settings.highlightToday = value;
          await this.plugin.saveSettings();
        }));
  }
}