import React from 'react';
import { QuizData } from '../types';
import { QUESTIONS } from '../data/questions';
import Button from './Button';

interface ResultsScreenProps {
  results: QuizData;
  onRestart: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, onRestart }) => {
  const correctAnswers = results.questionOrder.reduce((count, questionIndex) => {
    const answer = results.answers[questionIndex]; 
    const question = QUESTIONS[questionIndex];
    return answer === question.correctAnswer ? count + 1 : count;
  }, 0);

  const totalQuestions = results.questionOrder.length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} мин ${seconds} сек`;
  };
  
  const formatTimeForCanvas = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const getResultMessage = () => {
    if (scorePercentage >= 90) return "Отлично! Вы настоящий эксперт!";
    if (scorePercentage >= 70) return "Хороший результат! Вы отлично разбираетесь в теме.";
    if (scorePercentage >= 50) return "Неплохо, но есть куда стремиться.";
    return "Стоит подучить материал и попробовать еще раз.";
  };

  const generateImageBlob = (): Promise<Blob | null> => {
    return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        const width = 800;
        const height = 500;
        canvas.width = width;
        canvas.height = height;

        // --- DRAWING ORDER ---
        // 1. Background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f9fafb');
        gradient.addColorStop(1, '#f3f4f6');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 2. Watermark
        ctx.save();
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.fillStyle = 'rgba(218, 41, 28, 0.12)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const watermarkText = `Результат: ${results.userName || 'Аноним'} | ${results.userEmail || ''}`;
        const textMetrics = ctx.measureText(watermarkText);
        const textWidth = textMetrics.width;

        const xSpacing = textWidth + 50; 
        const ySpacing = 30;

        const angle = -Math.PI / 6;
        ctx.rotate(angle);
        
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        const rotatedWidth = Math.abs(width * cos) + Math.abs(height * sin);
        const rotatedHeight = Math.abs(width * sin) + Math.abs(height * cos);

        for (let y = -rotatedHeight / 2; y < rotatedHeight * 1.5; y += ySpacing) {
            for (let x = -rotatedWidth / 2; x < rotatedWidth * 1.5; x += xSpacing) {
                ctx.fillText(watermarkText, x, y);
            }
        }
        ctx.restore();
        
        // 3. Main Content Text (with shadow)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Title
        ctx.fillStyle = '#B91C1C'; // red-700
        ctx.font = 'bold 40px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Результаты теста', width / 2, 70);
        
        // User Info
        ctx.font = '20px Inter, sans-serif';
        ctx.fillStyle = '#4b5563';
        ctx.fillText(`Фамилия Имя Отчество: ${results.userName || 'Аноним'}`, width / 2, 110);
        ctx.fillText(`E-mail: ${results.userEmail || 'Не указан'}`, width / 2, 140);

        // Add completion date and time
        const completionDateTime = new Date().toLocaleString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        ctx.font = '16px Inter, sans-serif';
        ctx.fillStyle = '#6b7280'; // gray-500
        ctx.fillText(`Тест завершен: ${completionDateTime}`, width / 2, 170);


        // Stats
        const stats = [
          { label: 'Правильно', value: correctAnswers, color: '#22c55e' },
          { label: 'Неправильно', value: incorrectAnswers, color: '#ef4444' },
          { label: 'Точность', value: `${scorePercentage}%`, color: '#DA291C' },
          { label: 'Время', value: formatTimeForCanvas(results.time), color: '#991B1B' },
        ];
        
        stats.forEach((stat, index) => {
          const yPos = 240 + index * 60;
          ctx.font = '24px Inter, sans-serif';
          ctx.fillStyle = '#374151';
          ctx.textAlign = 'left';
          ctx.fillText(stat.label, 180, yPos);

          ctx.font = 'bold 30px Inter, sans-serif';
          ctx.fillStyle = stat.color;
          ctx.textAlign = 'right';
          ctx.fillText(stat.value.toString(), width - 180, yPos);
        });
        
        ctx.shadowColor = 'transparent';

        canvas.toBlob(blob => {
          resolve(blob);
        }, 'image/png');
    });
  };

  const fileName = `результат-теста-${results.userName?.replace(/\s+/g, '_') || 'эксперт'}.png`;

  const handleDownload = async () => {
    const blob = await generateImageBlob();
    if (!blob) {
      console.error('Не удалось создать blob из canvas');
      return;
    }
    const link = document.createElement('a');
    link.download = fileName;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center animate-fade-in border border-gray-200">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
        Результаты теста
      </h1>
      <p className="text-md text-slate-500 mb-4">
        для <span className="font-bold text-red-600">{results.userName || "Анонимного пользователя"}</span>
        <br/>
        <span className="text-sm">{results.userEmail || ""}</span>
      </p>
      <p className="text-lg text-red-700 font-semibold mb-6">
        {getResultMessage()}
      </p>

      <div className="my-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center bg-slate-50 p-6 rounded-xl">
        <div>
          <p className="text-4xl font-bold text-green-500">{correctAnswers}</p>
          <p className="text-sm text-slate-500">Правильно</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-red-500">{incorrectAnswers}</p>
          <p className="text-sm text-slate-500">Неправильно</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-slate-700">{scorePercentage}%</p>
          <p className="text-sm text-slate-500">Точность</p>
        </div>
         <div>
          <p className="text-4xl font-bold text-red-600">{formatTime(results.time)}</p>
          <p className="text-sm text-slate-500">Время</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
        <Button onClick={onRestart} variant="secondary" className="w-full sm:w-auto text-lg">
          Пройти заново
        </Button>
        <Button onClick={handleDownload} className="w-full sm:w-auto text-lg">
          Скачать
        </Button>
      </div>
    </div>
  );
};

export default ResultsScreen;