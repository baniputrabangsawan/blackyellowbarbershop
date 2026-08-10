/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ChevronDown, Check } from "lucide-react";

const queueFormSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp tidak valid (min 10 digit)"),
  serviceId: z.string().min(1, "Layanan harus dipilih"),
  branchId: z.string().min(1, "Cabang harus dipilih"),
});

type QueueFormValues = z.infer<typeof queueFormSchema>;

export function QueueForm({ options, initialServiceId }: { options: any, initialServiceId?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<QueueFormValues>({
    resolver: zodResolver(queueFormSchema),
    defaultValues: {
      branchId: options.branches[0]?.id || "",
      serviceId: initialServiceId || ""
    }
  });

  const selectedServiceId = watch("serviceId");
  const selectedService = options.services.find((s: any) => s.id === selectedServiceId);

  const onSubmit = async (data: QueueFormValues) => {
    setIsSubmitting(true);
    
    // Cari detail layanan untuk harga
    const selectedServiceData = options.services.find((s: any) => s.id === data.serviceId);
    const serviceName = selectedServiceData?.name || "Layanan Tidak Diketahui";
    const servicePrice = selectedServiceData?.price 
      ? `(Rp ${selectedServiceData.price.toLocaleString("id-ID")})` 
      : "";

    // Template Pesan WA
    const message = `Halo Admin Black Yellow Barbershop, saya ingin mendaftar antrean dengan rincian berikut:

Nama: ${data.customerName}
No. WA: ${data.phone}
Layanan: ${serviceName} ${servicePrice}

Mohon info cara pembayarannya. Terima kasih.`;

    const waNumber = "6281142209979";
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    
    // Redirect ke WhatsApp
    window.location.assign(waUrl);
    
    // Tombol akan tetap dalam state loading saat diarahkan ke WA
    setTimeout(() => {
      setIsSubmitting(false);
    }, 5000);
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-2xl overflow-visible" style={{ overflow: "visible" }}>
      <div className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="branchId" className="text-foreground font-medium">Cabang</Label>
            <select
              id="branchId"
              {...register("branchId")}
              className="flex w-full items-center justify-between rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {options.branches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {errors.branchId && <p className="text-sm text-destructive">{errors.branchId.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-foreground font-medium">Nama Lengkap</Label>
              <Input
                id="customerName"
                placeholder="Misal: Budi"
                {...register("customerName")}
                className="bg-background"
              />
              {errors.customerName && <p className="text-sm text-destructive">{errors.customerName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-medium">Nomor WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Misal: 081234567890"
                {...register("phone")}
                className="bg-background"
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-foreground font-medium">Pilih Layanan</Label>
            
            {/* Minimalist Select Dropdown */}
            <div className="relative">
              <button 
                type="button" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex w-full items-center justify-between rounded-md border ${errors.serviceId ? 'border-destructive' : 'border-input'} bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors`}
              >
                {selectedService ? (
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-foreground">{selectedService.name}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      Rp {selectedService.price?.toLocaleString("id-ID")} • {selectedService.duration_minutes} Menit
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-- Pilih Layanan --</span>
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground opacity-50" />
              </button>
              
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                  <div className="relative z-50 mt-2 w-full overflow-y-visible rounded-md border border-border bg-popover text-popover-foreground shadow-sm animate-in slide-in-from-top-2 duration-150">
                    <div className="p-1">
                      {options.services.map((s: any) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setValue("serviceId", s.id, { shouldValidate: true });
                            setIsDropdownOpen(false);
                          }}
                          className={`relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm py-2 px-3 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${selectedServiceId === s.id ? "bg-accent/50" : ""}`}
                        >
                          <div className="flex flex-col items-start text-left">
                            <span className={`font-medium ${selectedServiceId === s.id ? "text-primary" : ""}`}>
                              {s.name}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5">
                              Rp {s.price?.toLocaleString("id-ID")} • {s.duration_minutes} Menit
                            </span>
                          </div>
                          {selectedServiceId === s.id && (
                            <Check className="h-4 w-4 text-primary ml-3 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {errors.serviceId && <p className="text-sm text-destructive">{errors.serviceId.message}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full rounded-md font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengalihkan ke WhatsApp...
              </>
            ) : (
              "Ambil Antrean Sekarang"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
