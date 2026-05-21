import { BiBriefcase } from "react-icons/bi";
import { BsBookmark, BsEye } from "react-icons/bs";

export type MyJobsTab = "applied" | "saved" | "viewed";

type Props = {
  activeTab: MyJobsTab;
  counts: Record<MyJobsTab, number>;
  onChange: (tab: MyJobsTab) => void;
};

const tabs = [
  { key: "applied" as const, label: "Applications", icon: BiBriefcase },
  { key: "saved" as const, label: "Saved Jobs", icon: BsBookmark },
  { key: "viewed" as const, label: "Viewed Jobs", icon: BsEye },
];

export default function MyJobsTabs({ activeTab, counts, onChange }: Props) {
  return (
    <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-2 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                active
                  ? "bg-cyan-700 text-white shadow"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Icon className="text-lg" />
                {tab.label}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}