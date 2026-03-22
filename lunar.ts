import solarLunar from 'solarlunar';

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  monthName: string;
  dayName: string;
}

// 农历月份名称（中文）
const MONTH_NAMES_CN = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
// 农历日期名称（中文）
const DAY_NAMES_CN = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

// 农历月份名称（英文）
const MONTH_NAMES_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// 农历日期名称（英文）- 使用序数词
function getDayNameEn(day: number): string {
  const suffixes = ['st', 'nd', 'rd'];
  const lastDigit = day % 10;
  const suffix = (day >= 11 && day <= 13) ? 'th' : (suffixes[lastDigit - 1] || 'th');
  return `${day}${suffix}`;
}

// 生肖英文映射
const ANIMALS_EN: Record<string, string> = {
  '鼠': 'Rat',
  '牛': 'Ox',
  '虎': 'Tiger',
  '兔': 'Rabbit',
  '龙': 'Dragon',
  '蛇': 'Snake',
  '马': 'Horse',
  '羊': 'Goat',
  '猴': 'Monkey',
  '鸡': 'Rooster',
  '狗': 'Dog',
  '猪': 'Pig'
};

// 星座英文映射
const ZODIAC_EN: Record<string, string> = {
  '摩羯座': 'Capricorn',
  '水瓶座': 'Aquarius',
  '双鱼座': 'Pisces',
  '白羊座': 'Aries',
  '金牛座': 'Taurus',
  '双子座': 'Gemini',
  '巨蟹座': 'Cancer',
  '狮子座': 'Leo',
  '处女座': 'Virgo',
  '天秤座': 'Libra',
  '天蝎座': 'Scorpio',
  '射手座': 'Sagittarius'
};

// 公历转农历（支持语言参数）
export function solarToLunar(date: Date, language: string = 'zh-cn'): LunarDate {
  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const lunar = solarLunar.solar2lunar(year, month, day);
    
    if (!lunar) {
      throw new Error('Lunar conversion returned null');
    }
    
    const isEnglish = language === 'en-us';
    const monthName = isEnglish 
      ? MONTH_NAMES_EN[lunar.lMonth - 1]
      : MONTH_NAMES_CN[lunar.lMonth - 1];
    const dayName = isEnglish
      ? getDayNameEn(lunar.lDay)
      : DAY_NAMES_CN[lunar.lDay - 1];
    
    return {
      year: lunar.lYear,
      month: lunar.lMonth,
      day: lunar.lDay,
      isLeap: lunar.isLeap === true,
      monthName: monthName,
      dayName: dayName
    };
  } catch (e) {
    console.warn('Lunar conversion failed:', e);
    const isEnglish = language === 'en-us';
    const monthIndex = date.getMonth();
    const dayNum = date.getDate();
    return {
      year: date.getFullYear(),
      month: monthIndex + 1,
      day: dayNum,
      isLeap: false,
      monthName: isEnglish ? MONTH_NAMES_EN[monthIndex] : MONTH_NAMES_CN[monthIndex],
      dayName: isEnglish ? getDayNameEn(dayNum) : DAY_NAMES_CN[(dayNum - 1) % 30]
    };
  }
}

// 获取生肖（支持语言参数）
export function getAnimal(year: number, language: string = 'zh-cn'): string {
  const animalsCn = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const offset = (year - 1900) % 12;
  const animalCn = animalsCn[offset >= 0 ? offset : offset + 12];
  
  if (language === 'en-us') {
    return ANIMALS_EN[animalCn] || animalCn;
  }
  return animalCn;
}

// 获取星座（支持语言参数）
export function getZodiac(month: number, day: number, language: string = 'zh-cn'): string {
  const signsCn = ['摩羯座', '水瓶座', '双鱼座', '白羊座', '金牛座', '双子座',
                   '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座'];
  const boundaries = [19, 18, 20, 19, 20, 21, 22, 22, 22, 23, 22, 21];
  
  let index = 0;
  for (let i = 0; i < boundaries.length; i++) {
    if ((month === i + 1 && day > boundaries[i]) || month > i + 1) {
      index = i + 1;
    }
  }
  const zodiacCn = signsCn[index % 12];
  
  if (language === 'en-us') {
    return ZODIAC_EN[zodiacCn] || zodiacCn;
  }
  return zodiacCn;
}

// 获取干支年（中文，不需要翻译）
export function getGanZhi(year: number): string {
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const offset = (year - 1984) % 60;
  const ganIndex = ((offset % 10) + 10) % 10;
  const zhiIndex = ((offset % 12) + 12) % 12;
  return gan[ganIndex] + zhi[zhiIndex];
}