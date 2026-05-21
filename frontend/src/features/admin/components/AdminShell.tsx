"use client";

import AdminSidebar from "@/features/admin/components/AdminSidebar";
import AdminTopbar from "@/features/admin/components/AdminTopbar";

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function AdminShell({ title, description, children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />

      <main className="lg:pl-72">
        <div className="px-4 md:px-8 py-6">
          <AdminTopbar title={title} description={description} />
          {children}
        </div>
      </main>
    </div>
  );
}