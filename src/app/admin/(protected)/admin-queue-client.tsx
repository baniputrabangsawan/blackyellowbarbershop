/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { updateQueueStatus, deleteQueue } from "@/actions/admin-queue";
import { createQueue } from "@/actions/queue";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Phone, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function AdminQueueClient({ initialQueues, options }: { initialQueues: any[], options?: any }) {
  const [queues, setQueues] = useState(initialQueues);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'dummy'
  );

  useEffect(() => {
    const channel = supabase
      .channel('admin-queues')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queues',
          filter: `queue_date=eq.${new Date().toISOString().split('T')[0]}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            window.location.reload();
          } else if (payload.eventType === 'UPDATE') {
            setQueues(prev => prev.map(q => 
              q.id === payload.new.id ? { ...q, ...payload.new } : q
            ));
          } else if (payload.eventType === 'DELETE') {
            setQueues(prev => prev.filter(q => q.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleStatusChange = async (queueId: string, newStatus: string) => {
    setLoadingId(queueId);
    await updateQueueStatus(queueId, newStatus);
    setLoadingId(null);
  };

  const handleDelete = async (queueId: string) => {
    if (!confirm("Yakin ingin menghapus antrean ini secara permanen?")) return;
    setLoadingId(queueId);
    await deleteQueue(queueId);
    setLoadingId(null);
  };

  const handleAddQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!options?.branches?.[0]?.id) {
      alert("Tidak ada cabang yang aktif!");
      return;
    }

    setIsAdding(true);
    
    const formData = new FormData();
    formData.append("customerName", customerName);
    // Jika tidak ada nomor, isi dengan nomor dummy untuk memenuhi validasi Zod
    formData.append("phone", phone || "080000000000"); 
    formData.append("serviceId", serviceId);
    if (barberId) formData.append("preferredBarberId", barberId);
    formData.append("branchId", options.branches[0].id); // Gunakan cabang pertama secara default

    const result = await createQueue(formData);
    
    if (result.error) {
      alert(`Gagal menambahkan: ${result.error}\nDetail: ${JSON.stringify(result.details || {})}`);
    } else {
      setIsAddOpen(false);
      setCustomerName("");
      setPhone("");
      setServiceId("");
      setBarberId("");
    }
    
    setIsAdding(false);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'waiting': return <Badge className="bg-warning/20 text-warning border-warning/30 hover:bg-warning/30">Menunggu</Badge>;
      case 'called': return <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 animate-pulse">Dipanggil</Badge>;
      case 'in_service': return <Badge className="bg-success/20 text-success border-success/30 hover:bg-success/30">Dilayani</Badge>;
      case 'completed': return <Badge variant="outline" className="text-muted-foreground border-border">Selesai</Badge>;
      case 'cancelled': 
      case 'no_show': return <Badge variant="outline" className="text-destructive border-destructive/30">Batal / Tidak Hadir</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-4">
      {/* Tombol Tambah Antrean */}
      <div className="flex justify-end mb-2">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="bg-primary text-primary-foreground hover:bg-primary/90" />}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Antrean Offline
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-surface border-border">
            <DialogHeader>
              <DialogTitle>Tambah Antrean Offline (Walk-in)</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddQueue} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Pelanggan</Label>
                <Input 
                  id="name" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. WhatsApp (Opsional)</Label>
                <Input 
                  id="phone" 
                  type="tel"
                  placeholder="08..."
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Layanan</Label>
                <select 
                  id="service"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Pilih Layanan</option>
                  {options?.services?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} - Rp{s.price}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="barber">Barber (Opsional)</Label>
                <select 
                  id="barber"
                  value={barberId}
                  onChange={(e) => setBarberId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Bebas Pilihkan</option>
                  {options?.barbers?.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Simpan Antrean
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {queues.length === 0 ? (
        <Card className="bg-surface border-border">
          <CardContent className="p-8 text-center text-muted-foreground">
            Belum ada antrean untuk hari ini.
          </CardContent>
        </Card>
      ) : (
        queues.map((queue) => {
          const isDone = ['completed', 'cancelled', 'no_show'].includes(queue.status);
          
          return (
            <Card key={queue.id} className={`bg-surface border-border overflow-hidden transition-all ${queue.status === 'called' ? 'border-primary shadow-lg shadow-primary/5' : ''} ${isDone ? 'opacity-60 grayscale' : ''}`}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left Column - Number & Status */}
                  <div className="bg-surface-elevated p-6 md:w-48 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border shrink-0">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Nomor</span>
                    <span className="font-heading text-4xl font-bold text-foreground mb-3">
                      B{queue.queue_number.toString().padStart(2, '0')}
                    </span>
                    {getStatusBadge(queue.status)}
                  </div>
                  
                  {/* Middle Column - Details */}
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-foreground">{queue.customer_name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone size={14} className="mr-1" />
                        {queue.phone}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Layanan: </span>
                        <span className="font-medium text-foreground">{queue.services?.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Barber: </span>
                        <span className="font-medium text-foreground">{queue.barbers?.name || 'Bebas'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Waktu Masuk: </span>
                        <span className="font-medium text-foreground">
                          {format(new Date(queue.joined_at), 'HH:mm')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sumber: </span>
                        <span className="font-medium text-foreground capitalize">{queue.source}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Actions */}
                  <div className="p-6 md:w-64 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-border bg-surface-elevated/50 shrink-0">
                    {loadingId === queue.id ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        {queue.status === 'waiting' && (
                          <>
                            <Button onClick={() => handleStatusChange(queue.id, 'called')} className="w-full bg-primary text-primary-foreground hover:bg-primary-hover">
                              Panggil
                            </Button>
                            <div className="flex gap-2">
                               <Button onClick={() => handleStatusChange(queue.id, 'no_show')} variant="outline" className="flex-1 text-xs px-2 border-destructive/50 text-destructive hover:bg-destructive/10">
                                 Tidak Hadir
                               </Button>
                               <Button onClick={() => handleDelete(queue.id)} variant="outline" size="icon" className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10" title="Hapus Antrean">
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                            </div>
                          </>
                        )}
                        
                        {queue.status === 'called' && (
                          <>
                            <Button onClick={() => handleStatusChange(queue.id, 'in_service')} className="w-full bg-success text-white hover:bg-success/90">
                              Mulai Layanan
                            </Button>
                            <Button onClick={() => handleStatusChange(queue.id, 'waiting')} variant="outline" className="w-full hover:bg-white/5">
                              Kembali Menunggu
                            </Button>
                          </>
                        )}
                        
                        {queue.status === 'in_service' && (
                          <Button onClick={() => handleStatusChange(queue.id, 'completed')} className="w-full bg-success text-white hover:bg-success/90">
                            Selesaikan
                          </Button>
                        )}
                        
                        {isDone && (
                          <>
                            <div className="text-center text-sm text-muted-foreground italic mb-2">
                              Selesai pada {queue.completed_at ? format(new Date(queue.completed_at), 'HH:mm') : format(new Date(queue.cancelled_at), 'HH:mm')}
                            </div>
                            <Button onClick={() => handleDelete(queue.id)} variant="ghost" size="sm" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
                              Hapus Permanen
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
