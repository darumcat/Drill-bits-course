import React, { useState } from 'react';
import Button from './Button';

interface NameInputScreenProps {
  onNameSubmit: (name: string, email: string) => void;
}

const NameInputScreen: React.FC<NameInputScreenProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onNameSubmit(name.trim(), email.trim());
    }
  };

  return (
    <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl text-center animate-fade-in border border-gray-200">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">
        Представьтесь, пожалуйста
      </h1>
      <p className="text-slate-600 mb-8">
        Ваши данные будут отображены в результатах теста.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите ваше ФИО"
          className="w-full px-4 py-3 text-lg bg-slate-100 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500/50 focus:border-red-500 transition-all duration-300"
          required
          autoFocus
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Введите ваш e-mail"
          className="w-full px-4 py-3 text-lg bg-slate-100 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500/50 focus:border-red-500 transition-all duration-300"
          required
        />
        <Button type="submit" disabled={!name.trim() || !email.trim()} className="w-full sm:w-auto text-lg mx-auto">
          Продолжить
        </Button>
      </form>
    </div>
  );
};

export default NameInputScreen;