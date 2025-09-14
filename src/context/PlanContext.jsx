
// import React, { createContext, useContext, useState } from "react";

// const slotKeys = ["morning", "afternoon", "evening", "night"];

// const PlanContext = createContext();

// export const usePlan = () => useContext(PlanContext);

// export const PlanProvider = ({ children }) => {
//   const [selectedDays, setSelectedDays] = useState([]);
//   const [plan, setPlan] = useState({});

//   // Ensure plan is initialized when days change
//   React.useEffect(() => {
//     if (selectedDays.length) {
//       setPlan(
//         selectedDays.reduce((acc, day) => {
//           acc[day] = acc[day] || { morning: [], afternoon: [], evening: [], night: [] };
//           return acc;
//         }, {})
//       );
//     }
//   }, [selectedDays]);

//   // Add activity to a day's slot
//  function addActivity(day, slot, activity) {
//   setPlan(prev => {
//     const dayPlan = prev[day] || { morning: [], afternoon: [], evening: [], night: [] };
//     // Always create a fresh unique id for this plan entry, regardless of the activity's name
//     const id =`act-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
//     return {
//       ...prev,
//       [day]: {
//         ...dayPlan,
//         [slot]: [...(dayPlan[slot] || []), { ...activity, id: String(id) }]
//       }
//     };
//   });
// }
//   // Remove activity
//   function removeActivity(day, slot, id) {
//     setPlan(prev => {
//       const dayPlan = { ...prev[day] };
//       dayPlan[slot] = dayPlan[slot].filter(act => String(act.id) !== String(id));
//       return { ...prev, [day]: dayPlan };
//     });
//   }

//   // Move activity (used for mobile "Move" button or dnd)
//   function moveActivity(fromDay, fromSlot, toDay, toSlot, id) {
//     setPlan(prev => {
//       const srcList = Array.from(prev[fromDay]?.[fromSlot] || []);
//       const idx = srcList.findIndex(act => String(act.id) === String(id));
//       if (idx === -1) return prev;
//       const [moved] = srcList.splice(idx, 1);
//       const destList = Array.from(prev[toDay]?.[toSlot] || []);
//       destList.push(moved);
//       return {
//         ...prev,
//         [fromDay]: { ...prev[fromDay], [fromSlot]: srcList },
//         [toDay]: { ...prev[toDay], [toSlot]: destList }
//       };
//     });
//   }

//   // Drag & Drop reorder/move
//   function reorderTimelineActivities(result) {
//     const { source, destination } = result;
//     if (!destination) return;
//     if (
//       source.droppableId === destination.droppableId &&
//       source.index === destination.index
//     ) return;
//     const [srcDay, srcSlot] = source.droppableId.split("|");
//     const [destDay, destSlot] = destination.droppableId.split("|");
//     setPlan(prev => {
//       const srcList = Array.from(prev[srcDay]?.[srcSlot] || []);
//       const [moved] = srcList.splice(source.index, 1);
//       const destList = Array.from(prev[destDay]?.[destSlot] || []);
//       destList.splice(destination.index, 0, moved);
//       return {
//         ...prev,
//         [srcDay]: { ...prev[srcDay], [srcSlot]: srcList },
//         [destDay]: { ...prev[destDay], [destSlot]: destList }
//       };
//     });
//   }

//   function setActivityPlace(day, slot, id, place) {
//   setPlan(prev => {
//     const oldSlot = prev[day][slot];
//     const updatedSlot = oldSlot.map(act =>
//       String(act.id) === String(id) ? { ...act, place } : act
//     );
//     return {
//       ...prev,
//       [day]: { ...prev[day], [slot]: updatedSlot }
//     };
//   });
// }


// function updateActivityName(day, slot, id, newName) {
//     setPlan(prev => {
//       const slotActs = prev[day]?.[slot] || [];
//       const updatedSlot = slotActs.map(act =>
//         String(act.id) === String(id) ? { ...act, name: newName } : act
//       );
//       return {
//         ...prev,
//         [day]: { ...prev[day], [slot]: updatedSlot }
//       };
//     });
//   }


// // set mood of the activity 
//   const setMood = (day, activityId, mood) => {
//   setPlan(prev => ({
//     ...prev,
//     [day]: Object.fromEntries(
//       Object.entries(prev[day]).map(([slot, acts]) => [
//         slot,
//         acts.map(a => a.id === activityId ? { ...a, mood } : a)
//       ])
//     )
//   }));
// };

// function moveActivityBetweenSlots({ fromDay, fromSlot, toDay, toSlot, activityId, insertIndex }) {
//   setPlan((prev) => {
//     const activity = prev[fromDay][fromSlot].find((a) => String(a.id) === String(activityId));
//     if (!activity) return prev;
//     const newFrom = prev[fromDay][fromSlot].filter((a) => String(a.id) !== String(activityId));
//     const newTo = [...prev[toDay][toSlot]];
//     if (insertIndex >= 0) newTo.splice(insertIndex, 0, activity);
//     else newTo.push(activity);
//     return {
//       ...prev,
//       [fromDay]: { ...prev[fromDay], [fromSlot]: newFrom },
//       [toDay]: { ...prev[toDay], [toSlot]: newTo },
//     };
//   });
// }
//   return (
//     <PlanContext.Provider value={{
//       selectedDays, setSelectedDays,
//       plan, setPlan, setActivityPlace,setMood,
//       addActivity, removeActivity, moveActivity,moveActivityBetweenSlots,
//       reorderTimelineActivities,updateActivityName
//     }}>
//       {children}
//     </PlanContext.Provider>
//   );
// };


import React, { createContext, useContext, useState } from "react";

const slotKeys = ["morning", "afternoon", "evening", "night"];
const DAY_START = 480;  // 8:00 in minutes
const DAY_END = 1380;   // 23:00 in minutes

const PlanContext = createContext();

export const usePlan = () => useContext(PlanContext);

export const PlanProvider = ({ children }) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [plan, setPlan] = useState({});
  const [planMode, setPlanMode] = useState("weekend"); // "single" or "weekend"

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

  // Add activity to a day's slot, with duration and start time
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
              duration: activity.duration || 60, // default 1 hour if not set
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

  function moveActivityBetweenSlots({ fromDay, fromSlot, toDay, toSlot, activityId, insertIndex }) {
    setPlan((prev) => {
      const activity = prev[fromDay][fromSlot].find((a) => String(a.id) === String(activityId));
      if (!activity) return prev;
      const newFrom = prev[fromDay][fromSlot].filter((a) => String(a.id) !== String(activityId));
      const newTo = [...prev[toDay][toSlot]];
      if (insertIndex >= 0) newTo.splice(insertIndex, 0, activity);
      else newTo.push(activity);
      return {
        ...prev,
        [fromDay]: { ...prev[fromDay], [fromSlot]: newFrom },
        [toDay]: { ...prev[toDay], [toSlot]: newTo },
      };
    });
  }

  // ---- CONFLICT AND BOUNDS DETECTION ----
  function getSlotConflicts(day, slot) {
    const acts = plan[day]?.[slot] || [];
    let conflicts = [];
    for (let i = 0; i < acts.length; i++) {
      for (let j = i + 1; j < acts.length; j++) {
        const a = acts[i], b = acts[j];
        if (
          (typeof a.start === "number") && a.duration &&
          (typeof b.start === "number") && b.duration &&
          (a.start < b.start + b.duration && b.start < a.start + a.duration)
        ) {
          conflicts.push(a, b);
        }
      }
    }
    return conflicts;
  }

  function isOutOfBounds(act) {
    if (typeof act.start !== "number" || typeof act.duration !== "number") return false;
    return act.start < DAY_START || act.start + act.duration > DAY_END;
  }

  // ---- AUTO-OPTIMIZE BY LOCATION ----
  function optimizeSlotOrderByLocation(day, slot) {
    const acts = plan[day]?.[slot] || [];
    if (acts.length < 2) return;
    function haversine(a, b) {
      if (!a.location || !b.location) return Infinity;
      const toRad = x => (x * Math.PI) / 180;
      const R = 6371; // km
      const dLat = toRad(b.location.lat - a.location.lat);
      const dLon = toRad(b.location.lon - a.location.lon);
      const lat1 = toRad(a.location.lat), lat2 = toRad(b.location.lat);
      const aVal = Math.sin(dLat / 2) ** 2 +
                   Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
      return R * c;
    }
    let remaining = [...acts];
    let result = [remaining.shift()];
    while (remaining.length) {
      let last = result[result.length - 1];
      let nearestIdx = 0, nearestDist = haversine(last, remaining[0]);
      for (let i = 1; i < remaining.length; i++) {
        let dist = haversine(last, remaining[i]);
        if (dist < nearestDist) { nearestDist = dist; nearestIdx = i; }
      }
      result.push(remaining.splice(nearestIdx, 1)[0]);
    }
    setPlan(prev => ({
      ...prev,
      [day]: { ...prev[day], [slot]: result }
    }));
  }

  return (
    <PlanContext.Provider value={{
      selectedDays, setSelectedDays, planMode, setPlanMode,
      plan, setPlan, setActivityPlace, setMood,
      addActivity, removeActivity, moveActivityBetweenSlots,
      reorderTimelineActivities, updateActivityName,
      getSlotConflicts, isOutOfBounds, optimizeSlotOrderByLocation
    }}>
      {children}
    </PlanContext.Provider>
  );
};