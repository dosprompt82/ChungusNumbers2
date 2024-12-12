import React, { useState } from 'react';
import Card from './Card';
import TipButton from './TipButton';

interface Problem {
  num1: number;
  num2: number;
}

const ChungusNumbers = () => {
  const [score, setScore] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<Problem>({ num1: 0, num2: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [draggedNumber, setDraggedNumber] = useState<number | null>(null);
  const [mouthOpen, setMouthOpen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAngry, setIsAngry] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [questionsInRound, setQuestionsInRound] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [showingLevelIntro, setShowingLevelIntro] = useState<boolean>(true);
  const [usedProblems, setUsedProblems] = useState<Set<string>>(new Set());
  const [isSick, setIsSick] = useState<boolean>(false);
  const [sickPhase, setSickPhase] = useState<number>(0);
  const [bunnyPosition, setBunnyPosition] = useState<number>(0);
  const getDifficultyRange = (level: number): { min: number; max: number } => {
    switch(level) {
      case 1: return { min: 1, max: 5 };
      case 2: return { min: 2, max: 7 };
      case 3: return { min: 3, max: 9 };
      case 4: return { min: 4, max: 12 };
      default: return { min: 5, max: 15 };
    }
  };

  const generateProblem = () => {
    const range = getDifficultyRange(level);
    let num1: number, num2: number, problemKey: string;

    do {
      num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      problemKey = `${num1}x${num2}`;
    } while (usedProblems.has(problemKey));

    const newUsedProblems = new Set(usedProblems);
    newUsedProblems.add(problemKey);
    setUsedProblems(newUsedProblems);

    const correct = num1 * num2;
    const wrongAnswers = new Set<number>();

    while (wrongAnswers.size < 3) {
      const deviation = Math.max(Math.floor(correct * 0.3), 5);
      const wrong = correct + Math.floor(Math.random() * deviation * 2) - deviation;
      if (wrong !== correct && wrong > 0) {
        wrongAnswers.add(wrong);
      }
    }

    const allOptions = Array.from(wrongAnswers).concat(correct);
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

    setCurrentProblem({ num1, num2 });
    setOptions(shuffledOptions);
    setFeedback('');
    setIsCorrect(null);
    setIsAngry(false);
  };

  const startLevel = () => {
    setShowingLevelIntro(false);
    setUsedProblems(new Set());
    generateProblem();
  };

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setQuestionsInRound(0);
    setWrongAnswers(0);
    setIsSick(false);
    setSickPhase(0);
    setBunnyPosition(0);
    setGameOver(false);
    setShowingLevelIntro(true);
    setUsedProblems(new Set());
  }; React.useEffect(() => {
    resetGame();
  }, []);

  const triggerSickness = () => {
    setIsSick(true);

    setTimeout(() => setSickPhase(1), 500);
    setTimeout(() => setSickPhase(2), 1000);
    setTimeout(() => setSickPhase(3), 1500);
    setTimeout(() => {
      setSickPhase(4);
      let position = 0;
      const runInterval = setInterval(() => {
        position += 20;
        setBunnyPosition(position);
        if (position >= 300) {
          clearInterval(runInterval);
          setTimeout(() => {
            setGameOver(true);
          }, 500);
        }
      }, 100);
    }, 2000);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, number: number) => {
    if (!gameOver && !showingLevelIntro) {
      setDraggedNumber(number);
      setMouthOpen(true);
    }
  };

  const handleDragEnd = () => {
    setMouthOpen(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (gameOver || showingLevelIntro) return;

    const correctAnswer = currentProblem.num1 * currentProblem.num2;

    if (draggedNumber === correctAnswer) {
      setScore(score + (level * 100));
      setFeedback('Yum yum! Correct!');
      setIsCorrect(true);
      setIsAngry(false);

      const newQuestionsInRound = questionsInRound + 1;
      setQuestionsInRound(newQuestionsInRound);

      if (newQuestionsInRound === 5) {
        setFeedback(`Level ${level} Complete!`);
        setTimeout(() => {
          setLevel(level + 1);
          setQuestionsInRound(0);
          setWrongAnswers(0);
          setShowingLevelIntro(true);
        }, 2000);
      } else {
        setTimeout(generateProblem, 1500);
      }
    } else {
      const newWrongAnswers = wrongAnswers + 1;
      setWrongAnswers(newWrongAnswers);

      if (newWrongAnswers >= 3) {
        triggerSickness();
      } else {
        setFeedback('GRRR! WRONG ANSWER!');
        setIsCorrect(false);
        setIsAngry(true);
        setTimeout(() => {
          setIsAngry(false);
        }, 1000);
      }
    }
    setMouthOpen(false);
  };  if (showingLevelIntro) {
    return (
      <Card className="p-6 max-w-2xl mx-auto bg-purple-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-purple-800 mb-8">Level {level}</h1>
          <div className="text-2xl mb-8">
            {level === 1 ? "Let's start with easy numbers!" :
             level === 2 ? "Getting a bit trickier!" :
             level === 3 ? "Now for some bigger numbers!" :
             level === 4 ? "Expert multiplication time!" :
             "Master level - Show your skills!"}
          </div>
          <div className="text-xl mb-8">
            Range: {getDifficultyRange(level).min} to {getDifficultyRange(level).max}
          </div>
          <button 
            onClick={startLevel}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                     text-2xl transform hover:scale-110 transition-all"
          >
            Start Level!
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto bg-purple-50 relative overflow-hidden">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-purple-800">Chungus Numbers</h1>

        <div className="flex justify-between mb-4 px-4">
          <div className="text-xl">Level: {level}</div>
          <div className="text-xl">Score: {score}</div>
          <div className="text-xl">Question: {questionsInRound + 1}/5</div>
          <div className="text-xl text-red-600">Lives: {3 - wrongAnswers}</div>
        </div>

        <div className="text-3xl mb-6 font-bold text-purple-700">
          What is {currentProblem.num1} × {currentProblem.num2}?
        </div>

        {sickPhase >= 4 && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 
                          w-16 h-32 bg-amber-700 border-4 border-amber-900">
            <div className="absolute top-1/2 left-2 w-2 h-4 bg-yellow-600"></div>
          </div>
        )}        <div 
          className={`relative w-64 h-80 mx-auto mb-6 ${isAngry ? 'animate-shake' : ''}`}
          style={{
            transform: `translateX(${bunnyPosition}px)`,
            transition: 'transform 0.1s linear'
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className={`absolute w-64 h-64 bottom-0 
                          ${sickPhase >= 1 ? 'bg-green-200' : 
                            sickPhase >= 2 ? 'bg-green-300' :
                            sickPhase >= 3 ? 'bg-green-400' :
                            isAngry ? 'bg-red-200' : 'bg-gray-200'} 
                          rounded-full transition-all duration-300`}>

            {sickPhase >= 2 && (
              <>
                <div className="absolute -left-2 top-8 w-3 h-3 bg-blue-400 
                               rounded-full animate-bounce"></div>
                <div className="absolute -right-2 top-12 w-3 h-3 bg-blue-400 
                               rounded-full animate-bounce delay-100"></div>
              </>
            )}

            <div className={`absolute left-8 top-16 w-8 h-8 
                           ${sickPhase >= 3 ? 'bg-green-800' : 
                             isAngry ? 'bg-red-600' : 'bg-black'} 
                           rounded-full transition-colors duration-300`}>
              {sickPhase >= 3 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            <div className={`absolute right-8 top-16 w-8 h-8 
                           ${sickPhase >= 3 ? 'bg-green-800' : 
                             isAngry ? 'bg-red-600' : 'bg-black'} 
                           rounded-full transition-colors duration-300`}>
              {sickPhase >= 3 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            <div className={`absolute left-1/2 transform -translate-x-1/2 top-32 
                           ${mouthOpen ? 'w-32 h-20' : 'w-24 h-4'}
                           ${sickPhase >= 2 ? 'bg-green-400' :
                             isAngry ? 'bg-red-400' : 'bg-pink-400'} 
                           rounded-b-full transition-all duration-300`}>
              {sickPhase >= 2 && (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🤢
                </div>
              )}
            </div>

            <div className={`absolute -top-20 left-4 w-16 h-32 
                           ${sickPhase >= 1 ? 'bg-green-200' :
                            sickPhase >= 2 ? 'bg-green-300' :
                            sickPhase >= 3 ? 'bg-green-400' :
                            isAngry ? 'bg-red-200' : 'bg-gray-200'} 
                           rounded-full transition-colors duration-300`}></div>
            <div className={`absolute -top-20 right-4 w-16 h-32 
                           ${sickPhase >= 1 ? 'bg-green-200' :
                            sickPhase >= 2 ? 'bg-green-300' :
                            sickPhase >= 3 ? 'bg-green-400' :
                            isAngry ? 'bg-red-200' : 'bg-gray-200'} 
                           rounded-full transition-colors duration-300`}></div>
          </div>
        </div>

        <div className={`text-xl mb-4 font-bold ${
          isCorrect === true ? 'text-green-600' : 
          isCorrect === false ? 'text-red-600' : ''
        }`}>
          {feedback}
        </div>

{gameOver && (
  <div className="text-center mb-4">
    <h2 className="text-4xl font-bold text-green-600 mb-2">
      BATHROOM EMERGENCY!
    </h2>
    <p className="text-2xl mb-2">Too many wrong answers made Chungus sick!</p>
    <p className="text-2xl mb-4">Final Score: {score}</p>
    <button
      onClick={resetGame}
      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
               text-2xl transform hover:scale-110 transition-all"
    >
      Play Again
    </button>
    <TipButton />
  </div>
)}

{!gameOver && (
  <div className="flex justify-center gap-4">
    {options.map((number, index) => (
      <div
        key={index}
        draggable
        onDragStart={(e) => handleDragStart(e, number)}
        onDragEnd={handleDragEnd}
        className="w-16 h-16 bg-white border-4 border-purple-500 rounded-lg 
                 flex items-center justify-center text-2xl font-bold cursor-move
                 hover:bg-purple-100 transition-colors"
      >
        {number}
      </div>
    ))}
  </div>
)}
      </div>
    </Card>
  );
};

export default ChungusNumbers;