import { getAdminMemberships } from "@/actions/admin-membership";
import { AdminMembershipClient } from "./admin-membership-client";
import { Users } from "lucide-react";

export const metadata = {
  title: "Kelola Membership | Admin",
};

export default async function AdminMembershipsPage() {
  const memberships = await getAdminMemberships();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kelola Membership</h1>
          <p className="text-muted-foreground text-sm">Setujui dan kelola keanggotaan pelanggan</p>
        </div>
      </div>

      <AdminMembershipClient initialMemberships={memberships} />
    </div>
  );
}
