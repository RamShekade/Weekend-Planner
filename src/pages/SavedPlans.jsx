import React, { useEffect, useState, useRef } from "react";
import { getPlansFromStorage, savePlanToStorage } from "../utils/planStorage";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./SavedPlans.css";

export default function SavedPlans() {
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null); // currently viewed plan
  const [editPlan, setEditPlan] = useState(null); // plan in edit mode
  const [memoryPlan, setMemoryPlan] = useState(null); // plan in memory mode
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const journalRef = useRef(null);

  useEffect(() => {
    // Fetch plans with loading indicator
    setLoading(true);
    setTimeout(() => {
      setPlans(getPlansFromStorage());
      setLoading(false);
    }, 300); // Slight delay to show loading state
  }, []);

  // Flatten plan to activities
  function flattenPlanToActivities(plan) {
    let activities = [];
    Object.entries(plan)
      .filter(([k]) => /^\d{4}-\d{2}-\d{2}$/.test(k))
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([day, slots]) => {
        ["morning", "afternoon", "evening", "night"].forEach(slotKey => {
          (slots[slotKey] || []).forEach(item => {
            activities.push({
              ...item,
              day,
              time: slotKey
            });
          });
        });
      });
    return activities;
  }

  // Get days range for plan display
  function getPlanDateRange(plan) {
    const dates = Object.keys(plan).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort();
    if (!dates.length) return "No dates";
    
    if (dates.length === 1) {
      return formatDate(dates[0]);
    }
    
    return `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
  }
  
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // View plan (read-only)
  function handleView(plan) {
    window.scrollTo(0, 0);
    setSelected({
      ...plan,
      activities: flattenPlanToActivities(plan),
      dateRange: getPlanDateRange(plan)
    });
    setEditPlan(null);
    setMemoryPlan(null);
  }

  // Edit plan (future: add editing UI)
  function handleEdit(plan) {
    window.scrollTo(0, 0);
    setEditPlan(plan);
    setSelected(null);
    setMemoryPlan(null);
  }

  // Add/Edit memories for a plan (show memory journal)
  function handleMemories(plan) {
    window.scrollTo(0, 0);
    setMemoryPlan({
      ...plan,
      activities: flattenPlanToActivities(plan),
      dateRange: getPlanDateRange(plan)
    });
    setSelected(null);
    setEditPlan(null);
  }

  // Save memory for activity in memory album
  function handleMemoryChange(activityIdx, { photo, note }) {
    const updated = { ...memoryPlan };
    if (!updated.activities[activityIdx].memory) updated.activities[activityIdx].memory = {};
    if (photo !== undefined) updated.activities[activityIdx].memory.photo = photo;
    if (note !== undefined) updated.activities[activityIdx].memory.note = note;
    setMemoryPlan(updated);
    savePlanToStorage(updated); // persist
    setPlans(getPlansFromStorage());
  }

  // Export PDF for memory album
  async function handleExportPDF() {
    if (!journalRef.current) return;
    
    setExportLoading(true);
    
    try {
      const node = journalRef.current;
      
      // Scroll to top to ensure all content is visible
      node.scrollTop = 0;
      
      const canvas = await html2canvas(node, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${memoryPlan.name}-memories.pdf`);
      
      // Success message could be shown here
    } catch (error) {
      console.error("Error exporting PDF:", error);
      // Error message could be shown here
    } finally {
      setExportLoading(false);
    }
  }

  // Delete plan function
  function handleDeletePlan(planId) {
    const updatedPlans = plans.filter(p => p.id !== planId);
    localStorage.setItem("savedPlans", JSON.stringify(updatedPlans));
    setPlans(updatedPlans);
  }

  // Mark plan as completed
  function handleCompletePlan(plan) {
    const updatedPlan = {...plan, status: "completed"};
    savePlanToStorage(updatedPlan);
    setPlans(getPlansFromStorage());
    
    if (editPlan && editPlan.id === plan.id) {
      setEditPlan(updatedPlan);
    }
  }

  // Filter plans by status and search term
  const filteredPlans = plans.filter(plan => {
    const matchesStatus = filterStatus === "all" || plan.status === filterStatus || 
                         (filterStatus === "active" && !plan.status);
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
                         plan.name.toLowerCase().includes(searchLower) ||
                         (plan.description && plan.description.toLowerCase().includes(searchLower));
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="plan-memories-container">
      <div className="memories-header">
        <div className="beach-wave-bg"></div>
        <h1 className="memories-title">
          <span className="memories-emoji">📚</span> My Travel Memories
        </h1>
        <p className="memories-subtitle">Cherish your adventures and create lasting memories</p>
      </div>

      {!selected && !editPlan && !memoryPlan && (
        <div className="plans-list-section">
          <div className="plans-controls">
            <div className="plans-filter">
              <button 
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All Plans
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                onClick={() => setFilterStatus('active')}
              >
                Active
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('completed')}
              >
                Completed
              </button>
            </div>
            
            <div className="plans-search">
              <input 
                type="text" 
                placeholder="Search plans..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your travel plans...</p>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="empty-plans-message">
              {searchTerm ? (
                <>
                  <div className="empty-icon">🔍</div>
                  <h3>No matching plans found</h3>
                  <p>Try adjusting your search term or filters</p>
                </>
              ) : (
                <>
                  <div className="empty-icon">🏝️</div>
                  <h3>No plans yet</h3>
                  <p>Start planning your next adventure to create memories!</p>
                </>
              )}
            </div>
          ) : (
            <div className="plans-grid">
              {filteredPlans.map(plan => (
                <div
                  key={plan.id}
                  className={`plan-card ${plan.status === 'completed' ? 'completed' : ''}`}
                >
                  <div className="plan-card-header">
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="plan-status">
                      {plan.status === 'completed' ? (
                        <span className="status-badge completed">Completed</span>
                      ) : (
                        <span className="status-badge active">Active</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="plan-details">
                    <div className="plan-detail">
                      <span className="detail-icon">📅</span>
                      <span className="detail-text">{getPlanDateRange(plan)}</span>
                    </div>
                    <div className="plan-detail">
                      <span className="detail-icon">🧩</span>
                      <span className="detail-text">
                        {flattenPlanToActivities(plan).length} activities
                      </span>
                    </div>
                    <div className="plan-detail">
                      <span className="detail-icon">📝</span>
                      <span className="detail-text">
                        Created {new Date(plan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {plan.status === 'completed' && (
                      <div className="plan-detail">
                        <span className="detail-icon">💭</span>
                        <span className="detail-text">
                          {countPlanMemories(plan)} memories
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="plan-actions">
                    <button className="plan-action-btn view" onClick={() => handleView(plan)}>
                      <span className="btn-icon">👁️</span>
                      <span className="btn-text">View</span>
                    </button>
                    
                    <button className="plan-action-btn edit" onClick={() => handleEdit(plan)}>
                      <span className="btn-icon">✏️</span>
                      <span className="btn-text">Edit</span>
                    </button>
                    
                    <button
                      className={`plan-action-btn ${plan.status === 'completed' ? 'memories' : 'add-memories'}`}
                      onClick={() => handleMemories(plan)}
                    >
                      <span className="btn-icon">{plan.status === 'completed' ? '📔' : '✨'}</span>
                      <span className="btn-text">
                        {plan.status === 'completed' ? 'Memories' : 'Add Memories'}
                      </span>
                    </button>
                    
                    <div className="plan-menu">
                      <button className="plan-menu-btn">•••</button>
                      <div className="plan-menu-dropdown">
                        {!plan.status || plan.status !== 'completed' ? (
                          <button onClick={() => handleCompletePlan(plan)}>
                            Mark as Completed
                          </button>
                        ) : null}
                        <button onClick={() => handleDeletePlan(plan.id)} className="delete-btn">
                          Delete Plan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selected && (
        <PlanViewer
          plan={selected}
          onBack={() => setSelected(null)}
        />
      )}

      {editPlan && (
        <PlanEditView
          plan={editPlan}
          onBack={() => setEditPlan(null)}
          onPlanUpdated={updatedPlan => {
            savePlanToStorage(updatedPlan);
            setPlans(getPlansFromStorage());
            setEditPlan(null);
          }}
          onMarkCompleted={handleCompletePlan}
        />
      )}

      {memoryPlan && (
        <MemoryJournal
          plan={memoryPlan}
          onBack={() => setMemoryPlan(null)}
          onMemoryChange={handleMemoryChange}
          onExport={handleExportPDF}
          exportLoading={exportLoading}
          journalRef={journalRef}
        />
      )}
    </div>
  );
}

// Helper function to count memories in a plan
function countPlanMemories(plan) {
  let count = 0;
  
  Object.entries(plan)
    .filter(([key]) => /^\d{4}-\d{2}-\d{2}$/.test(key))
    .forEach(([_, slots]) => {
      ["morning", "afternoon", "evening", "night"].forEach(slotKey => {
        (slots[slotKey] || []).forEach(activity => {
          if (activity.memory && (activity.memory.note || activity.memory.photo)) {
            count++;
          }
        });
      });
    });
    
  return count;
}

// Show plan activities (read-only)
function PlanViewer({ plan, onBack }) {
  // Group activities by day for better organization
  const activitiesByDay = {};
  plan.activities.forEach(activity => {
    if (!activitiesByDay[activity.day]) {
      activitiesByDay[activity.day] = [];
    }
    activitiesByDay[activity.day].push(activity);
  });

  return (
    <div className="plan-viewer">
      <button className="back-button" onClick={onBack}>
        <span className="back-icon">←</span>
        <span>Back to Plans</span>
      </button>
      
      <div className="plan-header">
        <h2 className="plan-title">{plan.name}</h2>
        <span className={`plan-badge ${plan.status === 'completed' ? 'completed' : 'active'}`}>
          {plan.status === 'completed' ? 'Completed' : 'Active'}
        </span>
      </div>
      
      <div className="plan-metadata">
        <div className="metadata-item">
          <span className="metadata-icon">📅</span>
          <span>{plan.dateRange}</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-icon">🗓️</span>
          <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-icon">📌</span>
          <span>{plan.activities.length} Activities</span>
        </div>
      </div>
      
      <div className="plan-activities-container">
        {Object.entries(activitiesByDay).map(([day, activities]) => (
          <div key={day} className="day-activities">
            <h3 className="day-header">
              {new Date(day).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <div className="activities-timeline">
              {activities.map((activity, idx) => (
                <div key={idx} className={`activity-item activity-${activity.time}`}>
                  <div className="activity-time-indicator">
                    <span className="time-label">{formatTimeSlot(activity.time)}</span>
                    <div className="time-dot"></div>
                    <div className="time-line"></div>
                  </div>
                  
                  <div className="activity-card">
                    <div className="activity-icon">
                      {activity.emoji || getTimeIcon(activity.time)}
                    </div>
                    <div className="activity-details">
                      <h4 className="activity-name">{activity.name}</h4>
                      {activity.place && (
                        <div className="activity-location">
                          <span className="location-icon">📍</span>
                          <span>{activity.place.name}</span>
                        </div>
                      )}
                      {activity.memory && (activity.memory.note || activity.memory.photo) && (
                        <div className="activity-memory-indicator">
                          <span className="memory-icon">💭</span>
                          <span>Has memories</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Edit mode with improved UI
function PlanEditView({ plan, onBack, onPlanUpdated, onMarkCompleted }) {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description || "");
  const [isEdited, setIsEdited] = useState(false);

  // Track changes to enable/disable save button
  useEffect(() => {
    if (name !== plan.name || description !== (plan.description || "")) {
      setIsEdited(true);
    } else {
      setIsEdited(false);
    }
  }, [name, description, plan]);

  function handleSave() {
    onPlanUpdated({ 
      ...plan, 
      name, 
      description,
      lastEdited: new Date().toISOString()
    });
  }

  return (
    <div className="plan-edit-view">
      <button className="back-button" onClick={onBack}>
        <span className="back-icon">←</span>
        <span>Back to Plans</span>
      </button>
      
      <div className="edit-form-container">
        <h2 className="edit-title">Edit Plan Details</h2>
        
        <div className="edit-form">
          <div className="form-group">
            <label htmlFor="plan-name">Plan Name</label>
            <input 
              id="plan-name"
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="Enter plan name"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="plan-description">Description (Optional)</label>
            <textarea 
              id="plan-description"
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Add notes about this plan..."
              rows={4}
              className="form-textarea"
            />
          </div>
          
          <div className="edit-status">
            <p>
              <strong>Status:</strong> {plan.status === 'completed' ? 'Completed' : 'Active'}
            </p>
            {!plan.status || plan.status !== 'completed' ? (
              <p className="status-description">
                Mark a plan as completed when your trip is over to start adding memories.
              </p>
            ) : null}
          </div>
          
          <div className="form-actions">
            <button 
              className="save-btn"
              onClick={handleSave}
              disabled={!isEdited}
            >
              Save Changes
            </button>
            
            {(!plan.status || plan.status !== 'completed') && (
              <button 
                className="complete-btn"
                onClick={() => onMarkCompleted(plan)}
              >
                Mark as Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Memory journal for a plan
function MemoryJournal({ plan, onBack, onMemoryChange, onExport, exportLoading, journalRef }) {
  // Group activities by day
  const activitiesByDay = {};
  plan.activities.forEach(activity => {
    if (!activitiesByDay[activity.day]) {
      activitiesByDay[activity.day] = [];
    }
    activitiesByDay[activity.day].push(activity);
  });

  // Count completed memories
  const completedMemories = plan.activities.filter(
    act => act.memory && (act.memory.note || act.memory.photo)
  ).length;

  return (
    <div className="memory-journal-container">
      <button className="back-button" onClick={onBack}>
        <span className="back-icon">←</span>
        <span>Back to Plans</span>
      </button>
      
      <div className="journal-header">
        <div className="journal-title-section">
          <h2 className="journal-title">{plan.name} Memory Journal</h2>
          <span className="journal-dates">{plan.dateRange}</span>
        </div>
        
        <div className="journal-stats">
          <div className="journal-stat">
            <span className="stat-number">{completedMemories}</span>
            <span className="stat-label">Memories</span>
          </div>
          <div className="journal-stat">
            <span className="stat-number">{plan.activities.length}</span>
            <span className="stat-label">Activities</span>
          </div>
        </div>
      </div>
      
      <div className="journal-intro">
        <p>
          Capture your experiences and memories from each activity. 
          Add photos and notes to create a beautiful travel journal.
        </p>
      </div>
      
      <div id="memory-journal" className="journal-content" ref={journalRef}>
        {Object.entries(activitiesByDay).map(([day, activities]) => (
          <div key={day} className="journal-day">
            <h3 className="journal-day-header">
              {new Date(day).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long', 
                day: 'numeric'
              })}
            </h3>
            
            <div className="journal-activities">
              {activities.map((activity, idx) => {
                const activityIdx = plan.activities.findIndex(
                  a => a.day === day && a.time === activity.time && a.id === activity.id
                );
                
                return (
                  <MemoryActivityBlock
                    key={idx}
                    activity={activity}
                    idx={activityIdx}
                    onMemoryChange={onMemoryChange}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="journal-actions">
        <button 
          className="export-btn"
          onClick={onExport}
          disabled={exportLoading}
        >
          {exportLoading ? (
            <>
              <span className="export-spinner"></span>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <span className="export-icon">📄</span>
              <span>Export as PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function MemoryActivityBlock({ activity, idx, onMemoryChange }) {
  const [note, setNote] = useState(activity.memory?.note || "");
  const [photoData, setPhotoData] = useState(activity.memory?.photo || "");
  const [isNoteEdited, setIsNoteEdited] = useState(false);
  const fileInputRef = useRef(null);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please select an image smaller than 5MB.");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoData(reader.result);
      onMemoryChange(idx, { photo: reader.result });
    };
    reader.readAsDataURL(file);
  }

  function handleNoteSave() {
    if (isNoteEdited) {
      onMemoryChange(idx, { note });
      setIsNoteEdited(false);
    }
  }
  
  function handleNoteChange(e) {
    setNote(e.target.value);
    setIsNoteEdited(true);
  }
  
  function removePhoto() {
    setPhotoData("");
    onMemoryChange(idx, { photo: "" });
  }
  
  function triggerFileInput() {
    fileInputRef.current.click();
  }

  return (
    <div className={`memory-activity ${activity.memory?.note || activity.memory?.photo ? 'has-memory' : ''}`}>
      <div className="memory-activity-header">
        <div className="activity-time-badge">
          {formatTimeSlot(activity.time)}
        </div>
        <div className="activity-info">
          <div className="activity-icon">
            {activity.emoji || getTimeIcon(activity.time)}
          </div>
          <div className="activity-name">{activity.name}</div>
        </div>
        {activity.place && (
          <div className="activity-location">
            <span className="location-icon">📍</span>
            <span>{activity.place.name}</span>
          </div>
        )}
      </div>
      
      <div className="memory-content">
        <div className="memory-note-section">
          <h4 className="memory-section-title">Your Memory</h4>
          <textarea
            value={note}
            onChange={handleNoteChange}
            onBlur={handleNoteSave}
            rows={3}
            className="memory-note-input"
            placeholder="Write your memory or story for this activity..."
          />
        </div>
        
        <div className="memory-photo-section">
          <h4 className="memory-section-title">Add Photo</h4>
          
          {photoData ? (
            <div className="memory-photo-preview">
              <img src={photoData} alt="memory" className="memory-photo" />
              <div className="photo-actions">
                <button className="change-photo-btn" onClick={triggerFileInput}>
                  Change Photo
                </button>
                <button className="remove-photo-btn" onClick={removePhoto}>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="memory-photo-upload" onClick={triggerFileInput}>
              <div className="upload-icon">📷</div>
              <span className="upload-text">Click to add a photo</span>
            </div>
          )}
          
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            ref={fileInputRef}
            className="photo-input"
          />
        </div>
      </div>
    </div>
  );
}

// Helper functions
function formatTimeSlot(timeSlot) {
  switch (timeSlot) {
    case 'morning': return 'Morning';
    case 'afternoon': return 'Afternoon';
    case 'evening': return 'Evening';
    case 'night': return 'Night';
    default: return timeSlot;
  }
}

function getTimeIcon(timeSlot) {
  switch (timeSlot) {
    case 'morning': return '☀️';
    case 'afternoon': return '🌤️';
    case 'evening': return '🌆';
    case 'night': return '🌙';
    default: return '📌';
  }
}