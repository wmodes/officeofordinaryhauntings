#!/usr/bin/env node
/**
 * fetch-ring.js — Office of Ordinary Hauntings
 *
 * Snapshots the member list of the Ghostring webring into js/ring.json, so the
 * site's "Prev" and "Next" links can send visitors to a random member without
 * every visit phoning a third party. Run it before a deploy to refresh the list:
 *
 *   node scripts/fetch-ring.js
 *
 * The list is the ring's own public websites.json. We keep only each site's
 * name and URL, and leave out the ring's index entry and our own site.
 *
 * No dependencies; Node 18+ (built-in fetch).
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SOURCE_URL = 'https://raw.githubusercontent.com/k3rs3d/ghostring/main/websites.json';
const OUTPUT_FILE = path.resolve(__dirname, '..', 'js', 'ring.json');

// Slugs that must never be offered as a random destination: the ring's own
// index page and this site.
const EXCLUDED_SLUGS = new Set(['ghostring', 'ooh']);

/**
 * Reduce the ring's raw member records to what the site needs.
 *
 * @param {Array<Object>} members Parsed contents of the ring's websites.json.
 * @returns {Array<{name: string, url: string}>} Members with a usable https URL.
 */
function toDestinations(members) {
  return members
    .filter((m) => !EXCLUDED_SLUGS.has(m.slug))
    .filter((m) => typeof m.url === 'string' && /^https?:\/\//.test(m.url))
    .map((m) => ({ name: String(m.name || m.slug || m.url), url: m.url }));
}

/** Fetch the member list and write the snapshot. */
async function main() {
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`could not fetch ${SOURCE_URL}: HTTP ${response.status}`);
  }

  const destinations = toDestinations(await response.json());
  if (destinations.length === 0) {
    throw new Error('the ring list came back empty; refusing to overwrite js/ring.json');
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(destinations, null, 1) + '\n');
  console.log(`wrote ${destinations.length} sites to js/ring.json`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
