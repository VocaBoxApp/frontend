"use client";

import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

type Voca = {
  id: number;
  word: string;
  meaning: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Home() {
  const [words, setWords] = useState<Voca[]>([]);
  const [showMeaning, setShowMeaning] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const loadWords = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/voca`);
        const data = await res.json();
        setWords(data);
      } catch (error) {
        console.error("Failed to fetch words:", error);
      }
    };
    loadWords();
  }, []);

  // 현재 카드 제거 후 다음 단어로 이동
  const removeWord = (direction: "left" | "right") => {
    if (words.length > 0) {
      setSwipeDirection(direction);
      setIsRemoving(true);
      setTimeout(() => {
        setWords((prev) => prev.slice(1)); // 첫 번째 단어 제거
        setShowMeaning(false);
        setSwipeDirection(null);
        setIsRemoving(false);
      }, 500); // 애니메이션 지속시간 (0.5초)
    }
  };

  // 스와이프 핸들러
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => removeWord("left"),
    onSwipedRight: () => removeWord("right"),
    preventScrollOnSwipe: true,
    trackMouse: true, // 데스크탑에서도 마우스 드래그 지원
  });

  // 키보드 이벤트 핸들링 (←: 모르는 단어, →: 외운 단어)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") removeWord("right");
      if (e.key === "ArrowLeft") removeWord("left");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [words]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-white text-black relative overflow-hidden">
      <div {...swipeHandlers} className="w-full max-w-md p-4 relative">
        <AnimatePresence>
          {words.length > 1 && (
            <motion.div
              key={`next-${words[1].id}`}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1 }}
              className="absolute top-0 left-0 w-11/12 max-w-xs h-56 sm:h-64 bg-white border border-gray-300 rounded-xl shadow-lg flex justify-center items-center text-center select-none transition-transform z-0"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-black">
                {words[1].word}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {words.length > 0 ? (
            <motion.div
              key={words[0].id}
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{ x: 0, y: 0, rotate: 0 }}
              exit={{
                x: swipeDirection === "right" ? "100vw" : "-100vw", // 화면 끝까지 날아가도록 설정
                y: swipeDirection === "right" ? -150 : -150, // 위쪽으로 살짝 올라가기
                rotate: swipeDirection === "right" ? -20 : 20, // 기울어짐
                transition: { duration: 0.3 }, // 더 자연스럽게 날아가는 효과
              }}
              className={`absolute top-0 left-0 w-11/12 max-w-xs h-56 sm:h-64 bg-white border border-gray-300 rounded-xl shadow-2xl flex flex-col justify-center items-center text-center select-none cursor-pointer transition-transform ${
                isRemoving ? "z-20" : "z-10"
              }`}
              onClick={() => setShowMeaning(!showMeaning)}
            >
              <h2 className="text-xl sm:text-3xl font-bold text-black">
                {words[0].word}
              </h2>
              {showMeaning && (
                <p className="text-md sm:text-lg mt-4 text-gray-600">
                  {words[0].meaning}
                </p>
              )}
            </motion.div>
          ) : (
            <p className="text-center">모든 단어 학습 완료 🎉</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
