import React, { useState, useCallback, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import NameInputScreen from './components/NameInputScreen';
import TopicSelectionScreen from './components/TopicSelectionScreen';
import { useLocalStorage } from './hooks/useLocalStorage';
import { GameState, QuizData } from './types';
import { QUESTIONS } from './data/questions';
import { TOPIC_MAPPING, TOPIC_NAMES } from './data/topicMapping';

const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const TOPIC_QUIZ_LENGTH = 5;
const FINAL_EXAM_LENGTH = 60;

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
    selectedTopics: null,
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
            newQuizData.questionOrder = shuffle(Array.from(Array(QUESTIONS.length).keys())).slice(0, 20);
            updated = true;
        }
        if (!newQuizData.optionOrders || newQuizData.optionOrders.length === 0) {
            console.log("Old data format detected, creating default option orders.");
            newQuizData.optionOrders = QUESTIONS.map(q => shuffle(Array.from(Array(q.options.length).keys())));
            updated = true;
        }
        if (updated) {
            setQuizData(newQuizData);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = useCallback(() => {
    const hasProgress = (quizData.answers.some(a => a !== null) || quizData.time > 0) && quizData.questionOrder.length > 0;
    if (hasProgress) {
      setGameState(GameState.QUIZ);
    } else {
      setGameState(GameState.NAME_INPUT);
    }
  }, [quizData]);
  
  const handleNameSubmit = useCallback((name: string, email: string) => {
    setQuizData(prev => ({
        ...prev,
        userName: name,
        userEmail: email,
    }));
    setGameState(GameState.TOPIC_SELECTION);
  }, [setQuizData]);

  const handleTopicsSubmit = useCallback((topics: string[]) => {
    let questionIndices: number[];
    let quizLength: number;

    if (topics.includes(TOPIC_NAMES.FINAL_EXAM)) {
      questionIndices = Array.from(Array(QUESTIONS.length).keys());
      quizLength = FINAL_EXAM_LENGTH;
    } else {
      const indicesSet = new Set<number>();
      topics.forEach(topic => {
        const indicesForTopic = TOPIC_MAPPING[topic] || [];
        indicesForTopic.forEach(index => indicesSet.add(index));
      });
      questionIndices = Array.from(indicesSet);
      quizLength = Math.min(questionIndices.length, topics.length * TOPIC_QUIZ_LENGTH);
    }

    const shuffledIndices = shuffle(questionIndices);
    // Ensure we don't try to slice more questions than are available
    const selectedQuestionIndices = shuffledIndices.slice(0, Math.min(quizLength, shuffledIndices.length));

    const optionOrders = QUESTIONS.map(q => shuffle(Array.from(Array(q.options.length).keys())));
    
    setQuizData({
      answers: Array(QUESTIONS.length).fill(null),
      time: 0,
      currentQuestionIndex: 0,
      userName: quizData.userName,
      userEmail: quizData.userEmail,
      questionOrder: selectedQuestionIndices,
      optionOrders: optionOrders,
      selectedTopics: topics,
    });
    setGameState(GameState.QUIZ);
  }, [setQuizData, quizData.userName, quizData.userEmail]);

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
      selectedTopics: null,
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
      case GameState.TOPIC_SELECTION:
        return <TopicSelectionScreen onTopicsSubmit={handleTopicsSubmit} userName={quizData.userName} />;
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