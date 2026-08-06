import { getAdminServices } from "@/actions/admin-services";
import { AdminServicesClient } from "./admin-services-client";
import { Scissors } from "lucide-react";

export const metadata = {
  title: "Kelola Layanan | Admin",
};

export default async function AdminServicesPage() {
  const services = await getAdminServices();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Scissors size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kelola Layanan</h1>
          <p className="text-muted-foreground text-sm">Atur harga dan status layanan barbershop</p>
        </div>
      </div>

      <AdminServicesClient initialServices={services} />
    </div>
  );
}
