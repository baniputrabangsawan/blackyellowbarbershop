/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { updateBarberStatus, updateBarber, deleteBarber, addBarber } from "@/actions/admin-barbers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit2, Save, X, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AdminBarbersClient({ initialBarbers }: { initialBarbers: any[] }) {
  const [barbers, setBarbers] = useState(initialBarbers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleToggleStatus = async (barberId: string, currentStatus: boolean) => {
    setLoadingId(barberId);
    const newStatus = !currentStatus;
    
    const result = await updateBarberStatus(barberId, newStatus);
    
    if (result.success) {
      setBarbers(prev => prev.map(b => b.id === barberId ? { ...b, is_active: newStatus } : b));
    } else {
      alert("Gagal memperbarui status: " + result.error);
    }
    
    setLoadingId(null);
  };

  const handleEditClick = (barber: any) => {
    setEditingId(barber.id);
    setEditName(barber.name);
  };

  const handleSaveEdit = async (barberId: string) => {
    if (!editName.trim()) return;
    
    setLoadingId(barberId);
    const result = await updateBarber(barberId, editName);
    
    if (result.success) {
      setBarbers(prev => prev.map(b => b.id === barberId ? { ...b, name: editName } : b));
      setEditingId(null);
    } else {
      alert("Gagal memperbarui barber: " + result.error);
    }
    setLoadingId(null);
  };

  const handleDelete = async (barberId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus barber ini? Aksi ini tidak dapat dibatalkan.")) return;
    
    setLoadingId(barberId);
    const result = await deleteBarber(barberId);
    
    if (result.success) {
      setBarbers(prev => prev.filter(b => b.id !== barberId));
    } else {
      alert("Gagal menghapus barber:\n" + result.error);
    }
    setLoadingId(null);
  };

  const handleAddBarber = async () => {
    if (!newName.trim()) return;
    
    setLoadingId("new");
    const result = await addBarber(newName);
    
    if (result.success && result.data) {
      setBarbers(prev => [...prev, result.data].sort((a, b) => a.name.localeCompare(b.name)));
      setIsAdding(false);
      setNewName("");
    } else {
      alert("Gagal menambahkan barber: " + result.error);
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {isAdding ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {isAdding ? "Batal" : "Tambah Barber"}
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tambah Barber Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Input 
                placeholder="Nama Barber (misal: Budi)" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="max-w-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddBarber()}
              />
              <Button 
                onClick={handleAddBarber} 
                disabled={loadingId === "new" || !newName.trim()}
              >
                {loadingId === "new" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-surface border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-surface-elevated border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Barber</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {barbers.map((barber) => {
                  const isEditing = editingId === barber.id;

                  return (
                    <tr key={barber.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <Input 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full h-8 px-2 py-1 text-sm bg-background border-input font-bold max-w-xs"
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(barber.id)}
                            autoFocus
                          />
                        ) : (
                          <p className="font-bold text-foreground">{barber.name}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline" className={barber.is_active ? "border-success/50 text-success bg-success/10" : "border-muted-foreground/50 text-muted-foreground bg-muted/10"}>
                          {barber.is_active ? "Aktif" : "Non-Aktif"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleSaveEdit(barber.id)}
                              disabled={loadingId === barber.id}
                            >
                              {loadingId === barber.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Simpan
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => setEditingId(null)}
                              disabled={loadingId === barber.id}
                            >
                              <X className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-muted-foreground hover:text-primary"
                              onClick={() => handleEditClick(barber)}
                              disabled={loadingId === barber.id}
                              title="Edit Barber"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(barber.id)}
                              disabled={loadingId === barber.id}
                              title="Hapus Barber"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              disabled={loadingId === barber.id}
                              onClick={() => handleToggleStatus(barber.id, barber.is_active)}
                              className={barber.is_active ? "text-destructive hover:bg-destructive/10 hover:text-destructive border-border" : "text-success hover:bg-success/10 hover:text-success border-border"}
                            >
                              {loadingId === barber.id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                              ) : null}
                              {barber.is_active ? "Nonaktifkan" : "Aktifkan"}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                
                {barbers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                      Belum ada data barber.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
