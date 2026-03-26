/**
 * Build values shaped like Gmail API `users.settings.filters` (`Schema$Filter`).
 * Types come from `googleapis`; there are no API calls here.
 */

import type { GmailFilter } from "./types.js";

export function formatDoesNotHaveTheWord(phrases: readonly string[]): string {
  const out: string[] = [];
  for (const raw of phrases) {
    const p = raw.trim();
    if (!p) continue;
    if (p.includes(" ")) out.push(`"${p}"`);
    else out.push(p);
  }
  if (out.length === 0) {
    throw new Error(
      "at least one keep phrase is required for the archive rule",
    );
  }
  return out.join(" ");
}
/** Gmail search fragment for `criteria.query` / `criteria.negatedQuery` (OR of `from:` atoms). */
function gmailSearchQueryFromAddresses(addresses: readonly string[]): string {
  const trimmed = addresses.map((a) => a.trim()).filter(Boolean);
  if (trimmed.length === 0) {
    throw new Error("at least one from address or pattern is required");
  }
  const atoms = trimmed.map((raw) => {
    const local = raw.startsWith("@") ? raw.slice(1) : raw;
    return `from:${local}`;
  });
  return atoms.length === 1 ? atoms[0]! : `(${atoms.join(" OR ")})`;
}

/**
 * Two `Schema$Filter` values: label matching senders; then archive + mark read except when
 * `keepInInboxPhrases` match (`negatedQuery`).
 */
export function generateGmailFilters(params: {
  fromAddresses: readonly string[];
  addLabel: string;
  keepInInboxIfHasPhrases: readonly string[];
}): GmailFilter[] {
  const fromAddresses = params.fromAddresses
    .map((a) => a.trim())
    .filter(Boolean);
  if (fromAddresses.length === 0) {
    throw new Error("at least one from address or pattern is required");
  }
  const keep = params.keepInInboxIfHasPhrases
    .map((p) => p.trim())
    .filter(Boolean);
  if (keep.length === 0) {
    throw new Error(
      "at least one keep phrase is required for the archive rule",
    );
  }

  const query = gmailSearchQueryFromAddresses(fromAddresses);
  const negatedQuery = formatDoesNotHaveTheWord(keep);

  return [
    {
      criteria: { query },
      action: { addLabelIds: [params.addLabel] },
    },
    {
      criteria: { query, negatedQuery },
      action: {
        addLabelIds: [params.addLabel],
        removeLabelIds: ["INBOX", "UNREAD"],
      },
    },
  ];
}
