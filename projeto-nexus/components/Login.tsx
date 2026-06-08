import React, { useState } from 'react';
import { Monitor, Lock, ArrowRight, KeyRound } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, name: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // Estados locais para capturar o que o usuário digita
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 2. CHAMA A FUNÇÃO AQUI!
    console.log("Botão clicado!", { identifier, password });

    let email = '';
    let name = '';

    if (identifier.includes('@')) {
      email = identifier;
    } else {
      name = identifier;
    }
    // Ela vai "viajar" de volta para o App.tsx com esses dados
    onLogin(email, name, password);
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Monitor className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Endomarketing Signage</h1>
          <p className="text-indigo-100">Digital Media Management System</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="deviceId" className="block text-sm font-medium text-slate-700 mb-2">
                Name/E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="deviceId"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g. admin or tv_reception"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Default Admin Pass: <span className="font-mono font-bold text-slate-700">admin123</span>
              </p>
            </div>
            {/*BTN LOGIN*/}
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-lg shadow-indigo-200"
            >
              Access System
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </form>
        </div>
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">© 2024 MK Systems Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
