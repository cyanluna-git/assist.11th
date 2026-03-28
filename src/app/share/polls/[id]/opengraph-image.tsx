import { ImageResponse } from "next/og";
import {
  formatPollDeadlineLabel,
  getPollStatusLabel,
} from "@/lib/poll-deadline";
import {
  buildPollShareOptionSummary,
  getPollShareData,
} from "@/lib/poll-share";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const poll = await getPollShareData(id);

  if (!poll) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            color: "white",
            fontSize: 44,
          }}
        >
          Poll not found
        </div>
      ),
      size,
    );
  }

  const options = buildPollShareOptionSummary(poll.options, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(circle at top left, rgba(15,77,129,0.22), transparent 30%), linear-gradient(135deg, #f8fbff 0%, #eef3f8 50%, #f9fafb 100%)",
          color: "#111827",
          padding: "48px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: 24,
              color: "#0f4d81",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "10px 16px",
                borderRadius: "999px",
                background: "rgba(15,77,129,0.10)",
              }}
            >
              aSSiST 11기 투표
            </div>
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 18px",
              borderRadius: "999px",
              background: poll.closesAt && getPollStatusLabel(poll.closesAt) === "마감" ? "#e5e7eb" : "#dbeafe",
              color: poll.closesAt && getPollStatusLabel(poll.closesAt) === "마감" ? "#374151" : "#1d4ed8",
              fontSize: 24,
            }}
          >
            {getPollStatusLabel(poll.closesAt)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "36px",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 54,
              lineHeight: 1.2,
              fontWeight: 700,
              maxHeight: "200px",
              overflow: "hidden",
            }}
          >
            {poll.title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              lineHeight: 1.5,
              color: "#4b5563",
              maxHeight: "120px",
              overflow: "hidden",
              whiteSpace: "pre-wrap",
            }}
          >
            {poll.description ?? "설명이 없는 투표입니다."}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "14px",
            marginTop: "34px",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "14px 18px",
              borderRadius: "18px",
              background: "white",
              border: "1px solid #dbe3ee",
              fontSize: 24,
              color: "#334155",
            }}
          >
            마감 {formatPollDeadlineLabel(poll.closesAt)}
          </div>
          <div
            style={{
              display: "flex",
              padding: "14px 18px",
              borderRadius: "18px",
              background: "white",
              border: "1px solid #dbe3ee",
              fontSize: 24,
              color: "#334155",
            }}
          >
            총 {poll.totalVoters}명 참여
          </div>
          {poll.isMultiple && (
            <div
              style={{
                display: "flex",
                padding: "14px 18px",
                borderRadius: "18px",
                background: "white",
                border: "1px solid #dbe3ee",
                fontSize: 24,
                color: "#334155",
              }}
            >
              복수선택
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginTop: "36px",
          }}
        >
          {options.map((option, index) => (
            <div
              key={`${option}-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.92)",
                border: "1px solid #dbe3ee",
                padding: "18px 22px",
                fontSize: 28,
                color: "#1f2937",
              }}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
