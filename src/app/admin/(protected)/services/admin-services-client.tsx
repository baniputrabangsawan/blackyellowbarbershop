/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { updateServiceStatus, updateServiceDetails, deleteService } from "@/actions/admin-services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit2, Save, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AdminServicesClient({ initialServices }: { initialServices: any[] }) {
  const [services, setServices] = useState(initialServices);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Edit State
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", duration: "", price: "" });

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    setLoadingId(serviceId);
    const newStatus = !currentStatus;
    const result = await updateServiceStatus(serviceId, newStatus);
    if (result.success) {
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, is_active: newStatus } : s));
    } else {
      alert("Gagal memperbarui status: " + result.error);
    }
    setLoadingId(null);
  };

  const handleEditClick = (service: any) => {
    setEditingServiceId(service.id);
    setEditForm({
      name: service.name,
      duration: service.duration_minutes.toString(),
      price: service.price?.toString() || "0",
    });
  };

  const handleSaveDetails = async (serviceId: string) => {
    if (!editForm.name || !editForm.duration || !editForm.price) return;
    
    setLoadingId(serviceId);
    const numDuration = parseInt(editForm.duration, 10);
    const numPrice = parseInt(editForm.price.replace(/\D/g, ''), 10);
    
    const result = await updateServiceDetails(serviceId, editForm.name, numDuration, numPrice);
    
    if (result.success) {
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, name: editForm.name, duration_minutes: numDuration, price: numPrice } : s));
      setEditingServiceId(null);
    } else {
      alert("Gagal memperbarui layanan: " + result.error);
    }
    setLoadingId(null);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus layanan ini? Aksi ini tidak dapat dibatalkan.")) return;
    
    setLoadingId(serviceId);
    const result = await deleteService(serviceId);
    
    if (result.success) {
      setServices(prev => prev.filter(s => s.id !== serviceId));
    } else {
      alert("Gagal menghapus layanan: " + result.error);
    }
    setLoadingId(null);
  };

  return (
    <Card className="bg-surface border-border overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-surface-elevated border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground">Layanan</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Durasi (Menit)</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Harga</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-center">Status</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => {
                const isEditing = editingServiceId === service.id;
                
                return (
                  <tr key={service.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <Input 
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full h-8 px-2 py-1 text-sm bg-background border-input font-bold"
                        />
                      ) : (
                        <>
                          <p className="font-bold text-foreground">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.category}</p>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {isEditing ? (
                        <Input 
                          type="number"
                          value={editForm.duration}
                          onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                          className="w-20 h-8 px-2 py-1 text-sm bg-background border-input"
                        />
                      ) : (
                        `${service.duration_minutes} Menit`
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Rp</span>
                          <Input 
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                            className="w-28 h-8 px-2 py-1 text-sm bg-background border-input"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          Rp {service.price?.toLocaleString('id-ID')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className={service.is_active ? "border-success/50 text-success bg-success/10" : "border-muted-foreground/50 text-muted-foreground bg-muted/10"}>
                        {service.is_active ? "Aktif" : "Non-Aktif"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleSaveDetails(service.id)}
                            disabled={loadingId === service.id}
                          >
                            {loadingId === service.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Simpan
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => setEditingServiceId(null)}
                            disabled={loadingId === service.id}
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
                            onClick={() => handleEditClick(service)}
                            disabled={loadingId === service.id}
                            title="Edit Layanan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(service.id)}
                            disabled={loadingId === service.id}
                            title="Hapus Layanan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            disabled={loadingId === service.id}
                            onClick={() => handleToggleStatus(service.id, service.is_active)}
                            className={service.is_active ? "text-destructive hover:bg-destructive/10 hover:text-destructive border-border" : "text-success hover:bg-success/10 hover:text-success border-border"}
                          >
                            {loadingId === service.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : null}
                            {service.is_active ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {services.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Belum ada data layanan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
