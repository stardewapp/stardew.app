#!/usr/bin/env python3

# Purpose: to parse Objects.json from the content folder and keep relevant information
# Result is saved to data/objects.json
# { itemID: { name, description, category, iconURL } }
#
# Content Files used: Objects.json, Strings/Objects.json, Strings/StringsFromCSFiles.json
# Wiki Pages used: None

from tqdm import tqdm

from helpers.models import Object, ContentObjectModel
from helpers.utils import (
    load_content,
    load_strings,
    save_json,
    getCategoryName,
    get_string,
)

# Room for improvement since we don't use a vast majority of things in the game
# could eventually only save the items we use
skip = set(["925", "927", "929", "930"])  # have descriptions but no use or image

# hardcoded names for objects whose names don't include enough information
# strange dolls name doesn't include the color
# dried fruit and mushroom names are only "Dried"
nameOverrides = {
    "126": "Strange Doll (green)",
    "127": "Strange Doll (yellow)",
    "DriedFruit": "Dried Fruit",
    "DriedMushroom": "Dried Mushroom",
}

descriptionOverrides = {
    "DriedFruit": "Chewy pieces of dried fruit."
}

# load the content files
OBJECTS: dict[str, ContentObjectModel] = load_content("Objects.json")
# SPRITES: dict[str, str] = load_content("sprites.json")
OBJ_STRINGS: dict[str, str] = load_strings("Objects.json")
STRINGS: dict[str, str] = load_strings("StringsFromCSFiles.json")
STRINGS_1_6: dict[str, str] = load_strings("1_6_Strings.json")

# alpha didn't include new content so we can use it to flag new content
ALPHA_OBJ: dict[str, ContentObjectModel] = load_content("Objects.json", "1.6 alpha")


def get_objects() -> dict[str, Object]:
    output: dict[str, Object] = {}
    for key, value in tqdm(OBJECTS.items()):
        if key in skip:
            continue

        if key in nameOverrides:
            name = nameOverrides[key]
        else:
            name = get_string(value["DisplayName"])

        if key in descriptionOverrides:
            description = descriptionOverrides[key]
        else:
            description = get_string(value["Description"])
            
        category = getCategoryName(
            Type=value["Type"],
            Category=value["Category"],
            StringsFromCSFiles=STRINGS,
            Strings_1_6=STRINGS_1_6,
        )
        # iconURL = SPRITES.get(key)

        minVersion = "1.5.0" if key in ALPHA_OBJ else "1.6.0"

        output[key] = {
            "category": category,
            "description": description,
            # "iconURL": iconURL, # As of 3.0.0, we now have the CDN link to the images
            "minVersion": minVersion,
            "name": name,
        }

    return output


if __name__ == "__main__":
    output = get_objects()
    save_json(output, "objects.json", sort=True)
