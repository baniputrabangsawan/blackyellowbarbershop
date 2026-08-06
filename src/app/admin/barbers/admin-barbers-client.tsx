/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { updateBarberStatus } from "@/actions/admin-barbers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export function AdminBarbersClient({ initialBarbers }: { initialBarbers: any[] }) {
  const [barbers, setBarbers] = useState(initialBarbers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

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

  return (
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
              {barbers.map((barber) => (
                <tr key={barber.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground">{barber.name}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="outline" className={barber.is_active ? "border-success/50 text-success bg-success/10" : "border-muted-foreground/50 text-muted-foreground bg-muted/10"}>
                      {barber.is_active ? "Aktif" : "Non-Aktif"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
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
                  </td>
                </tr>
              ))}
              
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
  );
}
