import prisma from '../prismaClient';
import { createLogger } from '../logger';

const logger = createLogger('hrService');

export async function createEmployee(userId: string, tenantId: string, departmentId?: string, roleTitle?: string) {
  try {
    const employee = await prisma.employee.create({ data: { userId, departmentId, roleTitle } });
    return employee;
  } catch (error) {
    logger.error('createEmployee failed', { error, userId, tenantId, departmentId, roleTitle });
    throw error;
  }
}

export async function listEmployees(tenantId: string) {
  try {
    return await prisma.employee.findMany({ where: { user: { tenantId } }, include: { user: true } });
  } catch (error) {
    logger.error('listEmployees failed', { error, tenantId });
    throw error;
  }
}
