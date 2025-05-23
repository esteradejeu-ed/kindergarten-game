"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./planeRace.module.css";

const GAME_DURATION = 30; // seconds
const COLORS = ["#ff4d4d", "#4da6ff", "#66ff66", "#ffb84d"];

interface Plane {
  id: number;
  row: number;
  col: number;
  color: string;
}

interface HistoryEntry {
  name: string;
  score: number;
  time: string;
}

const GRID_ROWS = 10;
const GRID_COLS = 10;

export default function PlaneRaceGame() {
  const [playerName, setPlayerName] = useState("");
  const [planes, setPlanes] = useState<Plane[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameActive, setGameActive] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const nextId = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const moveRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("plane-tetris-history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const updateHistory = (name: string, score: number) => {
    const newEntry = { name, score, time: new Date().toLocaleTimeString() };
    const updated = [newEntry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("plane-tetris-history", JSON.stringify(updated));
  };

  const startGame = () => {
    setPlanes([]);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameActive(true);
    nextId.current = 0;

    // Spawn one plane per row
    const initialPlanes = Array.from({ length: GRID_ROWS }, (_, i) => ({
      id: nextId.current++,
      row: i,
      col: 0,
      color: COLORS[i % COLORS.length],
    }));
    setPlanes(initialPlanes);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          clearInterval(moveRef.current!);
          setGameActive(false);
          updateHistory(playerName, score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    moveRef.current = setInterval(() => {
      setPlanes((prev) =>
        prev.map((plane) => ({
          ...plane,
          col: (plane.col + 1) % GRID_COLS, // wrap around
        }))
      );
    }, 300);
  };

  const clickPlane = (id: number) => {
    setPlanes((prev) => prev.filter((p) => p.id !== id));
    setScore((prev) => prev + 1);
  };

  return (
    <div className={styles.container}>
      <h1>Plane Tetris</h1>
      {!gameActive && (
        <div className={styles.setup}>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={startGame} disabled={!playerName.trim()}>
            Start
          </button>
        </div>
      )}

      <div className={styles.info}>
        <span>Player: {playerName || "-"}</span>
        <span>Time: 00:{String(timeLeft).padStart(2, "0")}</span>
        <span>Score: {score}</span>
      </div>

      <div className={styles.grid}>
        {Array.from({ length: GRID_ROWS }).map((_, row) => (
          <div key={row} className={styles.row}>
            {Array.from({ length: GRID_COLS }).map((_, col) => {
              const plane = planes.find((p) => p.row === row && p.col === col);
              return (
                <div
                  key={col}
                  className={styles.cell}
                  style={{ backgroundColor: plane?.color || "#eee" }}
                  onClick={() => plane && clickPlane(plane.id)}
                ></div>
              );
            })}
          </div>
        ))}
      </div>

      {!gameActive && history.length > 0 && (
        <div className={styles.history}>
          <h2>Last 10 Players</h2>
          <ul>
            {history.map((entry, idx) => (
              <li key={idx}>{entry.name} — {entry.score} at {entry.time}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
