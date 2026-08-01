C J JEWELLERY — WEBSITE README
================================

This folder contains the complete C J Jewellery website. It is a static
showcase-and-enquiry site — no online shop, no database. It is built with
Vite, modern HTML, CSS and vanilla JavaScript, using GSAP for the animated
opening sequence and scroll effects, and Lucide for icons.


1. HOW TO OPEN THE WEBSITE ON A MAC
------------------------------------
Double-click "Open C J Jewellery.command" in this folder. The website
opens in your browser. Nothing needs installing.

If macOS shows a security warning the first time you double-click it
(because the file was downloaded rather than created on this Mac),
right-click the file, choose "Open", then confirm "Open" in the dialog.
You only need to do this once.

You can also just open the "dist" folder and double-click index.html
inside it — that is the finished website, and it works the same way.

A note on what the command file does: if the developer tool Node.js
happens to be installed on your Mac, it starts a live preview instead,
where changes you make to the site appear as soon as you save a file.
If Node.js is not installed — which is normal — it simply opens the
ready-built site. You do not need Node.js to view or to publish the
website. You would only want it if you plan to edit the site yourself
and watch the changes live (see section 3).


2. WHAT CHANGED IN THIS REDESIGN
------------------------------------
This is a full visual and technical redesign, not a re-colouring of the
previous version:

  - A scroll-driven "Threaded, one bead at a time" sequence: beads drift
    in scattered, thread themselves onto the cord one by one, the clasps
    fasten, and the finished strand dissolves into the real photograph of
    the bracelet on the wrist. You control it by scrolling — scroll back
    and it runs in reverse.
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

ABOUT THE BEADS IN THE THREADING SEQUENCE
------------------------------------------
The beads in the "Threaded, one bead at a time" sequence are drawn by the
website itself (in src/beads.js), not photographed. That is deliberate:
there are no photographs of individual loose beads, and cutting them out
of photos of finished pieces would misrepresent what is actually sold.

If you later photograph loose beads on a plain white background, they can
replace the drawn ones without any redesign. src/beads.js has a comment
block at the very top explaining exactly what to change — it is a few
lines, and the threading motion, depth ordering and scroll control all
keep working unchanged.


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
The finished website is already built and sitting in the "dist" folder,
so publishing does not need any developer tools:

  1. Buy a domain name (for example, cjjewellery.co.uk).
  2. Get a normal static web hosting account (no database needed).
  3. Update the placeholder domain (see section 4). It appears in
     index.html, public/robots.txt and public/sitemap.xml, and also in
     the matching already-built files inside "dist" — the simplest
     approach is to ask whoever helps you publish to rebuild after the
     change, or to edit the same three files inside "dist" directly.
  4. Upload everything *inside* the "dist" folder to your hosting
     account, usually via the host's file manager or FTP/SFTP. Upload
     the contents, not the "dist" folder itself.
  5. Optional but recommended: ask your host to confirm HTTPS is
     enabled, and submit sitemap.xml to Google Search Console.

Do not upload: "node_modules", the "src" folder, package.json,
vite.config.js, the scripts folder, this README, or the .command file.
None of those are part of the live website.

If you (or a developer) do change the site's source files later, the
"dist" folder is regenerated by running "npm run build" in Terminal —
that step needs Node.js installed. Everything already in "dist" was
built for you, so you only need this if you start editing.


7. USEFUL TERMINAL COMMANDS (OPTIONAL)
-------------------------------------------
These all require Node.js, which you only need if you want to edit the
site yourself. From inside this folder:

    npm install        One-time setup after installing Node.js
    npm run dev        Start the live preview, with instant updates as
                        you save changes
    npm run build      Rebuild the finished "dist" folder
    npm run preview    Preview the finished "dist" build locally

Node.js is free, from https://nodejs.org (choose the LTS version).
You do not need it just to view or publish the site.


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

  scripts/make-openable.js     Build helper — see the note below

  dist/                         THE FINISHED WEBSITE. Already built and
                                 included. This is what opens when you
                                 double-click the .command file, and this
                                 is what gets uploaded to your web host.
  node_modules/                 Only appears if you install Node.js and run
                                 setup — third-party code (Vite, GSAP,
                                 Lucide). Never uploaded to your host.

A note on scripts/make-openable.js: browsers apply strict security rules
to pages opened directly from the Finder rather than served by a web
host. This small script adjusts two attributes in the built index.html so
the site still runs when double-clicked, instead of loading with no
styling and no animation. It runs automatically as part of "npm run
build" and changes nothing about how the site behaves once it is hosted
online.
