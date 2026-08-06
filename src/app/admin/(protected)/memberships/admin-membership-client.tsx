/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { updateMembershipStatus } from "@/actions/admin-membership";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function AdminMembershipClient({ initialMemberships }: { initialMemberships: any[] }) {
  const [memberships, setMemberships] = useState(initialMemberships);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (membershipId: string, newStatus: string, durationDays?: number) => {
    setLoadingId(membershipId);
    
    const result = await updateMembershipStatus(membershipId, newStatus, durationDays);
    
    if (result.success) {
      // Optimistically update UI without relying on realtime for MVP to keep it simple
      setMemberships(prev => prev.map(m => {
        if (m.id === membershipId) {
          const updated = { ...m, status: newStatus };
          if (newStatus === "active" && durationDays) {
            updated.activated_at = new Date().toISOString();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + durationDays);
            updated.expires_at = expiresAt.toISOString();
          }
          return updated;
        }
        return m;
      }));
    }
    
    setLoadingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <Badge className="bg-warning/20 text-warning border-warning/30 hover:bg-warning/30">Menunggu Verifikasi</Badge>;
      case 'active': return <Badge className="bg-success/20 text-success border-success/30 hover:bg-success/30">Aktif</Badge>;
      case 'expired': return <Badge variant="outline" className="text-muted-foreground border-border">Kadaluarsa</Badge>;
      case 'suspended': return <Badge variant="outline" className="text-destructive border-destructive/30">Ditangguhkan</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-4">
      {memberships.length === 0 ? (
        <Card className="bg-surface border-border">
          <CardContent className="p-8 text-center text-muted-foreground">
            Belum ada pendaftaran membership.
          </CardContent>
        </Card>
      ) : (
        memberships.map((membership) => {
          return (
            <Card key={membership.id} className="bg-surface border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left Column - Details */}
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg text-foreground">{membership.customer_name}</h3>
                          {getStatusBadge(membership.status)}
                        </div>
                        <p className="text-xs font-mono text-muted-foreground">{membership.code}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Phone size={14} className="mr-2" />
                        <span className="text-foreground">{membership.phone}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <CalendarDays size={14} className="mr-2" />
                        <span>Mendaftar: </span>
                        <span className="text-foreground ml-1">
                          {format(new Date(membership.joined_at), 'dd MMM yyyy', { locale: localeId })}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Paket: </span>
                        <span className="font-medium text-foreground">{membership.membership_plans?.name}</span>
                      </div>
                      
                      {membership.status === 'active' && membership.expires_at && (
                        <div>
                          <span className="text-muted-foreground">Berlaku s/d: </span>
                          <span className="font-medium text-primary">
                            {format(new Date(membership.expires_at), 'dd MMM yyyy', { locale: localeId })}
                          </span>
                        </div>
                      )}
                      
                      {membership.birth_date && (
                        <div>
                          <span className="text-muted-foreground">Tgl Lahir: </span>
                          <span className="font-medium text-foreground">
                            {format(new Date(membership.birth_date), 'dd MMM yyyy', { locale: localeId })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Column - Actions */}
                  <div className="p-6 md:w-64 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-border bg-surface-elevated/50 shrink-0">
                    {loadingId === membership.id ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        {membership.status === 'pending' && (
                          <>
                            <Button 
                              onClick={() => handleStatusChange(membership.id, 'active', membership.membership_plans?.duration_days)} 
                              className="w-full bg-success text-white hover:bg-success/90"
                            >
                              Aktifkan
                            </Button>
                            <Button 
                              onClick={() => handleStatusChange(membership.id, 'suspended')} 
                              variant="outline" 
                              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                            >
                              Tolak
                            </Button>
                          </>
                        )}
                        
                        {membership.status === 'active' && (
                          <>
                            <Button 
                              onClick={() => handleStatusChange(membership.id, 'suspended')} 
                              variant="outline" 
                              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                            >
                              Tangguhkan
                            </Button>
                          </>
                        )}
                        
                        {(membership.status === 'suspended' || membership.status === 'expired') && (
                          <Button 
                            onClick={() => handleStatusChange(membership.id, 'active', membership.membership_plans?.duration_days)} 
                            className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
                          >
                            Aktifkan Kembali
                          </Button>
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
