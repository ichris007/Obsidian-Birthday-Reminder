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
  
  function solar2lunar(year: number, month: number, day: number): LunarResult | null;
  function lunar2solar(year: number, month: number, day: number, isLeap?: boolean): { year: number; month: number; day: number } | null;
  
  const solarlunar: {
    solar2lunar: typeof solar2lunar;
    lunar2solar: typeof lunar2solar;
  };
  
  export default solarlunar;
}