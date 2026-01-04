# Lost & Found – React UI (Figma export)

This folder is a **ready‑to‑run React + Vite + Tailwind v4** project based on your Figma export.

## Run locally

1) Install **Node.js (LTS)**

2) In this folder:

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal.

## What I fixed / added

- Added missing React dependencies (`react`, `react-dom`) + TypeScript types
- Added a `tsconfig.json` so the project compiles cleanly
- Replaced Figma-only asset imports (`figma:asset/...`) with normal imports from `src/assets`
- Fixed case-sensitive imports used by shadcn components (`./button`, `./input`) by adding:
  - `src/app/components/ui/button.tsx`
  - `src/app/components/ui/input.tsx`
  - `src/app/components/ui/checkbox.tsx`
- Restored your **custom** components (used by the auth screens) in:
  - `src/app/components/ui/Button.tsx`
  - `src/app/components/ui/Input.tsx`
  - `src/app/components/ui/Checkbox.tsx`

## Menus

I added a **Menus** demo page that shows:

- Top navigation (NavigationMenu)
- Sidebar (collapsible)
- Action menubar (filters/sort/actions)

Open the app and click **Menus** in the top navigation.

File: `src/app/components/MenusPage.tsx`
