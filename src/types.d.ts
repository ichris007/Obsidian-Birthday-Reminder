declare module 'solarlunar' {
  interface LunarResult {
    lYear: number;      // 农历年
    lMonth: number;     // 农历月
    lDay: number;       // 农历日
    isLeap: boolean;    // 是否闰月
    lunarYear?: string; // 农历年中文
    lunarMonth?: string;// 农历月中文
    lunarDay?: string;  // 农历日中文
  }

  /** lunar2solar 实际返回带公历 cYear/cMonth/cDay 的完整对象，非法日期返回 -1 */
  interface SolarResult {
    lYear: number;
    lMonth: number;
    lDay: number;
    isLeap: boolean;
    cYear: number;
    cMonth: number;
    cDay: number;
    animal?: string;
    gzYear?: string;
  }

  const solarlunar: {
    solar2lunar: (year: number, month: number, day: number) => LunarResult | null;
    lunar2solar: (year: number, month: number, day: number, isLeap?: boolean) => SolarResult | number;
  };

  export default solarlunar;
}