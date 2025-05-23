"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";

const GAME_DURATION_SECONDS = 30;
const HISTORY_KEY = "falling-stars-history";

interface Star {
  id: number;
  top: number;
  left: string;
}

interface HistoryEntry {
  name: string;
  score: number;
  time: string;
}

export default function FallingStarsGame() {
  const [playerName, setPlayerName] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [stars, setStars] = useState<Star[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION_SECONDS);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const nextId = useRef<number>(0);
  const starsInterval = useRef<NodeJS.Timeout | null>(null);
  const moveInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const updateHistory = (name: string, score: number) => {
    const newEntry: HistoryEntry = {
      name,
      score,
      time: new Date().toLocaleTimeString(),
    };
    const updated = [newEntry, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const startGame = () => {
    setScore(0);
    setStars([]);
    setTimeLeft(GAME_DURATION_SECONDS);
    setGameActive(true);
    nextId.current = 0;

    timerInterval.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerInterval.current) clearInterval(timerInterval.current);
          if (starsInterval.current) clearInterval(starsInterval.current);
          if (moveInterval.current) clearInterval(moveInterval.current);
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

    starsInterval.current = setInterval(() => {
      const newStar: Star = {
        id: nextId.current++,
        top: 0,
        left: `${Math.random() * 90}%`,
      };
      setStars((prevStars) => [...prevStars, newStar]);
    }, 500);

    moveInterval.current = setInterval(() => {
      setStars((prevStars) =>
        prevStars
          .map((star) => ({
            ...star,
            top: star.top + 2,
          }))
          .filter((star) => star.top < 400)
      );
    }, 50);
  };

  const stopAll = () => {
    if (starsInterval.current) clearInterval(starsInterval.current);
    if (moveInterval.current) clearInterval(moveInterval.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
  };

  const resetGame = () => {
    stopAll();
    setScore(0);
    setStars([]);
    setTimeLeft(GAME_DURATION_SECONDS);
    setGameActive(false);
  };

  useEffect(() => {
    return stopAll;
  }, []);

  const handleStarClick = (id: number) => {
    setStars((prevStars) => prevStars.filter((star) => star.id !== id));
    setScore((prevScore) => prevScore + 1);
  };

  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60).toString().padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className={styles["game-container"]}>
      <h1 className={styles["game-title"]}>Catch the Falling Stars!</h1>

      {!gameActive && (
        <div className={styles["setup-area"]}>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className={styles["name-input"]}
          />
          <button
            onClick={startGame}
            disabled={!playerName.trim()}
            className={styles["start-button"]}
          >
            Start Game
          </button>
        </div>
      )}

      <div className={styles["info-bar"]}>
        <span>Player: {playerName || "-"}</span>
        <span>Time Left: {formatTime(timeLeft)}</span>
        <span>Score: {score}</span>
      </div>

      <div className={styles["star-area"]}>
        <AnimatePresence>
  {stars.map((star) => (
    <motion.div
      key={star.id}
      className={styles["star"]}
      style={{ top: `${star.top}px`, left: star.left }}
      onClick={() => handleStarClick(star.id)}
      initial={{ scale: 1 }}
      whileTap={{ scale: 0.8 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.2 }}
    />
  ))}
</AnimatePresence>

      </div>

      {gameActive && (
        <button onClick={resetGame} className={styles["reset-button"]}>
          Reset
        </button>
      )}

      {!gameActive && score > 0 && (
        <div className={styles["game-over"]}>
          <p>Game Over, {playerName}! Final Score: {score}</p>
        </div>
      )}

      {!gameActive && history.length > 0 && (
        <div className={styles["history"]}>
          <h2>Last 10 Players</h2>
          <ul>
            {history.map((entry, index) => (
              <li key={index}>
                {entry.name} — {entry.score} points at {entry.time}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
