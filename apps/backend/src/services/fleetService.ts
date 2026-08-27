import prisma from '../prismaClient';
import { createLogger } from '../logger';
import { Prisma } from '@prisma/client';

const logger = createLogger('fleetService');

export interface CreateVehicleInput {
  tenantId: string;
  vehicleTypeId?: string | null;
  plateNumber: string;
  vin?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
}

export async function createVehicle(input: CreateVehicleInput) {
  try {
    const vehicle = await prisma.vehicle.create({ data: input as Prisma.VehicleCreateInput });
    return vehicle;
  } catch (error) {
    logger.error('createVehicle failed', { error, input });
    throw error;
  }
}

export async function listVehicles(tenantId: string) {
  try {
    return await prisma.vehicle.findMany({ where: { tenantId } });
  } catch (error) {
    logger.error('listVehicles failed', { error, tenantId });
    throw error;
  }
}

export async function updateVehicle(id: string, data: Partial<CreateVehicleInput>) {
  try {
    return await prisma.vehicle.update({ where: { id }, data: data as Prisma.VehicleUpdateInput });
  } catch (error) {
    logger.error('updateVehicle failed', { error, id, data });
    throw error;
  }
}

export async function deleteVehicle(id: string) {
  try {
    await prisma.vehicle.delete({ where: { id } });
    return true;
  } catch (error) {
    logger.error('deleteVehicle failed', { error, id });
    throw error;
  }
}
