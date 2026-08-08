/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { createGallery, updateGallery, deleteGallery } from "@/actions/admin-gallery";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";

export function GalleryClient({ initialGalleries }: { initialGalleries: any[] }) {
  const [galleries, setGalleries] = useState(initialGalleries);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [category, setCategory] = useState("Umum");
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  const resetForm = () => {
    setEditingId(null);
    setImageUrl("");
    setSelectedFile(null);
    setPreviewUrl("");
    setAltText("");
    setCategory("Umum");
    setSortOrder(galleries.length * 10);
    setIsPublished(true);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (gallery: any) => {
    setEditingId(gallery.id);
    setImageUrl(gallery.image_url);
    setSelectedFile(null);
    setPreviewUrl(gallery.image_url);
    setAltText(gallery.alt_text || "");
    setCategory(gallery.category || "Umum");
    setSortOrder(gallery.sort_order);
    setIsPublished(gallery.is_published);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl && !selectedFile) {
      alert("Harap pilih gambar atau masukkan URL gambar.");
      return;
    }
    
    setIsSaving(true);
    
    let finalImageUrl = imageUrl;
    
    if (selectedFile) {
      try {
        const supabase = createClient();
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, selectedFile);
        
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: publicUrlData } = supabase.storage.from('gallery').getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      } catch (err: any) {
        alert("Gagal mengunggah gambar: " + err.message);
        setIsSaving(false);
        return;
      }
    }

    const data = { image_url: finalImageUrl, alt_text: altText, category, sort_order: sortOrder, is_published: isPublished };

    if (editingId) {
      const res = await updateGallery(editingId, data);
      if (res.success) {
        setGalleries(galleries.map((g) => (g.id === editingId ? { ...g, ...data } : g)));
        setIsOpen(false);
      } else {
        alert("Gagal memperbarui: " + res.error);
      }
    } else {
      const res = await createGallery(data);
      if (res.success) {
        window.location.reload();
      } else {
        alert("Gagal menambahkan: " + res.error);
      }
    }
    
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus foto galeri ini secara permanen?")) return;
    const res = await deleteGallery(id);
    if (res.success) {
      setGalleries(galleries.filter((g) => g.id !== id));
    } else {
      alert("Gagal menghapus: " + res.error);
    }
  };

  const handleTogglePublished = async (gallery: any, checked: boolean) => {
    setGalleries(galleries.map(g => g.id === gallery.id ? { ...g, is_published: checked } : g));
    await updateGallery(gallery.id, { 
      image_url: gallery.image_url, 
      alt_text: gallery.alt_text,
      category: gallery.category,
      sort_order: gallery.sort_order, 
      is_published: checked 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90" />}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Foto
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-surface border-border">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Foto Galeri" : "Tambah Foto Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-4 border p-4 rounded-md border-border bg-background/50">
                <div className="space-y-2">
                  <Label htmlFor="imageFile" className="font-semibold text-primary">Upload File Gambar Baru</Label>
                  <Input 
                    id="imageFile" 
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                        // Kosongkan imageUrl manual agar tahu kita pakai file
                        setImageUrl(""); 
                      }
                    }} 
                  />
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-surface px-2 text-muted-foreground">Atau</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Gunakan URL Gambar (Manual)</Label>
                  <Input 
                    id="imageUrl" 
                    value={imageUrl} 
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value) {
                        setSelectedFile(null);
                        setPreviewUrl(e.target.value);
                      } else {
                        setPreviewUrl("");
                      }
                    }} 
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="altText">Alt Text (Deskripsi Gambar untuk SEO)</Label>
                <Input 
                  id="altText" 
                  value={altText} 
                  onChange={(e) => setAltText(e.target.value)} 
                  placeholder="Misal: Hasil potongan gaya Mullet"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <select 
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Interior">Interior</option>
                    <option value="Potongan">Hasil Potongan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Urutan</Label>
                  <Input 
                    id="sortOrder" 
                    type="number"
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(parseInt(e.target.value))} 
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2 border p-3 rounded-md border-border bg-background/50">
                  <Switch id="isPublished" checked={isPublished} onCheckedChange={setIsPublished} />
                  <Label htmlFor="isPublished" className="cursor-pointer">Tampilkan (Published)</Label>
                </div>
              </div>

              {previewUrl && (
                <div className="mt-4 p-2 border rounded-md overflow-hidden aspect-video relative bg-black/20">
                  {/* Gunakan img biasa untuk preview agar tidak error jika URL tidak diizinkan di config next/image */}
                  <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-surface border-border border-dashed">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Belum ada foto galeri.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          galleries.map((gallery) => (
            <Card key={gallery.id} className={`bg-surface border-border overflow-hidden transition-all ${gallery.is_published ? '' : 'opacity-50 grayscale hover:grayscale-0'}`}>
              <div className="relative aspect-[4/3] bg-background">
                {/* Fallback to normal img if next/image config blocks it */}
                <img 
                  src={gallery.image_url} 
                  alt={gallery.alt_text || "Gallery image"}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                    {gallery.category}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-muted-foreground truncate flex-1 pr-2" title={gallery.alt_text}>
                    {gallery.alt_text || "Tanpa deskripsi"}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={gallery.is_published} 
                      onCheckedChange={(c) => handleTogglePublished(gallery, c)} 
                      aria-label="Toggle publish"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(gallery)} className="h-8 w-8 hover:bg-white/5">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(gallery.id)} className="h-8 w-8 hover:bg-destructive/10 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
