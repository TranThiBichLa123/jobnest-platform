import { Job } from "@/shared/types/job";
import { splitSkills } from "@/shared/utils/job-format";

export default function JobDescriptionSection({ job }: { job: Job }) {
  const skills = splitSkills(job.skills);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Job Description
      </h2>

      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-8">
        {job.description}
      </p>

      {skills.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Required Skills
          </h2>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 rounded-full bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-800 text-sm font-semibold"
              >
                {skill}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}