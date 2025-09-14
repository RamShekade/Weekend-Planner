import React, { useState } from "react";
import "./BrowseActivitiesModal.css";
import { activities } from "../data/activities";
import { checkWeatherForOutdoorActivity } from "../functions/Weather";
import ActivityCard from "./ActivityCard"; // Modularized ActivityCard component

const themes = [
  { id: "adventure", label: "Adventure", categories: ["outdoor", "fitness", "travel"] },
  { id: "family", label: "Family Time", categories: ["family", "food", "entertainment"] },
  { id: "friends", label: "Friends Weekend", categories: ["entertainment", "events", "food"] },
  { id: "wellness", label: "Wellness", categories: ["wellness", "hobbies"] },
  { id: "all", label: "All", categories: [] }
];

const DEFAULT_LOCATION = { lat: 28.6139, lon: 77.209 };
const DEFAULT_DATE = new Date().toISOString().slice(0, 10);

const indoorAlternatives = [
  { id: "movie-night", name: "Movie Night", emoji: "🍿" },
  { id: "board-games", name: "Board Games", emoji: "🎲" }
];

export default function BrowseActivitiesModal({ onSave, onClose, plannedDate, plannedPlace }) {
  const [selected, setSelected] = useState([]);
  const [theme, setTheme] = useState("all");
  const [weatherWarning, setWeatherWarning] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Custom activity input
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("✨");

  async function toggleSelect(activity) {
    if (selected.some((a) => a.id === activity.id)) {
      setSelected(prev => prev.filter((a) => a.id !== activity.id));
      setWeatherWarning(null);
      return;
    }

    if ((activity.weatherType === "outdoor" || activity.outdoor) && (plannedPlace || DEFAULT_LOCATION)) {
      setWeatherWarning("Checking weather...");
      try {
        const { ok, weather } = await checkWeatherForOutdoorActivity({
          lat: (plannedPlace && plannedPlace.lat) || DEFAULT_LOCATION.lat,
          lon: (plannedPlace && plannedPlace.lon) || DEFAULT_LOCATION.lon,
          date: plannedDate || DEFAULT_DATE
        });
        if (!ok) {
          setWeatherWarning(
            `⚠️ Weather is ${weather} on this date. Would you like to pick an indoor alternative (e.g. Movie Night or Board Games)?`
          );
          return;
        } else {
          setWeatherWarning(null);
        }
      } catch {
        setWeatherWarning("Could not fetch weather. Try again later.");
        return;
      }
    }
    setSelected(prev => [...prev, activity]);
    setWeatherWarning(null);
  }

  function handleAlternativePick(alt) {
    setSelected(prev => [...prev, alt]);
    setWeatherWarning(null);
  }

  function handleSave() {
    onSave(selected);
  }

  // Add custom activity handler
  function handleAddCustomActivity() {
    if (!customName.trim()) return;
    const id = "custom-" + Date.now();
    const activity = {
      id,
      name: customName,
      emoji: customIcon || "✨",
      isCustom: true
    };
    setSelected(prev => [...prev, activity]);
    setCustomName("");
    setCustomIcon("✨");
  }

  // Filtering by theme
  const themeFiltered =
    theme === "all"
      ? activities
      : activities.filter((cat) =>
          themes.find((t) => t.id === theme)?.categories.includes(cat.id)
        );

  // Unique categories for tab bar
  const uniqueCategories = [
    { id: "all", name: "All", icon: "✨" },
    ...themeFiltered.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon
    }))
  ];

  // Filter by active category
  const categoryFiltered =
    activeCategory === "all"
      ? themeFiltered
      : themeFiltered.filter((cat) => cat.id === activeCategory);

  // Search filter (across all visible activities)
  const filteredActivities = categoryFiltered.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.name.toLowerCase().includes(search.trim().toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="browse-modal-bg">
      <div className="browse-modal">
        <h2 className="browse-modal-title">Select Activities</h2>
        
        <div className="top-controls">
          <div className="theme-selector">
            {themes.map((t) => (
              <button
                key={t.id}
                className={
                  "theme-btn" + (theme === t.id ? " selected" : "")
                }
                onClick={() => {
                  setTheme(t.id);
                  setActiveCategory("all");
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="activity-search"
            placeholder="🔍 Search activities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{marginTop: 10}}
          />
        </div>

        <div className="category-tabbar">
          {uniqueCategories.map(cat => (
            <button
              key={cat.id}
              className={
                "category-tab" + (activeCategory === cat.id ? " selected" : "")
              }
              onClick={() => setActiveCategory(cat.id)}
            >
              <span style={{marginRight: 6}}>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="browse-activity-card-list">
          {/* Custom activity input */}
          <div className="browse-category">
            <h3 className="browse-category-title">✨ Custom Activity</h3>
            <div className="browse-items-cards">
              <div className="activity-card custom-card" tabIndex={0} style={{ display: "flex", alignItems: "center", padding: 10, border: "1.2px dashed #b5b5b5", background: "#f9fafb" }}>
                <input
                  type="text"
                  placeholder="Activity name"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  style={{ flex: 1, marginRight: 7, minWidth: 80 }}
                  maxLength={30}
                />
                <input
                  type="text"
                  placeholder="Emoji"
                  value={customIcon}
                  onChange={e => setCustomIcon(e.target.value)}
                  style={{ width: 36, fontSize: "1.1em", textAlign: "center", marginRight: 7 }}
                  maxLength={2}
                />
                <button
                  style={{
                    background: "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "5px 13px",
                    fontWeight: 500
                  }}
                  disabled={!customName}
                  onClick={handleAddCustomActivity}
                  type="button"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {filteredActivities.length === 0 && (
            <div style={{color: "#999", margin: "2em", textAlign: "center"}}>
              No activities found!
            </div>
          )}
          {filteredActivities.map((cat) => (
            <div key={cat.id} className="browse-category">
              <h3 className="browse-category-title">{cat.icon} {cat.name}</h3>
              <div className="browse-items-cards">
                {cat.items.map((item) => {
                  const id = `${cat.id}-${item.id}`;
                  let moodTag = null;
                  if (/reading|meditation|yoga|journaling|painting/i.test(item.name)) moodTag = "Relaxed";
                  if (/gaming|football|cycling|dance|concert/i.test(item.name)) moodTag = "Excited";
                  if (/family|playdate|lunch|visiting/i.test(item.name)) moodTag = "Social";
                  return (
                    <ActivityCard
                      key={id}
                      id={id}
                      name={item.name}
                      emoji={item.emoji}
                      moodTag={moodTag}
                      selected={selected.some((a) => a.id === id)}
                      onClick={() => toggleSelect({
                        ...item,
                        category: cat.name,
                        id,
                        weatherType: cat.weatherType
                      })}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {weatherWarning && (
          <div className="weather-warning">
            <div>{weatherWarning}</div>
            {weatherWarning.includes("indoor alternative") &&
              <div style={{ marginTop: 10 }}>
                {indoorAlternatives.map(alt => (
                  <button
                    key={alt.id}
                    className="theme-btn"
                    style={{ marginRight: 8 }}
                    onClick={() => handleAlternativePick(alt)}
                  >
                    {alt.emoji} {alt.name}
                  </button>
                ))}
              </div>
            }
          </div>
        )}

        <div className="browse-modal-footer">
          <button className="modal-btn" onClick={handleSave} disabled={selected.length === 0}>
            Add to Plan
          </button>
          <button className="modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}