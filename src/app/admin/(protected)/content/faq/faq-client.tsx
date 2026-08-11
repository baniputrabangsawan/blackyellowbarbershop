"use client";
import type { Faq } from "@/types";

import { useState } from "react";
import { createFaq, updateFaq, deleteFaq } from "@/actions/admin-faq";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, GripVertical } from "lucide-react";

export function FaqClient({ initialFaqs }: { initialFaqs: Faq[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setSortOrder(faqs.length * 10);
    setIsActive(true);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (faq: Faq) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setSortOrder(faq.sort_order || 0);
    setIsActive(faq.is_active ?? true);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const data = { question, answer, sort_order: sortOrder, is_active: isActive };

    if (editingId) {
      const res = await updateFaq(editingId, data);
      if (res.success) {
        setFaqs(faqs.map((f) => (f.id === editingId ? { ...f, ...data } : f)));
        setIsOpen(false);
      } else {
        alert("Gagal memperbarui: " + res.error);
      }
    } else {
      const res = await createFaq(data);
      if (res.success) {
        // Reload page to get new ID from server, or just reload to simplify
        window.location.reload();
      } else {
        alert("Gagal menambahkan: " + res.error);
      }
    }
    
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus FAQ ini?")) return;
    const res = await deleteFaq(id);
    if (res.success) {
      setFaqs(faqs.filter((f) => f.id !== id));
    } else {
      alert("Gagal menghapus: " + res.error);
    }
  };

  const handleToggleActive = async (faq: Faq, checked: boolean) => {
    setFaqs(faqs.map(f => f.id === faq.id ? { ...f, is_active: checked } : f));
    await updateFaq(faq.id, { 
      question: faq.question, 
      answer: faq.answer, 
      sort_order: faq.sort_order || 0, 
      is_active: checked 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90" />}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah FAQ
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-background border-border">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit FAQ" : "Tambah FAQ Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="question">Pertanyaan</Label>
                <Input 
                  id="question" 
                  value={question} 
                  onChange={(e) => setQuestion(e.target.value)} 
                  placeholder="Misal: Apakah melayani booking online?"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Jawaban</Label>
                <textarea 
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Urutan (Angka)</Label>
                  <Input 
                    id="sortOrder" 
                    type="number"
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(parseInt(e.target.value))} 
                  />
                  <p className="text-xs text-muted-foreground">Angka kecil = urutan atas</p>
                </div>
                <div className="space-y-2 flex flex-col justify-end pb-1">
                  <div className="flex items-center space-x-2 border p-2.5 rounded-md border-border bg-background/50">
                    <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                    <Label htmlFor="isActive" className="cursor-pointer">Aktif / Tampilkan</Label>
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
        {faqs.length === 0 ? (
          <Card className="bg-surface border-border border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              Belum ada FAQ. Klik &quot;Tambah FAQ&quot; untuk mulai membuat.
            </CardContent>
          </Card>
        ) : (
          faqs.map((faq) => (
            <Card key={faq.id} className={`bg-surface border-border transition-opacity ${faq.is_active ? '' : 'opacity-60'}`}>
              <CardContent className="p-4 flex gap-4 items-start">
                <div className="mt-1 cursor-move text-muted-foreground hover:text-foreground">
                  <GripVertical size={16} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-foreground">{faq.question}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch 
                        checked={faq.is_active} 
                        onCheckedChange={(c) => handleToggleActive(faq, c)} 
                        aria-label="Toggle active"
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(faq)} className="h-8 w-8 hover:bg-white/5">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(faq.id)} className="h-8 w-8 hover:bg-destructive/10 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {faq.answer}
                  </p>
                  <div className="text-xs text-muted-foreground/60 pt-2">
                    Urutan: {faq.sort_order}
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
