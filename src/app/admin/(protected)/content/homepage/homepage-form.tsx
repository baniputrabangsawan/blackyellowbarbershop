"use client";

import { useState } from "react";
import { updateHeroSettings } from "@/actions/admin-settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Type } from "lucide-react";

export function HomepageForm({ initialSettings }: { initialSettings: any }) {
  const [heroTitle, setHeroTitle] = useState(initialSettings?.hero_title ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState(initialSettings?.hero_subtitle ?? "");
  const [heroDescription, setHeroDescription] = useState(initialSettings?.hero_description ?? "");
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);
    
    const result = await updateHeroSettings(heroTitle, heroSubtitle, heroDescription);
    if (!result.success) {
      setMessage({ type: 'error', text: "Gagal memperbarui pengaturan: " + result.error });
    } else {
      setMessage({ type: 'success', text: "Berhasil memperbarui teks halaman utama!" });
      setTimeout(() => setMessage(null), 3000);
    }
    
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Halaman Utama</h1>
          <p className="text-muted-foreground">Kelola teks dan tampilan beranda website publik.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md mb-6 ${message.type === 'success' ? 'bg-success/20 text-success border border-success/30' : 'bg-destructive/20 text-destructive border border-destructive/30'}`}>
          {message.text}
        </div>
      )}

      <Card className="bg-surface border-border overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Hero Section (Bagian Atas)
          </CardTitle>
          <CardDescription>Ubah teks yang pertama kali dilihat oleh pelanggan saat membuka website.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Judul Utama</Label>
              <Input 
                id="heroTitle" 
                value={heroTitle} 
                onChange={(e) => setHeroTitle(e.target.value)} 
                placeholder="Misal: Potongan Presisi."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Sub-judul Utama</Label>
              <Input 
                id="heroSubtitle" 
                value={heroSubtitle} 
                onChange={(e) => setHeroSubtitle(e.target.value)} 
                placeholder="Misal: Gaya Tanpa Kompromi."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroDescription">Deskripsi Pendek</Label>
              <textarea 
                id="heroDescription" 
                value={heroDescription} 
                onChange={(e) => setHeroDescription(e.target.value)} 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Deskripsi..."
                required
              />
            </div>
            
            <div className="pt-4 border-t border-border">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                ) : (
                  "Simpan Perubahan Konten"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
