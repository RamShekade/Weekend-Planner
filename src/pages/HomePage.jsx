import React, { useState, useEffect } from "react";
import ActivityBrowser from "../components/ActivityBrowser";
// import ScheduleCalendar from "../components/ScheduleCalendar";
import MoodPicker from "../components/MoodPicker";
import MoodBoard from "../components/MoodBoard";
import { moods } from "../data/moods";
import { themes } from "../themes";
import html2canvas from "html2canvas";
import "../index.css";
import TimelineView from "../components/TimelineView";

// Initial Activities
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

const timeSlots = ["morning", "afternoon", "evening", "night"];
const days = ["saturday", "sunday"];
const initialSchedule = {
  saturday: { morning: null, afternoon: null, evening: null, night: null },
  sunday: { morning: null, afternoon: null, evening: null, night: null },
};
const initialLocked = {
  saturday: { morning: false, afternoon: false, evening: false, night: false },
  sunday: { morning: false, afternoon: false, evening: false, night: false },
};

function HomePage() {
     const [selectedDates, setSelectedDates] = useState(days);
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

  // Load schedule, theme, mood, locks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("weekendly-schedule");
    if (saved) setSchedule(JSON.parse(saved));
    const savedTheme = localStorage.getItem("weekendly-theme");
    if (savedTheme) setTheme(savedTheme);
    const savedMood = localStorage.getItem("weekendly-mood");
    if (savedMood) setWeekendMood(savedMood);
    const savedLocks = localStorage.getItem("weekendly-locks");
    if (savedLocks) setLocked(JSON.parse(savedLocks));
  }, []);

  // Save schedule to localStorage
  useEffect(() => {
    localStorage.setItem("weekendly-schedule", JSON.stringify(schedule));
  }, [schedule]);
  useEffect(() => {
    localStorage.setItem("weekendly-theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("weekendly-mood", weekendMood || "");
  }, [weekendMood]);
  useEffect(() => {
    localStorage.setItem("weekendly-locks", JSON.stringify(locked));
  }, [locked]);

  // Apply theme CSS vars
  useEffect(() => {
    const vars = themes[theme];
    for (const k in vars) {
      document.documentElement.style.setProperty(k, vars[k]);
    }
  }, [theme]);

  // Add activity
  const handleAddToSchedule = (activity) =>
    setModal({ open: true, activity, day: null, slot: null });

  // Assign activity: open mood picker after slot selection
  const handleAssign = (day, slot) => {
    setPendingAssignment({ day, slot });
    setModal({ open: false, activity: modal.activity });
  };

  // After mood pick, save activity with mood
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

  // Edit scheduled activity (re-pick mood)
  const handleEdit = (day, slot, activity) => {
    setPendingAssignment({ day, slot });
    setModal({ open: false, activity });
  };

  // Remove scheduled activity
  const handleRemove = (day, slot) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: null },
    }));
  };

  // Toggle lock state for a slot
  const toggleLock = (day, slot) => {
    setLocked((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: !prev[day][slot] },
    }));
  };

  // Drag-and-drop reorder: swap activities between slots in a day
  const handleReorder = (day, fromSlot, toSlot) => {
    setSchedule((prev) => {
      const newDay = { ...prev[day] };
      const temp = newDay[fromSlot];
      newDay[fromSlot] = newDay[toSlot];
      newDay[toSlot] = temp;
      return { ...prev, [day]: newDay };
    });
  };

  // Export as image
  const handleExport = () => {
    const node = document.querySelector(".calendar-grid");
    html2canvas(node).then((canvas) => {
      const link = document.createElement("a");
      link.download = "weekendly-plan.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  // "Surprise Me" randomizer
  const handleSurpriseMe = () => {
    setSchedule((prev) => {
      const moodObj = moods.find((m) => m.key === weekendMood);
      const options = moodObj
        ? activities.filter((a) => moodObj.activities.includes(a.name))
        : activities;
      const pickRandom = () => options[Math.floor(Math.random() * options.length)];
      const newSchedule = { ...prev };
      days.forEach((day) => {
        timeSlots.forEach((slot) => {
          if (!locked[day][slot]) {
            newSchedule[day][slot] = pickRandom();
          }
        });
      });
      return newSchedule;
    });
  };

  // Filter activities based on mood
  const filteredActivities = weekendMood
    ? activities.filter((a) =>
        moods.find((m) => m.key === weekendMood)?.activities.includes(a.name)
      )
    : activities;

  return (
    <div className="app-container">
      <header>
        <h1>Weekendly</h1>
        <p>Plan your perfect weekend, visually and easily!</p>
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
          📸 Export Weekend Plan as Image
        </button>
      </header>

      <ActivityBrowser
        activities={filteredActivities}
        onAdd={handleAddToSchedule}
        mood={weekendMood}
      />

        <TimelineView
    selectedDates={selectedDates}
    schedule={schedule}
    timeSlots={timeSlots}
    onEdit={handleEdit}
    onRemove={handleRemove}
    onReorder={handleReorder}
    locked={locked}
    toggleLock={toggleLock}
    />

      {/* Modal for selecting day/slot */}
      {modal.open && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Pick a time slot</h3>
            <div className="modal-options">
              {days.map((day) =>
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
          &copy; {new Date().getFullYear()} Weekendly &mdash; Built with React +
          Vite
        </p>
      </footer>
    </div>
  );
}

export default HomePage;

// import React, { useState } from 'react';
// import { Calendar, Search, Palette, Plus, Sun, Moon } from 'lucide-react';
// import { WeekendlyHeader } from './WeekendlyHeader';
// import { MoodSelector } from './MoodSelector';
// import { ActivityBrowser } from './ActivityBrowser';
// // Drop-in your own simple Badge component
// import { Badge } from '../components/Badge';
// // Drop-in your own Dialog components or use a dialog library
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/Dialog';
// import { ScheduledActivityCard } from './ScheduledActivityCard';
// import { useWeekendly } from '../contexts/ScheduleContext';

// // Minimal cn utility (classNames joiner)
// function cn(...classes) {
//   return classes.filter(Boolean).join(' ');
// }

// const TIME_SLOTS = [
//   { id: 'morning', label: 'Morning', icon: <Sun className="h-4 w-4" />, time: '6AM - 12PM' },
//   { id: 'afternoon', label: 'Afternoon', icon: <Calendar className="h-4 w-4" />, time: '12PM - 6PM' },
//   { id: 'evening', label: 'Evening', icon: <Moon className="h-4 w-4" />, time: '6PM - 12AM' },
// ];

// function DaySchedule({ day, title, gradient }) {
//   const { state, removeActivity, addActivity } = useWeekendly();
//   const [selectedTimeSlot, setSelectedTimeSlot] = useState('morning');
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   const dayActivities = state.currentPlan?.activities.filter(a => a.day === day) || [];

//   const getActivitiesForTimeSlot = (timeSlot) => {
//     return dayActivities.filter(a => a.timeSlot === timeSlot);
//   };

//   const handleActivitySelect = (activity) => {
//     addActivity(activity, day, selectedTimeSlot);
//     setIsDialogOpen(false);
//   };

//   const openAddDialog = (timeSlot) => {
//     setSelectedTimeSlot(timeSlot);
//     setIsDialogOpen(true);
//   };

//   return (
//     <div className="weekend-card bg-white shadow rounded-2xl overflow-hidden mb-8">
//       <div className={cn('p-4 rounded-t-2xl text-white mb-4', gradient)}>
//         <h2 className="text-xl font-bold flex items-center">
//           <Calendar className="h-5 w-5 mr-2" />
//           {title}
//         </h2>
//         <p className="text-white/80 text-sm">
//           {dayActivities.length} activities planned
//         </p>
//       </div>
//       <div className="px-4 pb-4 space-y-4">
//         {TIME_SLOTS.map((timeSlot) => {
//           const activities = getActivitiesForTimeSlot(timeSlot.id);
//           return (
//             <div key={timeSlot.id} className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-2">
//                   {timeSlot.icon}
//                   <span className="font-medium">{timeSlot.label}</span>
//                   <span className="text-xs text-muted-foreground">{timeSlot.time}</span>
//                 </div>
//                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                   <DialogTrigger asChild>
//                     <button
//                       type="button"
//                       onClick={() => openAddDialog(timeSlot.id)}
//                       className="h-7 px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 flex items-center text-xs"
//                     >
//                       <Plus className="h-3 w-3" />
//                     </button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
//                     <DialogHeader>
//                       <DialogTitle>
//                         Add Activity to {title} {timeSlot.label}
//                       </DialogTitle>
//                     </DialogHeader>
//                     <ActivityBrowser onActivitySelect={handleActivitySelect} />
//                   </DialogContent>
//                 </Dialog>
//               </div>
//               <div className="min-h-[60px] p-2 border-2 border-dashed border-border/30 rounded-lg space-y-2">
//                 {activities.length > 0 ? (
//                   activities.map((activity) => (
//                     <ScheduledActivityCard
//                       key={activity.id}
//                       activity={activity}
//                       onRemove={removeActivity}
//                     />
//                   ))
//                 ) : (
//                   <div className="flex items-center justify-center h-14 text-muted-foreground text-sm">
//                     Drop an activity here or click + to add
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// export function WeekendSchedule() {
//   const { state } = useWeekendly();

//   if (!state.currentPlan || state.currentPlan.activities.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <div className="text-6xl mb-4 animate-bounce-gentle">📅</div>
//         <h3 className="text-xl font-semibold mb-2">No weekend plans yet!</h3>
//         <p className="text-muted-foreground mb-4">
//           Start by selecting your mood and browse activities to create your perfect weekend.
//         </p>
//         <Badge variant="secondary" className="text-sm">
//           Tip: Activities will appear here as you add them
//         </Badge>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="text-center space-y-2">
//         <h2 className="text-2xl font-bold">Your Weekend Plan</h2>
//         <p className="text-muted-foreground">
//           Total activities: {state.currentPlan.activities.length} • 
//           Mood: <span className="capitalize text-primary font-medium">{state.currentPlan.mood}</span>
//         </p>
//       </div>
//       <div className="grid md:grid-cols-2 gap-6">
//         <DaySchedule
//           day="saturday"
//           title="Saturday"
//           gradient="gradient-saturday"
//         />
//         <DaySchedule
//           day="sunday"
//           title="Sunday"
//           gradient="gradient-sunday"
//         />
//       </div>
//     </div>
//   );
// }

// export default function HomePage() {
//   const [activeTab, setActiveTab] = useState('mood');
//   const { addActivity } = useWeekendly();

//   const handleActivitySelect = (activity) => {
//     // Default to Saturday morning for quick add
//     addActivity(activity, 'saturday', 'morning');
//     setActiveTab('schedule');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
//       <WeekendlyHeader />

//       <main className="container max-w-screen-2xl mx-auto px-4 py-8">
//         <div className="space-y-8">
//           <div className="flex justify-center">
//             <div className="grid grid-cols-3 w-full max-w-md">
//               <button 
//                 type="button"
//                 onClick={() => setActiveTab('mood')}
//                 className={
//                   'flex items-center justify-center px-4 py-2 rounded ' +
//                   (activeTab === 'mood'
//                     ? 'bg-primary text-white'
//                     : 'bg-white text-primary border border-primary')
//                 }
//               >
//                 <Palette className="h-4 w-4 mr-2" />
//                 <span className="hidden sm:inline">Mood</span>
//               </button>
//               <button 
//                 type="button"
//                 onClick={() => setActiveTab('activities')}
//                 className={
//                   'flex items-center justify-center px-4 py-2 rounded ' +
//                   (activeTab === 'activities'
//                     ? 'bg-primary text-white'
//                     : 'bg-white text-primary border border-primary')
//                 }
//               >
//                 <Search className="h-4 w-4 mr-2" />
//                 <span className="hidden sm:inline">Browse</span>
//               </button>
//               <button 
//                 type="button"
//                 onClick={() => setActiveTab('schedule')}
//                 className={
//                   'flex items-center justify-center px-4 py-2 rounded ' +
//                   (activeTab === 'schedule'
//                     ? 'bg-primary text-white'
//                     : 'bg-white text-primary border border-primary')
//                 }
//               >
//                 <Calendar className="h-4 w-4 mr-2" />
//                 <span className="hidden sm:inline">Schedule</span>
//               </button>
//             </div>
//           </div>

//           {activeTab === 'mood' && (
//             <div className="max-w-4xl mx-auto">
//               <MoodSelector />
//               <div className="flex justify-center mt-8">
//                 <button 
//                   type="button"
//                   onClick={() => setActiveTab('activities')}
//                   className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full text-white font-semibold transition"
//                 >
//                   Browse Activities →
//                 </button>
//               </div>
//             </div>
//           )}

//           {activeTab === 'activities' && (
//             <div className="max-w-6xl mx-auto">
//               <ActivityBrowser onActivitySelect={handleActivitySelect} />
//             </div>
//           )}

//           {activeTab === 'schedule' && (
//             <div className="max-w-6xl mx-auto">
//               <WeekendSchedule />
//             </div>
//           )}
//         </div>
//       </main>

//       {/* Floating Weekend Summary */}
//       <div className="fixed bottom-6 right-6 z-40">
//         <button
//           type="button"
//           onClick={() => setActiveTab('schedule')}
//           className="rounded-full shadow-lg bg-primary hover:bg-primary/90 animate-float flex items-center px-6 py-3 text-white font-semibold transition"
//         >
//           <Calendar className="h-4 w-4 mr-2" />
//           View Plan
//         </button>
//       </div>
//     </div>
//   );
// }