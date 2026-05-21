import api from "@/shared/api/http";
import { Company, CreateCompanyRequest } from "@/shared/types/employer";
import { PageResponse } from "@/features/jobs/api";

export const companyApi = {
  getTopCompanies: async (): Promise<Company[]> => {
    const response = await api.get("/companies/top");
    return response.data;
  },

  getMyCompanies: async (
    page = 0,
    size = 20
  ): Promise<PageResponse<Company>> => {
    const response = await api.get("/companies/my", {
      params: { page, size },
    });

    return response.data;
  },

  createCompany: async (data: CreateCompanyRequest): Promise<Company> => {
    const response = await api.post("/companies", data);
    return response.data;
  },

  uploadVerificationDocument: async (
    companyId: number,
    file: File
  ): Promise<Company> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      `/companies/${companyId}/verification-document`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};