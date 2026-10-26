// utils.ts - 日期与 frontmatter 工具
//
// 关键约束：生日是「纯日期」，不带时区。任何一步经过 Date 的 ISO/UTC 解析都会引入偏移：
//   new Date('1990-05-20')          → 按 UTC 解析，UTC-4/5 得到 5 月 19 日
//   date.toISOString().slice(0,10)  → 在 UTC+8 把本地 5 月 20 日零点写成 5 月 19 日
// 因此这里统一只处理 {year, month, day} 整数三元组，比较与运算全部走 UTC 序数。

export interface DateOnly {
  year: number;
  /** 1-12 */
  month: number;
  /** 1-31 */
  day: number;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const DATE_ONLY_RE = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/;

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function makeDateOnly(year: number, month: number, day: number): DateOnly | null {
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

/**
 * 把 frontmatter 里的值解析成纯日期。
 * 支持 "1990-05-20"、"1990/5/20"、"1990.5.20"（可带时间后缀）、Date 对象、时间戳数字。
 */
export function parseDateOnly(value: unknown): DateOnly | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    // Date 对象取本地年月日，绝不 toISOString
    return makeDateOnly(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }

  if (typeof value === 'number') {
    const fromNumber = new Date(value);
    if (Number.isNaN(fromNumber.getTime())) return null;
    return makeDateOnly(fromNumber.getFullYear(), fromNumber.getMonth() + 1, fromNumber.getDate());
  }

  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text) return null;

  const matched = DATE_ONLY_RE.exec(text);
  if (matched) {
    return makeDateOnly(Number(matched[1]), Number(matched[2]), Number(matched[3]));
  }

  // 兜底：交给 Date 解析，但只取本地年月日（用于 "May 20, 1990" 这类写法）
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return makeDateOnly(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
}

/**
 * 两位补零。
 * 不用 `String(n).padStart(2, '0')`：`padStart` 属于 ES2017，本项目的 lib 只到 ES7，
 * 类型声明是靠 @types/node 的 `reference lib="es2020"` 间接带来的；审核环境的类型检查
 * 不加载 node types 时会退化成 any，触发 no-unsafe-call / no-unsafe-assignment。
 */
function pad2(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

export function toDateKey(date: DateOnly): string {
  return `${date.year}-${pad2(date.month)}-${pad2(date.day)}`;
}

/** 归一化签名：字符串、Date、时间戳都能比，用于判断属性值是否真的变了 */
export function birthdaySignature(value: unknown): string {
  const parsed = parseDateOnly(value);
  return parsed ? toDateKey(parsed) : '';
}

/** 农历生日：year 为农历年，month 为农历月（1-12），day 为农历日（1-30） */
export interface LunarInput {
  year: number;
  month: number;
  day: number;
  /** 闰月，写作 `1990-04L-26` 里的 L */
  isLeap: boolean;
}

const LUNAR_RE = /^(\d{4})[-/.](\d{1,2})([Ll]?)[-/.](\d{1,2})$/;

/** 解析农历生日，格式 `YYYY-MM-DD`，闰月把 L 缀在月份后：`2023-02L-01` */
export function parseLunarDate(value: unknown): LunarInput | null {
  if (typeof value !== 'string') return null;
  const matched = LUNAR_RE.exec(value.trim());
  if (!matched) return null;
  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[4]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 30) return null;
  return { year, month, day, isLeap: matched[3] !== '' };
}

export function lunarKey(value: LunarInput): string {
  return `${value.year}-${pad2(value.month)}${value.isLeap ? 'L' : ''}-${pad2(value.day)}`;
}

/** 构造本地正午的 Date，交给 solarlunar 时不会被 DST 的零点跳变影响 */
export function toLocalDate(date: DateOnly): Date {
  return new Date(date.year, date.month - 1, date.day, 12, 0, 0, 0);
}

export function todayDateOnly(): DateOnly {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

/** UTC 序数：纯日期相减，跨夏令时也不会多出/少掉一天 */
function dayOrdinal(date: DateOnly): number {
  return Math.round(Date.UTC(date.year, date.month - 1, date.day) / 86400000);
}

export function diffInDays(from: DateOnly, to: DateOnly): number {
  return dayOrdinal(to) - dayOrdinal(from);
}

export function isLeapYear(year: number): boolean {
  return daysInMonth(year, 2) === 29;
}

/**
 * 某个生日在指定年份的实际日期。
 * 2 月 29 日在平年顺延到 3 月 1 日（沿用 1.5.x 的行为，避免老用户看到日期跳变）。
 */
export function birthdayInYear(birth: DateOnly, year: number): DateOnly {
  if (birth.month === 2 && birth.day === 29 && !isLeapYear(year)) {
    return { year, month: 3, day: 1 };
  }
  const safeDay = Math.min(birth.day, daysInMonth(year, birth.month));
  return { year, month: birth.month, day: safeDay };
}

export interface NextBirthday {
  date: DateOnly;
  /** 距离今天的天数，0 表示今天 */
  daysRemaining: number;
  /** 这次生日当天满多少岁 */
  age: number;
}

/** 下一次生日（含今天）。今天生日返回 0，昨天生日则滚到明年。 */
export function nextBirthday(birth: DateOnly, today: DateOnly): NextBirthday {
  const thisYear = birthdayInYear(birth, today.year);
  if (diffInDays(today, thisYear) >= 0) {
    return { date: thisYear, daysRemaining: diffInDays(today, thisYear), age: today.year - birth.year };
  }
  const nextYear = birthdayInYear(birth, today.year + 1);
  return { date: nextYear, daysRemaining: diffInDays(today, nextYear), age: today.year + 1 - birth.year };
}
