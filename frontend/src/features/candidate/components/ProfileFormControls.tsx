"use client";

import { useState } from "react";

export const Input = ({ label, placeholder, type = "text", ...props }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-all disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-700"
      {...props}
    />
  </div>
);

export const Select = ({ label, options = [], ...props }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    <select
      className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:border-cyan-500 transition-all"
      {...props}
    >
      <option value="">Select...</option>
      {options.map((option: string) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export const SectionTitle = ({ title }: { title: string }) => (
  <div className="mt-8 mb-4">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
      {title}
    </h2>
  </div>
);

export const TagInput = ({ label, placeholder, tags, setTags }: any) => {
  const [input, setInput] = useState("");

  const addTag = () => {
    const next = input.trim();
    if (!next) return;
    if (tags.some((tag: string) => tag.toLowerCase() === next.toLowerCase())) {
      setInput("");
      return;
    }
    setTags([...tags, next]);
    setInput("");
  };

  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      <div className="flex items-center gap-2 border dark:border-gray-600 rounded-lg px-4 py-2.5 dark:bg-gray-700 focus-within:border-cyan-500 transition-all">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="flex-1 outline-none bg-transparent dark:text-white"
        />
        <button
          type="button"
          onClick={addTag}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-1.5 rounded-md"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {tags.map((tag: string, idx: number) => (
          <span
            key={`${tag}-${idx}`}
            className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg flex items-center gap-2 border border-cyan-200 dark:border-cyan-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => setTags(tags.filter((_: string, i: number) => i !== idx))}
              className="font-bold"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};