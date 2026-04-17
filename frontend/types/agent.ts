export interface Agent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}
