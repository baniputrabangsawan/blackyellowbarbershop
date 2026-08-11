"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Scissors, Home, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-dvh flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <div className="container relative z-10 flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-8"
        >
          <div className="text-[120px] md:text-[200px] font-black leading-none font-heading text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/20 select-none">
            404
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-4 rounded-full border border-primary/30 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <Scissors className="w-10 h-10 md:w-16 md:h-16 text-primary" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="max-w-md mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">
            Waduh, Potongan Meleset!
          </h1>
          <p className="text-muted-foreground mb-8 text-sm md:text-base leading-relaxed">
            Halaman yang Anda cari sepertinya sudah dicukur habis atau memang tidak pernah ada. Mari kembali ke tempat yang aman.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => router.back()}
              className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto rounded-full font-medium" })}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </button>
            <Link 
              href="/" 
              className={buttonVariants({ size: "lg", className: "w-full sm:w-auto rounded-full font-medium bg-primary text-primary-foreground hover:bg-primary/90" })}
            >
              <Home className="w-4 h-4 mr-2" />
              Halaman Utama
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
