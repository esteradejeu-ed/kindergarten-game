"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./balloonPop.module.css";

const GAME_DURATION = 10;
const HISTORY_KEY = "balloon-pop-history";
const COLORS = ["#ff4d4d", "#4da6ff", "#66ff66", "#ffff66", "#ffb84d", "#bf80ff", "#FFB3BA", // soft pink
  "#FFDFBA", // peach
  "#FFFFBA", // pale yellow
  "#BAFFC9", // mint green
  "#BAE1FF", // baby blue
  "#E3BAFF", // lilac
  "#D5AAFF", // lavender
  "#F9C0D8", // blush rose
  "#B9FBC0", // seafoam
  "#C0F0F9", // icy blue
  "#FFF1BA", // cream yellow
  "#D9D2E9", // light violet
  "#FFCCE5", // cotton candy
  "#C8E6C9", // pastel green
  "#E6EE9C", // soft lime
  "#B3E5FC", // powder blue
  "#F8BBD0", // bubblegum pink
  "#F0F4C3", // pale lime
  "#FDDDE6", // light blush
  "#D1C4E9"  // pastel purple
  ];

  interface HistoryEntry {
  name: string;
  score: number;
  time: string;
}

export default function BalloonPopGame() {
  const [playerName, setPlayerName] = useState("");
  const [score, setScore] = useState(0);
const [balloons, setBalloons] = useState<{ id: number; bottom: number; left: string; speed: number; color: string; }[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameActive, setGameActive] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const nextId = useRef(0);
const spawnInterval = useRef<NodeJS.Timeout | null>(null);
const timerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const updateHistory = (name: any, score: any) => {
    const newEntry = { name, score, time: new Date().toLocaleTimeString() };
    const updated = [newEntry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const startGame = () => {
    setScore(0);
    setBalloons([]);
    setTimeLeft(GAME_DURATION);
    setGameActive(true);
    nextId.current = 0;

    timerInterval.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
     if (timerInterval.current !== null) {
    clearInterval(timerInterval.current);
    }

    if (spawnInterval.current !== null) {
    clearInterval(spawnInterval.current);
    }
          setGameActive(false);
          setScore((finalScore) => {
            updateHistory(playerName, finalScore);
            return finalScore;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    spawnInterval.current = setInterval(() => {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const newBalloon = {
        id: nextId.current++,
        bottom: 0,
        left: Math.random() * 90 + "%",
        speed: 0.5 + Math.random() * 0.000000000025,
        color: randomColor,
      };
      setBalloons((prev) => [...prev, newBalloon]);
    }, 500);
  };

  useEffect(() => {
    if (!gameActive) return;
    const moveInterval = setInterval(() => {
      setBalloons((prev) =>
        prev
          .map((balloon) => ({ ...balloon, bottom: balloon.bottom + balloon.speed }))
          .filter((balloon) => balloon.bottom < 100)
      );
    }, 50);
    return () => clearInterval(moveInterval);
  }, [gameActive]);

  const popBalloon = (id: any) => {
    setBalloons((prev) => prev.filter((b) => b.id !== id));
    setScore((s) => s + 1);
  };

  const formatTime = (sec: any) => sec.toString().padStart(2, "0");

  return (
    <div className={styles.container}>
      <h1>Balloon Pop Game</h1>
      {!gameActive && (
        <div className={styles.setup}>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={startGame} disabled={!playerName.trim()}>
            Start Game
          </button>
        </div>
      )}

      <div className={styles.info}>
        <span>Player: {playerName || "-"}</span>
        <span>Time: 00:{formatTime(timeLeft)}</span>
        <span>Score: {score}</span>
      </div>

      <div className={styles.playArea}>
        {balloons.map((b) => (
          <div
            key={b.id}
            className={styles.balloon}
            style={{
              bottom: `${b.bottom}%`,
              left: b.left,
              backgroundColor: b.color,
              borderColor: b.color,
            }}
            onClick={() => popBalloon(b.id)}
          />
        ))}
      </div>

      {!gameActive && history.length > 0 && (
        <div className={styles.history}>
          <h2>Last 10 Players</h2>
          <ul>
            {history.map((entry, idx) => (
              <li key={idx}>
                {entry.name} — {entry.score} points at {entry.time}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
