# v2 correction QA — 2026-09-16

Scope: correction of the existing personal portfolio using the September 16 audit. This is not a certification of pixel equality or identical motion to Jesper Landberg.

## Evidence

Source visual truth: audit-2026-09-16/01-reference-idle.png, 04-reference-profile.png, 11-reference-full-hover-move.png, 06-reference-project-opening.png.

Implementation: evidence-v2/gallery.png, profile.png, full-hover.png, detail-final.png, detail-scroll-fixed.png, mobile-gallery.png, mobile-detail.png, mobile-profile.png.

Desktop CSS viewport and captured dimensions: 1280×720 on both sides, no density scaling. Mobile: 390×844. Full-view comparisons: evidence-v2/compare-gallery.png, compare-profile.png, compare-hover.png, compare-detail.png. Original full-resolution images were also inspected for ring highlights, hover edges, small labels and close controls.

## Findings, fixes and comparison history

- P1 detached labels: artwork, caption and arrow now share one curved texture. Removed continuous wave phase; velocity deformation settles. Evidence: gallery.png.
- P1 missing hover: implemented enter, pointer tracking, velocity tilt, project switch and exit. Initial clipping of preview images was corrected with explicit inset. Evidence: full-hover.png and full-hover-switched.png.
- P1 profile ring: replaced thin lines with a thick physical material, environmental reflection, pointer tilt, orbiting objects and a screen-space lens band. Iterated from uniform white to excessive amber to a more neutral reflection. Evidence: profile.png.
- P2 repeated detail image: generated a second original asset for every project and added distinct typographic interludes. Evidence: detail-scroll-fixed.png.
- P2 transitions: added opening transform anchored to the selected card and scroll-velocity tilt on right-side content. First iteration broke the fixed close button and sticky description. Removed the persistent transform from the scroll container and moved close outside it. Rechecked after scrolling: close top=34px, information top=51px. Evidence: detail-scroll-fixed.png.
- P2 index density: arranged the three demo projects in centered rows instead of inventing additional projects. Evidence: full-hover.png.

## Required fidelity surfaces

- Fonts/typography: locally bundled Inter; revised index hierarchy, metadata and paragraph leading. Japanese demo copy intentionally differs from the English source.
- Spacing/layout: right image begins at approximately 532px (reference 538px), 50px artwork gaps, larger profile ring, fixed close control. Mobile first image remains visible initially.
- Colors/tokens: black scene, restrained image shading, white detail sheet, neutral metallic reflection derived from artwork.
- Image quality: six original local images. No hotlinks. New images inspected at full size. Pan/zoom/crossfade sequences replace videos in this demo.
- Copy/content: fictional projects marked as concepts; no invented clients, awards, identity or contact details.

## Validation

npm run build succeeded. Desktop: hover, pointer movement, project switch, open, next project, detail scrolling, close, profile and demo contact confirmation. Mobile: gallery, project open/close and profile. Viewport reset. Inspected logs contain shader floating-point precision warnings, but no application errors. No FPS benchmark or multi-hour soak test was performed.

## Intentional demo differences

The imagery is generated still-image sequences, not live-action footage. The ring uses original abstract objects. Whole-scene source distortion is approximated by coordinated card curves, a screen-space lens band and detail-plane tilt, not the same renderer. These limits remain explicit: this is a corrected prototype, not an exact clone. Optical and motion fidelity can be refined further.

final result: passed

## 2026-09-17 curve correction
User screenshots exposed a remaining curve mismatch despite the earlier pass. Replaced vertical displacement with opposing edge expansion/contraction; added matching curved hit regions, corrected wheel sensitivity and removed auto-snap. Reference and revised 1280x720 screenshots are in evidence-curve. Click after scrolling opened the corresponding Form / Future detail. Foreground floor distortion is attenuated to keep perspective lines restrained. This supersedes the earlier gallery-curvature assessment.

