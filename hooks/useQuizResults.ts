import { useCallback } from 'react';
import { QuizData } from '../types';
import { QUESTIONS } from '../data/questions';
import { SheetsResults, sendResultsToSheets, sendResultsViaForm } from '../services/sheetsService';

export const useQuizResults = () => {
  const sendQuizResults = useCallback(async (quizData: QuizData): Promise<boolean> => {
    // Проверяем что тест завершен и есть данные
    if (!quizData.userName || !quizData.startTime || !quizData.selectedTopics) {
      console.log('❌ Недостаточно данных для отправки');
      return false;
    }

    // Считаем результаты
    const correctAnswers = quizData.questionOrder.reduce((count, questionIndex) => {
      const answer = quizData.answers[questionIndex];
      const question = QUESTIONS[questionIndex];
      return answer === question.correctAnswer ? count + 1 : count;
    }, 0);

    const totalQuestions = quizData.questionOrder.length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Форматируем дату и время начала
    const startDate = new Date(quizData.startTime);
    const formattedDate = startDate.toLocaleDateString('ru-RU');
    const formattedTime = startDate.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Подготавливаем данные для отправки
    const results: SheetsResults = {
      fullName: quizData.userName,
      startDate: formattedDate,
      startTime: formattedTime,
      duration: quizData.time,
      selectedTopics: quizData.selectedTopics.join(', '),
      correctAnswers: correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      score: scorePercentage
    };

    console.log('📊 Подготовлены данные для отправки:', results);

    // Пробуем отправить основным методом
    try {
      const mainResult = await sendResultsToSheets(results);
      
      if (mainResult.success) {
        console.log('✅ Данные успешно отправлены основным методом');
        return true;
      } else {
        // Если основной метод не сработал, используем форму
        console.log('🔄 Основной метод не сработал, пробуем через форму...');
        const formSuccess = sendResultsViaForm(results);
        
        if (formSuccess) {
          console.log('✅ Данные отправлены через форму');
          return true;
        } else {
          console.log('❌ Оба метода отправки не сработали');
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Ошибка при отправке:', error);
      // При ошибке тоже пробуем форму
      const formSuccess = sendResultsViaForm(results);
      return formSuccess;
    }
  }, []);

  return { sendQuizResults };
};