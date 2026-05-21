export type MyJobsMessageState = {
  type: "success" | "error" | "info";
  text: string;
};

type Props = {
  message: MyJobsMessageState | null;
};

export default function MyJobsMessage({ message }: Props) {
  if (!message) return null;

  const messageClass =
    message.type === "success"
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
      : message.type === "info"
      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";

  return (
    <div className={`mb-6 rounded-2xl border p-4 text-sm ${messageClass}`}>
      {message.text}
    </div>
  );
}