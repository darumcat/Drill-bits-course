import React, { useState, useCallback, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import NameInputScreen from './components/NameInputScreen';
import { useLocalStorage } from './hooks/useLocalStorage';
import { GameState, QuizData } from './types';
import { QUESTIONS } from './data/questions';

const shuffle = (array: number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const QUIZ_LENGTH = 20;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [quizData, setQuizData] = useLocalStorage<QuizData>('drillBitQuiz', {
    answers: Array(QUESTIONS.length).fill(null),
    time: 0,
    currentQuestionIndex: 0,
    userName: null,
    userEmail: null,
    questionOrder: [],
    optionOrders: [],
  });

  // Handle backward compatibility for users with old saved data
  useEffect(() => {
    const hasProgress = quizData.answers.some(a => a !== null) || quizData.time > 0;
    if (hasProgress) {
        let updated = false;
        const newQuizData = { ...quizData };
        if (!newQuizData.questionOrder || newQuizData.questionOrder.length === 0) {
            console.log("Old data format detected, creating default question order.");
            // For old data, just create a default order, the new quiz logic will handle selection.
            newQuizData.questionOrder = Array.from(Array(QUESTIONS.length).keys()).slice(0, QUIZ_LENGTH);
            updated = true;
        }
        if (!newQuizData.optionOrders || newQuizData.optionOrders.length === 0) {
            console.log("Old data format detected, creating default option orders.");
            newQuizData.optionOrders = QUESTIONS.map(q => Array.from(Array(q.options.length).keys()));
            updated = true;
        }
        if (updated) {
            setQuizData(newQuizData);
        }
    }
  }, [quizData, setQuizData]);

  const handleStart = useCallback(() => {
    const hasProgress = quizData.answers.some(a => a !== null) || quizData.time > 0;
    if (hasProgress && quizData.questionOrder.length > 0) {
      setGameState(GameState.QUIZ);
    } else {
      setGameState(GameState.NAME_INPUT);
    }
  }, [quizData]);
  
  const handleNameSubmit = useCallback((name: string, email: string) => {
    const questionIndices = Array.from(Array(QUESTIONS.length).keys());
    const shuffledIndices = shuffle(questionIndices);
    const selectedQuestionIndices = shuffledIndices.slice(0, QUIZ_LENGTH);

    const optionOrders = QUESTIONS.map(q => shuffle(Array.from(Array(q.options.length).keys())));
    
    setQuizData({
      answers: Array(QUESTIONS.length).fill(null),
      time: 0,
      currentQuestionIndex: 0,
      userName: name,
      userEmail: email,
      questionOrder: selectedQuestionIndices,
      optionOrders: optionOrders,
    });
    setGameState(GameState.QUIZ);
  }, [setQuizData]);

  const handleFinish = useCallback((finalTime: number) => {
    setQuizData(prev => ({ ...prev, time: finalTime }));
    setGameState(GameState.RESULTS);
  }, [setQuizData]);

  const handleRestart = useCallback(() => {
    setQuizData({
      answers: Array(QUESTIONS.length).fill(null),
      time: 0,
      currentQuestionIndex: 0,
      userName: null,
      userEmail: null,
      questionOrder: [],
      optionOrders: [],
    });
    setGameState(GameState.START);
  }, [setQuizData]);
  
  const hasProgress = (quizData.answers.some(a => a !== null) || quizData.time > 0) && quizData.questionOrder.length > 0;

  const renderContent = () => {
    switch(gameState) {
      case GameState.START:
        return <StartScreen onStart={handleStart} hasProgress={hasProgress} />;
      case GameState.NAME_INPUT:
        return <NameInputScreen onNameSubmit={handleNameSubmit} />;
      case GameState.QUIZ:
        return <QuizScreen onFinish={handleFinish} quizData={quizData} setQuizData={setQuizData} />;
      case GameState.RESULTS:
        return <ResultsScreen results={quizData} onRestart={handleRestart} />;
      default:
        return <StartScreen onStart={handleStart} hasProgress={hasProgress} />;
    }
  }

  return (
    <div className="min-h-screen font-sans text-slate-800 flex items-center justify-center p-4 selection:bg-red-600 selection:text-white">
      <div className="w-full max-w-3xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;