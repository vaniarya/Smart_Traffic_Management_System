import { useState } from "react";
import "./App.css";
import Home from "./components/home";
import Heatmaps from "./components/Heatmaps";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";

function App() {
  const [selected, setSelected] = useState<string>("Home");

  const menuItems: string[] = ["Home", "Heatmaps", "Analytics", "Settings"];

  const renderContent = () => {
    switch (selected) {
      case "Home":
        return <Home />;
      case "Heatmaps":
        return <Heatmaps />;
      case "Analytics":
        return <Analytics />;
      case "Settings":
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="page">

      {/* Floating Sidebar */}
      <div className="sidebar-card">
        <h2 className="logo">SmartTraffic</h2>

        {menuItems.map((item) => (
          <div
            key={item}
            className={`menu-item ${selected === item ? "active" : ""}`}
            onClick={() => setSelected(item)}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Floating Content Panel */}
      <div className="content-card">
        {renderContent()}
      </div>

    </div>
  );
}

export default App;