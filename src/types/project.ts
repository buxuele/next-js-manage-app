export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  url: string;
  path: string;
  image?: string;
  created_at: number;
  updated_at: number;
}

export interface ProjectFormData {
  name: string;
  description: string;
  url: string;
  path: string;
  image?: File;
}

export interface ProjectStatus {
  id: string;
  isOnline: boolean;
  isChecking: boolean;
}
