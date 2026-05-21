import { Job } from "./job";

export interface ViewedJob extends Job {
  viewedAt?: string;
}