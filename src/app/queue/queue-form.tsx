"use client";
import type { Service, Branch } from "@/types";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronDown, Check } from "lucide-react";

// Mapping nomor WhatsApp per cabang (berdasarkan nama cabang)
const BRANCH_WA_NUMBERS: Record<string, string> = {
  makassar: "62811424428",
  gowa: "62811424427",
};

/**
 * Mencocokkan slug dari query param ke service ID dari database.
 * Slug format: "bronze-cuts" → match ke service dengan nama "Bronze Cuts".
 */
function matchServiceBySlug(services: Service[], slug: string): string | undefined {
  if (!slug) return undefined;

  // Normalisasi slug menjadi lowercase tanpa tanda hubung untuk perbandingan
  const normalizedSlug = slug.toLowerCase().replace(/-/g, " ");

  const matched = services.find(
    (s: Service) => s.name.toLowerCase() === normalizedSlug
  );

  return matched?.id;
}

/**
 * Mendapatkan nomor WA berdasarkan nama cabang.
 * Melakukan pencocokan partial — jika nama cabang mengandung "makassar" → nomor makassar, dst.
 * Fallback ke nomor Makassar jika tidak ada kecocokan.
 */
function getWhatsAppNumber(branchName: string): string {
  const name = branchName.toLowerCase();

  for (const [keyword, number] of Object.entries(BRANCH_WA_NUMBERS)) {
    if (name.includes(keyword)) {
      return number;
    }
  }

  // Fallback ke nomor Makassar
  return BRANCH_WA_NUMBERS.makassar;
}

const queueFormSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp tidak valid (min 10 digit)"),
  serviceId: z.string().min(1, "Layanan harus dipilih"),
  branchId: z.string().min(1, "Cabang harus dipilih"),
});

type QueueFormValues = z.infer<typeof queueFormSchema>;

export function QueueForm({
  options,
  initialServiceSlug,
}: {
  options: { branches: Branch[], services: Service[] };
  initialServiceSlug?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Cocokkan slug dari URL ke service ID dari database
  const matchedServiceId = initialServiceSlug
    ? matchServiceBySlug(options.services, initialServiceSlug)
    : undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QueueFormValues>({
    resolver: zodResolver(queueFormSchema),
    defaultValues: {
      branchId: options.branches[0]?.id || "",
      serviceId: matchedServiceId || "",
    },
  });

  const selectedServiceId = watch("serviceId");
  const selectedBranchId = watch("branchId");
  const selectedService = options.services.find(
    (s: Service) => s.id === selectedServiceId
  );
  const selectedBranch = options.branches.find(
    (b: Branch) => b.id === selectedBranchId
  );

  // Jika matchedServiceId berubah (misal: navigasi ulang), update form value
  useEffect(() => {
    if (matchedServiceId) {
      setValue("serviceId", matchedServiceId, { shouldValidate: true });
    }
  }, [matchedServiceId, setValue]);

  const onSubmit = async (data: QueueFormValues) => {
    setIsSubmitting(true);

    // Cari detail layanan dan cabang
    const serviceData = options.services.find(
      (s: Service) => s.id === data.serviceId
    );
    const branchData = options.branches.find(
      (b: Branch) => b.id === data.branchId
    );

    const serviceName = serviceData?.name || "Layanan Tidak Diketahui";
    const servicePrice = serviceData?.price
      ? `(Rp ${serviceData.price.toLocaleString("id-ID")})`
      : "";
    const branchName = branchData?.name || "Cabang Tidak Diketahui";

    // Template Pesan WA — menyertakan layanan dan cabang
    const message = `Halo Admin Black Yellow Barbershop, saya ingin mendaftar antrean dengan rincian berikut:

Nama: ${data.customerName}
No. WA: ${data.phone}
Cabang: ${branchName}
Layanan: ${serviceName} ${servicePrice}

Mohon info cara pembayarannya. Terima kasih.`;

    // Nomor WA dinamis berdasarkan cabang yang dipilih
    const waNumber = getWhatsAppNumber(branchName);
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

    // Redirect ke WhatsApp
    window.location.assign(waUrl);

    // Tombol akan tetap dalam state loading saat diarahkan ke WA
    setTimeout(() => {
      setIsSubmitting(false);
    }, 5000);
  };

  return (
    <div
      className="bg-surface border border-border rounded-xl shadow-2xl overflow-visible"
      style={{ overflow: "visible" }}
    >
      <div className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="branchId" className="text-foreground font-medium">
              Cabang
            </Label>
            <select
              id="branchId"
              {...register("branchId")}
              className="flex w-full items-center justify-between rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {options.branches.map((b: Branch) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.branchId && (
              <p className="text-sm text-destructive">
                {errors.branchId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="customerName"
                className="text-foreground font-medium"
              >
                Nama Lengkap
              </Label>
              <Input
                id="customerName"
                placeholder="Misal: Budi"
                {...register("customerName")}
                className="bg-background"
              />
              {errors.customerName && (
                <p className="text-sm text-destructive">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-medium">
                Nomor WhatsApp
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Misal: 081234567890"
                {...register("phone")}
                className="bg-background"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-foreground font-medium">
              Pilih Layanan
            </Label>

            {/* Minimalist Select Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex w-full items-center justify-between rounded-md border ${errors.serviceId ? "border-destructive" : "border-input"} bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors`}
              >
                {selectedService ? (
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-foreground">
                      {selectedService.name}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      Rp{" "}
                      {selectedService.price?.toLocaleString("id-ID")} •{" "}
                      {selectedService.duration_minutes} Menit
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    -- Pilih Layanan --
                  </span>
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
                      {options.services.map((s: Service) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setValue("serviceId", s.id, {
                              shouldValidate: true,
                            });
                            setIsDropdownOpen(false);
                          }}
                          className={`relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm py-2 px-3 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${selectedServiceId === s.id ? "bg-accent/50" : ""}`}
                        >
                          <div className="flex flex-col items-start text-left">
                            <span
                              className={`font-medium ${selectedServiceId === s.id ? "text-primary" : ""}`}
                            >
                              {s.name}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5">
                              Rp {s.price?.toLocaleString("id-ID")} •{" "}
                              {s.duration_minutes} Menit
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

            {errors.serviceId && (
              <p className="text-sm text-destructive">
                {errors.serviceId.message}
              </p>
            )}
          </div>

          {/* Indikator layanan & cabang yang dipilih */}
          {selectedService && selectedBranch && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
              <p className="font-medium text-foreground">
                Ringkasan Antrean:
              </p>
              <p className="text-muted-foreground mt-1">
                <span className="text-foreground font-medium">{selectedService.name}</span>
                {" "}di cabang{" "}
                <span className="text-foreground font-medium">{selectedBranch.name}</span>
              </p>
            </div>
          )}

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
