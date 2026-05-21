type Props = {
  coverLetter: string;
  onChange: (value: string) => void;
};

export default function CoverLetterPanel({ coverLetter, onChange }: Props) {
  return (
    <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Cover letter
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Optional, but recommended. Keep it short and relevant to this role.
      </p>

      <textarea
        value={coverLetter}
        onChange={(e) => onChange(e.target.value)}
        maxLength={1200}
        placeholder="Write a short message to the employer..."
        className="mt-5 w-full min-h-[190px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-cyan-500 transition-colors resize-none"
      />

      <div className="mt-2 text-right text-xs text-gray-400">
        {coverLetter.length}/1200
      </div>
    </div>
  );
}