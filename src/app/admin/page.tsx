import type { Metadata } from "next";
import CombinedAdminApp from "@/components/combined-admin-app";

export const metadata: Metadata = {
  title: "Admin · Helios Queue",
  description: "Manage the combined Amazfit Helios strap waitlist queue.",
};

export default function AdminPage() {
  return <CombinedAdminApp />;
}
