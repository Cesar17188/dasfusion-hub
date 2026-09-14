export type ProjectPhase = 'discovery' | 'design' | 'development' | 'qa_testing' | 'delivered';
export type ProjectStatus = 'on_track' | 'at_risk' | 'delayed' | 'completed' | 'paused';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type ProjectCategory = 
  | 'Fullstack Web' 
  | 'Mobile App' 
  | 'AI & Machine Learning' 
  | 'Cloud & DevOps' 
  | 'SaaS & Enterprise' 
  | 'Automation & Bots';

export interface ProjectRequirement {
  id: string;
  title: string;
  completed: boolean;
  priority?: 'must_have' | 'nice_to_have';
}

export interface TeamMember {
  name: string;
  role: string;
  avatar?: string;
}

export interface ClientProject {
  id: string;
  userId?: string;
  title: string;
  description: string;
  category: ProjectCategory;
  phase: ProjectPhase;
  status: ProjectStatus;
  priority: ProjectPriority;
  progressPercentage: number;
  budget?: number;
  currency?: 'USD' | 'EUR';
  techStack: string[];
  assignedLead?: string;
  assignedTeam?: TeamMember[];
  startDate: string;
  targetDeliveryDate: string;
  actualDeliveryDate?: string;
  liveUrl?: string;
  repoUrl?: string;
  deliverablesTotal: number;
  deliverablesDone: number;
  requirements?: ProjectRequirement[];
  createdAt: string;
  updatedAt?: string;
}

export interface KanbanColumn {
  id: ProjectPhase;
  title: string;
  description: string;
  badge: string;
  icon: string;
  colorClass: string;
}

export interface PortalMetrics {
  totalProjects: number;
  inDevelopment: number;
  inDiscovery: number;
  inDesign: number;
  inQa: number;
  completed: number;
  averageProgress: number;
  totalDeliverables: number;
  completedDeliverables: number;
}
