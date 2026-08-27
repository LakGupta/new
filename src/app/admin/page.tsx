import type { Metadata } from "next";
import AdminApp from "@/components/admin-app";

export const metadata: Metadata = {
  title: "Admin · Helios Queue",
  description: "Manage the Amazfit Helios strap waitlist queue.",
};

export default function AdminPage() {
  return <AdminApp />;
}
