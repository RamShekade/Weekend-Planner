import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import HomePage from "./components/HomePage";
import { PlanProvider } from "./context/PlanContext";
import "./App.css";
import DistanceTracker from "./components/DistanceTracker";
import PlanMemoriesPage from "./pages/PlanMemories";

function App() {
  return (
    <PlanProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/plan" element={<HomePage />} />
          <Route path="/memory" element={<PlanMemoriesPage />} />
        </Routes>
      </Router>
    </PlanProvider>
  );
}
export default App;