"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getUserPostCount } from "@/lib/firestore";

const STATUS_COLORS: { max: number; color: string }[] = [
  { max: 5,  color: "#9CA3AF" }, // みならい: グレー
  { max: 10, color: "#3B82F6" }, // 一般人: ブルー
  { max: 15, color: "#3A7D55" }, // 一人前: グリーン
  { max: 20, color: "#7C3AED" }, // 玄人: パープル
  { max: Infinity, color: "#F59E0B" }, // 宗匠: ゴールド
];

function statusColor(count: number): string {
  return STATUS_COLORS.find((s) => count <= s.max)!.color;
}

export default function UserAvatar({
  uid,
  photoURL,
  displayName,
  size = 36,
}: {
  uid: string;
  photoURL: string;
  displayName: string;
  size?: number;
}) {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    getUserPostCount(uid).then((count) => setColor(statusColor(count)));
  }, [uid]);

  const dotSize = Math.round(size * 0.33);

  return (
    <div className="relative inline-block flex-shrink-0" style={{ width: size, height: size }}>
      {photoURL ? (
        <Image
          src={photoURL}
          alt={displayName}
          width={size}
          height={size}
          className="rounded-full"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="rounded-full bg-gray-200 flex items-center justify-center text-sm"
          style={{ width: size, height: size }}
        >
          {displayName[0] ?? "?"}
        </div>
      )}
      {color && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-white"
          style={{ width: dotSize, height: dotSize, backgroundColor: color }}
        />
      )}
    </div>
  );
}
