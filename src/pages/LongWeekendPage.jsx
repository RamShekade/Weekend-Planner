import React, { useState, useEffect } from "react";
import ActivityBrowser from "../components/ActivityBrowser";
import ScheduleCalendar from "../components/ScheduleCalendar";
import MoodPicker from "../components/MoodPicker";
import MoodBoard from "../components/MoodBoard";
import { moods } from "../data/moods";
import { themes } from "../themes";
import html2canvas from "html2canvas";
import "../index.css";

// Add Friday and Monday for a 4-day long weekend
const longWeekendDays = ["friday", "saturday", "sunday", "monday"];
const timeSlots = ["morning", "afternoon", "evening", "night"];

const initialSchedule = {
  friday: { morning: null, afternoon: null, evening: null, night: null },
  saturday: { morning: null, afternoon: null, evening: null, night: null },
  sunday: { morning: null, afternoon: null, evening: null, night: null },
  monday: { morning: null, afternoon: null, evening: null, night: null },
};

const initialLocked = {
  friday: { morning: false, afternoon: false, evening: false, night: false },
  saturday: { morning: false, afternoon: false, evening: false, night: false },
  sunday: { morning: false, afternoon: false, evening: false, night: false },
  monday: { morning: false, afternoon: false, evening: false, night: false },
};

const initialActivities = [
  { name: "Brunch", icon: "🥞", category: "Food" },
  { name: "Hiking", icon: "🥾", category: "Adventure" },
  { name: "Movie Night", icon: "🎬", category: "Leisure" },
  { name: "Reading", icon: "📚", category: "Chill" },
  { name: "Picnic", icon: "🧺", category: "Outdoor" },
  { name: "Board Games", icon: "🎲", category: "Fun" },
  { name: "Yoga", icon: "🧘‍♂️", category: "Wellness" },
  { name: "Coffee Date", icon: "☕", category: "Chill" },
  { name: "Swimming", icon: "🏊", category: "Active" },
  { name: "Camping", icon: "🏕️", category: "Adventure" },
  { name: "Nap", icon: "😴", category: "Lazy" },
  { name: "Binge-watch", icon: "📺", category: "Lazy" },
  { name: "New Restaurant", icon: "🍽️", category: "Adventurous" },
];

function LongWeekendPage() {
  const [activities] = useState(initialActivities);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [modal, setModal] = useState({
    open: false,
    activity: null,
    day: null,
    slot: null,
  });
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [theme, setTheme] = useState("default");
  const [weekendMood, setWeekendMood] = useState(null);
  const [locked, setLocked] = useState(initialLocked);

  // Load from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem("longweekendly-schedule");
    if (saved) setSchedule(JSON.parse(saved));
    const savedTheme = localStorage.getItem("longweekendly-theme");
    if (savedTheme) setTheme(savedTheme);
    const savedMood = localStorage.getItem("longweekendly-mood");
    if (savedMood) setWeekendMood(savedMood);
    const savedLocks = localStorage.getItem("longweekendly-locks");
    if (savedLocks) setLocked(JSON.parse(savedLocks));
  }, []);

  useEffect(() => {
    localStorage.setItem("longweekendly-schedule", JSON.stringify(schedule));
  }, [schedule]);
  useEffect(() => {
    localStorage.setItem("longweekendly-theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("longweekendly-mood", weekendMood || "");
  }, [weekendMood]);
  useEffect(() => {
    localStorage.setItem("longweekendly-locks", JSON.stringify(locked));
  }, [locked]);

  useEffect(() => {
    const vars = themes[theme];
    for (const k in vars) {
      document.documentElement.style.setProperty(k, vars[k]);
    }
  }, [theme]);

  const handleAddToSchedule = (activity) =>
    setModal({ open: true, activity, day: null, slot: null });

  const handleAssign = (day, slot) => {
    setPendingAssignment({ day, slot });
    setModal({ open: false, activity: modal.activity });
  };

  const handleMoodPick = (moodObj) => {
    if (!pendingAssignment) return;
    const { day, slot } = pendingAssignment;
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: {
          ...modal.activity,
          mood: moodObj.label,
          moodEmoji: moodObj.emoji,
          moodColor: moodObj.color,
        },
      },
    }));
    setPendingAssignment(null);
    setModal({ open: false, activity: null });
  };

  const handleEdit = (day, slot, activity) => {
    setPendingAssignment({ day, slot });
    setModal({ open: false, activity });
  };

  const handleRemove = (day, slot) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: null },
    }));
  };

  const toggleLock = (day, slot) => {
    setLocked((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: !prev[day][slot] },
    }));
  };

  const handleReorder = (day, fromSlot, toSlot) => {
    setSchedule((prev) => {
      const newDay = { ...prev[day] };
      const temp = newDay[fromSlot];
      newDay[fromSlot] = newDay[toSlot];
      newDay[toSlot] = temp;
      return { ...prev, [day]: newDay };
    });
  };

  const handleExport = () => {
    const node = document.querySelector(".calendar-grid");
    html2canvas(node).then((canvas) => {
      const link = document.createElement("a");
      link.download = "longweekendly-plan.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const handleSurpriseMe = () => {
    setSchedule((prev) => {
      const moodObj = moods.find((m) => m.key === weekendMood);
      const options = moodObj
        ? activities.filter((a) => moodObj.activities.includes(a.name))
        : activities;
      const pickRandom = () => options[Math.floor(Math.random() * options.length)];
      const newSchedule = { ...prev };
      longWeekendDays.forEach((day) => {
        timeSlots.forEach((slot) => {
          if (!locked[day][slot]) {
            newSchedule[day][slot] = pickRandom();
          }
        });
      });
      return newSchedule;
    });
  };

  const filteredActivities = weekendMood
    ? activities.filter((a) =>
        moods.find((m) => m.key === weekendMood)?.activities.includes(a.name)
      )
    : activities;

  return (
    <div className="app-container">
      <header>
        <h1>Long Weekendly</h1>
        <p>Plan your perfect long weekend (Fri-Mon) with extra fun!</p>
        <div style={{ margin: "1rem 0" }}>
          <label htmlFor="themePicker" style={{ marginRight: 8 }}>
            Theme:
          </label>
          <select
            id="themePicker"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          >
            {Object.keys(themes).map((t) => (
              <option value={t} key={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <MoodBoard selectedMood={weekendMood} onSelect={setWeekendMood} />
        <button
          style={{
            margin: "1rem 1rem 1rem 0",
            background: "#ffe380",
            fontWeight: "bold",
            borderRadius: 6,
            padding: "0.6rem 1.5rem",
            cursor: "pointer",
            border: "none",
          }}
          onClick={handleSurpriseMe}
        >
          🎡 Surprise Me!
        </button>
        <button
          onClick={handleExport}
          style={{
            margin: "1rem 0",
            background: "#a3e3d3",
            fontWeight: "bold",
            borderRadius: 6,
            padding: "0.6rem 1.5rem",
            cursor: "pointer",
            border: "none",
          }}
        >
          📸 Export Long Weekend Plan as Image
        </button>
      </header>

      <ActivityBrowser
        activities={filteredActivities}
        onAdd={handleAddToSchedule}
        mood={weekendMood}
      />

      <ScheduleCalendar
        schedule={schedule}
        timeSlots={timeSlots}
        onEdit={handleEdit}
        onRemove={handleRemove}
        onReorder={handleReorder}
        locked={locked}
        toggleLock={toggleLock}
        days={longWeekendDays}
      />

      {/* Modal for selecting day/slot */}
      {modal.open && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Pick a time slot</h3>
            <div className="modal-options">
              {longWeekendDays.map((day) =>
                timeSlots.map((slot) => (
                  <button
                    className="slot-btn"
                    key={day + slot}
                    disabled={!!schedule[day][slot]}
                    onClick={() => handleAssign(day, slot)}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)} -{" "}
                    {slot.charAt(0).toUpperCase() + slot.slice(1)}
                  </button>
                ))
              )}
            </div>
            <button
              className="close-btn"
              onClick={() => setModal({ open: false, activity: null })}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mood picker modal */}
      {pendingAssignment && (
        <div className="modal-backdrop">
          <div className="modal">
            <MoodPicker onPick={handleMoodPick} />
            <button
              className="close-btn"
              onClick={() => setPendingAssignment(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <footer>
        <p
          style={{
            marginTop: 40,
            fontSize: "0.95rem",
            color: "#aaa",
          }}
        >
          &copy; {new Date().getFullYear()} Weekendly &mdash; Plan your long weekends with joy!
        </p>
      </footer>
    </div>
  );
}

export default LongWeekendPage;