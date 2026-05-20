import api, { getApiErrorMessage } from "@/shared/api/http";
import {
  CandidateProfile,
  CandidateProfileRequest,
} from "@/shared/types/profile";
import { CandidateCV } from "@/shared/types/cv";

export const candidateProfileApi = {
  getMyProfile: async (): Promise<CandidateProfile> => {
    const response = await api.get("/candidate/profile");
    return response.data;
  },

  updateMyProfile: async (
    data: CandidateProfileRequest
  ): Promise<CandidateProfile> => {
    const response = await api.put("/candidate/profile", data);
    return response.data;
  },

  uploadAvatar: async (
    file: File
  ): Promise<{ avatarUrl: string; message: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/candidate/profile/avatar", formData);
    return response.data;
  },
};

function buildCVFormData(
  fileFieldName: "file" | "cvFile",
  data: {
    file: File;
    title?: string;
    isDefault?: boolean;
  }
) {
  const formData = new FormData();
  formData.append(fileFieldName, data.file);

  if (data.title?.trim()) {
    formData.append("title", data.title.trim());
  }

  formData.append("isDefault", String(Boolean(data.isDefault)));
  return formData;
}

export const cvApi = {
  getMyCVs: async (): Promise<CandidateCV[]> => {
    const response = await api.get("/candidate/cvs");
    return response.data;
  },

  getCVById: async (cvId: number): Promise<CandidateCV> => {
    const response = await api.get(`/candidate/cvs/${cvId}`);
    return response.data;
  },

  getDefaultCV: async (): Promise<CandidateCV | null> => {
    const response = await api.get("/candidate/cvs/default");
    return response.data;
  },

  uploadCV: async (data: {
    file: File;
    title?: string;
    isDefault?: boolean;
  }): Promise<CandidateCV> => {
    try {
      const response = await api.post(
        "/candidate/cvs/upload",
        buildCVFormData("file", data)
      );
      return response.data;
    } catch (firstError) {
      try {
        const retryResponse = await api.post(
          "/candidate/cvs/upload",
          buildCVFormData("cvFile", data)
        );
        return retryResponse.data;
      } catch (retryError) {
        throw new Error(getApiErrorMessage(retryError, "Failed to upload CV."));
      }
    }
  },

  updateCV: async (
    cvId: number,
    data: Partial<{
      title: string;
      isDefault: boolean;
    }>
  ): Promise<CandidateCV> => {
    const response = await api.put(`/candidate/cvs/${cvId}`, data);
    return response.data;
  },

  deleteCV: async (cvId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/candidate/cvs/${cvId}`);
    return response.data;
  },

  setDefaultCV: async (cvId: number): Promise<CandidateCV> => {
    const response = await api.post(`/candidate/cvs/${cvId}/set-default`);
    return response.data;
  },
};