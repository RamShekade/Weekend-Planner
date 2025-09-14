import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import { PlanProvider } from "./context/PlanContext";
import "./App.css";
import SavedPlans from "./pages/SavedPlans";

function App() {
  return (
    <PlanProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/plan" element={<HomePage />} />
          <Route path="/saved-plan" element={<SavedPlans />} />
        </Routes>
      </Router>
    </PlanProvider>
  );
}
export default App;