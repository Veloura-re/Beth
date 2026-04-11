import { prisma } from '../index';

export class CampaignService {
  static async createCampaign(data: {
    name: string;
    description: string;
    budget: number;
    rewardPerScan: number;
    painterMargin: number;
    systemRevenue: number;
    organizationId: string;
  }) {
    return await prisma.campaign.create({
      data: {
        name: data.name,
        description: data.description,
        budget: data.budget || 0,
        rewardPerScan: data.rewardPerScan || 10,
        painterMargin: data.painterMargin || 0.05,
        systemRevenue: data.systemRevenue || 0.25,
        organizationId: data.organizationId,
      },
    });
  }

  static async listCampaigns(organizationId?: string) {
    return await prisma.campaign.findMany({
      where: organizationId ? { organizationId } : {},
      include: { 
        _count: { 
          select: { qrCodes: true, scans: true } 
        } 
      },
    });
  }

  static async getCampaignDetails(id: string, organizationId?: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        _count: { select: { qrCodes: true, scans: true } },
        qrCodes: true,
      }
    });

    if (organizationId && campaign?.organizationId !== organizationId) {
      throw new Error('Access denied');
    }

    return campaign;
  }
}
