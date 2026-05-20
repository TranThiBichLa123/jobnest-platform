import { server } from "@/config/env";

export const DEFAULT_COMPANY_LOGO = "/images/default-company.jpg";
export const DEFAULT_JOB_IMAGE = "/images/default-job.png";

export function getSafeCompanyLogoSrc(logoUrl?: string | null) {
  if (!logoUrl || logoUrl.trim() === "") return DEFAULT_COMPANY_LOGO;

  const value = logoUrl.trim();

  if (value.includes("example.com")) return DEFAULT_COMPANY_LOGO;

  if (value.startsWith("/uploads")) {
    return `${server}${value}`;
  }

  if (value.startsWith("/")) return value;

  if (value.startsWith("https://res.cloudinary.com")) return value;

  return DEFAULT_COMPANY_LOGO;
}

export function getSafeJobImageSrc(imageUrl?: string | null) {
  if (!imageUrl || imageUrl.trim() === "") return DEFAULT_JOB_IMAGE;

  const value = imageUrl.trim();

  if (value.includes("example.com")) return DEFAULT_JOB_IMAGE;

  if (value.startsWith("/uploads")) {
    return `${server}${value}`;
  }

  if (value.startsWith("/")) return value;

  if (value.startsWith("https://res.cloudinary.com")) return value;

  return DEFAULT_JOB_IMAGE;
}