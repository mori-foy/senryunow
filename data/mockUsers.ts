export interface User {
  id: string;
  name: string;
  avatar: string;
}

export const ME: User = {
  id: "me",
  name: "あなた",
  avatar: "🧑",
};

export const mockUsers: User[] = [
  { id: "yuki", name: "ゆうき", avatar: "😎" },
  { id: "sakura", name: "さくら", avatar: "🌸" },
  { id: "taro", name: "たろう", avatar: "🐻" },
  { id: "mio", name: "みお", avatar: "🦋" },
];
