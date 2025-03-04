"use client";

import { useEffect, useState } from "react";

type Voca = {
  id: number;
  word: string;
  meaning: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Home() {
  const [words, setWords] = useState<Voca[]>([]);

  const loadWords = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/voca`);
      const data = await res.json();
      console.log(data);
      setWords(data);
    } catch (error) {
      console.error("Failed to fetch words:", error);
    }
  };

  useEffect(() => {
    loadWords();
  }, []);

  return (
    <div>
      <h1>단어 목록</h1>
      <ul>
        {words.map((word) => (
          <li key={word.id}>
            <strong>{word.word}</strong> - {word.meaning}
          </li>
        ))}
      </ul>
    </div>
  );
}
