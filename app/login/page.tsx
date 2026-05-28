"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // تأكد أن المسار صحيح
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // بعد الدخول بنجاح، حوله للرئيسية
    } catch (error) {
      alert("خطأ: تأكد من الإيميل وكلمة المرور");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white border rounded-lg w-96 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">تسجيل الدخول</h2>
        <input 
          type="email" placeholder="البريد الإلكتروني" className="w-full p-2 mb-4 border rounded" 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="كلمة المرور" className="w-full p-2 mb-4 border rounded" 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">دخول</button>
      </form>
    </div>
  );
}