import React from 'react';
import { useSchedule } from '../context/ScheduleContext';

function DayColumn({ day, activities, onRemove }) {
  return (
    <div>
      <h3>{day}</h3>
      {activities.map((a, idx) => (
        <div key={idx}>
          <span>{a.icon} {a.name}</span>
          <button onClick={() => onRemove(day, idx)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

function ScheduleView() {
  const { schedule, dispatch } = useSchedule();

  const handleRemove = (day, idx) => {
    dispatch({ type: 'REMOVE_ACTIVITY', day, idx });
  };

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <DayColumn day="saturday" activities={schedule.saturday} onRemove={handleRemove} />
      <DayColumn day="sunday" activities={schedule.sunday} onRemove={handleRemove} />
    </div>
  );
}

export default ScheduleView;