
// ==================== Auth Types ====================
export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ==================== Domain Types ====================
export interface Domain {
  id: number;
  domain_name: string;
  created_at: string;
  updated_at: string;
}

export interface DomainForm {
  domain_name: string;
}

// ==================== Tech Lead Types ====================
export interface TechLead {
  id: number;
  domain_id: number;
  tech_lead_name: string;
  domain_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TechLeadForm {
  domain_id: number;
  tech_lead_name: string;
}

// ==================== Status Types ====================
export interface Status {
  id: number;
  status_name: string;
  created_at: string;
}

export interface StatusForm {
  status_name: string;
}

// ==================== Project Types ====================
export type Complexity = "simple" | "medium" | "complex";

export interface Project {
  id: number;
  project_name: string;
  project_type?: string;
  project_details?: string;
  project_commercial_name?: string;
  tech_lead_id: number;
  tech_lead_name?: string;
  complexity: Complexity;
  status_id: number;
  status_name?: string;
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectForm {
  project_name: string;
  project_type?: string;
  project_details?: string;
  project_commercial_name?: string;
  tech_lead_id: number;
  complexity: Complexity;
  status_id: number;
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
}

// ==================== Commercial Types ====================
export interface ProjectCommercial {
  id: number;
  project_id: number;
  project_name?: string;
  mrc: number;
  otc: number;
  ps_cost: number;
  ps_mandays: number;
  contract_term: number;
  total_contract_value: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCommercialForm {
  project_id: number;
  mrc: number;
  otc: number;
  ps_cost: number;
  ps_mandays: number;
  contract_term: number;
}

// ==================== Project Update Types ====================
export interface ProjectUpdateRecord {
  id: number;
  project_id: number;
  project_name?: string;
  update_details: string;
  status_id: number;
  status_name?: string;
  update_date: string;
  created_at: string;
}

export interface ProjectUpdateForm {
  project_id: number;
  update_details: string;
  status_id: number;
}

