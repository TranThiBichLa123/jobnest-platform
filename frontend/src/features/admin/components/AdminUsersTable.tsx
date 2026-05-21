import { BiLock, BiLockOpen } from "react-icons/bi";
import AdminStatusBadge from "@/features/admin/components/AdminStatusBadge";
import { AdminUser } from "@/shared/types/admin";

type Props = {
  users: AdminUser[];
  loadingId: number | null;
  onBlock: (user: AdminUser) => void;
  onUnblock: (user: AdminUser) => void;
};

function isBlocked(user: AdminUser) {
  const status = String(user.status || "").toUpperCase();
  return status === "BLOCKED" || status === "SUSPENDED";
}

export default function AdminUsersTable({
  users,
  loadingId,
  onBlock,
  onUnblock,
}: Props) {
  return (
    <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-5 py-4 text-left">User</th>
              <th className="px-5 py-4 text-left">Role</th>
              <th className="px-5 py-4 text-left">Status</th>
              <th className="px-5 py-4 text-left">Created</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map((user) => {
              const blocked = isBlocked(user);

              return (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/60">
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {user.username || "Unknown"}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </td>

                  <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300">
                    {user.role}
                  </td>

                  <td className="px-5 py-4">
                    <AdminStatusBadge value={user.status} />
                  </td>

                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {blocked ? (
                      <button
                        onClick={() => onUnblock(user)}
                        disabled={loadingId === user.id}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-60"
                      >
                        <BiLockOpen />
                        Unblock
                      </button>
                    ) : (
                      <button
                        onClick={() => onBlock(user)}
                        disabled={loadingId === user.id || user.role === "ADMIN"}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50"
                      >
                        <BiLock />
                        Block
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="p-10 text-center">
          <h3 className="font-bold text-gray-900 dark:text-white">
            No users found
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            User accounts will appear here.
          </p>
        </div>
      )}
    </div>
  );
}