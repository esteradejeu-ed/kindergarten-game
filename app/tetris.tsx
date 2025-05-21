// TetrisGame.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import styles from "./tetrisGame.module.css";

const ROWS = 20;
const COLS = 10;
const SPEED = 500;

const SHAPES = [
  [[1]],
  [[1], [1]],
  [[1], [1], [1]],
  [[1], [1], [1], [1]],
  [[1, 1]],
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
];

type Cell = number;
type Grid = Cell[][];

function getRandomShape() {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)];
}

export default function TetrisGame() {
  const [grid, setGrid] = useState<Grid>(Array(ROWS).fill(0).map(() => Array(COLS).fill(0)));
  const [shape, setShape] = useState<number[][]>(getRandomShape());
  const [position, setPosition] = useState({ row: 0, col: 3 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const mergeShape = (grid: Grid, shape: number[][], row: number, col: number): Grid => {
    const newGrid = grid.map(r => [...r]);
    shape.forEach((r, i) => {
      r.forEach((cell, j) => {
        if (cell) {
          const y = row + i;
          const x = col + j;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            newGrid[y][x] = 1;
          }
        }
      });
    });
    return newGrid;
  };

  const isValidMove = (shape: number[][], row: number, col: number): boolean => {
    return shape.every((r, i) =>
      r.every((cell, j) => {
        if (!cell) return true;
        const newRow = row + i;
        const newCol = col + j;
        return (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          grid[newRow][newCol] === 0
        );
      })
    );
  };

const drop = () => {
  const { row, col } = position;
  if (isValidMove(shape, row + 1, col)) {
    setPosition({ row: row + 1, col });
  } else {
    const merged = mergeShape(grid, shape, row, col);
    const { updatedGrid, linesCleared } = clearLines(merged);
    setScore(s => s + linesCleared * 100);

    const nextShape = getRandomShape();
    if (!isValidMove(nextShape, 0, 3)) {
      setGameOver(true);
      clearInterval(intervalRef.current!);
      return;
    }
    setShape(nextShape);
    setPosition({ row: 0, col: 3 });
    setGrid(updatedGrid);
  }
};

  const clearLines = (grid: Grid): { updatedGrid: Grid, linesCleared: number } => {
  const newGrid: Grid = [];
  let linesCleared = 0;

  for (let i = 0; i < ROWS; i++) {
    if (grid[i].every(cell => cell === 1)) {
      linesCleared++;
    } else {
      newGrid.push([...grid[i]]);
    }
  }

  while (newGrid.length < ROWS) {
    newGrid.unshift(Array(COLS).fill(0));
  }

  return { updatedGrid: newGrid, linesCleared };
};


  useEffect(() => {
    intervalRef.current = setInterval(drop, SPEED);
    return () => clearInterval(intervalRef.current!);
  });

  const move = (direction: number) => {
    const { row, col } = position;
    const newCol = col + direction;
    if (isValidMove(shape, row, newCol)) {
      setPosition({ row, col: newCol });
    }
  };

  const renderGrid = (): JSX.Element[] => {
    const displayGrid = grid.map(row => [...row]);
    shape.forEach((r, i) => {
      r.forEach((cell, j) => {
        if (cell) {
          const y = position.row + i;
          const x = position.col + j;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            displayGrid[y][x] = 2;
          }
        }
      });
    });

    return displayGrid.map((row, i) => (
      <div key={i} className={styles.row}>
        {row.map((cell, j) => (
          <div
            key={j}
            className={`${styles.cell} ${cell === 1 ? styles.filled : ""} ${cell === 2 ? styles.active : ""}`}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className={styles.container}>
      <h1>Tetris Mini Game</h1>
      <p>Score: {score}</p>
      <div className={styles.gameZone}>
        {gameOver ? <div className={styles.over}>Game Over</div> : renderGrid()}
      </div>
      <div className={styles.controls}>
        <button onClick={() => move(-1)}>◀️</button>
        <button onClick={drop}>⬇️</button>
        <button onClick={() => move(1)}>▶️</button>
      </div>
    </div>
  );
}
