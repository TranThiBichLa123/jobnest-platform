"use client";

type Props = {
  avatarUrl: string | null;
  imageError: boolean;
  avatarUploading: boolean;
  username?: string;
  onImageError: () => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function CandidateAvatarUpload({
  avatarUrl,
  imageError,
  avatarUploading,
  username,
  onImageError,
  onAvatarChange,
}: Props) {
  return (
    <div className="flex items-center gap-6 mb-8 pb-6 border-b dark:border-gray-700">
      {!imageError && avatarUrl ? (
        <img
          src={avatarUrl}
          width={90}
          height={90}
          alt="avatar"
          className="w-[90px] h-[90px] rounded-full border-4 border-cyan-100 dark:border-cyan-900 object-cover shadow-md"
          onError={onImageError}
        />
      ) : (
        <div className="w-[90px] h-[90px] rounded-full border-4 border-cyan-100 dark:border-cyan-900 bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center text-white text-3xl font-bold shadow-md">
          {username?.[0]?.toUpperCase() || "U"}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Profile Photo
        </h2>

        <label className="cursor-pointer inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm">
          {avatarUploading ? "Uploading..." : "Change Avatar"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onAvatarChange}
            disabled={avatarUploading}
          />
        </label>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          JPG, PNG, WEBP, GIF. Max 2MB.
        </p>
      </div>
    </div>
  );
}