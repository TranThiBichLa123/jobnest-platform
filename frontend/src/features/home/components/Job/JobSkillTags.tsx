"use client";
import React from "react";

const JobSkillTags = ({ skills }: any) => {
	return (
		<div className="flex-align-center gap-2 mt-2 flex-wrap">
			{skills?.map((skill: string, i: number) => (
				<span
					key={i}
					className="text-muted bg-slate-200 rounded-sm px-2 py-[1px] dark:bg-hover-color sm:text-sm "
				>
					{skill}
				</span>
			))}
		</div>
	);
};

export default JobSkillTags;
