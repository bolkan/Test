# PROBER · Field Console

Technical field-service Web App for MPI TS2000-HP and the TS2000 / TS2000-D / TS2000-DP family.

**Repository:** https://github.com/bolkan/Test

**GitHub Pages (after enabling it):** https://bolkan.github.io/Test/

## Available functions

- High-contrast responsive dashboard and illustrative prober schematic.
- Component explorer with manufacturer page references.
- Full-text search of **all 64 pages** from the four submitted PDFs, with source/page links.
- Guided reference library, without invented equipment commands.
- Family-specific maintenance review checklist with Customer vs MPI Service boundaries.
- Explicit block on treating TS2000 / D / DP maintenance as TS2000-HP maintenance.
- Document viewer, optional local-PDF import, and PDF viewer when originals are placed in the docs directory.
- Local service logbook, JSON export, and PWA offline support.

## Document collection

1. User Manual TS2000-HP, Rev. 2.1, 06/2025: 34 pages.
2. Data Sheet TS2000-HP, 04/2025: 14 pages.
3. Physical Dimensions sheet TS2000-HP: 1 page.
4. Maintenance Manual TS2000 / D / DP, Rev. 1.1, 07/2026: 15 pages.

All **extracted text** is already committed to the repository in data.js. For original pages including illustrations and tables, upload the four PDF files to the docs/ folder, preserving the original names.

A separate ZIP package named PROBER_Test_PDF_originali.zip includes all four PDF originals and a Mac script PUBBLICA_SU_GITHUB.command to clone and upload them via authenticated Git. Alternatively load PDFs locally into the Web App browser.

## Hosting and running

GitHub Pages: Settings → Pages → Build and deployment → Deploy from a branch → main → /(root).

For local development, from the repository root run:

    python3 -m http.server 8080

Then visit http://localhost:8080/.

## Important safety and publication notes

This is **reference software**, NOT a machine-control interface, a certified safety device, or a substitute for site-specific official service procedures. Follow the full original manuals and approved HSE/LOTO controls. The station EMO does not establish that all electrical power is off.

The TS2000 / D / DP maintenance manual does not explicitly apply to TS2000-HP; the app keeps those maintenance tasks separate.

This repository is PUBLIC. The supplied TS2000-HP User Manual displays a **Confidential C** marking and publisher copyright restrictions. Ensure authorization before publishing. Deleting PDF files later does not necessarily delete Git history, clones, archives or copies.
