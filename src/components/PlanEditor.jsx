// import React, { useState } from "react";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import { usePlan } from "../context/PlanContext";
// import PlacePickerModal from "./PlacePickerModal";
// import MoodSelector from "./MoodSelector";
// import "./PlanEditor.css";

// const slots = [
//   { key: "morning", label: "Morning", icon: "☀️" },
//   { key: "afternoon", label: "Afternoon", icon: "🌤️" },
//   { key: "evening", label: "Evening", icon: "🌆" },
//   { key: "night", label: "Night", icon: "🌙" }
// ];

// function isMobile() {
//   return window.innerWidth <= 600;
// }

// export default function PlanTimelineEditor({ onAddActivity }) {
//   const {
//     plan, selectedDays,
//     reorderTimelineActivities, removeActivity, moveActivity,
//     setActivityPlace, updateActivityName // <-- add to context for editing
//   } = usePlan();

//   const [moveModal, setMoveModal] = useState({ open: false, day: null, slot: null, id: null });
//   const [placeModal, setPlaceModal] = useState({ open: false, day: null, slot: null, id: null });
//   const [moodSelector, setMoodSelector] = useState({ open: false, day: null, slot: null, id: null });

//   // Editing state
//   const [editing, setEditing] = useState({ day: null, slot: null, id: null, name: "" });

//   function onDragEnd(result) {
//     if (!result.destination) return;
//     reorderTimelineActivities(result);
//   }

//   function handleMoveBtn(day, slot, id) {
//     setMoveModal({ open: true, day, slot, id });
//   }
//   function handleMoveTo(day, slot) {
//     moveActivity(moveModal.day, moveModal.slot, day, slot, moveModal.id);
//     setMoveModal({ open: false, day: null, slot: null, id: null });
//   }

//   function handlePlaceBtn(day, slot, id) {
//     setPlaceModal({ open: true, day, slot, id });
//   }
//   function handlePlacePicked(place) {
//     setActivityPlace(placeModal.day, placeModal.slot, placeModal.id, place);
//     setPlaceModal({ open: false, day: null, slot: null, id: null });
//   }

//   // Helper: mood emoji from value
//   function getMoodEmoji(mood) {
//     if (mood === "happy") return "😀";
//     if (mood === "relax") return "🧘";
//     if (mood === "party") return "🎉";
//     if (mood === "adventure") return "🏞️";
//     return "😃";
//   }
//   // Helper: mood color (optional, can be used for card border)
//   function getMoodColor(mood) {
//     if (mood === "happy") return "#fef08a";
//     if (mood === "relax") return "#a7f3d0";
//     if (mood === "party") return "#fbcfe8";
//     if (mood === "adventure") return "#bae6fd";
//     return "#e0e7ff";
//   }

//   function startEdit(day, slot, id, name) {
//     setEditing({ day, slot, id, name });
//   }
//   function handleEditChange(e) {
//     setEditing((prev) => ({ ...prev, name: e.target.value }));
//   }
//   function handleEditSave() {
//     if (editing.name.trim()) {
//       updateActivityName(editing.day, editing.slot, editing.id, editing.name.trim());
//       setEditing({ day: null, slot: null, id: null, name: "" });
//     }
//   }
//   function handleEditCancel() {
//     setEditing({ day: null, slot: null, id: null, name: "" });
//   }

//   return (
//     <>
//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="timeline-grid">
//           {selectedDays.map((day) => (
//             <div className="timeline-day-col" key={day}>
//               <div className="timeline-day-header">
//                 <h3>{formatDay(day)}</h3>
//               </div>
//               {slots.map(slot => (
//                 <div className="timeline-slot" key={slot.key}>
//                   <div className="timeline-slot-header">
//                     <span className="timeline-slot-icon">{slot.icon}</span>
//                     <span>{slot.label}</span>
//                     <button
//                       className="add-activity-btn"
//                       onClick={() => onAddActivity(day, slot.key)}
//                     >＋</button>
//                   </div>
//                   <Droppable droppableId={`${day}|${slot.key}`} type="ACTIVITY">
//                     {(provided) => (
//                       <ul
//                         className="timeline-slot-list"
//                         ref={provided.innerRef}
//                         {...provided.droppableProps}
//                       >
//                         {(plan[day]?.[slot.key] || []).map((act, idx) => (
//                           <Draggable draggableId={String(act.id)} index={idx} key={act.id}>
//                             {(provided, snapshot) => (
//                               <li
//                                 className={
//                                   "timeline-activity-block" +
//                                   (snapshot.isDragging ? " dragging" : "")
//                                 }
//                                 ref={provided.innerRef}
//                                 {...provided.draggableProps}
//                                 {...provided.dragHandleProps}
//                                 style={{
//                                   ...provided.draggableProps.style,
//                                   borderLeft: `7px solid ${getMoodColor(act.mood)}`,
//                                   background: "#fff",
//                                   boxShadow: snapshot.isDragging ? "0 4px 16px #6366f133" : "0 2px 7px #e0e7ff22"
//                                 }}
//                               >
//                                 {act.emoji && (
//                                   <span className="timeline-block-icon">{act.emoji}</span>
//                                 )}
//                                 {editing.day === day && editing.slot === slot.key && editing.id === act.id ? (
//                                   <span className="timeline-block-name editing">
//                                     <input
//                                       value={editing.name}
//                                       onChange={handleEditChange}
//                                       autoFocus
//                                       maxLength={30}
//                                       onBlur={handleEditSave}
//                                       onKeyDown={e => {
//                                         if (e.key === "Enter") handleEditSave();
//                                         if (e.key === "Escape") handleEditCancel();
//                                       }}
//                                       style={{
//                                         fontSize: "1em",
//                                         padding: "2px 8px",
//                                         borderRadius: 8,
//                                         border: "1px solid #bbb",
//                                       }}
//                                     />
//                                     <button
//                                       className="edit-save-btn"
//                                       onMouseDown={handleEditSave}
//                                       style={{ marginLeft: 4, fontSize: "1em" }}
//                                     >💾</button>
//                                     <button
//                                       className="edit-cancel-btn"
//                                       onMouseDown={handleEditCancel}
//                                       style={{ marginLeft: 2, fontSize: "1em" }}
//                                     >✕</button>
//                                   </span>
//                                 ) : (
//                                   <span className="timeline-block-name">
//                                     {act.name}
//                                     <button
//                                       className="edit-name-btn"
//                                       style={{ marginLeft: 8, fontSize: "1em", background: "none", border: "none", cursor: "pointer" }}
//                                       title="Edit Activity Name"
//                                       onClick={() => startEdit(day, slot.key, act.id, act.name)}
//                                     >✏️</button>
//                                   </span>
//                                 )}
//                                 {/* Mood shortcut button */}
//                                 <button
//                                   className="timeline-block-mood-btn"
//                                   title="Set Mood / Vibe"
//                                   onClick={() =>
//                                     setMoodSelector({
//                                       open: true,
//                                       day,
//                                       slot: slot.key,
//                                       id: act.id
//                                     })
//                                   }
//                                   type="button"
//                                 >
//                                   {getMoodEmoji(act.mood)}
//                                 </button>
//                                 {/* Inline mood selector, only for this activity */}
//                                 {moodSelector.open &&
//                                   moodSelector.day === day &&
//                                   moodSelector.slot === slot.key &&
//                                   moodSelector.id === act.id && (
//                                     <div className="timeline-block-mood-picker">
//                                       <MoodSelector
//                                         day={day}
//                                         activityId={act.id}
//                                         mood={act.mood}
//                                       />
//                                       <button
//                                         className="close-mood-picker-btn"
//                                         onClick={() => setMoodSelector({ open: false })}
//                                       >✕</button>
//                                     </div>
//                                   )}
//                                 <button
//                                   className="timeline-block-place"
//                                   onClick={() => handlePlaceBtn(day, slot.key, act.id)}
//                                   title={act.place ? "View/Edit Location" : "Set Location"}
//                                   style={{ marginLeft: 5 }}
//                                 >
//                                   {act.place
//                                     ? <span role="img" aria-label="Location">📍</span>
//                                     : <span role="img" aria-label="Set Location">➕</span>
//                                   }
//                                 </button>
//                                 {isMobile() && (
//                                   <button
//                                     className="move-act-btn"
//                                     onClick={() => handleMoveBtn(day, slot.key, act.id)}
//                                   >Move</button>
//                                 )}
//                                 <button
//                                   className="remove-act-btn"
//                                   onClick={() => removeActivity(day, slot.key, act.id)}
//                                 >✕</button>
//                               </li>
//                             )}
//                           </Draggable>
//                         ))}
//                         {provided.placeholder}
//                       </ul>
//                     )}
//                   </Droppable>
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       </DragDropContext>
//       {moveModal.open && (
//         <div className="move-modal-bg">
//           <div className="move-modal">
//             <h4>Move Activity To:</h4>
//             {selectedDays.map(d => (
//               <div key={d}>
//                 <span>{formatDay(d)}</span>
//                 {slots.map(s => (
//                   <button
//                     key={s.key}
//                     className="move-slot-btn"
//                     onClick={() => handleMoveTo(d, s.key)}
//                   >
//                     {s.icon} {s.label}
//                   </button>
//                 ))}
//               </div>
//             ))}
//             <button className="modal-btn cancel" onClick={() => setMoveModal({ open: false, day: null, slot: null, id: null })}>Cancel</button>
//           </div>
//         </div>
//       )}
//       {placeModal.open && (
//         <PlacePickerModal
//           onPick={handlePlacePicked}
//           onClose={() => setPlaceModal({ open: false, day: null, slot: null, id: null })}
//         />
//       )}
//     </>
//   );
// }

// function formatDay(str) {
//   const d = new Date(str);
//   return d.toLocaleDateString(undefined, {
//     weekday: "short",
//     month: "short",
//     day: "numeric"
//   });
// }


import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { usePlan } from "../context/PlanContext";
import PlacePickerModal from "./PlacePickerModal";
import MoodSelector from "./MoodSelector";
import "./PlanEditor.css";

const slots = [
  { key: "morning", label: "Morning", icon: "☀️" },
  { key: "afternoon", label: "Afternoon", icon: "🌤️" },
  { key: "evening", label: "Evening", icon: "🌆" },
  { key: "night", label: "Night", icon: "🌙" }
];

function isMobile() {
  return window.innerWidth <= 600;
}

export default function PlanTimelineEditor({ onAddActivity }) {
  const {
    plan, selectedDays,
    reorderTimelineActivities, removeActivity, moveActivity,
    setActivityPlace, updateActivityName
  } = usePlan();

  const [moveModal, setMoveModal] = useState({ open: false, day: null, slot: null, id: null });
  const [placeModal, setPlaceModal] = useState({ open: false, day: null, slot: null, id: null });
  const [moodSelector, setMoodSelector] = useState({ open: false, day: null, slot: null, id: null });

  // Editing state
  const [editing, setEditing] = useState({ day: null, slot: null, id: null, name: "" });

  // Pagination state for mobile
  const [mobilePage, setMobilePage] = useState(0);
  const isOnMobile = isMobile();
  const mobileDays = isOnMobile ? [selectedDays[mobilePage] || selectedDays[0]].filter(Boolean) : selectedDays;

  function onDragEnd(result) {
    if (!result.destination) return;
    reorderTimelineActivities(result);
  }

  function handleMoveBtn(day, slot, id) {
    setMoveModal({ open: true, day, slot, id });
  }
  function handleMoveTo(day, slot) {
    moveActivity(moveModal.day, moveModal.slot, day, slot, moveModal.id);
    setMoveModal({ open: false, day: null, slot: null, id: null });
  }

  function handlePlaceBtn(day, slot, id) {
    setPlaceModal({ open: true, day, slot, id });
  }
  function handlePlacePicked(place) {
    setActivityPlace(placeModal.day, placeModal.slot, placeModal.id, place);
    setPlaceModal({ open: false, day: null, slot: null, id: null });
  }

  function getMoodEmoji(mood) {
    if (mood === "happy") return "😀";
    if (mood === "relax") return "🧘";
    if (mood === "party") return "🎉";
    if (mood === "adventure") return "🏞️";
    return "😃";
  }
  function getMoodColor(mood) {
    if (mood === "happy") return "#fef08a";
    if (mood === "relax") return "#a7f3d0";
    if (mood === "party") return "#fbcfe8";
    if (mood === "adventure") return "#bae6fd";
    return "#e0e7ff";
  }

  function startEdit(day, slot, id, name) {
    setEditing({ day, slot, id, name });
  }
  function handleEditChange(e) {
    setEditing((prev) => ({ ...prev, name: e.target.value }));
  }
  function handleEditSave() {
    if (editing.name.trim()) {
      updateActivityName(editing.day, editing.slot, editing.id, editing.name.trim());
      setEditing({ day: null, slot: null, id: null, name: "" });
    }
  }
  function handleEditCancel() {
    setEditing({ day: null, slot: null, id: null, name: "" });
  }

  // Pagination handlers
  function handlePrevDay() {
    setMobilePage(p => Math.max(0, p - 1));
  }
  function handleNextDay() {
    setMobilePage(p => Math.min(selectedDays.length - 1, p + 1));
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={`timeline-grid${isOnMobile ? ' mobile' : ' horizontal-scroll'}`}>
          {isOnMobile && selectedDays.length > 1 && (
            <button
              className="timeline-mobile-arrow left"
              disabled={mobilePage === 0}
              onClick={handlePrevDay}
              aria-label="Previous day"
            >‹</button>
          )}

          {mobileDays.map((day) => (
            <div className="timeline-day-col" key={day}>
              <div className="timeline-day-header">
                <h3>{formatDay(day)}</h3>
              </div>
              {slots.map(slot => (
                <div className="timeline-slot" key={slot.key}>
                  <div className="timeline-slot-header">
                    <span className="timeline-slot-icon">{slot.icon}</span>
                    <span>{slot.label}</span>
                    <button
                      className="add-activity-btn"
                      onClick={() => onAddActivity(day, slot.key)}
                    >＋</button>
                  </div>
                  <Droppable droppableId={`${day}|${slot.key}`} type="ACTIVITY">
                    {(provided) => (
                      <ul
                        className="timeline-slot-list"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {(plan[day]?.[slot.key] || []).map((act, idx) => (
                          <Draggable draggableId={String(act.id)} index={idx} key={act.id}>
                            {(provided, snapshot) => (
                              <li
                                className={
                                  "timeline-activity-block" +
                                  (snapshot.isDragging ? " dragging" : "")
                                }
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  borderLeft: `7px solid ${getMoodColor(act.mood)}`,
                                  background: "#fff",
                                  boxShadow: snapshot.isDragging ? "0 4px 16px #6366f133" : "0 2px 7px #e0e7ff22"
                                }}
                              >
                                {act.emoji && (
                                  <span className="timeline-block-icon">{act.emoji}</span>
                                )}
                                {editing.day === day && editing.slot === slot.key && editing.id === act.id ? (
                                  <span className="timeline-block-name editing">
                                    <input
                                      value={editing.name}
                                      onChange={handleEditChange}
                                      autoFocus
                                      maxLength={30}
                                      onBlur={handleEditSave}
                                      onKeyDown={e => {
                                        if (e.key === "Enter") handleEditSave();
                                        if (e.key === "Escape") handleEditCancel();
                                      }}
                                      style={{
                                        fontSize: "1em",
                                        padding: "2px 8px",
                                        borderRadius: 8,
                                        border: "1px solid #bbb",
                                      }}
                                    />
                                    <button
                                      className="edit-save-btn"
                                      onMouseDown={handleEditSave}
                                      style={{ marginLeft: 4, fontSize: "1em" }}
                                    >💾</button>
                                    <button
                                      className="edit-cancel-btn"
                                      onMouseDown={handleEditCancel}
                                      style={{ marginLeft: 2, fontSize: "1em" }}
                                    >✕</button>
                                  </span>
                                ) : (
                                  <span className="timeline-block-name">
                                    {act.name}
                                    <button
                                      className="edit-name-btn"
                                      style={{ marginLeft: 8, fontSize: "1em", background: "none", border: "none", cursor: "pointer" }}
                                      title="Edit Activity Name"
                                      onClick={() => startEdit(day, slot.key, act.id, act.name)}
                                    >✏️</button>
                                  </span>
                                )}
                                {/* Mood shortcut button */}
                                <button
                                  className="timeline-block-mood-btn"
                                  title="Set Mood / Vibe"
                                  onClick={() =>
                                    setMoodSelector({
                                      open: true,
                                      day,
                                      slot: slot.key,
                                      id: act.id
                                    })
                                  }
                                  type="button"
                                >
                                  {getMoodEmoji(act.mood)}
                                </button>
                                {/* Inline mood selector, only for this activity */}
                                {moodSelector.open &&
                                  moodSelector.day === day &&
                                  moodSelector.slot === slot.key &&
                                  moodSelector.id === act.id && (
                                    <div className="timeline-block-mood-picker">
                                      <MoodSelector
                                        day={day}
                                        activityId={act.id}
                                        mood={act.mood}
                                      />
                                      <button
                                        className="close-mood-picker-btn"
                                        onClick={() => setMoodSelector({ open: false })}
                                      >✕</button>
                                    </div>
                                  )}
                                <button
                                  className="timeline-block-place"
                                  onClick={() => handlePlaceBtn(day, slot.key, act.id)}
                                  title={act.place ? "View/Edit Location" : "Set Location"}
                                  style={{ marginLeft: 5 }}
                                >
                                  {act.place
                                    ? <span role="img" aria-label="Location">📍</span>
                                    : <span role="img" aria-label="Set Location">➕</span>
                                  }
                                </button>
                                {/* {isOnMobile && (
                                  <button
                                    className="move-act-btn"
                                    onClick={() => handleMoveBtn(day, slot.key, act.id)}
                                  >Move</button>
                                )} */}
                                <button
                                  className="remove-act-btn"
                                  onClick={() => removeActivity(day, slot.key, act.id)}
                                >✕</button>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          ))}

          {isOnMobile && selectedDays.length > 1 && (
            <button
              className="timeline-mobile-arrow right"
              disabled={mobilePage === selectedDays.length - 1}
              onClick={handleNextDay}
              aria-label="Next day"
            >›</button>
          )}
        </div>
      </DragDropContext>
      {moveModal.open && (
        <div className="move-modal-bg">
          <div className="move-modal">
            <h4>Move Activity To:</h4>
            {selectedDays.map(d => (
              <div key={d}>
                <span>{formatDay(d)}</span>
                {slots.map(s => (
                  <button
                    key={s.key}
                    className="move-slot-btn"
                    onClick={() => handleMoveTo(d, s.key)}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            ))}
            <button className="modal-btn cancel" onClick={() => setMoveModal({ open: false, day: null, slot: null, id: null })}>Cancel</button>
          </div>
        </div>
      )}
      
      {placeModal.open && (
        <PlacePickerModal
          onPick={handlePlacePicked}
          onClose={() => setPlaceModal({ open: false, day: null, slot: null, id: null })}
        />
      )}
    </>
  );
}

function formatDay(str) {
  const d = new Date(str);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}