
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function HomePage() {


  const router = useRouter();




  return (
    <section className="relative flex flex-col items-center justify-center text-center min-h-screen  text-white p-4 md:p-6">
      {/* Background Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 bg-[url('/hero-bg.webp')] bg-cover bg-center "
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] to-purple-500/80 " />

      {/* Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-7xl mx-auto"
      >
        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">💬 Komunikasi Tanpa Batas</span>
        <h1 className="text-2xl sm:text-6xl font-bold mt-4">Platform Chat Sederhana untuk Konektivitas Global</h1>
        <p className="text-lg sm:text-xl text-gray-300 mt-3 max-w-xl mx-auto">
          Bangun percakapan tanpa hambatan, buat grup diskusi, dan tetap terhubung dengan siapa saja. Sepenuhnya gratis dan mudah digunakan!
        </p>
        <Button onClick={() => router.push('/login')} className="mt-6 px-6 py-3 text-lg font-semibold rounded-full shadow-lg">
          🚀 Let&apos;s Chat
        </Button>
      </motion.div>
    </section>
  )
}