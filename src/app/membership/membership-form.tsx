/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { createMembership } from "@/actions/membership";
import { Loader2, CheckCircle2 } from "lucide-react";

const membershipFormSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp tidak valid (min 10 digit)"),
  planId: z.string().min(1, "Pilih salah satu paket"),
  birthDate: z.string().optional(),
  consent: z.literal(true, {
    message: "Anda harus menyetujui syarat & ketentuan privasi"
  })
});

type MembershipFormValues = z.infer<typeof membershipFormSchema>;

export function MembershipForm({ plans }: { plans: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      planId: plans.length > 0 ? plans[0].id : "",
    }
  });

  const selectedPlanId = watch("planId");

  const onSubmit = async (data: MembershipFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("customerName", data.customerName);
    formData.append("phone", data.phone);
    formData.append("planId", data.planId);
    if (data.birthDate) {
      formData.append("birthDate", data.birthDate);
    }

    const result = await createMembership(formData);
    
    if (result.error) {
      setError(result.error);
    } else if (result.success && result.data) {
      setSuccessData(result.data);
    }
    
    setIsSubmitting(false);
  };

  if (successData) {
    return (
      <Card className="bg-surface border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-success" />
        <CardContent className="p-10 text-center flex flex-col items-center">
          <CheckCircle2 className="text-success w-16 h-16 mb-6" />
          <h3 className="text-2xl font-bold mb-2">Pendaftaran Berhasil!</h3>
          <p className="text-muted-foreground mb-6">
            Terima kasih {successData.customer_name}. Pengajuan membership Anda telah kami terima dan sedang dalam proses verifikasi (Pending).
          </p>
          <div className="bg-background p-4 rounded-lg w-full max-w-xs border border-border mb-6">
            <p className="text-sm text-muted-foreground mb-1">Kode Referensi Anda</p>
            <p className="font-mono text-2xl font-bold text-primary">{successData.code}</p>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Silakan tunjukkan kode ini kepada kasir kami pada kunjungan berikutnya untuk aktivasi dan pembayaran (jika ada).
          </p>
          <Button onClick={() => window.location.assign("/")} variant="outline" className="rounded-full px-8">
            Kembali ke Beranda
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-border overflow-hidden">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md border border-destructive/20 flex items-start">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold">1. Pilih Paket Membership</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setValue("planId", plan.id, { shouldValidate: true })}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedPlanId === plan.id 
                      ? "border-primary bg-primary/5 ring-1 ring-primary" 
                      : "border-border hover:border-primary/50 bg-background"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{plan.name}</h4>
                    <span className="text-primary font-bold">
                      {plan.price ? `Rp ${plan.price.toLocaleString('id-ID')}` : 'Gratis'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {plan.benefits?.map((benefit: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="text-primary">•</span> {benefit}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">Masa berlaku: {plan.duration_days} Hari</p>
                </div>
              ))}
            </div>
            {errors.planId && <p className="text-sm text-destructive">{errors.planId.message}</p>}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">2. Data Diri</h3>
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
              
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-foreground">Tanggal Lahir (Opsional)</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register("birthDate")}
                  className="bg-background border-input"
                />
                {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="consent" 
                onCheckedChange={(checked: boolean | "indeterminate") => setValue("consent", (checked === true) as true, { shouldValidate: true })}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="consent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                >
                  Syarat & Ketentuan
                </label>
                <p className="text-sm text-muted-foreground">
                  Saya setuju bahwa data di atas digunakan untuk keperluan membership Black Yellow Barbershop sesuai dengan Kebijakan Privasi.
                </p>
                {errors.consent && <p className="text-sm text-destructive mt-1">{errors.consent.message}</p>}
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary-hover font-semibold py-6 text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Memproses Pendaftaran...
              </>
            ) : (
              "Daftar Membership"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
