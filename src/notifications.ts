import { Notice, Platform } from 'obsidian';
import type BirthdayReminderPlugin from './main';
import type { BirthdayReminderSettings } from './settings';
import type { BirthdayData } from './birthdays';
import { collectBirthdays } from './birthdays';
import type { Language, LocaleMessages } from './locales';
import { getLocale } from './locales';
import { toDateKey, todayDateOnly } from './utils';

export interface ReminderSummary {
  title: string;
  lines: string[];
}

const MAX_NAMES_PER_LINE = 3;

function formatNames(
  items: BirthdayData[],
  locale: LocaleMessages,
  isEnglish: boolean
): string {
  const shown = items.slice(0, MAX_NAMES_PER_LINE).map((item) => {
    const age = isEnglish ? `${item.age} ${locale.ageUnitEn}` : `${item.age}${locale.ageUnit}`;
    return isEnglish ? `${item.name} (${age})` : `${item.name}（${age}）`;
  });
  const rest = items.length - shown.length;
  if (rest > 0) {
    shown.push(locale.notifyMore.replace('{count}', String(rest)));
  }
  return shown.join(isEnglish ? ', ' : '、');
}

/**
 * 生成一条合并提醒：今天的生日 + 提前 N 天的生日。
 * 没有任何可提醒项时返回 null。
 */
export function buildReminderSummary(
  data: BirthdayData[],
  settings: BirthdayReminderSettings,
  locale: LocaleMessages
): ReminderSummary | null {
  const isEnglish = settings.language === 'en-us';
  const separator = isEnglish ? ': ' : '：';

  const todays = data.filter((item) => item.daysRemaining === 0);
  const offsets = Array.from(new Set(settings.reminderDays))
    .filter((day) => day > 0)
    .sort((a, b) => a - b);
  const upcoming = data.filter((item) => offsets.includes(item.daysRemaining));

  if (todays.length === 0 && upcoming.length === 0) return null;

  const lines: string[] = [];
  if (todays.length > 0) {
    lines.push(`${locale.notifyTodayLabel}${separator}${formatNames(todays, locale, isEnglish)}`);
  }
  for (const offset of offsets) {
    const group = upcoming.filter((item) => item.daysRemaining === offset);
    if (group.length === 0) continue;
    lines.push(`${offset}${locale.notifyDaysSuffix}${separator}${formatNames(group, locale, isEnglish)}`);
  }

  return { title: locale.notifyTitle, lines };
}

/** "09:30" → 570。非法值回落到 09:00，保证配置写错也不会整天不提醒。 */
export function parseTimeToMinutes(value: string): number {
  const matched = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!matched) return 9 * 60;
  const hours = Number(matched[1]);
  const minutes = Number(matched[2]);
  if (hours > 23 || minutes > 59) return 9 * 60;
  return hours * 60 + minutes;
}

export function isTimeReached(value: string, now: Date = new Date()): boolean {
  return now.getHours() * 60 + now.getMinutes() >= parseTimeToMinutes(value);
}

/**
 * 每日提醒调度：
 * - 启动时补一次（今天还没提醒过且已过设定时间就发）
 * - 之后每分钟 tick 一次，当天只提醒一次（lastNotifiedDate 去重）
 * - 桌面走系统通知，移动端退化为 Notice
 */
export class ReminderService {
  private timer: number | null = null;

  constructor(private readonly plugin: BirthdayReminderPlugin) {}

  start(): void {
    this.stop();
    this.timer = window.setInterval(() => this.check(false), 60 * 1000);
    this.plugin.registerInterval(this.timer);
    this.check(false);
  }

  stop(): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** force=true 时忽略开关、时间与当日去重（手动命令用） */
  check(force: boolean): void {
    const settings = this.plugin.settings;
    if (!force && !settings.notifyEnabled) return;

    const today = toDateKey(todayDateOnly());
    if (!force && settings.lastNotifiedDate === today) return;
    if (!force && !isTimeReached(settings.notifyTime)) return;

    const data = collectBirthdays(this.plugin.app, settings);
    const locale = getLocale(settings.language as Language);
    const summary = buildReminderSummary(data, settings, locale);

    // 手动命令没有任何可见反馈是最难排查的失败，留一行给 DevTools
    console.debug('[birthday-reminder] reminder check', {
      force,
      records: data.length,
      lines: summary ? summary.lines : null
    });

    if (!summary) {
      if (force) new Notice(locale.notifyNothing);
      // 自动检查即使没内容也记一笔，避免这一整天每分钟重复扫库
      if (!force) void this.markNotified(today);
      return;
    }

    // 手动检查一律走应用内提示：系统通知被 macOS 静默拦掉时，命令会看起来「毫无反应」
    this.deliver(summary, force);
    // 手动检查不占用当天名额，否则上午手动看一眼就会把 09:00 的自动提醒顶掉
    if (!force) void this.markNotified(today);
  }

  private async markNotified(today: string): Promise<void> {
    if (this.plugin.settings.lastNotifiedDate === today) return;
    this.plugin.settings.lastNotifiedDate = today;
    await this.plugin.saveSettings();
  }

  /** preferNotice=true 时跳过系统通知，直接弹应用内提示（手动命令用） */
  private deliver(summary: ReminderSummary, preferNotice = false): void {
    const body = summary.lines.join('\n');

    if (!preferNotice && this.canUseSystemNotification()) {
      try {
        const notification = new Notification(summary.title, { body });
        notification.onclick = () => {
          window.focus();
          void this.plugin.activateView();
        };
        return;
      } catch (error) {
        console.warn('Desktop notification failed, falling back to Notice:', error);
      }
    }

    const notice = new Notice(`${summary.title}\n${body}`, 15000);
    // messageEl 替代已弃用的 noticeEl（since 1.8.7，本插件 minAppVersion 1.12.7）
    notice.messageEl.addEventListener('click', () => void this.plugin.activateView());
  }

  /**
   * 系统通知是否可用：桌面端 + API 存在 + 没被用户拒绝。
   * ⚠ macOS 的系统级开关（系统设置 → 通知）读不到，permission 通常恒为 granted，
   * 那种情况下仍会静默不显示，需要用户自己在系统设置里放开。
   */
  private canUseSystemNotification(): boolean {
    if (!Platform.isDesktopApp) return false;
    if (typeof Notification !== 'function') return false;
    return Notification.permission !== 'denied';
  }
}
