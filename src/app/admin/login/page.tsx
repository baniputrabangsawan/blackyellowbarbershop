import { LoginForm } from "./login-form";

export const metadata = {
  title: "Admin Login | Black Yellow Barbershop",
  description: "Masuk ke Dashboard Admin Black Yellow Barbershop",
};

import Image from "next/image";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Kolom Kiri: Image & Brand */}
      <div className="relative hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden bg-muted">
        <Image
          src="https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=2000&auto=format&fit=crop"
          alt="Barbershop Premium"
          fill
          priority
          className="object-cover object-center grayscale-[0.2]"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        
        <div className="relative z-10 w-full max-w-md text-center text-white">
          <div className="mx-auto w-20 h-20 bg-primary flex items-center justify-center rounded-2xl mb-8 shadow-2xl shadow-primary/20">
            <span className="font-heading font-bold text-4xl text-primary-foreground">BY</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 leading-tight">
            Black <span className="text-primary">Yellow</span>
          </h1>
          <p className="text-white/80 text-lg">
            Sistem manajemen operasional dan antrean khusus admin.
          </p>
        </div>
      </div>

      {/* Kolom Kanan: Login Form */}
      <div className="flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative">
        <div className="w-full max-w-sm">
          {/* Tampilkan logo di mobile karena kolom kiri disembunyikan */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <span className="font-heading font-bold text-3xl text-primary-foreground">BY</span>
            </div>
          </div>
          
          <LoginForm />
          
          <p className="text-center text-xs text-muted-foreground mt-8">
            &copy; {new Date().getFullYear()} Black Yellow Barbershop. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
