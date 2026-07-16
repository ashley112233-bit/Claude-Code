C J JEWELLERY — WEBSITE README
================================

This folder contains the complete C J Jewellery website. It is a static
showcase-and-enquiry site — no online shop, no database. It is built with
Vite, modern HTML, CSS and vanilla JavaScript, using GSAP for the animated
opening sequence and scroll effects, and Lucide for icons.


1. HOW TO OPEN THE WEBSITE ON A MAC
------------------------------------
Double-click "Open C J Jewellery.command" in this folder.

The first time you run it, it will quietly set up the website (this can
take a minute and only happens once), then it starts a local preview
server and opens the site in your default browser automatically. You do
not need to type anything.

Leave that window open while you're looking at the site — closing it (or
pressing Control+C in it) stops the preview. Run the command file again
any time you want to look at the site.

If macOS shows a security warning the first time you double-click it
(because the file was downloaded rather than created on this Mac),
right-click the file, choose "Open", then confirm "Open" in the dialog.
You only need to do this once.

Note: unlike the very first version of this site, you can no longer just
double-click index.html directly — the site now uses a small build tool
(Vite) so it can use modern JavaScript animation and image handling. The
command file above handles that for you automatically.


2. WHAT CHANGED IN THIS REDESIGN
------------------------------------
This is a full visual and technical redesign, not a re-colouring of the
previous version:

  - A full-screen, slowly animated opening sequence built from four of
    the real supplied photographs, with automatic scene changes, and
    working previous/next, pause/play and progress controls.
  - A transparent header that turns into a soft blurred cream bar once
    you scroll past the opening sequence.
  - An editorial jewellery gallery (an oversized featured photo with
    smaller offset images) instead of a grid of identical cards.
  - An interactive "Made especially for you" bespoke section — visitors
    can try colours, bead styles, clasps, charms and gift presentation,
    and carry their choices straight into the enquiry form. It does not
    calculate a price.
  - A visual "Our Story" section with a large quotation, a real product
    photograph, and an animated timeline.
  - A "How it works" section styled as a bracelet thread running through
    three beads/stages, instead of three plain boxes.
  - A restyled enquiry form with floating labels and soft dividers. It
    keeps every field, all validation, and the same behaviour as before
    (see section 5).
  - All animation respects your device's reduced-motion setting: with
    reduced motion switched on, the opening sequence becomes a static
    first scene and scroll animations are skipped in favour of the
    content simply being visible.

The brand, the product photography, the enquiry form's behaviour, the
price guidance, the delivery wording and the privacy/accessibility
content are all preserved from the previous version — only the visual
design and technical foundation changed.


3. WHERE TO CHANGE THE EMAIL ADDRESS AND WORDING
---------------------------------------------------
  - Page content: everything visible on the page lives in index.html at
    the top of this folder — headings, paragraphs, product descriptions,
    form labels. It's organised with comments like
    "<!-- ============ ENQUIRY ============ -->" to help you find a
    section.
  - Email address: search index.html for "cmjosephs@gmail.com" (it's a
    clickable link and appears in the footer). It is also set once in
    src/main.js, in the line that builds the mailto address.
  - Prices: the price guidance sentence is in the section commented
    "<!-- ============ PRICE STATEMENT ============ -->".
  - Colours and fonts: all brand colours and the two typefaces (Fraunces
    for headings, Manrope for body text) are defined once at the top of
    src/style.css under ":root", so changing a value there updates the
    whole site.
  - After changing index.html, src/style.css or src/main.js, just save
    the file — if the local preview server is running (section 1), the
    site updates in your browser automatically.


4. PLACEHOLDER DOMAIN — MUST BE REPLACED
--------------------------------------------
This version uses a placeholder web address:

    https://www.cjjewellery.example.com/

This uses the internet's reserved "example.com" domain, so it is
guaranteed not to point at a real website. It appears in:

  - index.html (the <link rel="canonical">, the Open Graph "og:url" and
    "og:image" meta tags, and the structured data script near the top)
  - public/robots.txt (the Sitemap line)
  - public/sitemap.xml (the <loc> address, also marked with a comment)

Once you have purchased a real domain, search each of these three files
for "cjjewellery.example.com" and replace it with your real address.


5. HOW THE ENQUIRY FORM CURRENTLY WORKS
-------------------------------------------
This site has no server, so it cannot send email by itself. Instead,
when a visitor fills in the form and selects "Prepare enquiry":

  1. The website checks that the required fields have been completed.
  2. It builds a plain text summary of the visitor's answers (including
     any colours, bead style, clasps, charms or letters they chose in
     the "Made especially for you" section, if they carried them into
     the form).
  3. It opens the visitor's own email application with a new message
     already addressed to cmjosephs@gmail.com, with the subject
     "C J Jewellery enquiry" and the summary filled in as the message.
  4. A message on the page explains that the visitor still needs to
     press Send in their own email application — the website does not
     send anything on its own.

The email address is also shown as an ordinary clickable link.

There is also a hidden "honeypot" field in the form (a field real
visitors never see or fill in). If it is filled in, the enquiry is
quietly ignored. This is a basic, first-line measure against very simple
automated spam — it does not provide full spam protection, and no
further claims are made about it.

The website does not store, save or transmit any form answers itself;
everything happens in the visitor's own browser and email application.
This is explained in the Privacy panel, linked from the footer.


6. WHAT WILL BE NEEDED LATER TO PUBLISH THE WEBSITE
---------------------------------------------------------
This site now needs a one-time "build" step before it can be uploaded,
because of the modern tools used to create the animation. To publish:

  1. Buy a domain name (for example, cjjewellery.co.uk).
  2. Get a normal static web hosting account (no database needed).
  3. On this Mac, open Terminal, move into this folder, and run:

         npm run build

     This creates a "dist" folder containing the finished, ready-to-
     upload website (plain HTML, CSS, JavaScript and images — the
     ordinary files any web host can serve).
  4. Update the placeholder domain (see section 4) before you build, so
     it's baked into the files in "dist".
  5. Upload everything inside the "dist" folder to your hosting account,
     usually via the host's file manager or FTP/SFTP.
  6. Optional but recommended: ask your host to confirm HTTPS is
     enabled, and submit sitemap.xml to Google Search Console.

You can check the finished build locally before uploading by running
"npm run preview" in Terminal — it serves the "dist" folder exactly as a
real host would.

The "Open C J Jewellery.command" file and the "npm run dev" command are
only for working on/previewing the site — they are not needed once it is
hosted online, and the "node_modules" folder they create should not be
uploaded.


7. USEFUL TERMINAL COMMANDS (OPTIONAL)
-------------------------------------------
If you're comfortable with Terminal, from inside this folder:

    npm run dev       Start the live preview (same as the command file)
    npm run build      Create the finished "dist" folder for publishing
    npm run preview    Preview the finished "dist" build locally


8. FULL LIST OF FILES IN THIS PROJECT
-----------------------------------------
  index.html                  The whole website (one page), Vite's entry point
  src/style.css                All styling and design tokens
  src/main.js                  All interactive behaviour and animation
  CLAUDE.md                    Permanent project rules for future changes
  package.json                 Project setup and the npm commands above
  vite.config.js                Build tool configuration
  README.txt                   This file
  Open C J Jewellery.command   Double-click to preview on a Mac
  public/                       Files copied to the site as-is
    favicon.png                 Browser tab icon (cropped from the logo)
    apple-touch-icon.png        Icon used if a visitor saves the site to
                                 their phone's home screen
    404.html                    Shown if a visitor reaches a broken link
    robots.txt                  Search engine crawling instructions
    sitemap.xml                 Search engine sitemap (placeholder domain)
    images/                     Logo and product photographs
      logo.png                  Full transparent logo (cinematic final scene)
      logo-horizontal.png       Compact horizontal logo (header and footer)
      cj-mark.png                Standalone "CJ" mark, for future use
      logo-card-photo.jpg       Real photo of the logo on a branded card
      icon-earrings.svg          Earrings line illustration (no photo supplied)
      hero-bracelet.jpg          Opening sequence photograph
      bracelet-pearl-wrist.jpg   Opening sequence + gallery photograph
      bracelet-duo-wrist.jpg     Opening sequence photograph
      gallery-bracelet-detail.jpg  Gallery photograph (different crop)
      bracelet-pearl-display.jpg  Featured gallery photograph
      bracelet-personalised.jpg   Personalised bracelet gallery photograph
      necklace-trio.jpg          Necklace gallery photograph
      og-image.jpg               Image used when the site is shared on
                                  social media

  dist/                         Created only after you run "npm run build" —
                                 the finished, uploadable website. Not part
                                 of the source files, safe to delete and
                                 regenerate at any time.
  node_modules/                 Created only after setup — third-party code
                                 (Vite, GSAP, Lucide). Not uploaded to your
                                 host, safe to delete and regenerate with
                                 "npm install".
