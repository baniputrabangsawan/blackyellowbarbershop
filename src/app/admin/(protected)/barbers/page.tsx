import { getAdminBarbers } from "@/actions/admin-barbers";
import { AdminBarbersClient } from "./admin-barbers-client";
import { Users } from "lucide-react";

export const metadata = {
  title: "Kelola Barber | Admin",
};

export default async function AdminBarbersPage() {
  const barbers = await getAdminBarbers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kelola Barber</h1>
          <p className="text-muted-foreground text-sm">Atur ketersediaan barber (kapster)</p>
        </div>
      </div>

      <AdminBarbersClient initialBarbers={barbers} />
    </div>
  );
}
