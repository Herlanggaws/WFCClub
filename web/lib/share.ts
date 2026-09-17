export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

export type ShareResult = "shared" | "copied" | "cancelled";

export async function shareOrCopy(payload: SharePayload): Promise<ShareResult> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(payload);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  await navigator.clipboard.writeText(
    `${payload.text}\n${payload.url}`.trim(),
  );
  return "copied";
}

export function buildSessionSharePayload(input: {
  place: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  topic?: string;
  url: string;
}): SharePayload {
  const topicPart = input.topic ? ` · ${input.topic}` : "";
  return {
    title: `WFC di ${input.place}`,
    text: `Yuk WFC bareng di ${input.place}${topicPart} — ${input.dateLabel}, ${input.startTime}–${input.endTime}`,
    url: input.url,
  };
}
