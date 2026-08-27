import type { Metadata } from "next";
import HistoricalAdminApp from "@/components/historical-admin-app";

export const metadata: Metadata = {
  title: "Historical Queue Admin · Helios Queue",
  description: "Manage the historical queue for people who messaged before the webapp.",
};

export default function HistoricalAdminPage() {
  return <HistoricalAdminApp />;
}
