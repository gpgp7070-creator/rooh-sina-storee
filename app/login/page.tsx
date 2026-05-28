"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react"; // تأكد من تثبيت lucide-react

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error) {
      alert("خطأ: تأكد من البريد الإلكتروني وكلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <form 
        onSubmit={handleLogin} 
        className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">تسجيل الدخول</h2>
          <p className="text-slate-500 mt-2">مرحباً بك مجدداً، يرجى إدخال البيانات</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input 
              type="email" 
              placeholder="البريد الإلكتروني" 
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 placeholder:text-slate-400 transition-all" 
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input 
              type="password" 
              placeholder="كلمة المرور" 
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 placeholder:text-slate-400 transition-all" 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "دخول"}
        </button>
      </form>
    </div>
  );
}