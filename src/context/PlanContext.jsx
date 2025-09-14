

import React, { createContext, useContext, useState } from "react";

const slotKeys = ["morning", "afternoon", "evening", "night"];
// Slot time boundaries in minutes from midnight
export const slotTimeRanges = {
  morning:   { start:  6 * 60, end: 12 * 60 },  // 06:00 - 12:00
  afternoon: { start: 12 * 60, end: 17 * 60 },  // 12:00 - 17:00
  evening:   { start: 17 * 60, end: 21 * 60 },  // 17:00 - 21:00
  night:     { start: 21 * 60, end: 24 * 60 },  // 21:00 - 24:00 (midnight)
};

const PlanContext = createContext();

export const usePlan = () => useContext(PlanContext);

// Helper: converts "HH:MM" to minutes from midnight
function timeStrToMinutes(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

// Helper: converts minutes from midnight to "HH:MM"
function minutesToTimeStr(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export const PlanProvider = ({ children }) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [plan, setPlan] = useState({});
  const [planMode, setPlanMode] = useState("weekend");

  React.useEffect(() => {
    if (selectedDays.length) {
      setPlan(
        selectedDays.reduce((acc, day) => {
          acc[day] = acc[day] || { morning: [], afternoon: [], evening: [], night: [] };
          return acc;
        }, {})
      );
    }
  }, [selectedDays]);

  // Add activity to a day's slot, now supporting start and duration
  function addActivity(day, slot, activity) {
    setPlan(prev => {
      const dayPlan = prev[day] || { morning: [], afternoon: [], evening: [], night: [] };
      const id = `act-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      return {
        ...prev,
        [day]: {
          ...dayPlan,
          [slot]: [
            ...(dayPlan[slot] || []),
            {
              ...activity,
              id: String(id),
              duration: activity.duration || 60, // default 1 hour
              start: typeof activity.start === "number" ? activity.start : null,
              location: activity.location || null
            }
          ]
        }
      };
    });
  }

  function removeActivity(day, slot, id) {
    setPlan(prev => {
      const dayPlan = { ...prev[day] };
      dayPlan[slot] = dayPlan[slot].filter(act => String(act.id) !== String(id));
      return { ...prev, [day]: dayPlan };
    });
  }

  function updateActivityName(day, slot, id, newName) {
    setPlan(prev => {
      const slotActs = prev[day]?.[slot] || [];
      const updatedSlot = slotActs.map(act =>
        String(act.id) === String(id) ? { ...act, name: newName } : act
      );
      return {
        ...prev,
        [day]: { ...prev[day], [slot]: updatedSlot }
      };
    });
  }

  function setActivityPlace(day, slot, id, place) {
    setPlan(prev => {
      const oldSlot = prev[day][slot];
      const updatedSlot = oldSlot.map(act =>
        String(act.id) === String(id) ? { ...act, place } : act
      );
      return {
        ...prev,
        [day]: { ...prev[day], [slot]: updatedSlot }
      };
    });
  }

  function updateActivityTime(day, slot, id, start, duration) {
    setPlan(prev => {
      const slotActs = prev[day]?.[slot] || [];
      const updatedSlot = slotActs.map(act =>
        String(act.id) === String(id)
          ? { ...act, start, duration }
          : act
      );
      return {
        ...prev,
        [day]: { ...prev[day], [slot]: updatedSlot }
      };
    });
  }

  // Mood setter
  const setMood = (day, activityId, mood) => {
    setPlan(prev => ({
      ...prev,
      [day]: Object.fromEntries(
        Object.entries(prev[day]).map(([slot, acts]) => [
          slot,
          acts.map(a => a.id === activityId ? { ...a, mood } : a)
        ])
      )
    }));
  };

  // DnD and move
  function reorderTimelineActivities(result) {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    const [srcDay, srcSlot] = source.droppableId.split("|");
    const [destDay, destSlot] = destination.droppableId.split("|");
    setPlan(prev => {
      const srcList = Array.from(prev[srcDay]?.[srcSlot] || []);
      const [moved] = srcList.splice(source.index, 1);
      const destList = Array.from(prev[destDay]?.[destSlot] || []);
      destList.splice(destination.index, 0, moved);
      return {
        ...prev,
        [srcDay]: { ...prev[srcDay], [srcSlot]: srcList },
        [destDay]: { ...prev[destDay], [destSlot]: destList }
      };
    });
  }

  function moveActivity(fromDay, fromSlot, toDay, toSlot, activityId) {
    setPlan((prev) => {
      const activity = prev[fromDay][fromSlot].find((a) => String(a.id) === String(activityId));
      if (!activity) return prev;
      const newFrom = prev[fromDay][fromSlot].filter((a) => String(a.id) !== String(activityId));
      const newTo = [...prev[toDay][toSlot], activity];
      return {
        ...prev,
        [fromDay]: { ...prev[fromDay], [fromSlot]: newFrom },
        [toDay]: { ...prev[toDay], [toSlot]: newTo },
      };
    });
  }

  // ---- BOUNDS DETECTION ----
  function isOutOfSlotBounds(slot, act) {
    const range = slotTimeRanges[slot];
    if (typeof act.start !== "number" || typeof act.duration !== "number") return false;
    return act.start < range.start || act.start + act.duration > range.end;
  }

  return (
    <PlanContext.Provider value={{
      selectedDays, setSelectedDays, planMode, setPlanMode,
      plan, setPlan, setActivityPlace, setMood,
      addActivity, removeActivity, moveActivity,
      reorderTimelineActivities, updateActivityName, updateActivityTime,
      isOutOfSlotBounds, timeStrToMinutes, minutesToTimeStr
    }}>
      {children}
    </PlanContext.Provider>
  );
};