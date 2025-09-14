import React from "react";
import "./MoodSelector.css";
import { usePlan } from "../context/PlanContext";

const moods = [
  { value: "happy", emoji: "😀", label: "Happy" },
  { value: "relax", emoji: "🧘", label: "Relax" },
  { value: "party", emoji: "🎉", label: "Party" },
  { value: "adventure", emoji: "🏞️", label: "Adventure" },
];

export default function MoodSelector({ day, activityId, mood }) {
  const { setMood } = usePlan();

  return (
    <div className="mood-emoji-row">
      {moods.map((m) => (
        <button
          key={m.value}
          className={"mood-emoji-btn" + (mood === m.value ? " selected" : "")}
          title={m.label}
          onClick={() => setMood(day, activityId, m.value)}
          type="button"
        >
          {m.emoji}
        </button>
      ))}
    </div>
  );
}