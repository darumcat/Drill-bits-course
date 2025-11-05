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


const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5FS71lFtxhrUVuexK-WahKA2ZGHuJtyqjCfDMdwL5ZMXiD9p_OuerdvUP4HolEsw/exec';

export const sendResultsToSheets = async (results: SheetsResults): Promise<boolean> => {
  try {
    // Используем Beacon для надежной отправки
    const blob = new Blob([JSON.stringify(results)], { type: 'application/json' });
    const success = navigator.sendBeacon(GOOGLE_SCRIPT_URL, blob);
    
    if (success) {
      console.log('✅ Данные отправлены в Google Sheets:', results.fullName);
      return true;
    } else {
      // Fallback на fetch
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results),
        mode: 'no-cors'
      });
      console.log('✅ Данные отправлены через fallback');
      return true;
    }
  } catch (error) {
    console.error('❌ Ошибка отправки в Google Sheets:', error);
    return false;
  }
};