// Utility for saving/loading plans to/from localStorage

const STORAGE_KEY = "savedPlans";

export function getPlansFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePlanToStorage(plan) {
  let plans = getPlansFromStorage();
  const idx = plans.findIndex(p => p.id === plan.id);
  if (idx > -1) {
    plans[idx] = plan;
  } else {
    plans.push(plan);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function deletePlanFromStorage(planId) {
  let plans = getPlansFromStorage();
  plans = plans.filter(p => p.id !== planId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}