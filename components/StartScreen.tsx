import React from 'react';
import Button from './Button';

interface StartScreenProps {
  onStart: () => void;
  hasProgress: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, hasProgress }) => {
  return (
    <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl text-center animate-fade-in border border-gray-200">
      <div className="relative">
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-red-200 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-red-100 rounded-full filter blur-3xl opacity-50"></div>
      </div>
      
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-700 mb-6 py-2 leading-normal">
        Тестирование по курсу буровых долот
      </h1>
      <p className="text-lg text-slate-600 mb-10">
        Проверьте свои знания в нашем интерактивном тесте. Вас ждет 20 вопросов.
      </p>
      <Button onClick={onStart} className="w-full sm:w-auto text-lg">
        {hasProgress ? 'Продолжить тест' : 'Начать тест'}
      </Button>
    </div>
  );
};

export default StartScreen;