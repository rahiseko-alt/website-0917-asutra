# Design QA — 3D PBL submission desk

final result: passed

## Submission-desk conversion — 2026-09-20

The 3D portfolio visual language remains the selected source of truth: black full-screen gallery, curved image cards, corner navigation, and the white project-sheet detail view. The content and main interaction were converted from a personal portfolio to an AI Business College web-assignment submission desk.

- `LOCAL INSIGHT`, `NAGOYA INBOUND`, and `VENTURE LAB` replace the demo project titles and map to PBL-01 through PBL-03.
- The project sheet now contains the primary workflow: student ID, student name, and public website URL are required before creating the correctly formatted `mailto:` submission (`【WEB提出】課題ID｜学籍番号｜氏名`).
- The form prepares the email only; it does not send mail automatically. The established Gmail-to-Sheets monitor remains the receiving workflow.
- Captured and inspected in the in-app browser: featured gallery and `#featured/project/local-insight` detail state at desktop size. The submission panel, labels, required fields, and primary mail action are visible and readable.
- `npm run build` passed; `npm run test:sites` passed 4/4 after the conversion.

No P0/P1/P2 visual or interaction defect was found in the inspected desktop submission flow.

Scope: reference-led local prototype with the user's explicitly requested generated demo imagery. This is not a pixel-identical reproduction, nor a claim of reproducing the original author's source code. Reference imagery, personal identity, awards, and business claims were replaced with fictional demo content.

## Source visual truth

- Source URL: https://jesperlandberg.com/ (2026-09-15).
- `../evidence/source-desktop.png` — 740×600.
- `../evidence/source-mobile.png` — 390×844.
- `../evidence/source-detail-mobile.png` — 390×844.
- Source interactions inspected in the in-app browser: desktop horizontal gallery, profile, full index, newsletter panel (not submitted), project detail and its internal scroll; mobile vertical gallery, profile, project detail.
- Observed font: ABCDiatypePlusVariable. Replaced with locally bundled Inter Variable.

## Implementation evidence

- Development preview: http://127.0.0.1:4173/
- Built-file preview, using the supplied Node static server: http://127.0.0.1:4174/
- `../evidence/implementation-desktop.png` — 740×600, generated Solstice card in featured view.
- `../evidence/implementation-mobile.png` — 390×844, vertical circulating gallery.
- `../evidence/implementation-detail-mobile.png` — 390×844, Solstice detail.
- `../evidence/implementation-full.png`, `implementation-profile.png`, `implementation-profile-mobile.png`, `implementation-detail.png` record additional states. Early profile screenshot records the initial issue; final mobile profile records corrected header visibility and ring sizing.
- CSS viewports equal screenshot pixel dimensions; no device-density rescaling. Cyclic gallery phase and image contents differ, so comparison judges layout and interaction pattern rather than pixel equality.
- Combined comparisons opened and inspected: `../evidence/comparison-desktop.png`, `comparison-mobile.png`, `comparison-detail-mobile.png`.
- Small navigation inspected additionally with browser DOM styles and full-resolution state screenshots. Source desktop navigation is approximately 5px at 740px width; implementation deliberately uses a 9px minimum and larger hit targets. No additional crop required to diagnose this documented substitution.

## Findings and iteration history

### First pass — corrected

- P2: PROFILE text remained visible behind CLOSE. Hide the background control while the dialog is open. Subsequent screenshot shows only CLOSE; keyboard cycle tested.
- P2: Profile ring too large on desktop. Reduced desktop portal from 85vh to 70vh and narrowed torus thickness. Mobile retains an edge-reaching circular presentation.
- P2: Desktop background grid too sparse and too axis-aligned. Increased grid subdivisions and rotated the plane; raised baseline panel curvature. Re-captured built implementation and inspected combined desktop comparison.
- P2: Initial mobile view had only three finite cards and no circulating experience. Added repeated card sets with cycle-preserving scroll repositioning; tested two-page scroll and captured the final mobile comparison.
- P2: Native scrollbars narrowed the mobile image area. Hidden visual scrollbars while retaining scrolling; the content remains inside 390 CSS px.
- P2: Mobile metadata pushed the first image too far down. Compacted metadata and spacing; final combined detail comparison shows the first image close to the reference's vertical position, with additional demo disclosure retained.
- P2: Closing details after an index selection could return to featured. Added explicit parent view to project hashes; verified `#full → #full/project/solstice → #full` with Escape.
- P2: Arrow-key movement did not move focus to the shown card. Synchronized focus with selection; verified Right then Enter opens Form / Future in the built preview.

### Final fidelity review

- Fonts/typography: Inter Variable is consistent; source-style compact navigation retained with intentional minimum readable size. Japanese descriptive copy wraps without truncation. Names remain placeholders as requested for a demo.
- Spacing/layout: black full-screen gallery, central curved panel, clipped adjacent panels, perspective ground grid, corner navigation, centered text index, white inset project detail and mobile vertical presentation are present. Mobile first-image spacing was corrected. No horizontal document overflow at 390px.
- Colors/tokens: black background, white foreground, low-contrast ground plane, pale project sheet. Accent colors originate in the original generated images.
- Images: all three generated images loaded successfully in the browser; no source hotlinks. Card aspect ratios/crops are consistent. Source video motion is replaced by static generated project covers, intentionally.
- Copy/content: no third-party accomplishments or identity copied. Demo projects and non-sending contact form are explicitly identified. Identity and contact details live in one editable file.

## Behavior verification

- Desktop wheel scroll changes visible project; drag changes project without accidentally opening it.
- Arrow keys update selection/focus; Enter opens the selected project.
- Featured/full switching, project opening, next project, Escape closing, full-index return.
- Profile open/close, Tab cycling remains within the dialog.
- Mobile gallery circulation, images, detail display, close control, profile content.
- Contact demo accepts a valid email and displays an explicit local-only confirmation; no external submission.
- Browser console error/warning capture: empty in the final built-preview check.
- `npm run build`: passed. Vite notes a large JS chunk (~736kB uncompressed / 200kB gzip), primarily Three.js.
- `npm run test:sites`: 4/4 passed. These test static serving/package behavior, not visual fidelity.
- Supplied `scripts/local-preview.mjs` serves the built app successfully on loopback.

## Remaining P3 / limits

- The profile ring is a simplified custom shader, not the reference's exact refraction and surrounding 3D objects.
- Original project videos are not reproduced. The three new images intentionally replace them.
- Low-end physical devices, screen readers and OS reduced-motion settings were not exercised in this browser session; fallback/reduced-motion behavior is implemented but not claimed as device-tested.
- No FPS or Lighthouse score is claimed. Further optimization can lazy-load Three.js and compress the original PNGs if this prototype is prepared for publication.
- No live newsletter service, public hosting, real identity or real contact address is configured.

## Checklist

- [x] Source and implementation captured and visually compared together.
- [x] Desktop and mobile primary states verified.
- [x] P0/P1/P2 findings resolved within the demo adaptation scope.
- [x] Built artifact, source, prompts and restart instructions saved.
