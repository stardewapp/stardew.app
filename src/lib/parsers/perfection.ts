export interface PerfectionRet {
  numObelisks?: number;
  goldenClock?: boolean;
  perfectionWaivers?: number;
}

export const parsePerfection = (
  SaveGame: any,
): PerfectionRet => {
  let numObelisks = 0;
  let goldenClock = false;
  let perfectionWaivers = 0;
  // StardewValley.Utitility.cs::numObelisksOnFarm()
  const obelisks = new Set([
    "Water Obelisk",
    "Earth Obelisk",
    "Desert Obelisk",
    "Island Obelisk",
  ]);

  try {
    perfectionWaivers = SaveGame.perfectionWaivers ?? 0;

    // loop through every building looking for obelisks and golden clock
    // shared between all players on the farm

    // For now, we'll only look in the GameLocation named "Farm", if this is wrong, we'll fix it later
    for (const location of SaveGame.locations.GameLocation) {
      if (!(Object.entries(location).some(([k, v]) => k.endsWith(':type') && v == 'Farm'))) continue;

      if (!location.buildings)
        return { numObelisks, goldenClock, perfectionWaivers };

      // check to see if there are multiple buildings
      if (Array.isArray(location.buildings.Building)) {
        for (const building of location.buildings.Building) {
          if (obelisks.has(building.buildingType)) {
            // check if building is done being built
            if (building.daysOfConstructionLeft <= 0) numObelisks++;
          } else if (building.buildingType === "Gold Clock") {
            // check if building is done being built
            if (building.daysOfConstructionLeft <= 0) goldenClock = true;
          }
        }
      } else {
        // only one building
        const building = location.buildings.Building;
        if (obelisks.has(building.buildingType)) {
          // check if building is done being built
          if (building.daysOfConstructionLeft <= 0) numObelisks++;
        } else if (building.buildingType === "Gold Clock") {
          // check if building is done being built
          if (building.daysOfConstructionLeft <= 0) goldenClock = true;
        }
      }

      return { numObelisks, goldenClock, perfectionWaivers };
    }
  } catch (err) {
    if (err instanceof Error)
      throw new Error(`Error in parsePerfection: ${err.message}`);
    throw new Error(`Error in parsePerfection: ${err}`);
  }

  return { numObelisks, goldenClock, perfectionWaivers };
};
