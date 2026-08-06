/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { updateServiceStatus, updateServicePrice } from "@/actions/admin-services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit2, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AdminServicesClient({ initialServices }: { initialServices: any[] }) {
  const [services, setServices] = useState(initialServices);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>("");

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

  const handleSavePrice = async (serviceId: string) => {
    if (!editPriceValue) return;
    
    setLoadingId(serviceId);
    const numPrice = parseInt(editPriceValue.replace(/\D/g, ''), 10);
    
    const result = await updateServicePrice(serviceId, numPrice);
    
    if (result.success) {
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, price: numPrice } : s));
      setEditingPriceId(null);
    } else {
      alert("Gagal memperbarui harga: " + result.error);
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
                <th className="px-6 py-4 font-medium text-muted-foreground">Durasi</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Harga</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-center">Status</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.category}</p>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {service.duration_minutes} Menit
                  </td>
                  <td className="px-6 py-4">
                    {editingPriceId === service.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Rp</span>
                        <Input 
                          type="number"
                          className="w-28 h-8 px-2 py-1 text-sm bg-background border-input"
                          value={editPriceValue}
                          onChange={(e) => setEditPriceValue(e.target.value)}
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                          onClick={() => handleSavePrice(service.id)}
                          disabled={loadingId === service.id}
                        >
                          {loadingId === service.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingPriceId(null)}
                          disabled={loadingId === service.id}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        Rp {service.price?.toLocaleString('id-ID')}
                        <button 
                          onClick={() => {
                            setEditingPriceId(service.id);
                            setEditPriceValue(service.price?.toString() || "");
                          }}
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                          title="Edit Harga"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="outline" className={service.is_active ? "border-success/50 text-success bg-success/10" : "border-muted-foreground/50 text-muted-foreground bg-muted/10"}>
                      {service.is_active ? "Aktif" : "Non-Aktif"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
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
                  </td>
                </tr>
              ))}
              
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
