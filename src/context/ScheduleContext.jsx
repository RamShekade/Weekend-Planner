import { createContext, useReducer, useContext } from 'react';

const ScheduleContext = createContext();

const initialState = {
  saturday: [],
  sunday: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ACTIVITY':
      return {
        ...state,
        [action.day]: [...state[action.day], action.activity],
      };
    case 'REMOVE_ACTIVITY':
      return {
        ...state,
        [action.day]: state[action.day].filter((a, idx) => idx !== action.idx),
      };
    // Add other actions (edit, reorder, etc.)
    default:
      return state;
  }
}

export function ScheduleProvider({ children }) {
  const [schedule, dispatch] = useReducer(reducer, initialState);
  return (
    <ScheduleContext.Provider value={{ schedule, dispatch }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export const useSchedule = () => useContext(ScheduleContext);