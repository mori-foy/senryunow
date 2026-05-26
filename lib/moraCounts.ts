const SMALL_KANA = new Set([
  "ぁ","ぃ","ぅ","ぇ","ぉ","ゃ","ゅ","ょ","ゎ",
  "ァ","ィ","ゥ","ェ","ォ","ャ","ュ","ョ","ヮ",
]);

export function countMora(text: string): number {
  let count = 0;
  for (const char of text) {
    if (SMALL_KANA.has(char)) continue;
    // Regular hiragana (ぁ-ん), katakana (ァ-ン), long vowel mark ー
    if (
      (char >= "ぁ" && char <= "ゖ") ||
      (char >= "ァ" && char <= "ー")
    ) {
      count++;
    } else if (char >= "一" && char <= "鿿") {
      // CJK unified ideographs — rough average
      count += 2;
    } else if (/\S/.test(char) && char !== "／" && char !== "/" && char !== "　") {
      count++;
    }
  }
  return count;
}

export function validateLines(lines: [string, string, string]): {
  valid: boolean;
  counts: [number, number, number];
  errors: [string | null, string | null, string | null];
} {
  const targets: [number, number, number] = [5, 7, 5];
  const counts = lines.map(countMora) as [number, number, number];
  const errors = counts.map((c, i) =>
    c === targets[i] ? null : `現在${c}音（${targets[i]}音必要）`
  ) as [string | null, string | null, string | null];
  return {
    valid: errors.every((e) => e === null),
    counts,
    errors,
  };
}
