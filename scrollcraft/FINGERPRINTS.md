# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| `salam-immobilier` | Élévation (architectural building-section grammar) | Minimal top bar + vertical architect's datum rule on left edge (`±0,00` to `+9,80 m`) with climbing level symbol (mobile: sticky WhatsApp dock) | `pin` + 5 independent photographic depth planes (`--sc-p` + fine-pointer parallax) with typography between sky and villa | `pin` (1.6) > `flow` > `pin` WebGL (4.2) > `pan` (3.0) > `flow` reveal on paper > `flow` contact (6 acts, 13.0vh) | Interactive WhatsApp message composer + embedded Google Maps & agency address card | Top-down lotissement blueprint tilts in 3D WebGL, places 4 red-and-white survey bornes, extrudes a two-storey villa and lights its windows at dusk while the datum rule measures elevation | Architectural golden-hour West Africa (red laterite, deep forest `#0D1310`, bone white `#F2EDE3`, terracotta `#E36A32`) | 4510 |

First build in registry (shares 0 columns with prior rows).

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- Grammar: **Élévation** (architectural section levels from ground to roof)
- Nav: Vertical architect datum rule with climbing level marker (`±0,00` to `+9,80`)
- Hero: 5-plane photographic cutout villa with display word behind roofline and foliage foreground
- Shape: `pin > flow > pin (WebGL) > pan > flow (paper) > flow`, 6 acts at 13.0vh
- Close: Live WhatsApp message composer synced with service cards + Google Maps card
- Signature move: WebGL lotissement plan-to-lit-villa extrusion coupled to elevation readout

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
