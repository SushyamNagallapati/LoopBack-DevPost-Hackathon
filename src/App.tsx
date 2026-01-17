import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import NewLoopPage from "./pages/NewLoopPage";
import LoopDetailPage from "./pages/LoopDetailPage";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <Router>
      <div className="h-screen bg-gray-950 flex flex-col">
        <Navbar />

        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/loop/new" element={<NewLoopPage />} />
            <Route path="/loop/:id" element={<LoopDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </div>

        <footer className="border-t border-gray-800 py-3 text-center text-[11px] text-gray-500/80">
          © 2026 · Created by Sushyam Nagallapati
        </footer>
      </div>
    </Router>
  );
}

export default App;
