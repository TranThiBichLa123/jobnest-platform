type Props = {
  open: boolean;
  title: string;
  description: string;
  loading: boolean;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function MyJobsConfirmDialog({
  open,
  title,
  description,
  loading,
  confirmLabel = "Confirm",
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[50000] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 shadow-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-2xl px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:bg-gray-400"
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}