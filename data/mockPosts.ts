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
  stamps: string[];
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
    stamps: [],
    redPenComments: [],
  },
  {
    id: "post2",
    userId: "sakura",
    username: "さくら",
    avatar: "🌸",
    lines: ["桜散る", "ライン既読で", "春終わる"],
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    stamps: [],
    redPenComments: [],
  },
  {
    id: "post3",
    userId: "taro",
    username: "たろう",
    avatar: "🐻",
    lines: ["コンビニで", "迷ってる俺", "また肉まん"],
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
    stamps: [],
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
