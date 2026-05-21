"use client";

import { usePathname } from "next/navigation";
import ResponsiveNav from "@/shared/components/Navbar/ResponsiveNav";
import Footer from "@/features/home/components/Footer/Footer";
import ScrollToTop from "@/shared/components/Helper/ScrollToTop";

export default function AppChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <ResponsiveNav />
      <main>{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
}