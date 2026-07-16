# C J Jewellery — project rules

Permanent rules for anyone (human or AI) working on this codebase. Follow these on every change, not just the initial build.

## Brand and content

- Always write the brand name as **C J Jewellery** — never "CJ Jewellery", "C.J. Jewellery" or "CJ Jewellry".
- Use UK English throughout (jewellery, personalised, colour, favourite, etc.).
- Use `cmjosephs@gmail.com` as the only enquiry contact. Never display a telephone number.
- Preserve the £8–£30 general price guidance. Never invent a fixed price list or per-item prices.
- Preserve the UK delivery wording. Never invent delivery costs or delivery times — cost and timing are confirmed per enquiry.
- Never display Celia's age, school, home address or personal telephone number, or any detail that could reveal where she can be found.
- Do not invent products, materials, reviews, testimonials, discounts or claims (e.g. "master jeweller", "luxury", "award-winning").
- Do not imply C J Jewellery owns or operates a physical jewellery shop. Any AI-generated or styled jewellery-shop-setting imagery is supporting brand atmosphere only, never evidence of a shop, showroom or particular materials (e.g. gemstones) being sold.
- Never add a shop, basket, checkout or payment system unless a human explicitly requests it in that session. This is a showcase-and-enquiry site, not a store.
- Use genuine supplied product photography prominently. Never fabricate a product photo (e.g. earrings) that wasn't supplied — use restrained typography/line art instead where no photo exists.

## Design direction

- This is an elegant, animated handmade boutique site — contemporary, editorial, warm. Not corporate, not a generic template, not a stack of white cards, not a traditional dark high-street jeweller.
- Maintain the established art direction: the blush/powder-blue watercolour from the logo, pearls, circular beads, fine clasps, soft translucency, the "bracelet thread" motif.
- Avoid generic equal-width card grids as the default layout tool. Prefer editorial, asymmetric composition.
- Avoid excessive rounded rectangles — this is not a SaaS dashboard.
- Respect `prefers-reduced-motion` everywhere motion is added: provide a static/simplified equivalent, never make motion the only way to reach content.
- Test both desktop and mobile layouts after any material design or CSS change — don't assume a desktop fix also works at 375px.

## Technical

- Static site built with Vite + vanilla JS + GSAP/ScrollTrigger. No React, no Tailwind, no server/database.
- Keep `npm run dev`, `npm run build` and `npm run preview` working.
- Keep the production build a plain static output that can be uploaded to any normal web host.
