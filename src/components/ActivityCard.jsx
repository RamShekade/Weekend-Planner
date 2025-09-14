import React from "react";
import "./ActivityCard.css"; // create this file for card styling

export default function ActivityCard({
  id,
  name,
  emoji,
  moodTag,
  selected,
  onClick
}) {
  return (
    <div
      className={"activity-card" + (selected ? " selected" : "")}
      tabIndex={0}
      onClick={onClick}
    >
      <div className="activity-card-emoji">{emoji}</div>
      <div className="activity-card-name">{name}</div>
      {moodTag && (
        <span className="activity-card-mood">{moodTag}</span>
      )}
      {selected && (
        <div className="activity-card-check">✔</div>
      )}
    </div>
  );
}