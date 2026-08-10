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
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const result = await loginAction(formData);
      if (result.success) {
        // Menggunakan router.push dan refresh untuk Next.js app router
        router.push("/admin");
        router.refresh();
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
    <Card className="w-full bg-[#151515] border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.8)] relative overflow-hidden">
      {/* Subtle accent glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <CardHeader className="space-y-1 pb-6 pt-8">
        <div className="flex flex-col items-center mb-2">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,204,0,0.1)]">
            <span className="font-heading font-bold text-2xl text-primary">BY</span>
          </div>
          <CardTitle className="font-heading text-2xl text-foreground tracking-wide">Login Admin</CardTitle>
          <CardDescription className="text-muted-foreground mt-1.5 text-center">
            Sistem manajemen Black Yellow
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md text-center">
              {errorMsg}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              className="bg-background/60 border-border/50 text-foreground focus-visible:ring-primary focus-visible:border-primary h-11 transition-all"
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
                className="bg-background/60 border-border/50 text-foreground focus-visible:ring-primary focus-visible:border-primary pr-10 h-11 transition-all"
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
            className="w-full bg-primary text-black hover:bg-primary/90 font-bold h-12 text-base shadow-[0_4px_14px_0_rgba(255,204,0,0.2)] hover:shadow-[0_6px_20px_rgba(255,204,0,0.3)] transition-all mt-4"
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
