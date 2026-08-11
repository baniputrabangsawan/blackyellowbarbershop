"use client";
import type { SiteSettings } from "@/types";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Loader2, KeyRound } from "lucide-react";
import { updateSiteSettingsAction } from "./actions";
import { updateAdminCredentials } from "@/actions/auth-settings";

type SettingsData = Partial<SiteSettings>;
type AdminAccount = { user_id: string; username: string; branch_name: string; };

export function SettingsForm({ initialData, userRole, adminAccounts = [] }: { initialData: SettingsData, userRole?: string | null, adminAccounts?: AdminAccount[] }) {
  const [formData, setFormData] = useState<SettingsData>(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // State untuk ganti kredensial admin
  const [targetAdmin, setTargetAdmin] = useState(adminAccounts[0]?.user_id || "");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername && !newPassword) {
      setMessage({ type: 'error', text: 'Tidak ada perubahan yang dilakukan.' });
      return;
    }

    if (newPassword && newPassword.length > 0 && newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password harus minimal 6 karakter.' });
      return;
    }
    
    setIsResetting(true);
    setMessage(null);
    const result = await updateAdminCredentials(targetAdmin, newUsername, newPassword);
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: `Data kredensial admin berhasil diubah!` });
      setNewPassword("");
      setTimeout(() => setMessage(null), 3000);
    }
    setIsResetting(false);
  };

  const handleChange = (field: keyof SiteSettings, value: string | number | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    
    const result = await updateSiteSettingsAction(formData);
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
      setTimeout(() => setMessage(null), 3000);
    }
    
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan Sistem</h1>
          <p className="text-muted-foreground">Kelola konfigurasi inti, operasional, dan informasi bisnis.</p>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Simpan Perubahan
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-md mb-6 ${message.type === 'success' ? 'bg-success/20 text-success border border-success/30' : 'bg-destructive/20 text-destructive border border-destructive/30'}`}>
          {message.text}
        </div>
      )}

      <Tabs defaultValue="operational" className="w-full">
        <TabsList className="flex w-full mb-6 bg-surface-elevated overflow-x-auto flex-nowrap snap-x justify-start h-auto p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsTrigger value="operational" className="py-2.5 px-4 shrink-0 snap-start">Operasional</TabsTrigger>
          <TabsTrigger value="business" className="py-2.5 px-4 shrink-0 snap-start">Info Bisnis</TabsTrigger>
          <TabsTrigger value="queue" className="py-2.5 px-4 shrink-0 snap-start">Antrean</TabsTrigger>
          <TabsTrigger value="branding" className="py-2.5 px-4 shrink-0 snap-start">Branding</TabsTrigger>
          {userRole === "owner" && (
            <TabsTrigger value="admin_accounts" className="py-2.5 px-4 shrink-0 snap-start text-warning data-[state=active]:text-warning">Akun Admin</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="operational" className="space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle>Status Operasional</CardTitle>
              <CardDescription>Atur status ketersediaan barbershop saat ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/50">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Toko Buka</Label>
                  <p className="text-sm text-muted-foreground">Nonaktifkan untuk menandai toko sedang tutup darurat atau di luar jam operasional.</p>
                </div>
                <Switch 
                  checked={!!formData.is_open} 
                  onCheckedChange={(v) => handleChange("is_open", v)} 
                />
              </div>

              <div className="space-y-3">
                <Label>Label Status Detail</Label>
                <select 
                  className="flex h-10 w-full md:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.operational_status || 'Buka'}
                  onChange={(e) => handleChange("operational_status", e.target.value)}
                >
                  <option value="Buka">Buka Normal</option>
                  <option value="Istirahat">Istirahat</option>
                  <option value="Antrean Penuh">Antrean Penuh (Close Order)</option>
                  <option value="Maintenance">Pemeliharaan Sistem</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-4 border border-border rounded-lg bg-background/50">
                  <Checkbox 
                    id="accept_new_queue" 
                    checked={!!formData.accept_new_queue}
                    onCheckedChange={(v) => handleChange("accept_new_queue", v)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="accept_new_queue">Terima Antrean Baru</Label>
                    <p className="text-xs text-muted-foreground">Izinkan pelanggan baru mengambil nomor antrean.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border border-border rounded-lg bg-background/50">
                  <Checkbox 
                    id="allow_online_queue" 
                    checked={!!formData.allow_online_queue}
                    onCheckedChange={(v) => handleChange("allow_online_queue", v)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="allow_online_queue">Antrean Online Aktif</Label>
                    <p className="text-xs text-muted-foreground">Pelanggan dapat mendaftar antrean melalui website publik.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border border-border rounded-lg bg-background/50">
                  <Checkbox 
                    id="allow_walkin" 
                    checked={!!formData.allow_walkin}
                    onCheckedChange={(v) => handleChange("allow_walkin", v)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="allow_walkin">Walk-in Aktif</Label>
                    <p className="text-xs text-muted-foreground">Menerima pelanggan yang datang langsung tanpa reservasi.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle>Informasi Profil Bisnis</CardTitle>
              <CardDescription>Data ini akan ditampilkan di halaman kontak dan footer website publik.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Bisnis</Label>
                  <Input value={formData.business_name || ''} onChange={e => handleChange('business_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nama Cabang</Label>
                  <Input value={formData.branch_name || ''} onChange={e => handleChange('branch_name', e.target.value)} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Alamat Lengkap</Label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.address || ''} 
                  onChange={e => handleChange('address', e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>WhatsApp (Gunakan awalan 08 atau 62)</Label>
                  <Input type="tel" value={formData.whatsapp || ''} onChange={e => handleChange('whatsapp', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nomor Telepon (Opsional)</Label>
                  <Input type="tel" value={formData.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Bisnis</Label>
                <Input type="email" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>URL Google Maps</Label>
                <Input type="url" placeholder="https://goo.gl/maps/..." value={formData.maps_url || ''} onChange={e => handleChange('maps_url', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle>Sosial Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input type="url" value={formData.instagram_url || ''} onChange={e => handleChange('instagram_url', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>TikTok URL</Label>
                  <Input type="url" value={formData.tiktok_url || ''} onChange={e => handleChange('tiktok_url', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input type="url" value={formData.facebook_url || ''} onChange={e => handleChange('facebook_url', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle>Konfigurasi Antrean Cerdas</CardTitle>
              <CardDescription>Atur batas dan estimasi perhitungan sistem antrean.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Maksimal Antrean Harian</Label>
                  <Input type="number" min="1" value={formData.max_daily_queue || 50} onChange={e => handleChange('max_daily_queue', parseInt(e.target.value))} />
                  <p className="text-xs text-muted-foreground">Batas total tiket yang bisa dikeluarkan dalam 1 hari.</p>
                </div>
                <div className="space-y-2">
                  <Label>Batas Maksimal Pelanggan Menunggu</Label>
                  <Input type="number" min="1" value={formData.max_waiting || 10} onChange={e => handleChange('max_waiting', parseInt(e.target.value))} />
                  <p className="text-xs text-muted-foreground">Tutup sementara pendaftaran online jika jumlah antrean belum dilayani mencapai angka ini.</p>
                </div>
                <div className="space-y-2">
                  <Label>Estimasi Waktu Default per Layanan (Menit)</Label>
                  <Input type="number" min="5" value={formData.default_estimation_mins || 45} onChange={e => handleChange('default_estimation_mins', parseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Toleransi Keterlambatan (Menit)</Label>
                  <Input type="number" min="0" value={formData.late_tolerance_mins || 15} onChange={e => handleChange('late_tolerance_mins', parseInt(e.target.value))} />
                  <p className="text-xs text-muted-foreground">Jika lewat, antrean dapat dilewati (Skip) atau dibatalkan otomatis.</p>
                </div>
              </div>
              
              <div className="pt-4 mt-4 border-t border-border">
                <div className="flex items-start space-x-3 p-4 bg-background/50 rounded-lg">
                  <Checkbox 
                    id="allow_barber_selection" 
                    checked={!!formData.allow_barber_selection}
                    onCheckedChange={(v) => handleChange("allow_barber_selection", v)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="allow_barber_selection">Izinkan Pemilihan Barber</Label>
                    <p className="text-xs text-muted-foreground">Pelanggan bisa memilih barber spesifik saat mengambil nomor antrean.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle>Branding & SEO</CardTitle>
              <CardDescription>Atur identitas visual dan optimalisasi mesin pencari.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input placeholder="https://..." value={formData.logo_url || ''} onChange={e => handleChange('logo_url', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Favicon URL</Label>
                  <Input placeholder="https://..." value={formData.favicon_url || ''} onChange={e => handleChange('favicon_url', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tagline Brand</Label>
                <Input value={formData.brand_tagline || ''} onChange={e => handleChange('brand_tagline', e.target.value)} />
                <p className="text-xs text-muted-foreground">Contoh: Gaya Tanpa Kompromi</p>
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <h4 className="font-semibold mb-4 text-sm uppercase text-muted-foreground tracking-wider">Search Engine Optimization (SEO)</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>SEO Title (Format)</Label>
                    <Input value={formData.seo_title || ''} onChange={e => handleChange('seo_title', e.target.value)} />
                    <p className="text-xs text-muted-foreground">Format default halaman utama.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.meta_description || ''} 
                      onChange={e => handleChange('meta_description', e.target.value)} 
                    />
                    <p className="text-xs text-muted-foreground">Deskripsi singkat yang muncul di pencarian Google. Maks 160 karakter.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>OG Image URL (Thumbnail Sosmed)</Label>
                    <Input placeholder="https://..." value={formData.og_image_url || ''} onChange={e => handleChange('og_image_url', e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {userRole === "owner" && (
          <TabsContent value="admin_accounts" className="space-y-6">
            <Card className="bg-surface border-warning/30 border-2 shadow-[0_0_15px_rgba(255,204,0,0.1)]">
              <CardHeader>
                <CardTitle className="text-warning flex items-center gap-2">
                  <KeyRound size={20} />
                  Kelola Password Admin Cabang
                </CardTitle>
                <CardDescription>Ubah password untuk admin cabang tertentu. Hanya Owner yang dapat melihat panel ini.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Pilih Akun Admin</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-warning"
                      value={targetAdmin}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTargetAdmin(val);
                        const selectedAdmin = adminAccounts.find(a => a.user_id === val);
                        if (selectedAdmin) {
                          setNewUsername(selectedAdmin.username);
                        }
                      }}
                    >
                      {adminAccounts.map((admin) => (
                        <option key={admin.user_id} value={admin.user_id}>
                          {admin.branch_name} ({admin.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Username Baru (Opsional)</Label>
                    <Input 
                      type="text" 
                      placeholder="Username baru" 
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="focus-visible:ring-warning"
                    />
                    <p className="text-xs text-muted-foreground">Biarkan tetap jika tidak ingin mengubah username.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Password Baru (Opsional)</Label>
                    <Input 
                      type="text" 
                      placeholder="Minimal 6 karakter" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      className="focus-visible:ring-warning"
                    />
                    <p className="text-xs text-muted-foreground">Kosongkan jika hanya ingin mengganti username.</p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isResetting} 
                    className="w-full bg-warning text-black hover:bg-warning/90 mt-2"
                  >
                    {isResetting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                    Simpan Perubahan Akun
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
