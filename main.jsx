import React from "react";
import { createRoot } from "react-dom/client";
import NeoVecinoMVP from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NeoVecinoMVP />
  </React.StrictMode>
);
