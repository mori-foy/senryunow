// 拗音・小書き母音（直前の子音と合わせて1モーラになるため単独ではカウントしない）
const SMALL_KANA = new Set([
  "ぁ","ぃ","ぅ","ぇ","ぉ","ゃ","ゅ","ょ","ゎ",
  "ァ","ィ","ゥ","ェ","ォ","ャ","ュ","ョ","ヮ",
]);

// 子音だけで1モーラを形成する文字（促音・撥音）
const CONSONANT_MORA = new Set(["っ","ッ","ん","ン"]);

export function countMora(text: string): number {
  let count = 0;
  for (const char of text) {
    if (CONSONANT_MORA.has(char)) {
      count++;
      continue;
    }
    if (SMALL_KANA.has(char)) continue;
    // 通常のひらがな・カタカナ・長音符
    if (
      (char >= "ぁ" && char <= "ゖ") ||
      (char >= "ァ" && char <= "ー")
    ) {
      count++;
    } else if (char >= "一" && char <= "鿿") {
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
