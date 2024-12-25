import * as Sentry from "@sentry/nextjs";
import { XMLParser } from "fast-xml-parser";

import {
  findChildren,
  parseBundles,
  parseCooking,
  parseCrafting,
  parseFishing,
  parseGeneral,
  parseMonsters,
  parseMuseum,
  parsePerfection,
  parseShipping,
  parseSocial,
  parsePowers,
} from "@/lib/parsers";
import { GetListOrEmpty, getAllFarmhands } from "@/lib/utils";
import { parseNotes } from "./parsers/notes";
import { parseScraps } from "./parsers/scraps";
import { parseWalnuts } from "./parsers/walnuts";

const semverSatisfies = require("semver/functions/satisfies");
const semverCoerce = require("semver/functions/coerce");

export function parseSaveFile(xml: string) {
  const parser = new XMLParser({ ignoreAttributes: false });
  let saveFile: any = null;
  try {
    saveFile = parser.parse(xml);
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(
        "Invalid file uploaded. Couldn't parse XML. Please upload a valid Stardew Valley save file.",
      );
    } else throw e;
  }

  try {
    let versionString: string = "";
    if (!saveFile.SaveGame.gameVersion) {
      versionString = "1.4.5"; // assume 1.4.5 if gameVersion is not present
    } else {
      versionString = saveFile.SaveGame.gameVersion.toString();
    }

    const version = semverCoerce(versionString).version;

    // make sure game version is at least 1.5.0
    if (!semverSatisfies(version, ">=1.5.0 <1.7")) {
      throw new Error(
        `Game version ${version} is not supported. stardew.app currently only supports the Stardew Valley 1.5 and 1.6 updates.`,
      );
    }

    // Now we can begin parsing the save file
    let players: any[] = [];

    // searches for all players in the save file and returns an array
    // objects are unprocessed and will be used to parse each player's data
    players = getAllFarmhands(saveFile.SaveGame);

    const parsedBundles = parseBundles(
      saveFile.SaveGame.bundleData,
      saveFile.SaveGame.locations.GameLocation.find(
        (obj: any) => Object.entries(obj).some(([k, v]) => k.endsWith(':type') && v == 'CommunityCenter'),

      ),
      version,
    );
    
    const parsedMuseum = parseMuseum(
      saveFile.SaveGame.locations.GameLocation.find(
        (obj: any) => Object.entries(obj).some(([k, v]) => k.endsWith(':type') && v == 'LibraryMuseum'),
      ),
      version,
    );

    const parsedWalnuts = parseWalnuts(saveFile.SaveGame);

    // obelisks and golden clock
    const parsedPerfection = parsePerfection(saveFile.SaveGame);

    // Map of uniqueMultiplayerID to array of children names
    const children = findChildren(saveFile.SaveGame);

    let processedPlayers: any[] = [];

    // get the saveGame.player's mailReceived, mailForTomorrow, mailbox so we don't
    // have to recompute it for each player
    const hostMailReceived = new Set<string>(
      GetListOrEmpty(saveFile.SaveGame.player.mailReceived, "string"),
    );
    const hostMailForTomorrow = new Set<string>(
      GetListOrEmpty(saveFile.SaveGame.player.mailForTomorrow, "string"),
    );
    const hostMailbox = new Set<string>(
      GetListOrEmpty(saveFile.SaveGame.player.mailbox, "string"),
    );

    players.forEach((player) => {
      // in here is where we'll call all our parsers and create the player object we'll use
      let processedPlayer = {
        _id: player.UniqueMultiplayerID,
        general: parseGeneral(
          player,
          saveFile.SaveGame.whichFarm.toString(),
          version,
        ),
        bundles: parsedBundles,
        fishing: parseFishing(player, version),
        cooking: parseCooking(player, version),
        crafting: parseCrafting(player),
        shipping: parseShipping(player, version),
        museum: parsedMuseum,
        social: parseSocial(
          player,
          children,
          saveFile.SaveGame.farmerFriendships
            ? saveFile.SaveGame.farmerFriendships
            : null,
        ),
        monsters: parseMonsters(player),
        walnuts: parsedWalnuts,
        notes: parseNotes(player),
        scraps: parseScraps(player),
        perfection: parsedPerfection,
        powers: parsePowers(
          player,
          version,
          saveFile.SaveGame.player.UniqueMultiplayerID.toString(),
          hostMailReceived,
          hostMailForTomorrow,
          hostMailbox,
        ),
      };
      processedPlayers.push(processedPlayer);
    });

    // processedPlayers.forEach((p) =>
    //   console.log(`Player: ${p.general.name} | powers:`, p.powers.collection),
    // );

    // // there isn't a powers column in our database yet
    // throw new Error("Not Implemented");

    return processedPlayers;
  } catch (e) {
    Sentry.captureException(e);
    throw new Error(`${e}`);
  }
}
