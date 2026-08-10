/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { updateBranchStatus, updateHeroSettings, resetTodayQueue } from "@/actions/admin-settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Store, RefreshCw, Type } from "lucide-react";

export function AdminSettingsClient({ initialSettings }: { initialSettings: any }) {
  const [branchActive, setBranchActive] = useState(initialSettings.branch?.is_active ?? true);
  const [heroTitle, setHeroTitle] = useState(initialSettings.siteSettings?.hero_title ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState(initialSettings.siteSettings?.hero_subtitle ?? "");
  const [heroDescription, setHeroDescription] = useState(initialSettings.siteSettings?.hero_description ?? "");
  
  const [isUpdatingBranch, setIsUpdatingBranch] = useState(false);
  const [isUpdatingHero, setIsUpdatingHero] = useState(false);
  const [isResettingQueue, setIsResettingQueue] = useState(false);

  const handleToggleBranch = async (checked: boolean) => {
    setIsUpdatingBranch(true);
    setBranchActive(checked);
    
    if (initialSettings.branch?.id) {
      const result = await updateBranchStatus(initialSettings.branch.id, checked);
      if (!result.success) {
        alert("Gagal memperbarui status cabang: " + result.error);
        setBranchActive(!checked);
      }
    }
    
    setIsUpdatingBranch(false);
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingHero(true);
    
    const result = await updateHeroSettings(heroTitle, heroSubtitle, heroDescription);
    if (!result.success) {
      alert("Gagal memperbarui pengaturan Hero: " + result.error);
    } else {
      alert("Berhasil memperbarui teks halaman utama!");
    }
    
    setIsUpdatingHero(false);
  };

  const handleResetQueue = async () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan/mereset semua antrean yang sedang berjalan hari ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    setIsResettingQueue(true);
    if (initialSettings.branch?.id) {
      const result = await resetTodayQueue(initialSettings.branch.id);
      if (result.success) {
        alert("Berhasil mereset antrean hari ini!");
      } else {
        alert("Gagal mereset antrean: " + result.error);
      }
    }
    setIsResettingQueue(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        {/* Status Toko */}
        <Card className="bg-surface border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Status Operasional
            </CardTitle>
            <CardDescription>Buka atau tutup layanan (menerima antrean baru)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-xl bg-background">
              <div>
                <p className="font-bold text-foreground">Terima Pelanggan Baru</p>
                <p className="text-sm text-muted-foreground">
                  Jika dimatikan, pelanggan tidak bisa ambil antrean di website.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={branchActive ? "text-success font-medium text-sm" : "text-muted-foreground font-medium text-sm"}>
                  {branchActive ? "Buka" : "Tutup"}
                </span>
                <Switch 
                  checked={branchActive} 
                  onCheckedChange={handleToggleBranch} 
                  disabled={isUpdatingBranch || !initialSettings.branch}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reset Antrean */}
        <Card className="bg-surface border-border overflow-hidden border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <RefreshCw className="w-5 h-5" />
              Reset Antrean
            </CardTitle>
            <CardDescription>Tindakan darurat untuk mengosongkan antrean</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border border-destructive/20 rounded-xl bg-destructive/5 space-y-4">
              <p className="text-sm text-foreground">
                Membatalkan (cancel) semua pelanggan yang saat ini sedang menunggu atau sedang dilayani pada hari ini.
              </p>
              <Button 
                variant="destructive" 
                onClick={handleResetQueue} 
                disabled={isResettingQueue || !initialSettings.branch}
                className="w-full"
              >
                {isResettingQueue ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                ) : (
                  "Reset Antrean Hari Ini"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tambah Cabang Gowa */}
        <Card className="bg-surface border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Store className="w-5 h-5" />
              Kelola Cabang
            </CardTitle>
            <CardDescription>Tambahkan cabang baru ke sistem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border border-border rounded-xl bg-background space-y-4">
              <p className="text-sm text-foreground">
                Tambahkan cabang "Black Yellow Gowa" ke dalam database antrean.
              </p>
              <Button 
                variant="outline" 
                onClick={async () => {
                  const { addGowaBranch } = await import("@/actions/admin-settings");
                  const res = await addGowaBranch();
                  alert(res.message || res.error);
                }} 
                className="w-full border-primary text-primary hover:bg-primary/10"
              >
                + Tambah Cabang Gowa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Teks Halaman Utama */}
        <Card className="bg-surface border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              Konten Halaman Utama
            </CardTitle>
            <CardDescription>Ubah teks yang pertama kali dilihat oleh pelanggan</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveHero} className="space-y-4">
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
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Deskripsi..."
                  required
                />
              </div>
              
              <Button type="submit" disabled={isUpdatingHero} className="w-full">
                {isUpdatingHero ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4 text-center">
                *Penting: Anda harus menjalankan file migrasi SQL `supabase_settings.sql` di Supabase Anda agar fitur Edit Konten ini berfungsi!
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
