  "use client";
import type { Testimonial } from "@/types";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTestimonial, updateTestimonial, deleteTestimonial } from "@/actions/admin-testimonial";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, GripVertical, Star } from "lucide-react";

export function TestimonialClient({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const router = useRouter();

  const [prevInitial, setPrevInitial] = useState(initialTestimonials);

  // Sync server state updates to local state during render (React recommended pattern over useEffect)
  if (initialTestimonials !== prevInitial) {
    setTestimonials(initialTestimonials);
    setPrevInitial(initialTestimonials);
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setContent("");
    setRating(5);
    setSortOrder(testimonials.length * 10);
    setIsActive(true);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setName(testimonial.name);
    setContent(testimonial.content);
    setRating(testimonial.rating || 5);
    setSortOrder(testimonial.sort_order || 0);
    setIsActive(testimonial.is_active ?? true);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const data = { name, content, rating, sort_order: sortOrder, is_active: isActive };

    if (editingId) {
      const res = await updateTestimonial(editingId, data);
      if (res.success) {
        setTestimonials(testimonials.map((t) => (t.id === editingId ? { ...t, ...data } : t)));
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Gagal memperbarui: " + res.error);
      }
    } else {
      const res = await createTestimonial(data);
      if (res.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Gagal menambahkan: " + res.error);
      }
    }
    
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus ulasan ini?")) return;
    const res = await deleteTestimonial(id);
    if (res.success) {
      setTestimonials(testimonials.filter((t) => t.id !== id));
      router.refresh();
    } else {
      alert("Gagal menghapus: " + res.error);
    }
  };

  const handleToggleActive = async (testimonial: Testimonial, checked: boolean) => {
    setTestimonials(testimonials.map(t => t.id === testimonial.id ? { ...t, is_active: checked } : t));
    const res = await updateTestimonial(testimonial.id, { 
      name: testimonial.name, 
      content: testimonial.content,
      rating: testimonial.rating || 5,
      sort_order: testimonial.sort_order || 0, 
      is_active: checked 
    });
    if (res.success) router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90" />}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Ulasan
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-background border-border">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Ulasan" : "Tambah Ulasan Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Pelanggan</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Misal: Andi S."
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Ulasan / Komentar</Label>
                <textarea 
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Pelayanan sangat memuaskan..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Rating Bintang</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 ${star <= rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`} 
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">{rating} Bintang</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Urutan Tampil</Label>
                  <Input 
                    id="sortOrder" 
                    type="number" 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(parseInt(e.target.value))} 
                  />
                  <p className="text-xs text-muted-foreground">Angka lebih kecil tampil duluan.</p>
                </div>
                <div className="space-y-2 pt-8">
                  <div className="flex items-center space-x-2">
                    <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                    <Label htmlFor="isActive" className="cursor-pointer">Tampilkan Publik</Label>
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

      <div className="space-y-3">
        {testimonials.length === 0 ? (
          <Card className="bg-surface border-border border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              Belum ada data testimonial.
            </CardContent>
          </Card>
        ) : (
          testimonials.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((testimonial) => (
            <Card key={testimonial.id} className={`bg-surface border-border transition-colors ${!testimonial.is_active ? 'opacity-50' : 'hover:border-primary/50'}`}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1 text-muted-foreground/50 hidden md:block">
                  <GripVertical size={20} />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        {testimonial.name}
                        {!testimonial.is_active && (
                          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Sembunyi</span>
                        )}
                      </h3>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= (testimonial.rating || 5) ? "text-primary fill-primary" : "text-muted-foreground/30"}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-3">
                    &quot;{testimonial.content}&quot;
                  </p>
                  
                  <div className="text-xs text-muted-foreground">
                    Urutan: {testimonial.sort_order || 0}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 border-l border-border pl-4 shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">Tampil:</span>
                    <Switch 
                      checked={testimonial.is_active ?? true} 
                      onCheckedChange={(c) => handleToggleActive(testimonial, c)} 
                      aria-label="Toggle active"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(testimonial)} className="h-8 w-8 hover:bg-white/5">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(testimonial.id)} className="h-8 w-8 hover:bg-destructive/10 text-destructive">
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
