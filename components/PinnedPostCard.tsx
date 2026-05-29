"use client";

import { type FirestorePost } from "@/lib/firestore";

type Status = "みならい" | "一般人" | "一人前" | "玄人" | "宗匠";

function getStatus(count: number): Status {
  if (count <= 5) return "みならい";
  if (count <= 10) return "一般人";
  if (count <= 15) return "一人前";
  if (count <= 20) return "玄人";
  return "宗匠";
}

/* --- Corner ornaments per status --- */

function CornerIchininmae({ className }: { className: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1 10 L1 1 L10 1" stroke="#3A7D55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CornerKurowto({ className }: { className: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M1 12 L1 1 L12 1" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 12 L4 4 L12 4" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CornerSosho({ className }: { className: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M1 14 L1 1 L14 1" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 14 L4 4 L14 4" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="1" cy="1" r="2" fill="#F59E0B" className="sosho-dot-glow" />
    </svg>
  );
}

function Corners({ status }: { status: Status }) {
  if (status === "一人前") {
    return (
      <>
        <CornerIchininmae className="absolute top-2 left-2" />
        <CornerIchininmae className="absolute top-2 right-2 scale-x-[-1]" />
        <CornerIchininmae className="absolute bottom-2 left-2 scale-y-[-1]" />
        <CornerIchininmae className="absolute bottom-2 right-2 scale-x-[-1] scale-y-[-1]" />
      </>
    );
  }
  if (status === "玄人") {
    return (
      <>
        <CornerKurowto className="absolute top-2 left-2" />
        <CornerKurowto className="absolute top-2 right-2 scale-x-[-1]" />
        <CornerKurowto className="absolute bottom-2 left-2 scale-y-[-1]" />
        <CornerKurowto className="absolute bottom-2 right-2 scale-x-[-1] scale-y-[-1]" />
      </>
    );
  }
  if (status === "宗匠") {
    return (
      <>
        <CornerSosho className="absolute top-2 left-2" />
        <CornerSosho className="absolute top-2 right-2 scale-x-[-1]" />
        <CornerSosho className="absolute bottom-2 left-2 scale-y-[-1]" />
        <CornerSosho className="absolute bottom-2 right-2 scale-x-[-1] scale-y-[-1]" />
      </>
    );
  }
  return null;
}

const FRAME: Record<Status, {
  outer: string;
  inner?: string;
  title: string;
  badge: string;
}> = {
  みならい: {
    outer: "border-2 border-dashed border-gray-400 bg-white/70",
    title: "text-gray-500",
    badge: "bg-gray-100 text-gray-500 border border-gray-300",
  },
  一般人: {
    outer: "border-2 border-blue-400 bg-blue-50/40 shadow-md shadow-blue-100",
    title: "text-blue-600",
    badge: "bg-blue-100 text-blue-600 border border-blue-300",
  },
  一人前: {
    outer: "border-2 border-[#3A7D55] bg-green-50/40 shadow-md shadow-green-100",
    inner: "border border-[#3A7D55]/30 rounded-xl",
    title: "text-[#3A7D55]",
    badge: "bg-green-100 text-[#3A7D55] border border-green-300",
  },
  玄人: {
    outer: "border-[3px] border-purple-600 bg-purple-50/30 shadow-lg shadow-purple-200",
    inner: "border border-purple-400/40 rounded-xl",
    title: "text-purple-700",
    badge: "bg-purple-100 text-purple-700 border border-purple-300",
  },
  宗匠: {
    outer: "border-[3px] border-yellow-500 bg-yellow-50/40 shadow-xl shadow-yellow-200",
    inner: "border border-yellow-400/50 rounded-xl",
    title: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700 border border-yellow-400",
  },
};

export default function PinnedPostCard({
  post,
  postCount,
}: {
  post: FirestorePost;
  postCount: number;
}) {
  const lines = post.haiku.split("／");
  const isTanka = post.mode === "tanka";
  const cardHeight = isTanka ? "210px" : "150px";
  const status = getStatus(postCount);
  const frame = FRAME[status];

  return (
    <div className="mb-4">
      <p
        className="text-xs font-bold mb-2 flex items-center gap-1"
        style={{ fontFamily: "var(--font-kaisei)" }}
      >
        <span>📌</span>
        <span className={frame.title}>マイベスト川柳</span>
      </p>

      <div className={`relative rounded-2xl p-4 ${frame.outer}`}>
        <Corners status={status} />

        {/* Status badge */}
        <div className="flex justify-center mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${frame.badge}`}>
            {status}
          </span>
        </div>

        {/* Inner frame for 一人前以上 */}
        {frame.inner ? (
          <div className={`${frame.inner} overflow-hidden`}>
            <div
              className="flex flex-row-reverse justify-center gap-5 pt-4 px-4"
              style={{
                height: cardHeight,
                backgroundImage: "url('/background_wasi.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  className="text-xl text-[#1A1A1A] leading-relaxed"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    fontFamily: "var(--font-kaisei)",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="flex flex-row-reverse justify-center gap-5 pt-4 px-4 rounded-xl overflow-hidden"
            style={{
              height: cardHeight,
              backgroundImage: "url('/background_wasi.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {lines.map((line, i) => (
              <div
                key={i}
                className="text-xl text-[#1A1A1A] leading-relaxed"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  fontFamily: "var(--font-kaisei)",
                }}
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
