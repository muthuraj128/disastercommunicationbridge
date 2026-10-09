import type { EmergencyReport, ReliefResource, Shelter, MatchRecommendation } from '../../types/dcb';

export class ReliefMatchingEngine {
  private static calculateDistanceKm(
    lat1: number | null, 
    lon1: number | null, 
    lat2: number | null, 
    lon2: number | null
  ): number {
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
      return 15.0;
    }

    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  public static matchResourcesForReport(
    report: EmergencyReport,
    resources: ReliefResource[]
  ): MatchRecommendation[] {
    const recommendations: MatchRecommendation[] = [];

    for (const resource of resources) {
      if (!resource.isAvailable || resource.availableCapacity <= 0) {
        continue;
      }

      const distanceKm = this.calculateDistanceKm(
        report.location.latitude,
        report.location.longitude,
        resource.location.latitude,
        resource.location.longitude
      );

      const isMedicalNeed = report.category === 'medical';
      const isMedicalResource = resource.resourceType === 'medical_kit' || resource.resourceType === 'ambulance';
      const medicalConstraintPassed = !isMedicalNeed || isMedicalResource;

      const capacitySatisfied = resource.availableCapacity >= report.peopleAffected;

      let categoryMatchScore = 0.5;
      if (report.category === 'rescue' && resource.resourceType === 'rescue_boat') categoryMatchScore = 1.0;
      if (report.category === 'medical' && isMedicalResource) categoryMatchScore = 1.0;
      if (report.category === 'food_water' && (resource.resourceType === 'food_rations' || resource.resourceType === 'water_liters')) categoryMatchScore = 1.0;
      if (report.category === 'shelter' && resource.resourceType === 'shelter_bed') categoryMatchScore = 1.0;

      const severityWeightMap = { critical: 1.0, high: 0.75, medium: 0.5, low: 0.25 };
      const severityScore = severityWeightMap[report.severity] || 0.5;

      const distanceScore = Math.max(0, 1 - distanceKm / 30);
      const capacityScore = Math.min(1.0, resource.availableCapacity / Math.max(1, report.peopleAffected));

      let totalScore =
        (severityScore * 35) +
        (distanceScore * 30) +
        (categoryMatchScore * 20) +
        (capacityScore * 15);

      if (!medicalConstraintPassed) {
        totalScore *= 0.3;
      }

      const scoreFormatted = Math.round(totalScore);

      let rationale = `Match Score ${scoreFormatted}/100. `;
      if (categoryMatchScore === 1.0) {
        rationale += `Exact category match (${resource.resourceType.replace('_', ' ')} for ${report.category}). `;
      }
      rationale += `Located ${distanceKm} km away. `;
      rationale += capacitySatisfied
        ? `Capacity (${resource.availableCapacity}) satisfies ${report.peopleAffected} people affected. `
        : `Partial capacity (${resource.availableCapacity}/${report.peopleAffected}). `;
      if (isMedicalNeed && !isMedicalResource) {
        rationale += `⚠️ Hard constraint warning: Non-medical resource for medical emergency.`;
      }

      recommendations.push({
        resource,
        score: scoreFormatted,
        matchRationale: rationale,
        distanceKm,
        medicalConstraintPassed,
        capacitySatisfied
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  public static matchSheltersForReport(
    report: EmergencyReport,
    shelters: Shelter[]
  ): MatchRecommendation[] {
    const recommendations: MatchRecommendation[] = [];

    for (const shelter of shelters) {
      if (!shelter.isActive) continue;

      const distanceKm = this.calculateDistanceKm(
        report.location.latitude,
        report.location.longitude,
        shelter.location.latitude,
        shelter.location.longitude
      );

      const remainingBeds = shelter.totalCapacity - shelter.currentOccupancy;
      const capacitySatisfied = remainingBeds >= report.peopleAffected;

      const distanceScore = Math.max(0, 1 - distanceKm / 40);
      const capacityScore = remainingBeds > 0 ? Math.min(1.0, remainingBeds / Math.max(1, report.peopleAffected)) : 0;
      const amenityScore = (shelter.hasPower ? 0.33 : 0) + (shelter.hasWater ? 0.33 : 0) + (shelter.hasMedical ? 0.34 : 0);

      const totalScore = Math.round((distanceScore * 40) + (capacityScore * 35) + (amenityScore * 25));

      let rationale = `Shelter Match ${totalScore}/100. ${shelter.name} is ${distanceKm} km away. `;
      rationale += `Remaining capacity: ${remainingBeds} beds (${shelter.currentOccupancy}/${shelter.totalCapacity} occupied). `;
      if (shelter.hasMedical) rationale += `Equipped with on-site medical staff. `;

      recommendations.push({
        shelter,
        score: totalScore,
        matchRationale: rationale,
        distanceKm,
        medicalConstraintPassed: true,
        capacitySatisfied
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }
}
