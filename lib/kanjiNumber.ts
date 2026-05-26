const KANJI: Record<string, string> = {
  "0": "〇", "1": "一", "2": "二", "3": "三", "4": "四",
  "5": "五", "6": "六", "7": "七", "8": "八", "9": "九",
};

export function toKanji(str: string | number): string {
  return String(str).replace(/[0-9]/g, (d) => KANJI[d] ?? d);
}
