
import apiClient from "./client";
import type {
  Domain,
  DomainForm,
  LoginCredentials,
  Project,
  ProjectCommercial,
  ProjectCommercialForm,
  ProjectForm,
  ProjectUpdateForm,
  ProjectUpdateRecord,
  RegisterCredentials,
  Status,
  StatusForm,
  TechLead,
  TechLeadForm,
  TokenResponse,
} from "../types";

// ==================== Auth ====================
export const authApi = {
  login: (data: LoginCredentials) =>
    apiClient.post<TokenResponse>("/api/auth/login", data),
  register: (data: RegisterCredentials) =>
    apiClient.post<TokenResponse>("/api/auth/register", data),
  getMe: () => apiClient.get("/api/auth/me"),
};

// ==================== Domains ====================
export const domainsApi = {
  getAll: () => apiClient.get<Domain[]>("/api/domains"),
  getById: (id: number) => apiClient.get<Domain>(`/api/domains/${id}`),
  create: (data: DomainForm) => apiClient.post<Domain>("/api/domains", data),
  update: (id: number, data: Partial<DomainForm>) =>
    apiClient.put<Domain>(`/api/domains/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/domains/${id}`),
};

// ==================== Tech Leads ====================
export const techLeadsApi = {
  getAll: () => apiClient.get<TechLead[]>("/api/tech-leads"),
  getById: (id: number) => apiClient.get<TechLead>(`/api/tech-leads/${id}`),
  create: (data: TechLeadForm) =>
    apiClient.post<TechLead>("/api/tech-leads", data),
  update: (id: number, data: Partial<TechLeadForm>) =>
    apiClient.put<TechLead>(`/api/tech-leads/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/tech-leads/${id}`),
};

// ==================== Statuses ====================
export const statusesApi = {
  getAll: () => apiClient.get<Status[]>("/api/statuses"),
  getById: (id: number) => apiClient.get<Status>(`/api/statuses/${id}`),
  create: (data: StatusForm) => apiClient.post<Status>("/api/statuses", data),
  update: (id: number, data: Partial<StatusForm>) =>
    apiClient.put<Status>(`/api/statuses/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/statuses/${id}`),
};

// ==================== Projects ====================
export const projectsApi = {
  getAll: () => apiClient.get<Project[]>("/api/projects"),
  getById: (id: number) => apiClient.get<Project>(`/api/projects/${id}`),
  create: (data: ProjectForm) =>
    apiClient.post<Project>("/api/projects", data),
  update: (id: number, data: Partial<ProjectForm>) =>
    apiClient.put<Project>(`/api/projects/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/projects/${id}`),
};

// ==================== Commercials ====================
export const commercialsApi = {
  getAll: () => apiClient.get<ProjectCommercial[]>("/api/commercials"),
  getById: (id: number) =>
    apiClient.get<ProjectCommercial>(`/api/commercials/${id}`),
  getByProject: (projectId: number) =>
    apiClient.get<ProjectCommercial>(`/api/commercials/project/${projectId}`),
  create: (data: ProjectCommercialForm) =>
    apiClient.post<ProjectCommercial>("/api/commercials", data),
  update: (id: number, data: Partial<ProjectCommercialForm>) =>
    apiClient.put<ProjectCommercial>(`/api/commercials/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/commercials/${id}`),
};

// ==================== Project Updates ====================
export const projectUpdatesApi = {
  getAll: () => apiClient.get<ProjectUpdateRecord[]>("/api/project-updates"),
  getById: (id: number) =>
    apiClient.get<ProjectUpdateRecord>(`/api/project-updates/${id}`),
  getByProject: (projectId: number) =>
    apiClient.get<ProjectUpdateRecord[]>(
      `/api/project-updates/project/${projectId}`
    ),
  create: (data: ProjectUpdateForm) =>
    apiClient.post<ProjectUpdateRecord>("/api/project-updates", data),
  update: (id: number, data: Partial<ProjectUpdateForm>) =>
    apiClient.put<ProjectUpdateRecord>(`/api/project-updates/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/project-updates/${id}`),
};

