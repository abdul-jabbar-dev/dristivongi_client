'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLoginMutation } from '@/redux/feature/user/user.reducer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [login, { isLoading, isError, error }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      if (res.data?.accessToken) {
        localStorage.setItem('token', res.data.accessToken);
        alert('সফলভাবে লগইন হয়েছে!');
        router.push('/');
      }
    } catch (err: any) {
      console.error('Login error', err);
      alert(err?.data?.message || 'লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">লগইন করুন</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ইমেইল</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition"
              placeholder="আপনার ইমেইল লিখুন" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">পাসওয়ার্ড</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition"
              placeholder="আপনার পাসওয়ার্ড লিখুন" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? 'লগইন হচ্ছে...' : 'লগইন'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          অ্যাকাউন্ট নেই? <Link href="/register" className="text-slate-600 hover:underline font-bold">নতুন অ্যাকাউন্ট তৈরি করুন</Link>
        </p>
      </div>
    </div>
  );
}
