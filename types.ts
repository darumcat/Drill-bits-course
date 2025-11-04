export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizData {
  answers: (number | null)[];
  time: number;
  currentQuestionIndex: number;
  userName: string | null;
  userEmail: string | null;
  questionOrder: number[];
  optionOrders: number[][];
  selectedTopics: string[] | null;
}

export enum GameState {
  START = 'start',
  NAME_INPUT = 'name_input',
  TOPIC_SELECTION = 'topic_selection',
  QUIZ = 'quiz',
  RESULTS = 'results',
}