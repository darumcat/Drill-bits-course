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

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFm4LbSt1-3OJMWeBLaVUC5ccTD-h1ea4NHgZGs-UexKEVMxK4TaRDDBEQe8IP4tdx/exec';

// ОСНОВНОЙ метод - через форму (работает всегда)
export const sendResultsToSheets = (results: SheetsResults): boolean => {
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

// Альтернативный метод через GET (для тестирования)
export const sendResultsViaGet = (results: SheetsResults): boolean => {
  try {
    const params = new URLSearchParams();
    params.append('data', JSON.stringify(results));
    
    const url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
    
    // Открываем в новой вкладке
    window.open(url, '_blank');
    
    console.log('✅ Данные отправлены через GET:', results.fullName);
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка отправки через GET:', error);
    return false;
  }
};