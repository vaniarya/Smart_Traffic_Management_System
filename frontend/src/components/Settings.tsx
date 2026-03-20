import React, { useEffect, useState } from "react";
import "./settings.css";

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };


  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="theme-toggle">
        <span>Dark Mode</span>

        <label className="switch">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleTheme}
          />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  );
};

export default Settings;