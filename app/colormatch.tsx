"use client";

import React, { useState, useEffect } from "react";
import styles from "./colorMatch.module.css";

const COLORS = ["red", "blue", "green", "yellow", "orange", "purple"];
const HISTORY_KEY = "memory-game-history";

type Card = {
  id: number;
  color: string;
  flipped: boolean;
  matched: boolean;
};

type HistoryEntry = {
  name: string;
  score: number;
  time: string;
};

function shuffle(array: string[]): Card[] {
  return [...array, ...array]
    .sort(() => 0.5 - Math.random())
    .map((color, index) => ({
      id: index,
      color,
      flipped: false,
      matched: false,
    }));
}

export default function ColorMatchGame() {
  const [playerName, setPlayerName] = useState<string>("");
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setHistory(parsed);
      } catch {
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    if (selected.length === 2) {
      const [first, second] = selected;
      if (cards[first].color === cards[second].color) {
        const updated = cards.map((card, idx) =>
          idx === first || idx === second ? { ...card, matched: true } : card
        );
        setCards(updated);
        setMatchedPairs((m) => m + 1);
      } else {
        setTimeout(() => {
          const flippedBack = cards.map((card, idx) =>
            idx === first || idx === second ? { ...card, flipped: false } : card
          );
          setCards(flippedBack);
        }, 800);
      }
      setTimeout(() => setSelected([]), 800);
    }
  }, [selected, cards]);

  const startGame = () => {
    setCards(shuffle(COLORS));
    setMatchedPairs(0);
    setSelected([]);
    setGameStarted(true);
  };

  const endGame = () => {
    const newEntry: HistoryEntry = {
      name: playerName,
      score: matchedPairs,
      time: new Date().toLocaleTimeString(),
    };
    const updated = [newEntry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setGameStarted(false);
  };

  const handleCardClick = (index: number) => {
    if (selected.length === 2 || cards[index].flipped || cards[index].matched) return;
    const flippedCards = cards.map((card, idx) =>
      idx === index ? { ...card, flipped: true } : card
    );
    setCards(flippedCards);
    setSelected([...selected, index]);
  };

  useEffect(() => {
    if (gameStarted && matchedPairs === COLORS.length) {
      setTimeout(() => endGame(), 1000);
    }
  }, [matchedPairs, gameStarted]);

  return (
    <div className={styles.container}>
      <h1>Color Match Memory</h1>
      {!gameStarted && (
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
      <div className={styles.grid}>
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className={`${styles.card} ${
              card.flipped || card.matched ? styles[card.color as keyof typeof styles] : ""
            }`}
            onClick={() => handleCardClick(idx)}
          >
            {card.flipped || card.matched ? "" : "?"}
          </div>
        ))}
      </div>
      {!gameStarted && history.length > 0 && (
        <div className={styles.history}>
          <h2>Last 10 Players</h2>
          <ul>
            {history.map((entry, idx) => (
              <li key={idx}>
                {entry.name} — {entry.score} pairs at {entry.time}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
