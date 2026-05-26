export interface Stamp {
  emoji: string;
  username: string;
}

export interface RedPenComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: Date;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  lines: [string, string, string];
  timestamp: Date;
  stamps: Stamp[];
  redPenComments: RedPenComment[];
}

export const initialMockPosts: Post[] = [
  {
    id: "post1",
    userId: "yuki",
    username: "ゆうき",
    avatar: "😎",
    lines: ["スマホ見て", "夜が明けてた", "また今日も"],
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    stamps: [
      { emoji: "😂", username: "さくら" },
      { emoji: "🥲", username: "みお" },
    ],
    redPenComments: [
      {
        id: "rpc1",
        authorId: "taro",
        authorName: "たろう",
        text: "それ昨日の俺やん",
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
      },
    ],
  },
  {
    id: "post2",
    userId: "sakura",
    username: "さくら",
    avatar: "🌸",
    lines: ["桜散る", "ライン既読で", "春終わる"],
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    stamps: [
      { emoji: "💯", username: "ゆうき" },
      { emoji: "🥲", username: "たろう" },
      { emoji: "🈴", username: "みお" },
    ],
    redPenComments: [
      {
        id: "rpc2",
        authorId: "yuki",
        authorName: "ゆうき",
        text: "季語がないから不合格",
        timestamp: new Date(Date.now() - 1000 * 60 * 1),
      },
    ],
  },
  {
    id: "post3",
    userId: "taro",
    username: "たろう",
    avatar: "🐻",
    lines: ["コンビニで", "迷ってる俺", "また肉まん"],
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
    stamps: [
      { emoji: "😂", username: "ゆうき" },
    ],
    redPenComments: [],
  },
  {
    id: "post4",
    userId: "mio",
    username: "みお",
    avatar: "🦋",
    lines: ["眠いのに", "目が冴えてる", "3時すぎ"],
    timestamp: new Date(Date.now() - 1000 * 30),
    stamps: [],
    redPenComments: [],
  },
];
