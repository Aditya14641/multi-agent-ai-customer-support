'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, register } from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const data = await login(form.email, form.password);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', data.username);
        toast.success('Welcome back!');
        router.push('/chat');
      } else {
        await register(form.username, form.email, form.password);
        toast.success('Account created! Please login.');
        setIsLogin(true);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <Toaster />
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛒</div>
          <h1 className="text-2xl font-bold text-white">TechMart Support</h1>
          <p className="text-gray-400 text-sm mt-1">AI-Powered Customer Assistant</p>
        </div>
        <div className="flex bg-gray-700 rounded-lg p-1 mb-6">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${isLogin ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Login</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${!isLogin ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Register</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input type="text" placeholder="Username" required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          )}
          <input type="email" placeholder="Email address" required
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input type="password" placeholder="Password" required
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold transition disabled:opacity-50">
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-400 text-center mb-2">Powered by Multi-Agent AI + RAG</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {['Billing', 'Technical', 'Product', 'Complaints', 'FAQ'].map(a => (
              <span key={a} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">{a}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
