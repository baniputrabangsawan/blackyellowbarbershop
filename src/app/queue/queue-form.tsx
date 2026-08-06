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
import { Loader2 } from "lucide-react";

const queueFormSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp tidak valid (min 10 digit)"),
  serviceId: z.string().min(1, "Layanan harus dipilih"),
  branchId: z.string().min(1, "Cabang harus dipilih"),
});

type QueueFormValues = z.infer<typeof queueFormSchema>;

export function QueueForm({ options }: { options: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<QueueFormValues>({
    resolver: zodResolver(queueFormSchema),
    defaultValues: {
      branchId: options.branches[0]?.id || "",
      serviceId: ""
    }
  });

  const onSubmit = async (data: QueueFormValues) => {
    setIsSubmitting(true);
    
    // Cari detail layanan untuk harga
    const selectedService = options.services.find((s: any) => s.id === data.serviceId);
    const serviceName = selectedService?.name || "Layanan Tidak Diketahui";
    const servicePrice = selectedService?.price 
      ? `(Rp ${selectedService.price.toLocaleString("id-ID")})` 
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
    window.location.href = waUrl;
    
    // Tombol akan tetap dalam state loading saat diarahkan ke WA
    setTimeout(() => {
      setIsSubmitting(false);
    }, 5000);
  };

  return (
    <Card className="bg-surface border-border overflow-hidden">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="branchId" className="text-foreground">Cabang</Label>
            <select
              id="branchId"
              {...register("branchId")}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {options.branches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {errors.branchId && <p className="text-sm text-destructive">{errors.branchId.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-foreground">Nama Lengkap</Label>
              <Input
                id="customerName"
                placeholder="Misal: Budi"
                {...register("customerName")}
                className="bg-background border-input"
              />
              {errors.customerName && <p className="text-sm text-destructive">{errors.customerName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Nomor WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Misal: 081234567890"
                {...register("phone")}
                className="bg-background border-input"
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceId" className="text-foreground">Pilih Layanan</Label>
            <select
              id="serviceId"
              {...register("serviceId")}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>-- Pilih Layanan --</option>
              {options.services.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} - Rp {s.price?.toLocaleString("id-ID")}</option>
              ))}
            </select>
            {errors.serviceId && <p className="text-sm text-destructive">{errors.serviceId.message}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary-hover font-semibold py-6 text-base mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Mengalihkan ke WhatsApp...
              </>
            ) : (
              "Ambil Antrean Sekarang"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
