import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export default function AdminPageHeader({
  title,
  description,
  actions,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-800 via-slate-900 to-gray-950 p-6 md:p-8 shadow-2xl mb-8">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            {title}
          </h1>

          <p className="mt-3 text-cyan-50/80 max-w-2xl">{description}</p>

          <div className="flex flex-wrap gap-3 mt-6">
            <AdminLink href="/admin">Dashboard</AdminLink>
            <AdminLink href="/admin/users">Users</AdminLink>
            <AdminLink href="/admin/jobs">Jobs</AdminLink>
            <AdminLink href="/admin/companies">Companies</AdminLink>
            <AdminLink href="/admin/applications">Applications</AdminLink>
          </div>
        </div>

        {actions}
      </div>
    </section>
  );
}

function AdminLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors"
    >
      {children}
    </Link>
  );
}