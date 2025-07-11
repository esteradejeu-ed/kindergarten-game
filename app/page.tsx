"use client";
import dynamic from "next/dynamic";

const GameRouter = dynamic(() => import("./GameRouter"), {
  ssr: false,
});

export default function Home() {
  return <GameRouter />;
}
