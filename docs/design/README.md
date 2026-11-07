# Design references

## Aurora home feed (Canva)

- Reference image: `canva-home-feed-reference.png`
- Canva design: <https://canva.link/mel04lufnh59y0q>
- Edit: <https://www.canva.com/d/UgvD_IonUKXwa2U>
- View: <https://www.canva.com/d/hMUtd64Xv3aRfx1>

Generated on 2026-11-07 with the Canva MCP server. The live implementation is
`packages/web/src/pages/FeedPage.tsx`; the tokens are in
`packages/web/src/style.css` and `packages/web/tailwind.config.ts`.

The live page keeps the mockup's **layout** — wave hero, composer, two-column
grid, right sidebar — but not its sample content. Every feed slot renders an
honest empty state until the content API exists, so the UI never shows invented
people, posts or trends.

## Component gallery

`/design` is the living style guide: tokens plus every reusable primitive
(Button, Input, Textarea, Card, Badge, Alert, Spinner) in each variant and
state. It is development-only and deliberately absent from the product
navigation.

The Canva export endpoint refused the website-type design, so the committed
image is the 596×335 page thumbnail. The editable design remains in Canva.
