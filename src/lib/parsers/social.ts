import villagers from "@/data/villagers.json";

export function findChildren(
  SaveGame: any
): Map<string, number> {
  // for now we only care about the number of children, may have to adjust
  // if we want to include names for some reason
  let children: Map<string, number> = new Map();

  try {
    // loop through every game location looking for children
    for (const location of SaveGame.locations.GameLocation) {
      // check if location has characters
      if (!location.characters) continue;

      // check multiple characters in location
      if (Array.isArray(location.characters.NPC)) {
        // multiple characters in location
        for (const NPC of location.characters.NPC) {
          if (!Object.keys(NPC).some(e => e.endsWith(':type'))) continue;
          if (Object.entries(NPC).some(([k, v]) => k.endsWith(':type') && v == 'Child')) {
            // found a child, increment count, or add to map if not present
            children.set(
              NPC.idOfParent,
              (children.get(NPC.idOfParent) ?? 0) + 1
            );
          }
        }
      } else {
        // only one character in location, check if it's a child
        let NPC = location.characters.NPC;
        if (Object.entries(NPC).some(([k, v]) => k.endsWith(':type') && v == 'Child')) {
          // found a child, increment count, or add to map if not present
          children.set(NPC.idOfParent, (children.get(NPC.idOfParent) ?? 0) + 1);
        }
      }
    }
  } catch (err) {
    if (err instanceof Error)
      throw new Error(`Error in findChildren: ${err.message}`);
    throw new Error(`Error in findChildren: ${err}`);
  }

  return children;
}

interface Relationship {
  points: number;
  status?: string;
}

export interface SocialRet {
  childrenCount?: number;
  houseUpgradeLevel?: number;
  spouse?: string | null;
  relationships: { [key: string]: Relationship };
}

export function parseSocial(
  player: any,
  children: Map<string, number>,
  farmerFriendships?: any
): SocialRet {
  /*
    Achievements Relevant:
      - Moving Up (house upgrade #1).
      - Living Large (house upgrade #2).
      - Full House (married + 2 kids).
      - A New Friend (5 hearts with any NPC).
      - Cliques (5 hearts with 4 NPCs).
      - Networking (5 hearts with 10 NPCs).
      - Popular (5 hearts with 20 NPCs).
      - Best Friends (10 hearts with any NPC).
      - The Beloved Farmer (10 hearts with 8 NPCs).
  */

  if (farmerFriendships) {
    if (Array.isArray(farmerFriendships.item)) {
      for (const idx in farmerFriendships.item) {
        if (farmerFriendships.item[idx].value.Friendship.Status === "Married") {
          player.spouse = "Other player";
        }
      }
    } else {
      if (farmerFriendships.item.value.Friendship.Status === "Married") {
        player.spouse = "Other player";
      }
    }
  }

  let childrenCount = 0;
  let relationships: { [key: string]: Relationship } = {};

  let houseUpgradeLevel: number = player.houseUpgradeLevel;
  let spouse = player.spouse ? player.spouse : undefined;

  // look up the number of children by UniqueMultiplayerID if it exists in children map
  childrenCount = children.get(player.UniqueMultiplayerID) ?? 0;

  // loop through friendshipData to find relationships
  if (!player.friendshipData) {
    return {
      childrenCount,
      houseUpgradeLevel,
      spouse,
      relationships,
    };
  }

  if (Array.isArray(player.friendshipData.item)) {
    // multiple relationships

    for (const idx in player.friendshipData.item) {
      const relationship = player.friendshipData.item[idx];
      const name = relationship.key.string;

      // check if NPC is a valid NPC
      if (!(name in villagers)) continue;
      // TODO: if we need to check children, we can do it here
      const friendshipPoints = relationship.value.Friendship.Points;
      const status = relationship.value.Friendship.Status;

      if (status === "Married" || status === "Dating") {
        relationships[name] = { points: friendshipPoints, status };
      } else {
        relationships[name] = { points: friendshipPoints };
      }
    }
  } else {
    // only one relationship
    const relationship = player.friendshipData.item;
    const name = relationship.key.string;

    // check if NPC is a valid NPC
    if (name in villagers) {
      const friendshipPoints = relationship.value.Friendship.Points;
      const status = relationship.value.Friendship.Status;

      if (status === "Married" || status === "Dating") {
        relationships[name] = { points: friendshipPoints, status };
      } else {
        relationships[name] = { points: friendshipPoints };
      }
    }
  }

  return {
    childrenCount,
    houseUpgradeLevel,
    spouse,
    relationships,
  };
}
