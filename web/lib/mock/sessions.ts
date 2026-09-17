import { addDaysIso, todayIsoDate } from "../constants";
import type { WfcSession } from "../types";

export function createMockSessions(): WfcSession[] {
  const today = todayIsoDate();

  return [
    {
      id: "s-two-hands",
      place: "Two Hands Full",
      date: today,
      startTime: "10:00",
      endTime: "16:00",
      note: "Kerja startup. Silakan sapa kalau mau ngobrol.",
      topic: "Startup",
      attendeeIds: ["u-andi", "u-sarah", "u-budi", "u-dimas", "u-rina", "u-maya"],
      createdById: "u-andi",
    },
    {
      id: "s-common-ground",
      place: "Common Grounds Dago",
      date: today,
      startTime: "09:00",
      endTime: "15:00",
      note: "Deep work pagi, coffee chat siang.",
      attendeeIds: ["u-reza", "u-nina", "u-lisa", "u-gita", "u-tom"],
      createdById: "u-reza",
    },
    {
      id: "s-jiwa",
      place: "Jiwa Coffee Cihampelas",
      date: today,
      startTime: "11:00",
      endTime: "17:00",
      topic: "Design",
      attendeeIds: ["u-sarah", "u-nina"],
      createdById: "u-sarah",
    },
    {
      id: "s-upnormal",
      place: "Warunk Upnormal Riau",
      date: today,
      startTime: "13:00",
      endTime: "18:00",
      note: "WFC santai sore.",
      attendeeIds: ["u-faro", "u-dimas", "u-lisa"],
      createdById: "u-faro",
    },
    {
      id: "s-tomorrow-north",
      place: "Northwood Coffee",
      date: addDaysIso(1),
      startTime: "10:00",
      endTime: "16:00",
      attendeeIds: ["u-budi", "u-andi"],
      createdById: "u-budi",
    },
  ];
}
