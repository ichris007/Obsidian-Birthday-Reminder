import { App } from 'obsidian';
import type { BirthdayReminderSettings } from './settings';
import type { DateOnly, LunarInput } from './utils';
import {
  birthdaySignature,
  isRecord,
  lunarKey,
  nextBirthday,
  parseDateOnly,
  parseLunarDate,
  toDateKey,
  toLocalDate,
  todayDateOnly,
} from './utils';
import {
  formatLunarMonthDay,
  getAnimal,
  getGanZhi,
  getZodiac,
  lunarToSolar,
  nextLunarOccurrence,
  solarToLunar,
} from './lunar';

export type BirthdayCalendar = 'solar' | 'lunar';

export interface BirthdayData {
  name: string;
  path: string;
  /** 生日按公历还是农历记录 */
  calendar: BirthdayCalendar;
  /** 原始生日：公历 YYYY-MM-DD / 农历 YYYY-MM-DD（闰月带 L） */
  birthday: string;
  /** 下一次生日的公历日期 */
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
  /** 别名列表，仅用于搜索命中 */
  aliases: string[];
}

/**
 * 别名归一化：Obsidian 的 aliases 可能是数组，也可能是一行用逗号/顿号分隔的文本。
 * 统一拆成去重后的字符串数组，空白项丢弃。
 */
export function parseAliases(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  const raw = Array.isArray(value) ? value : [value];
  const out: string[] = [];
  for (const entry of raw) {
    if (typeof entry !== 'string') continue;
    for (const part of entry.split(/[,，、;；]+/)) {
      const alias = part.trim();
      if (alias) out.push(alias);
    }
  }
  return Array.from(new Set(out));
}

/**
 * 生日属性签名：公历、农历与别名一起归一化，
 * 只要其中一个变了就认为需要刷新，正文改动则保持不动。
 */
export function birthdaySignatureFor(
  frontmatter: Record<string, unknown> | null,
  settings: BirthdayReminderSettings
): string {
  const solarRaw = frontmatter ? frontmatter[settings.birthdayProperty] : undefined;
  const lunarRaw = settings.lunarProperty && frontmatter ? frontmatter[settings.lunarProperty] : undefined;
  const aliasRaw = settings.aliasProperty && frontmatter ? frontmatter[settings.aliasProperty] : undefined;
  const lunarParsed = parseLunarDate(lunarRaw);
  const aliases = parseAliases(aliasRaw).join(',');
  return `${birthdaySignature(solarRaw)}|${lunarParsed ? lunarKey(lunarParsed) : ''}|${aliases}`;
}

function makeSolarItem(
  file: { path: string; name: string },
  birth: DateOnly,
  today: DateOnly,
  settings: BirthdayReminderSettings,
  aliases: string[]
): BirthdayData {
  const language = settings.language;
  const next = nextBirthday(birth, today);

  let lunarInfo: string | null = null;
  if (settings.enableLunar) {
    const lunar = solarToLunar(toLocalDate(birth), language);
    if (lunar) lunarInfo = formatLunarMonthDay(lunar.month, lunar.day, lunar.isLeap, language);
  }

  return {
    name: file.name.replace(/\.md$/, ''),
    path: file.path,
    calendar: 'solar',
    birthday: toDateKey(birth),
    nextBirthday: toDateKey(next.date),
    daysRemaining: next.daysRemaining,
    age: next.age,
    lunarInfo,
    animal: settings.enableZodiac ? getAnimal(birth.year, language) : null,
    zodiac: settings.enableZodiac ? getZodiac(birth.month, birth.day, language) : null,
    ganZhi: settings.enableZodiac ? getGanZhi(birth.year) : null,
    isToday: next.daysRemaining === 0,
    monthDay: `${next.date.month}-${next.date.day}`,
    birthMonth: next.date.month - 1,
    birthDay: next.date.day,
    aliases,
  };
}

function makeLunarItem(
  file: { path: string; name: string },
  birth: LunarInput,
  today: DateOnly,
  settings: BirthdayReminderSettings,
  aliases: string[]
): BirthdayData | null {
  const language = settings.language;
  const next = nextLunarOccurrence(birth, today);
  if (!next) return null;

  // 农历生日也要有星座：用出生那年的公历日期算
  const birthSolar = lunarToSolar(birth);

  return {
    name: file.name.replace(/\.md$/, ''),
    path: file.path,
    calendar: 'lunar',
    birthday: toDateKey({ year: birth.year, month: birth.month, day: birth.day }),
    nextBirthday: toDateKey(next.date),
    daysRemaining: next.daysRemaining,
    age: next.age,
    // 农历生日本身就是农历日期，即使关闭「显示农历」也保留可读写法
    lunarInfo: formatLunarMonthDay(birth.month, birth.day, birth.isLeap, language),
    animal: settings.enableZodiac ? getAnimal(birth.year, language) : null,
    zodiac: settings.enableZodiac && birthSolar ? getZodiac(birthSolar.month, birthSolar.day, language) : null,
    ganZhi: settings.enableZodiac ? getGanZhi(birth.year) : null,
    isToday: next.daysRemaining === 0,
    monthDay: `${next.date.month}-${next.date.day}`,
    birthMonth: next.date.month - 1,
    birthDay: next.date.day,
    aliases,
  };
}

/**
 * 收集全库生日数据。视图与通知共用同一份实现，保证两边算出的结果一致。
 * 传入 snapshots 时会顺带写入各文件的属性签名（供 main.ts 判断属性是否真的变了）。
 */
export function collectBirthdays(
  app: App,
  settings: BirthdayReminderSettings,
  snapshots?: Map<string, string>
): BirthdayData[] {
  const items: BirthdayData[] = [];
  const today = todayDateOnly();
  const lunarProperty = settings.lunarProperty;

  for (const file of app.vault.getMarkdownFiles()) {
    const cache = app.metadataCache.getFileCache(file);
    const frontmatterRaw = cache?.frontmatter;
    const frontmatter = isRecord(frontmatterRaw) ? frontmatterRaw : null;

    if (snapshots) snapshots.set(file.path, birthdaySignatureFor(frontmatter, settings));
    if (!frontmatter) continue;
    if (settings.targetPath && !file.path.startsWith(settings.targetPath)) continue;

    const solarBirth = parseDateOnly(frontmatter[settings.birthdayProperty]);
    if (solarBirth) {
      const aliases = settings.aliasProperty ? parseAliases(frontmatter[settings.aliasProperty]) : [];
      items.push(makeSolarItem(file, solarBirth, today, settings, aliases));
      continue;
    }

    if (!lunarProperty) continue;
    const lunarBirth = parseLunarDate(frontmatter[lunarProperty]);
    if (!lunarBirth) continue;
    const lunarAliases = settings.aliasProperty ? parseAliases(frontmatter[settings.aliasProperty]) : [];
    const item = makeLunarItem(file, lunarBirth, today, settings, lunarAliases);
    if (item) items.push(item);
  }

  items.sort((a, b) => a.daysRemaining - b.daysRemaining);
  return items;
}
