import { prisma } from '../index';

export class OrganizationService {
  static async createOrganization(name: string) {
    return await prisma.organization.create({
      data: { name },
    });
  }

  static async listOrganizations() {
    return await prisma.organization.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { users: true, campaigns: true }
        }
      }
    });
  }

  static async findByName(name: string) {
    return await prisma.organization.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });
  }

  static async findById(id: string) {
    return await prisma.organization.findUnique({
      where: { id }
    });
  }

  static async updateOrganization(id: string, name: string) {
    return await prisma.organization.update({
      where: { id },
      data: { name }
    });
  }

  static async deleteOrganization(id: string) {
    // For now, simple delete, though soft-delete or constraint checks might be safer
    return await prisma.organization.delete({
      where: { id }
    });
  }
}
