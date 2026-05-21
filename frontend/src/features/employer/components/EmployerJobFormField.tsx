import { ReactNode } from "react";

type BaseProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

export function EmployerJobFormField({ label, error, children }: BaseProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      {children}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-600";

export const textareaClass =
  "w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-600 resize-none";