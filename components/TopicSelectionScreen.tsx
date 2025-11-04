import React, { useState } from 'react';
import Button from './Button';
import { TOPIC_LIST, TOPIC_NAMES } from '../data/topicMapping';

interface TopicSelectionScreenProps {
  onTopicsSubmit: (topics: string[]) => void;
  userName: string | null;
}

const TopicSelectionScreen: React.FC<TopicSelectionScreenProps> = ({ onTopicsSubmit, userName }) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => {
      const isSelected = prev.includes(topic);
      const isSpecialTest = topic === TOPIC_NAMES.FINAL_EXAM || topic === TOPIC_NAMES.PERIODIC_CHECK;

      if (isSelected) {
        return prev.filter(t => t !== topic);
      } else {
        if (isSpecialTest) {
          // If a special test (Final or Periodic) is selected, it's the only selection
          return [topic];
        } else {
          // If another topic is selected, remove special tests if they were selected
          return [...prev.filter(t => t !== TOPIC_NAMES.FINAL_EXAM && t !== TOPIC_NAMES.PERIODIC_CHECK), topic];
        }
      }
    });
  };

  const handleSubmit = () => {
    if (selectedTopics.length > 0) {
      onTopicsSubmit(selectedTopics);
    }
  };

  return (
    <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl animate-fade-in border border-gray-200 w-full">
      <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">
        Выбор темы
      </h1>
      <p className="text-slate-600 mb-8 text-center">
        Здравствуйте, <span className="font-semibold text-red-600">{userName || 'участник'}</span>! Выберите одну или несколько тем для теста.
      </p>
      
      <div className="space-y-3 mb-8 max-h-[50vh] overflow-y-auto pr-2">
        {TOPIC_LIST.map((topic) => {
          const isSelected = selectedTopics.includes(topic);
          const isSpecialTest = topic === TOPIC_NAMES.FINAL_EXAM || topic === TOPIC_NAMES.PERIODIC_CHECK;

          const baseClasses = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ease-in-out flex items-center gap-4 cursor-pointer";
          const selectedClasses = "bg-red-100 border-red-500 ring-2 ring-red-500/50";
          const defaultClasses = "bg-slate-50 border-slate-200 hover:border-red-400 hover:bg-red-50";
          const specialTestClasses = "border-red-700 bg-red-50 hover:bg-red-100 text-red-900 font-semibold";
          
          return (
            <div
              key={topic}
              onClick={() => handleTopicToggle(topic)}
              className={`${baseClasses} ${isSelected ? selectedClasses : (isSpecialTest ? specialTestClasses : defaultClasses)}`}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => e.key === ' ' || e.key === 'Enter' ? handleTopicToggle(topic) : null}
            >
              <div className={`w-6 h-6 rounded-md border-2 ${isSelected ? 'bg-red-600 border-red-600' : 'border-slate-400'} flex items-center justify-center transition-all flex-shrink-0`}>
                {isSelected && (
                  <svg xmlns="http://www.w.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="flex-1">{topic}</span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 pt-6">
        <Button onClick={handleSubmit} disabled={selectedTopics.length === 0} className="w-full text-lg">
          Начать тест
        </Button>
         <p className="text-sm text-slate-500 mt-3 text-center">
          Итоговый тест содержит 60 вопросов по всем темам. Периодическая проверка - 20 случайных вопросов. Тесты по отдельным темам содержат 5 вопросов.
        </p>
      </div>
    </div>
  );
};

export default TopicSelectionScreen;