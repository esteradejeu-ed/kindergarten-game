"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./carRace.module.css";

const GAME_DURATION = 10;
const TRACK_LENGTH = 100;

interface HistoryEntry {
  name: string;
  score: number;
  time: string;
  duration: number;
}

export default function CarRaceGame() {
  const [playerName, setPlayerName] = useState("");
  const [position, setPosition] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameActive, setGameActive] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("car-race-history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive) return;
      if (e.key === " " || e.key === "ArrowRight") {
        moveCar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameActive]);

  const startGame = () => {
    setPosition(0);
    setTimeLeft(GAME_DURATION);
    setGameActive(true);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const moveCar = () => {
    setPosition((prev) => {
      const next = Math.min(prev + 5, TRACK_LENGTH);
      if (next >= TRACK_LENGTH) {
        clearInterval(timerRef.current!);
        const durationUsed = GAME_DURATION - timeLeft + 1;
        endGame(durationUsed);
      }
      return next;
    });
  };

  const endGame = (duration?: number) => {
    setGameActive(false);
    updateHistory(playerName, position, duration);
  };

  const updateHistory = (name: string, score: number, duration?: number) => {
    const actualDuration = duration ?? GAME_DURATION - timeLeft;
    const newEntry = {
      name,
      score,
      time: new Date().toLocaleTimeString(),
      duration: actualDuration,
    };
    const updated = [newEntry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("car-race-history", JSON.stringify(updated));
  };

  return (
    <div className={styles.container}>
      <h1>🏁 Car Race</h1>

      {!gameActive && (
        <div className={styles.setup}>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={startGame} disabled={!playerName.trim()}>
            Start Race
          </button>
        </div>
      )}

      <div className={styles.info}>
        <span>Player: {playerName || "-"}</span>
        <span>Time: 00:{String(timeLeft).padStart(2, "0")}</span>
        <span>Distance: {position}m</span>
      </div>

      <div className={styles.track}>
        <div className={styles.car} style={{ left: `${position}%` }}>🚗</div>
        <div className={styles.finishLine}></div>
      </div>

      {gameActive && (
        <button className={styles.driveButton} onClick={moveCar}>
          Drive!
        </button>
      )}

      {!gameActive && history.length > 0 && (
        <div className={styles.history}>
          <h2>🏆 Last 10 Players</h2>
          <ul>
            {history.map((entry, idx) => (
              <li key={idx}>
                {entry.name} — {entry.score}m in {entry.duration}s at {entry.time}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
