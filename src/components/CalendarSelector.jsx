import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarSelector.css";
import { usePlan } from "../context/PlanContext";

// Hardcoded demo holidays (ISO format, next 2 months)
const holidays = [
  { date: "2025-09-14", localName: "Ganesh Chaturthi" },      // Sunday
  { date: "2025-09-25", localName: "Eid-e-Milad" },           // Thursday
  { date: "2025-10-02", localName: "Gandhi Jayanti" },        // Thursday
  { date: "2025-10-03", localName: "Durga Ashtami" },         // Friday
  { date: "2025-10-20", localName: "Diwali" },                // Monday
];

function formatRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const opts = { month: "short", day: "numeric" };
  if (s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString(undefined, opts)}–${e.getDate()}`;
  }
  return `${s.toLocaleDateString(undefined, opts)}–${e.toLocaleDateString(undefined, opts)}`;
}

// Detect long weekends from holiday list (Nager.Date format)
function detectLongWeekends(holidays) {
  const longWeekends = [];
  holidays.forEach(h => {
    const date = new Date(h.date);
    const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

    // Friday holiday: Fri + Sat + Sun
    if (day === 5) {
      const fri = new Date(h.date);
      const sat = new Date(fri); sat.setDate(fri.getDate() + 1);
      const sun = new Date(fri); sun.setDate(fri.getDate() + 2);
      longWeekends.push({
        name: h.localName,
        range: [fri, sun],
        label: `${h.localName} (${formatRange(fri, sun)})`
      });
    }
    // Monday holiday: Sat + Sun + Mon
    else if (day === 1) {
      const mon = new Date(h.date);
      const sat = new Date(mon); sat.setDate(mon.getDate() - 2);
      const sun = new Date(mon); sun.setDate(mon.getDate() - 1);
      longWeekends.push({
        name: h.localName,
        range: [sat, mon],
        label: `${h.localName} (${formatRange(sat, mon)})`
      });
    }
    // Thursday holiday: Thu + Fri (off) + Sat + Sun
    else if (day === 4) {
      const thu = new Date(h.date);
      const fri = new Date(thu); fri.setDate(thu.getDate() + 1);
      const sat = new Date(thu); sat.setDate(thu.getDate() + 2);
      const sun = new Date(thu); sun.setDate(thu.getDate() + 3);
      longWeekends.push({
        name: h.localName + " (if Friday leave)",
        range: [thu, sun],
        label: `${h.localName} Bridge (${formatRange(thu, sun)})`
      });
    }
    // Tuesday holiday: Sat + Sun + Mon (off) + Tue
    else if (day === 2) {
      const tue = new Date(h.date);
      const sat = new Date(tue); sat.setDate(tue.getDate() - 3);
      const sun = new Date(tue); sun.setDate(tue.getDate() - 2);
      const mon = new Date(tue); mon.setDate(tue.getDate() - 1);
      longWeekends.push({
        name: h.localName + " (if Monday leave)",
        range: [sat, tue],
        label: `${h.localName} Bridge (${formatRange(sat, tue)})`
      });
    }
  });
  return longWeekends;
}

export default function CalendarSelector() {
  const { selectedDays, setSelectedDays } = usePlan();
  const [dateValue, setDateValue] = useState(null);

  const [longWeekends, setLongWeekends] = useState([]);

  useEffect(() => {
    setLongWeekends(detectLongWeekends(holidays));
  }, []);

  // For react-calendar: highlight holidays
  const getTileClassName = ({ date, view }) => {
    if (view === "month") {
      const iso = date.toISOString().split("T")[0];
      if (holidays.some(h => h.date === iso)) return "holiday-tile";
    }
    return undefined;
  };

  // Optional: show holiday name on hover/title
  const getTileContent = ({ date, view }) => {
    if (view === "month") {
      const iso = date.toISOString().split("T")[0];
      const holiday = holidays.find(h => h.date === iso);
      if (holiday) return <span title={holiday.localName}>🎉</span>;
    }
    return null;
  };

  const presets = [
    { label: "Weekend (Sat–Sun)", days: [6, 0] },
    { label: "Long Weekend (Fri–Sun)", days: [5, 6, 0] },
    { label: "Extra Long (Fri–Mon)", days: [5, 6, 0, 1] },
  ];

  const handlePreset = (days) => {
    // Find next Friday as anchor
    const today = new Date();
    let start = new Date(today);
    start.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7));
    const selected = days.map((d, i) => {
      let date = new Date(start);
      date.setDate(start.getDate() + i);
      return date.toISOString().split('T')[0];
    });
    setSelectedDays(selected);
    setDateValue(selected.length === 1 ? new Date(selected[0]) : [new Date(selected[0]), new Date(selected[selected.length-1])]);
  };

  // Handle calendar change (range or single)
  const onCalendarChange = (val) => {
    if (Array.isArray(val)) {
      const [start, end] = val;
      if (start && end) {
        const dates = [];
        let cursor = new Date(start);
        while (cursor <= end) {
          dates.push(cursor.toISOString().split('T')[0]);
          cursor.setDate(cursor.getDate() + 1);
        }
        setSelectedDays(dates);
      }
      setDateValue(val);
    } else if (val) {
      setSelectedDays([val.toISOString().split('T')[0]]);
      setDateValue(val);
    }
  };

  // Handle clicking a long weekend suggestion
  const handleLongWeekend = (range) => {
    const dates = [];
    const cursor = new Date(range[0]);
    while (cursor <= range[1]) {
      dates.push(cursor.toISOString().split('T')[0]);
      cursor.setDate(cursor.getDate() + 1);
    }
    setSelectedDays(dates);
    setDateValue([range[0], range[1]]);
  };

  return (
    <div className="calendar-selector">
      <h2 className="calendar-title">Select your weekend/holiday dates</h2>
      <Calendar
        onChange={onCalendarChange}
        value={dateValue}
        selectRange={true}
        className="main-calendar"
        tileClassName={getTileClassName}
        tileContent={getTileContent}
      />
      <div className="calendar-btn-row" style={{ marginTop: 24 }}>
        {presets.map(preset => (
          <button
            key={preset.label}
            className="calendar-btn"
            onClick={() => handlePreset(preset.days)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div style={{ margin: "16px 0 0 0" }}>
        <h3 style={{ fontSize: "1.04em", margin: "0 0 4px 0", color: "#6366f1" }}>✨ Plan Ahead: Upcoming Long Weekends</h3>
        {longWeekends.length === 0 && (
          <div style={{ color: "#aaa" }}>No long weekends found!</div>
        )}
        {longWeekends.map((lw, idx) => (
          <button
            key={lw.label}
            className="calendar-btn longweekend-btn"
            style={{
              background: "#e0e7ff",
              color: "#3b3b54",
              marginBottom: 7,
              border: "1.5px solid #6366f133",
              fontWeight: 500,
              fontSize: "1em"
            }}
            onClick={() => handleLongWeekend(lw.range)}
          >
            {`✅ ${lw.label} → Plan Now`}
          </button>
        ))}
      </div>
      <div className="calendar-selected">
        {selectedDays.length > 0 && (
          <span>
            <b>Selected:</b> {selectedDays.join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}