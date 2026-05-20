"use client";

import { Input, SectionTitle, Select, TagInput } from "./ProfileFormControls";

type Props = {
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  currentPosition: string;
  yearsOfExperience: string;
  skills: string[];
  aboutMe: string;
  setFullName: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  setDateOfBirth: (value: string) => void;
  setGender: (value: string) => void;
  setCurrentPosition: (value: string) => void;
  setYearsOfExperience: (value: string) => void;
  setSkills: (value: string[]) => void;
  setAboutMe: (value: string) => void;
};

export default function CandidateProfileFields(props: Props) {
  return (
    <>
      <SectionTitle title="Personal Information" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Input
          label="Full Name"
          value={props.fullName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            props.setFullName(e.target.value)
          }
        />

        <Input label="Email" value={props.email} disabled />

        <Input
          label="Phone Number"
          value={props.phoneNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            props.setPhoneNumber(e.target.value)
          }
        />

        <Input
          label="Date of Birth"
          type="date"
          value={props.dateOfBirth}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            props.setDateOfBirth(e.target.value)
          }
        />

        <Select
          label="Gender"
          options={["Male", "Female", "Other"]}
          value={props.gender}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            props.setGender(e.target.value)
          }
        />
      </div>

      <SectionTitle title="Experience" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Input
          label="Current Position"
          value={props.currentPosition}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            props.setCurrentPosition(e.target.value)
          }
        />

        <Select
          label="Years of Experience"
          options={["0", "1", "2", "3", "4", "5+"]}
          value={props.yearsOfExperience}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            props.setYearsOfExperience(e.target.value)
          }
        />

        <TagInput
          label="Key Skills"
          placeholder="Add a skill..."
          tags={props.skills}
          setTags={props.setSkills}
        />
      </div>

      <SectionTitle title="About Me" />

      <textarea
        className="mt-4 w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 h-32 focus:outline-none focus:border-cyan-500 transition-colors"
        value={props.aboutMe}
        onChange={(e) => props.setAboutMe(e.target.value)}
      />
    </>
  );
}