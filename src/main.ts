#!/usr/bin/env node
/**
 * Emit XML under public/: {@link generateGmailFilters} → API-shaped filters → import XML.
 */

import { join } from "node:path";
import { generateGmailFilters } from "./generateGmailFilters.js";
import { toGmailImportXml } from "./toGmailImportXml.js";
import { writeTextFile } from "./lib/io.js";

export const publicDir = "public";

const allegroFilters = generateGmailFilters({
  addLabel: "Allegro",
  fromAddresses: ["@allegro.pl", "@allegromail.pl"],
  keepInInboxIfHasPhrases: [
    "czeka na odbiór",
    "gotowa do odbioru",
    "czeka na Ciebie",
    "czekają na Ciebie",
    "przypomnienie o odbiorze",
    "zwrot",
    "opłacenie",
    "nie udała",
    "anulowany",
  ],
});

const aliexpressFilters = generateGmailFilters({
  addLabel: "Aliexpress",
  fromAddresses: ["@aliexpress.com", "@notice.aliexpress.com"],
  keepInInboxIfHasPhrases: ["ready for pickup"],
});

writeTextFile(
  join(publicDir, "allegro.xml"),
  toGmailImportXml("Allegro filters", allegroFilters),
);
writeTextFile(
  join(publicDir, "aliexpress.xml"),
  toGmailImportXml("Aliexpress filters", aliexpressFilters),
);
