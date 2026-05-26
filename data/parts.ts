export interface Part {
  id: string;
  text: string;
  reading: string;
  mora: number;
}

export const allParts: Part[] = [
  // 季語・自然系
  { id: "p001", text: "春風", reading: "はるかぜ", mora: 4 },
  { id: "p002", text: "夕暮れ", reading: "ゆうぐれ", mora: 4 },
  { id: "p003", text: "桜", reading: "さくら", mora: 3 },
  { id: "p004", text: "月明かり", reading: "つきあかり", mora: 5 },
  { id: "p005", text: "雪解け", reading: "ゆきどけ", mora: 4 },
  { id: "p006", text: "秋風", reading: "あきかぜ", mora: 4 },
  { id: "p007", text: "入道雲", reading: "にゅうどうぐも", mora: 6 },
  { id: "p008", text: "蛍", reading: "ほたる", mora: 3 },
  { id: "p009", text: "霜", reading: "しも", mora: 2 },
  { id: "p010", text: "波音", reading: "なみおと", mora: 4 },
  { id: "p011", text: "春雨", reading: "はるさめ", mora: 4 },
  { id: "p012", text: "夕立", reading: "ゆうだち", mora: 4 },
  { id: "p013", text: "星空", reading: "ほしぞら", mora: 4 },
  { id: "p014", text: "朝露", reading: "あさつゆ", mora: 4 },
  { id: "p015", text: "木枯らし", reading: "こがらし", mora: 4 },
  { id: "p016", text: "夕焼け", reading: "ゆうやけ", mora: 4 },
  { id: "p017", text: "雷", reading: "かみなり", mora: 4 },
  { id: "p018", text: "紅葉", reading: "もみじ", mora: 3 },
  { id: "p019", text: "雪", reading: "ゆき", mora: 2 },
  { id: "p020", text: "梅", reading: "うめ", mora: 2 },
  { id: "p021", text: "梅雨", reading: "つゆ", mora: 2 },
  { id: "p022", text: "向日葵", reading: "ひまわり", mora: 4 },
  { id: "p023", text: "朝霧", reading: "あさぎり", mora: 4 },
  { id: "p024", text: "初雪", reading: "はつゆき", mora: 4 },
  { id: "p025", text: "春の夜", reading: "はるのよる", mora: 5 },
  // 動詞・形容詞系
  { id: "p026", text: "揺れる", reading: "ゆれる", mora: 3 },
  { id: "p027", text: "消えた", reading: "きえた", mora: 3 },
  { id: "p028", text: "あざやか", reading: "あざやか", mora: 4 },
  { id: "p029", text: "淡い", reading: "あわい", mora: 3 },
  { id: "p030", text: "迷ってる", reading: "まよってる", mora: 5 },
  { id: "p031", text: "散りゆく", reading: "ちりゆく", mora: 4 },
  { id: "p032", text: "輝く", reading: "かがやく", mora: 4 },
  { id: "p033", text: "静かな", reading: "しずかな", mora: 4 },
  { id: "p034", text: "眩しい", reading: "まぶしい", mora: 4 },
  { id: "p035", text: "寂しい", reading: "さびしい", mora: 4 },
  { id: "p036", text: "懐かしい", reading: "なつかしい", mora: 5 },
  { id: "p037", text: "泣いてた", reading: "ないてた", mora: 4 },
  { id: "p038", text: "笑えた", reading: "わらえた", mora: 4 },
  { id: "p039", text: "流れる", reading: "ながれる", mora: 4 },
  { id: "p040", text: "消えそう", reading: "きえそう", mora: 4 },
  { id: "p041", text: "見えない", reading: "みえない", mora: 4 },
  { id: "p042", text: "桜散りゆく", reading: "さくらちりゆく", mora: 7 },
  { id: "p043", text: "揺れてた", reading: "ゆれてた", mora: 4 },
  // 助詞・接続系
  { id: "p044", text: "が", reading: "が", mora: 1 },
  { id: "p045", text: "は", reading: "は", mora: 1 },
  { id: "p046", text: "に", reading: "に", mora: 1 },
  { id: "p047", text: "を", reading: "を", mora: 1 },
  { id: "p048", text: "と", reading: "と", mora: 1 },
  { id: "p049", text: "でも", reading: "でも", mora: 2 },
  { id: "p050", text: "だけど", reading: "だけど", mora: 3 },
  { id: "p051", text: "なのに", reading: "なのに", mora: 3 },
  { id: "p052", text: "ながら", reading: "ながら", mora: 3 },
  { id: "p053", text: "から", reading: "から", mora: 2 },
  { id: "p054", text: "だから", reading: "だから", mora: 3 },
  { id: "p055", text: "けれど", reading: "けれど", mora: 3 },
  // 感情・日常系
  { id: "p056", text: "なんとなく", reading: "なんとなく", mora: 5 },
  { id: "p057", text: "ねむい", reading: "ねむい", mora: 3 },
  { id: "p058", text: "うれしい", reading: "うれしい", mora: 4 },
  { id: "p059", text: "つらいな", reading: "つらいな", mora: 4 },
  { id: "p060", text: "また今日も", reading: "またきょうも", mora: 5 },
  { id: "p061", text: "どうしよう", reading: "どうしよう", mora: 5 },
  { id: "p062", text: "ため息", reading: "ためいき", mora: 4 },
  { id: "p063", text: "わくわく", reading: "わくわく", mora: 4 },
  { id: "p064", text: "ドキドキ", reading: "どきどき", mora: 4 },
  { id: "p065", text: "なんでだろ", reading: "なんでだろ", mora: 5 },
  { id: "p066", text: "さびしいな", reading: "さびしいな", mora: 5 },
  { id: "p067", text: "眠れない", reading: "ねむれない", mora: 5 },
  { id: "p068", text: "また明日", reading: "またあした", mora: 5 },
  // 固有名詞・現代語系
  { id: "p069", text: "スマホ", reading: "すまほ", mora: 3 },
  { id: "p070", text: "コンビニ", reading: "こんびに", mora: 4 },
  { id: "p071", text: "ライン既読", reading: "らいんきどく", mora: 6 },
  { id: "p072", text: "夜が明けた", reading: "よるがあけた", mora: 6 },
  { id: "p073", text: "夜中に", reading: "よなかに", mora: 4 },
  { id: "p074", text: "3時すぎ", reading: "さんじすぎ", mora: 5 },
  { id: "p075", text: "目が冴えて", reading: "めがさえて", mora: 5 },
  { id: "p076", text: "肉まん", reading: "にくまん", mora: 4 },
  { id: "p077", text: "スマホ見て", reading: "すまほみて", mora: 5 },
  { id: "p078", text: "春終わる", reading: "はるおわる", mora: 5 },
  { id: "p079", text: "コンビニで", reading: "こんびにで", mora: 5 },
  { id: "p080", text: "迷う俺", reading: "まようおれ", mora: 5 },
];

export function getRandomParts(count: number, exclude: string[] = []): Part[] {
  const available = allParts.filter((p) => !exclude.includes(p.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
