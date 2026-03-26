/**
 * Gmail **Settings → Filters → Import filters** Atom/XML (`apps:property`).
 * Builds XML from `googleapis` {@link gmail_v1.Schema$Filter} shapes using **xmlbuilder2**.
 *
 * @see https://developers.google.com/gmail/api/guides/migrate-from-email-settings
 */

import { create } from "xmlbuilder2";
import type { GmailFilter } from "./types.js";
import {
  XMLSerializedAsObject,
  XMLSerializedAsObjectArray,
} from "xmlbuilder2/lib/interfaces.js";

const ATOM_NS = "http://www.w3.org/2005/Atom";
const APPS_NS = "http://schemas.google.com/apps/2006";

/** One `<apps:property>` inside a filter `<entry>`. */
type GmailAppsProperty = Readonly<{
  name: string;
  value: string;
}>;

function apiCriteriaQueryToXmlFromField(query: string): string {
  const q = query.trim();
  const inner =
    q.startsWith("(") && q.endsWith(")") ? q.slice(1, -1).trim() : q;
  const orParts = inner.split(/\s+OR\s+/i).map((p) => p.trim());
  const xmlParts: string[] = [];
  for (const part of orParts) {
    const m = /^from:(.+)$/i.exec(part);
    if (!m) {
      throw new Error(
        `cannot map API criteria.query to XML "from" field (expected from:… OR from:…): ${query}`,
      );
    }
    const host = m[1]!.trim();
    xmlParts.push(host.startsWith("@") ? host : `@${host}`);
  }
  return xmlParts.join(" OR ");
}

/**
 * Maps a narrow subset of API filters (as produced by {@link createGmailFilters}) to import XML properties.
 */
function gmailApiFilterToImportProperties(
  filter: GmailFilter,
): GmailAppsProperty[] {
  const { criteria, action } = filter;
  if (!criteria || !action) {
    throw new Error(
      "Schema$Filter must include criteria and action for XML export",
    );
  }

  const props: GmailAppsProperty[] = [];

  if (criteria.from) {
    props.push({ name: "from", value: criteria.from });
  } else if (criteria.query) {
    props.push({
      name: "from",
      value: apiCriteriaQueryToXmlFromField(criteria.query),
    });
  } else {
    throw new Error(
      "Schema$Filter needs criteria.from or criteria.query for XML export",
    );
  }

  const labelRef = action.addLabelIds?.[0];
  if (!labelRef) {
    throw new Error("Schema$Filter needs action.addLabelIds[0] for XML export");
  }
  props.push({ name: "label", value: labelRef });

  props.push({ name: "sizeOperator", value: "s_sl" });
  props.push({ name: "sizeUnit", value: "s_smb" });

  if (criteria.negatedQuery) {
    props.push({ name: "doesNotHaveTheWord", value: criteria.negatedQuery });
  }

  const remove = action.removeLabelIds ?? [];
  if (remove.includes("UNREAD")) {
    props.push({ name: "shouldAlwaysMarkAsRead", value: "true" });
  }
  if (remove.includes("INBOX")) {
    props.push({ name: "shouldArchive", value: "true" });
  }

  return props;
}

export function toGmailImportXml(
  title: string,
  filters: readonly GmailFilter[],
): string {
  const doc = create({ version: "1.0", encoding: "UTF-8" })
    .ele("feed", { xmlns: ATOM_NS, "xmlns:apps": APPS_NS })
    .ele("title")
    .txt(title)
    .up();

  for (const filter of filters) {
    const entry = doc.ele("entry");
    entry.ele("category", { term: "filter" }).up();
    entry.ele("title").txt("Mail Filter").up();
    for (const p of gmailApiFilterToImportProperties(filter)) {
      entry.ele("apps:property", { name: p.name, value: p.value }).up();
    }
    entry.up();
  }

  return doc.end({ prettyPrint: true });
}
