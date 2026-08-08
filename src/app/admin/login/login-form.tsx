"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction } from "./actions";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const result = await loginAction(formData);
      if (result.success) {
        // Menggunakan window.location.href alih-alih router.push untuk memastikan
        // status autentikasi Supabase dan cache Next.js benar-benar diperbarui.
        window.location.assign("/admin");
      } else {
        setErrorMsg(result.error || "Terjadi kesalahan saat login.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Koneksi bermasalah. Silakan coba lagi.");
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md bg-surface border-border shadow-xl">
      <CardHeader className="space-y-2 text-center pb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <span className="font-heading font-bold text-3xl text-primary-foreground">BY</span>
          </div>
        </div>
        <CardTitle className="font-heading text-2xl text-foreground">Dashboard Admin</CardTitle>
        <CardDescription className="text-muted-foreground">
          Silakan masuk untuk mengelola antrean, layanan, dan keanggotaan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md text-center">
              {errorMsg}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@blackyellow.com"
              required
              autoComplete="email"
              className="bg-background border-input text-foreground focus-visible:ring-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="bg-background border-input text-foreground focus-visible:ring-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-11"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk Dashboard"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
