import React, { useState, useEffect } from 'react';
import { QUESTIONS } from '../data/questions';
import { QuizData } from '../types';
import { useTimer } from '../hooks/useTimer';
import Button from './Button';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface QuizScreenProps {
  onFinish: (finalTime: number) => void;
  quizData: QuizData;
  setQuizData: React.Dispatch<React.SetStateAction<QuizData>>;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ onFinish, quizData, setQuizData }) => {
  const { time, start, formattedTime } = useTimer(quizData.time);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(quizData.currentQuestionIndex);
  
  const totalQuestionsInQuiz = quizData.questionOrder.length;

  // Handle case where questionOrder or optionOrders might not be initialized yet
  if (!quizData.questionOrder || totalQuestionsInQuiz === 0 || !quizData.optionOrders || quizData.optionOrders.length === 0) {
    return <div>Загрузка вопросов...</div>;
  }

  const realQuestionIndex = quizData.questionOrder[currentQuestionIndex];
  const currentQuestion = QUESTIONS[realQuestionIndex];
  const currentOptionOrder = quizData.optionOrders[realQuestionIndex];
  
  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Save progress on time change
    setQuizData(prev => ({...prev, time}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);
  
  const handleAnswerSelect = (originalOptionIndex: number) => {
    const newAnswers = [...quizData.answers];
    newAnswers[realQuestionIndex] = originalOptionIndex;
    setQuizData(prev => ({...prev, answers: newAnswers}));
  };

  const goToNext = () => {
    if (currentQuestionIndex < totalQuestionsInQuiz - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setQuizData(prev => ({...prev, currentQuestionIndex: nextIndex}));
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setQuizData(prev => ({...prev, currentQuestionIndex: prevIndex}));
    }
  };
  
  const handleFinishClick = () => {
    onFinish(time);
  };

  const ProgressBar: React.FC = () => {
    const progress = ((currentQuestionIndex + 1) / totalQuestionsInQuiz) * 100;
    return (
      <div className="w-full bg-slate-200 rounded-full h-3 mb-4 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}></div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full animate-fade-in border border-gray-200">
      <header className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
        <div className="text-sm font-semibold text-slate-600">
          Вопрос {currentQuestionIndex + 1} из {totalQuestionsInQuiz}
        </div>
        <div className="flex items-center gap-4">
          <div className="font-mono text-lg font-bold bg-slate-100 border px-3 py-1 rounded-md text-red-600">
            {formattedTime}
          </div>
        </div>
      </header>

      <main>
        <ProgressBar />
        <h2 className="text-xl md:text-2xl font-bold mb-6 min-h-[6rem] text-slate-900">{currentQuestion.question}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentOptionOrder.map((originalOptionIndex, displayIndex) => {
            const option = currentQuestion.options[originalOptionIndex];
            const isSelected = quizData.answers[realQuestionIndex] === originalOptionIndex;
            const baseClasses = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ease-in-out transform hover:border-red-400 hover:scale-[1.02]";
            const selectedClasses = "bg-red-100 border-red-500 ring-2 ring-red-500/50";
            const defaultClasses = "bg-slate-50 border-slate-200";
            return (
              <button
                key={displayIndex}
                onClick={() => handleAnswerSelect(originalOptionIndex)}
                className={`${baseClasses} ${isSelected ? selectedClasses : defaultClasses}`}
              >
                <span className="font-medium text-slate-700">{option}</span>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button
          onClick={goToPrevious}
          disabled={currentQuestionIndex === 0}
          variant="secondary"
          className="w-full sm:w-auto"
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowLeftIcon className="w-5 h-5"/>
            <span>Предыдущий</span>
          </div>
        </Button>
        
        {currentQuestionIndex === totalQuestionsInQuiz - 1 ? (
          <Button onClick={handleFinishClick} className="w-full sm:w-auto">
            Завершить тест
          </Button>
        ) : (
          <Button
            onClick={goToNext}
            disabled={currentQuestionIndex === totalQuestionsInQuiz - 1}
            className="w-full sm:w-auto"
          >
            <div className="flex items-center justify-center gap-2">
              <span>Следующий</span>
              <ArrowRightIcon className="w-5 h-5"/>
            </div>
          </Button>
        )}
      </footer>
    </div>
  );
};

export default QuizScreen;