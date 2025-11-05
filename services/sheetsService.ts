// Сервис для отправки результатов в Google Sheets

export interface SheetsResults {
  fullName: string;
  startDate: string;
  startTime: string;
  duration: number;
  selectedTopics: string;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
}

// ОБНОВИТЕ ЭТОТ URL после переразвертывания скрипта
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzPWKrIqMLXhlVqwZsepSf36o5zfdQGpIB-Mjea5heAN-wshYkGOa8gb80Cx9Bw3Ev_/exec';

export const sendResultsToSheets = async (results: SheetsResults): Promise<{success: boolean; message?: string}> => {
  try {
    // Используем fetch с JSONP подходом через GET параметры
    const params = new URLSearchParams();
    params.append('data', JSON.stringify(results));
    
    const url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'no-cors' // Важно: no-cors для обхода CORS
    });
    
    console.log('✅ Данные отправлены в Google Sheets:', results.fullName);
    return { success: true, message: 'Данные отправлены' };
    
  } catch (error) {
    console.error('❌ Ошибка отправки в Google Sheets:', error);
    
    // Fallback: открываем в новой вкладке
    try {
      const params = new URLSearchParams();
      params.append('data', JSON.stringify(results));
      const fallbackUrl = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
      
      window.open(fallbackUrl, '_blank');
      return { success: true, message: 'Данные отправлены через fallback' };
    } catch (fallbackError) {
      return { success: false, message: 'Не удалось отправить данные' };
    }
  }
};

// Альтернативная функция с использованием формы (надежный способ)
export const sendResultsViaForm = (results: SheetsResults): boolean => {
  try {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GOOGLE_SCRIPT_URL;
    form.target = '_blank';
    form.style.display = 'none';
    
    // Добавляем данные как скрытые поля
    Object.entries(results).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    console.log('✅ Данные отправлены через форму:', results.fullName);
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка отправки через форму:', error);
    return false;
  }
};