/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { createPromo, updatePromo, deletePromo } from "@/actions/admin-promo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, CalendarClock } from "lucide-react";
import { format } from "date-fns";

export function PromoClient({ initialPromos }: { initialPromos: any[] }) {
  const [promos, setPromos] = useState(initialPromos);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setCtaText("");
    setCtaUrl("");
    setIsActive(true);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (promo: any) => {
    setEditingId(promo.id);
    setTitle(promo.title);
    setDescription(promo.description || "");
    // Format dates to YYYY-MM-DDTHH:mm for datetime-local input
    setStartDate(promo.start_date ? new Date(promo.start_date).toISOString().slice(0, 16) : "");
    setEndDate(promo.end_date ? new Date(promo.end_date).toISOString().slice(0, 16) : "");
    setCtaText(promo.cta_text || "");
    setCtaUrl(promo.cta_url || "");
    setIsActive(promo.is_active);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const data = { 
      title, 
      description, 
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      cta_text: ctaText,
      cta_url: ctaUrl,
      is_active: isActive 
    };

    if (editingId) {
      const res = await updatePromo(editingId, data);
      if (res.success) {
        setPromos(promos.map((p) => (p.id === editingId ? { ...p, ...data } : p)));
        setIsOpen(false);
      } else {
        alert("Gagal memperbarui: " + res.error);
      }
    } else {
      const res = await createPromo(data);
      if (res.success) {
        window.location.reload();
      } else {
        alert("Gagal menambahkan: " + res.error);
      }
    }
    
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus promo ini secara permanen?")) return;
    const res = await deletePromo(id);
    if (res.success) {
      setPromos(promos.filter((p) => p.id !== id));
    } else {
      alert("Gagal menghapus: " + res.error);
    }
  };

  const handleToggleActive = async (promo: any, checked: boolean) => {
    setPromos(promos.map(p => p.id === promo.id ? { ...p, is_active: checked } : p));
    await updatePromo(promo.id, { 
      title: promo.title, 
      description: promo.description,
      start_date: promo.start_date,
      end_date: promo.end_date,
      cta_text: promo.cta_text,
      cta_url: promo.cta_url,
      is_active: checked 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90" />}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Promo Baru
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-surface border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Promo" : "Buat Promo / Pengumuman"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Banner</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Misal: Diskon Merdeka 20%"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Singkat</Label>
                <textarea 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Syarat dan ketentuan berlaku..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border mt-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Mulai Tayang (Opsional)</Label>
                  <Input 
                    id="startDate" 
                    type="datetime-local"
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Berakhir Pada (Opsional)</Label>
                  <Input 
                    id="endDate" 
                    type="datetime-local"
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                  />
                  <p className="text-xs text-muted-foreground">Banner akan hilang otomatis setelah lewat batas waktu.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border mt-2">
                <div className="space-y-2">
                  <Label htmlFor="ctaText">Teks Tombol Aksi (CTA)</Label>
                  <Input 
                    id="ctaText" 
                    value={ctaText} 
                    onChange={(e) => setCtaText(e.target.value)} 
                    placeholder="Misal: Klaim Sekarang"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaUrl">URL Tujuan / Link Aksi</Label>
                  <Input 
                    id="ctaUrl" 
                    value={ctaUrl} 
                    onChange={(e) => setCtaUrl(e.target.value)} 
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-4">
                <div className="flex items-center space-x-2 border p-3 rounded-md border-border bg-background/50">
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive" className="cursor-pointer">Aktif / Tayang Sekarang</Label>
                    <p className="text-xs text-muted-foreground">Jika nonaktif, promo tidak akan muncul walau jadwal tayangnya valid.</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {promos.length === 0 ? (
          <Card className="bg-surface border-border border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              Belum ada data promo atau pengumuman.
            </CardContent>
          </Card>
        ) : (
          promos.map((promo) => {
            const isExpired = promo.end_date && new Date(promo.end_date) < new Date();
            const isNotStarted = promo.start_date && new Date(promo.start_date) > new Date();
            const statusLabel = !promo.is_active ? "Nonaktif" : (isExpired ? "Kadaluarsa" : (isNotStarted ? "Terjadwal" : "Tayang"));
            
            return (
              <Card key={promo.id} className={`bg-surface border-border transition-all ${!promo.is_active || isExpired ? 'opacity-60' : 'border-primary/50 shadow-sm shadow-primary/10'}`}>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-foreground text-lg">{promo.title}</h3>
                      <div className="shrink-0 pt-1">
                        <span className={`text-xs px-2 py-1 rounded-full border ${promo.is_active && !isExpired && !isNotStarted ? 'bg-success/10 text-success border-success/30' : 'bg-muted/50 text-muted-foreground border-border'}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                    
                    {promo.description && (
                      <p className="text-sm text-muted-foreground">
                        {promo.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
                      {(promo.start_date || promo.end_date) && (
                        <div className="flex items-center gap-1">
                          <CalendarClock size={14} />
                          <span>
                            {promo.start_date ? format(new Date(promo.start_date), "dd MMM yyyy") : "Kapan saja"} 
                            {" - "} 
                            {promo.end_date ? format(new Date(promo.end_date), "dd MMM yyyy") : "Selamanya"}
                          </span>
                        </div>
                      )}
                      
                      {promo.cta_text && (
                        <div>
                          Tombol: <span className="font-medium text-foreground">{promo.cta_text}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-4">
                    <div className="flex items-center gap-2 mb-0 md:mb-2 mr-auto md:mr-0">
                      <span className="text-xs text-muted-foreground md:hidden">Tampilkan:</span>
                      <Switch 
                        checked={promo.is_active} 
                        onCheckedChange={(c) => handleToggleActive(promo, c)} 
                        aria-label="Toggle active"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(promo)} className="h-8 w-8 hover:bg-white/5">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)} className="h-8 w-8 hover:bg-destructive/10 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
