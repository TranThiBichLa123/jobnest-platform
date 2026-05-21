export default function MyJobsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-36 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse"
        />
      ))}
    </div>
  );
}