"use client";

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FallingStarsGame from "./fallingstars";
import ColorMatchGame from "./colormatch";
import BalloonPopGame from "./balloons";
import styles from "./app.module.css";

export default function GameRouter() {
    return (
        <Router>
            <div className={styles.nav}>
                <Link to="/">Falling Stars</Link>
                <Link to="/memory">Color Match</Link>
                <Link to="/balloon">Balloon Pop</Link>
            </div>
            <Routes>
                <Route path="/" element={<FallingStarsGame />} />
                <Route path="/memory" element={<ColorMatchGame />} />
                <Route path="/balloon" element={<BalloonPopGame />} />
            </Routes>
        </Router>
    );
}
