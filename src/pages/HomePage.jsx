
import React, { useState, useRef, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./HomePage.css";
import BrowseActivitiesModal from "../components/BrowseActivitiesModal";
import PlanTimelineEditor from "../components/PlanEditor";
import { usePlan } from "../context/PlanContext";
import { activities } from "../data/activities"; 
import html2canvas from "html2canvas";
import DistanceTracker from "../components/DistanceTracker";
import RecommenderChatbot from "../components/Chatbot";
import "../components/Chatbot.css";
import { useNavigate } from "react-router-dom";



const SLOT_KEYS = ["morning", "afternoon", "evening", "night"];
const holidays = [
  { date: "2025-09-14", name: "Ganesh Chaturthi" },
  { date: "2025-09-22", name: "Sharad Navratri Begins" },
  { date: "2025-09-25", name: "Eid-e-Milad" },
  { date: "2025-09-28", name: "Durga Puja Begins" },
  { date: "2025-09-29", name: "Maha Saptami" },
  { date: "2025-10-01", name: "Maha Navami" },
  { date: "2025-10-02", name: "Gandhi Jayanti" },
  { date: "2025-10-07", name: "Maharishi Valmiki Jayanti" },
  { date: "2025-10-07", name: "Sukkot Begins (Jewish)" },
  { date: "2025-10-10", name: "Karva Chauth" },
  { date: "2025-10-13", name: "Canadian Thanksgiving" },
  { date: "2025-10-20", name: "Diwali" },
  { date: "2025-10-22", name: "Govardhan Puja" },
  { date: "2025-10-23", name: "Bhai Duj" },
  { date: "2025-11-01", name: "All Saints’ Day (Christian)" },
  { date: "2025-11-02", name: "All Souls’ Day (Christian)" },
  { date: "2025-11-05", name: "Guru Nanak Jayanti" },
  { date: "2025-11-24", name: "Martyrdom of Guru Tegh Bahadur" },
  { date: "2025-12-06", name: "Saint Nicholas Day" },
  { date: "2025-12-08", name: "Bodhi Day (Buddhist)" },
  { date: "2025-12-15", name: "Hanukkah Begins (Jewish)" },
  { date: "2025-12-22", name: "Hanukkah Ends (Jewish)" },
  { date: "2025-12-25", name: "Christmas Day" }
];


export default function HomePage() {
  const { selectedDays, setSelectedDays, addActivity, setPlan, plan } = usePlan();
  const [calendarDone, setCalendarDone] = useState(false);
  const [dateValue, setDateValue] = useState([null, null]);
  const [browseModal, setBrowseModal] = useState({ open: false, day: null, slot: null });
  const [browsing, setBrowsing] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const planRef = useRef();
  const [holidayName, setHolidayName] = useState("");
  const [showDistance, setShowDistance] = useState(false);
  const [animateWave, setAnimateWave] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);
const [weatherInfo, setWeatherInfo] = useState(null);
const [weatherLoading, setWeatherLoading] = useState(true);
const [weatherError, setWeatherError] = useState("");
 
  useEffect(() => {
    
    document.body.classList.add('beach-theme');
    
    // Cleanup function'
     if (!navigator.geolocation) {
    setWeatherError("Geolocation is not supported.");
    setWeatherLoading(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude: lat, longitude: lon } = position.coords;
        const apiKey = "45f2261b0c20880c11bd96d4b1d61659";
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch weather");
        const data = await res.json();
        setWeatherInfo(data);
      } catch (err) {
        setWeatherError("Couldn't fetch weather data.");
      } finally {
        setWeatherLoading(false);
      }
    },
    () => {
      setWeatherError("Couldn't get your location.");
      setWeatherLoading(false);
    }
  );
    return () => {
      document.body.classList.remove('beach-theme');
    };
  }, []);

  const navigate = useNavigate();

function handleSavedPlanClick() {
  navigate("/saved-plan"); // or whatever route you want
}


function getWeatherSuggestion(weather) {
  if (!weather) return null;
  const main = weather.weather[0]?.main || "";
  const temp = weather.main?.temp;

  if (main === "Clear" && temp > 20) return { msg: "☀️ It's sunny and warm! Try some outdoor adventures.", emoji: "☀️" };
  if (main === "Clouds") return { msg: "⛅ Partly cloudy day – great for a picnic or a walk.", emoji: "⛅" };
  if (main === "Rain") return { msg: "🌧️ It's rainy. How about exploring indoor activities or a cozy cafe?", emoji: "🌧️" };
  if (main === "Snow") return { msg: "❄️ Snowy day! Maybe go skiing or enjoy indoor fun.", emoji: "❄️" };
  if (main === "Thunderstorm") return { msg: "⛈️ Thunderstorm alert! Best to plan indoor activities.", emoji: "⛈️" };
  return { msg: `Today's weather: ${main}. Plan accordingly!`, emoji: "🌤️" };
}

  function handleExportImage() {
    if (!planRef.current) return;
    
    setSaveMsg("Preparing your beautiful plan...");
    
    html2canvas(planRef.current, { 
      useCORS: true, 
      backgroundColor: "#fff",
      scale: 2, // Higher quality
    }).then(canvas => {
      const link = document.createElement("a");
      link.download = "MyBeachPlan.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      setSaveMsg("Plan exported successfully!");
      setTimeout(() => setSaveMsg(""), 2000);
    });
  }

  const getTileClassName = ({ date, view }) => {
    if (view === "month") {
      const iso = date.toISOString().split("T")[0];
      if (holidays.some(h => h.date === iso)) return "holiday-tile";
      
      // Check if date is in selected range
      if (Array.isArray(dateValue) && dateValue[0] && dateValue[1]) {
        if (date >= dateValue[0] && date <= dateValue[1]) {
          return "selected-range-tile";
        }
      }
    }
    return undefined;
  };

  const getTileContent = ({ date, view }) => {
    if (view === "month") {
      const iso = date.toISOString().split("T")[0];
      const h = holidays.find(h => h.date === iso);
      if (h) return <span title={h.name} className="holiday-emoji">🎉</span>;
    }
    return null;
  };

  function onCalendarChange(value) {
    setDateValue(value);
    if (Array.isArray(value) && value[0] && value[1]) {
      const days = [];
      let cur = new Date(value[0]);
      while (cur <= value[1]) {
        days.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
      }
      setSelectedDays(days);
      setHolidayName(""); // clear
    } else if (value) {
      const iso = value.toISOString().slice(0, 10);
      setSelectedDays([iso]);
      // If holiday, show name
      const h = holidays.find(h => h.date === iso);
      setHolidayName(h ? h.name : "");
    }
  }

  function handleCalendarConfirm() {
    setCalendarDone(true);
  }

  function handleAddActivity(day, slot) {
    setBrowseModal({ open: true, day, slot });
  }

  function handleBrowseButton() {
    setBrowsing(true);
  }

  function handleBrowseDoneSlot(selectedActs) {
    selectedActs.forEach((act) => addActivity(browseModal.day, browseModal.slot, act));
    setBrowseModal({ open: false, day: null, slot: null });
  }

  function handleBrowseDone(selectedActs) {
    // Add to "morning" slot (or distribute as you wish)
    selectedActs.forEach((act, idx) => {
      const day = selectedDays[idx % selectedDays.length];
      addActivity(day, "morning", act);
    });
    setBrowsing(false);
  }

  function handleSurpriseMe() {
    if (!selectedDays.length) return;
    
    setSaveMsg("Creating a surprise plan for you! 🎉");

    // Flatten all activities
    const allActs = activities.flatMap(cat =>
      cat.items.map(item => ({
        ...item,
        id: `${cat.id}-${item.id}`,
        category: cat.name,
        name: item.name,
      }))
    );

    // Helper for random pick
    const randomAct = () => allActs[Math.floor(Math.random() * allActs.length)];

    // Build random plan: { [day]: { slot: [activity] } }
    const randomPlan = {};
    selectedDays.forEach(day => {
      randomPlan[day] = {};
      SLOT_KEYS.forEach(slot => {
        randomPlan[day][slot] = [randomAct()];
      });
    });
    
    setTimeout(() => {
      setPlan(randomPlan);
      setSaveMsg("Surprise plan created! Enjoy your adventure! 🏄‍♂️");
      setTimeout(() => setSaveMsg(""), 2000);
    }, 800);
  }

  function handleSavePlan() {
    if (!plan || Object.keys(plan).length === 0) {
      setSaveMsg("No plan to save!");
      setTimeout(() => setSaveMsg(""), 2000);
      return;
    }

    // Get current plans array from localStorage or use empty array
    const plans = JSON.parse(localStorage.getItem("savedPlans")) || [];

    // Add a unique id if not present
    if (!plan.id) {
      plan.id = "beach-plan-" + Date.now();
      plan.createdAt = new Date().toISOString();
      plan.name = "Beach Getaway - " + new Date().toLocaleDateString();
    }

    // Remove any existing plan with the same id (replace if re-saving)
    const filtered = plans.filter(p => p.id !== plan.id);

    // Add current plan
    filtered.push(plan);

    // Save back to localStorage
    localStorage.setItem("savedPlans", JSON.stringify(filtered));

    setSaveMsg("Plan saved successfully! 🌴");
    setTimeout(() => setSaveMsg(""), 2000);
  }

  return (
    <div className="homepage-root">
      <div className="beach-background">
        <div className="ocean">
          <div className={`wave ${animateWave ? 'animate-wave' : ''}`}></div>
          <div className={`wave wave2 ${animateWave ? 'animate-wave' : ''}`}></div>
          <div className={`wave wave3 ${animateWave ? 'animate-wave' : ''}`}></div>
        </div>
        <div className="sand"></div>
        <div className="palm-tree left"></div>
        <div className="palm-tree right"></div>
        <div className="sun"></div>
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
      </div>
      
      {!calendarDone ? (
        <div className="calendar-section">
          <div className="calendar-container">
            <h2 className="calendar-header">
              <span className="emoji-icon">🏝️</span> Plan Your Perfect Weekend!!
              <span className="emoji-icon">🌴</span>
            </h2>
            
            <div className="calendar-wrapper">
              <Calendar
                onChange={onCalendarChange}
                value={dateValue}
                selectRange={true}
                className="main-calendar"
                tileClassName={getTileClassName}
                tileContent={getTileContent}
              />
            </div>
            {holidayName && (
              <div className="calendar-holiday-name">
                <span role="img" aria-label="holiday">🎉</span> {holidayName}
              </div>
            )}
            <div className="calendar-selected-dates">
              {Array.isArray(dateValue) && dateValue[0] && dateValue[1] && (
                <>
                  <span>Selected: </span>
                  <b>
                    {dateValue[0].toLocaleDateString()} –{" "}
                    {dateValue[1].toLocaleDateString()}
                  </b>
                </>
              )}
              {Array.isArray(dateValue) && dateValue[0] && !dateValue[1] && (
                <>
                  <span>Selected: </span>
                  <b>
                    {dateValue[0].toLocaleDateString()}
                  </b>
                </>
              )}
            </div>
            <button
              className="calendar-confirm-btn"
              disabled={!(Array.isArray(dateValue) && dateValue[0] && dateValue[1]) && !holidayName}
              onClick={handleCalendarConfirm}
            >
              <span className="btn-text">Start Planning</span>
              <span className="btn-icon">🏄‍♂️</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="planning-screen">
          <div className="planning-header">
            <h1 className="plan-title">Weekendly: Effortless Weekend Planning</h1>
            <p className="plan-subtitle">Create unforgettable moments for your perfect vacation</p>
          </div>

          <div className="weather-banner">
  {weatherLoading ? (
    <span>Loading weather...</span>
  ) : weatherError ? (
    <span>{weatherError}</span>
  ) : weatherInfo ? (
    <span>
      {getWeatherSuggestion(weatherInfo).emoji}
      &nbsp;{getWeatherSuggestion(weatherInfo).msg}&nbsp;
      <span style={{ fontWeight: 600, color: "#0072a3" }}>
        {Math.round(weatherInfo.main.temp)}°C
      </span>
      {" | "}
      {weatherInfo.name}
    </span>
  ) : null}
</div>
          <div className="planning-topbar">
            
            <button
              className="action-btn browse-activities-btn"
              onClick={handleBrowseButton}
            >
              <span className="btn-icon">🔍</span>
              <span className="btn-text">Browse Activities</span>
            </button>
            
            <button
              className="action-btn surprise-btn"
              onClick={handleSurpriseMe}
            >
              <span className="btn-icon">🎲</span>
              <span className="btn-text">Surprise Me!</span>
            </button>
            
            <button
              className="action-btn save-plan-btn"
              onClick={handleSavePlan}
            >
              <span className="btn-icon">💾</span>
              <span className="btn-text">Save Plan</span>
            </button>
            
            <button
              className="action-btn export-plan-btn"
              onClick={handleExportImage}
            >
              <span className="btn-icon">🖼️</span>
              <span className="btn-text">Export Plan</span>
            </button>
            
            <button
              className="action-btn distance-btn"
              onClick={() => setShowDistance(true)}
            >
              <span className="btn-icon">🗺️</span>
              <span className="btn-text">Show Route</span>
            </button>

            <button className="action-btn distance-btn" onClick={handleSavedPlanClick} >
   <span className="btn-text">Saved Plans</span>
</button>
          </div>
          
          {saveMsg && (
            <div className="save-message">
              {saveMsg}
            </div>
          )}
          
          <div className="plan-container" ref={planRef}>
            <PlanTimelineEditor onAddActivity={handleAddActivity} />
          </div>
          
          {/* Distance Tracker Modal Overlay */}
          {showDistance && (
            <div className="modal-overlay distance-tracker-overlay">
              <div className="modal-card distance-tracker-modal-card">
                <button
                  className="close-modal-btn"
                  onClick={() => setShowDistance(false)}
                >
                  ×
                </button>
                <h3 className="modal-title">Distance & Route Planner</h3>
                <DistanceTracker />
              </div>
            </div>
          )}
        </div>
      )}

      {browsing && (
        <div className="modal-overlay">
          <div className="modal-card browse-modal-card">
            <button
              className="close-modal-btn"
              onClick={() => setBrowsing(false)}
            >
              ×
            </button>
            <BrowseActivitiesModal
              onSave={handleBrowseDone}
              onClose={() => setBrowsing(false)}
            />
          </div>
        </div>
      )}
      
      {browseModal.open && (
        <div className="modal-overlay">
          <div className="modal-card browse-modal-card">
            <button
              className="close-modal-btn"
              onClick={() => setBrowseModal({ open: false, day: null, slot: null })}
            >
              ×
            </button>
            <BrowseActivitiesModal
              onSave={handleBrowseDoneSlot}
              onClose={() => setBrowseModal({ open: false, day: null, slot: null })}
            />
          </div>
        </div>
      )}
      
      <button
        className="chatbot-fab"
        aria-label={showChatbot ? "Hide Smart Recommender" : "Show Smart Recommender"}
        onClick={() => setShowChatbot(s => !s)}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 1100,
          border: "none",
          background: "#fef08a",
          borderRadius: "50%",
          width: 56,
          height: 56,
          boxShadow: "0 2px 12px #0002",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          cursor: "pointer",
          transition: "background 0.2s"
        }}
        title={showChatbot ? "Close Smart Recommender" : "Open Smart Recommender"}
      >
        {showChatbot ? "✖️" : "💬"}
      </button>
      {/* Smart Recommender Chatbot */}
      {showChatbot && (
        <div className="chatbot-popup">
          <RecommenderChatbot />
        </div>
      )}
    </div>
  );
}