"use client";

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FallingStarsGame from "./fallingstars";
import ColorMatchGame from "./colormatch";
import BalloonPopGame from "./balloons";
import CarRaceGame from "./car-race-game";
import PlaneRaceGame from "./plane-race";
import TetrisGame from "./tetris";
import styles from "./app.module.css";

export default function GameRouter() {
    return (
            <Router>
            <div className={styles.nav}>
                <Link to="/">Falling Stars</Link>
                <Link to="/memory">Color Match</Link>
                <Link to="/balloon">Balloon Pop</Link>
                <Link to="/tetris">Tetris</Link>
                <Link to="/race">Car Race</Link> {/* New Link */}
                <Link to="/plane-race">Plane Race</Link> {/* New Link */}
            </div>
            <Routes>
                <Route path="/" element={<FallingStarsGame />} />
                <Route path="/memory" element={<ColorMatchGame />} />
                <Route path="/balloon" element={<BalloonPopGame />} />
                <Route path="/tetris" element={<TetrisGame />} />
                <Route path="/race" element={<CarRaceGame />} /> {/* New Route */}
                <Route path="/plane-race" element={<PlaneRaceGame />} /> {/* New Route */}
            </Routes>
        </Router>
    );
}
