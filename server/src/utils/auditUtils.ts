import { Request } from 'express';

export interface AuditInfo {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface UserInfo {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Creates audit info for new records
 */
export const createAuditInfo = (userEmail: string): AuditInfo => {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    createdBy: userEmail,
    updatedAt: now,
    updatedBy: userEmail,
  };
};

/**
 * Updates audit info for existing records
 */
export const updateAuditInfo = (existingAuditInfo: any, userEmail: string): AuditInfo => {
  return {
    ...existingAuditInfo,
    updatedAt: new Date().toISOString(),
    updatedBy: userEmail,
  };
};

/**
 * Creates delete audit info
 */
export const deleteAuditInfo = (existingAuditInfo: any, userEmail: string): AuditInfo => {
  return {
    ...existingAuditInfo,
    updatedAt: new Date().toISOString(),
    updatedBy: userEmail,
    deletedAt: new Date().toISOString(),
    deletedBy: userEmail,
  };
};

/**
 * Gets user email from request (from JWT token)
 */
export const getUserEmailFromRequest = (req: Request): string => {
  return (req as any).user?.email || 'unknown@system.com';
};

/**
 * Gets user ID from request (from JWT token)
 */
export const getUserIdFromRequest = (req: Request): number => {
  return (req as any).user?.id || 0;
};
