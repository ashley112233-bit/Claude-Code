C J JEWELLERY — WEBSITE README
================================

This folder contains the complete C J Jewellery website. It is built with
plain HTML, CSS and JavaScript only — no frameworks, no build tools, no
database and no online shop. It is a showcase and enquiry website.


1. HOW TO OPEN THE WEBSITE ON A MAC
------------------------------------
Double-click "Open C J Jewellery.command" in this folder. It will open
index.html in your default web browser.

If macOS shows a security warning the first time (because the file was
downloaded rather than created on this Mac), right-click the file, choose
"Open", then confirm "Open" in the dialog. You only need to do this once.

You can also open the website by double-clicking index.html directly, or
by dragging index.html into Safari.


2. ABOUT THE PRODUCT PHOTOGRAPHS AND THE LOGO
------------------------------------------------
Six real product photographs were supplied and are now used on the site:

  - images/necklace-trio.jpg      A pearl necklace with two beaded necklaces
                                   (necklace gallery card)
  - images/bracelet-pearl-wrist.jpg   A pearl bracelet worn on the wrist
                                   (bracelet gallery card)
  - images/bracelet-duo-wrist.jpg     Two colourful beaded bracelets worn
                                   together (bracelet gallery card)
  - images/bracelet-pearl-display.jpg A pearl bracelet displayed with a
                                   C J Jewellery card (featured bracelet
                                   card, and the hero photo's companion)
  - images/bracelet-personalised.jpg  A cream beaded bracelet personalised
                                   with letter beads and a heart charm
                                   (bracelet gallery card)
  - images/hero-bracelet.jpg      A pearl bracelet, ribbon and roses — used
                                   as the main hero photograph

Each photo was cropped to reduce how much of the formal jewellery-shop
backdrop is visible (glass display cases, showroom panelling), keeping the
focus on the handmade piece itself, and compressed to keep the site quick
to load. The originals are not altered — only resized copies are used on
the site. Earrings still use a simple line-art icon, as no earring
photograph was supplied — this is intentional (see the brief's instruction
not to invent product photography that wasn't provided).

The real logo has also now been supplied as a clean, flat file (the "CJ"
monogram with a small diamond on a watercolour blush/blue background) and
is used throughout the site at its correct proportions, with no
stretching or redrawing:

  - images/logo.png is the working site logo — used in the header, the
    hero section and the footer (in the footer it sits on a small cream
    card so it stays readable against the dark background).
  - favicon.png and apple-touch-icon.png are cropped from the same logo
    (just the "CJ" monogram and diamond, without the smaller wordmark
    text, since that would be unreadable at browser-tab size).
  - images/logo-card-photo.jpg is a separate, real photograph of the logo
    as printed on a branded card, used once on the page (in the Bespoke
    section) as an honest supporting photo alongside the working logo.

If you'd like to add more product photographs later (necklace or earring
close-ups once you have them), save them into the images folder with
short, web-safe file names (letters, numbers and hyphens only, no
spaces), then add a new gallery card in index.html following the pattern
of the existing ones in the section commented
"<!-- 3. JEWELLERY GALLERY -->".


3. WHERE TO CHANGE THE EMAIL ADDRESS AND WORDING
---------------------------------------------------
Everything customer-facing lives in index.html, which is a single plain
text file you can open in TextEdit (use "Open With" and choose TextEdit,
or a code editor if you have one).

  - Email address: search index.html for "cmjosephs@gmail.com" — it
    appears a few times (a clickable link, the enquiry copy, and the
    footer). It is also set once in script.js, near the top of the
    "Enquiry form" section, in the line that builds the mailto address.
  - Headings and paragraphs: each section is clearly commented, e.g.
    "<!-- 1. HERO -->", "<!-- 6. OUR STORY -->", "<!-- 8. ENQUIRY FORM -->".
    Edit the text between the HTML tags directly.
  - Prices: the price guidance sentence is in the section commented
    "<!-- 4. PRICE GUIDANCE -->".
  - Colours: all brand colours are defined once at the top of styles.css
    under ":root", so changing --blush, --powder-blue, --cream or
    --charcoal updates the whole site.


4. PLACEHOLDER DOMAIN — MUST BE REPLACED
--------------------------------------------
This first version uses a placeholder web address:

    https://www.cjjewellery.example.com/

This uses the internet's reserved "example.com" domain, so it is
guaranteed not to point at a real website. It appears in:

  - index.html (the <link rel="canonical">, the Open Graph "og:url" and
    "og:image" meta tags, and the structured data script near the top)
  - robots.txt (the Sitemap line)
  - sitemap.xml (the <loc> address, also marked with a comment)

Once you have purchased a real domain, search each of these three files
for "cjjewellery.example.com" and replace it with your real address.


5. HOW THE ENQUIRY FORM CURRENTLY WORKS
-------------------------------------------
This first version of the website has no server, so it cannot send email
by itself. Instead, when a visitor fills in the form and selects
"Prepare enquiry":

  1. The website checks that the required fields have been completed.
  2. It builds a plain text summary of the visitor's answers.
  3. It opens the visitor's own email application with a new message
     already addressed to cmjosephs@gmail.com, with the subject
     "C J Jewellery enquiry" and the summary filled in as the message.
  4. A message on the page explains that the visitor still needs to
     press Send in their own email application — the website does not
     send anything on its own.

The email address is also shown as an ordinary clickable link, so anyone
who prefers to write their own email can do that instead.

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
To put this website on the internet, you will need:

  1. A domain name (for example, cjjewellery.co.uk), bought from a domain
     registrar.
  2. A normal web hosting account (many hosts offer simple UK-priced
     packages for static sites — no database is required for this site).
  3. To upload every file and folder in this project (index.html,
     styles.css, script.js, the images folder, favicon.png,
     apple-touch-icon.png, 404.html, robots.txt and sitemap.xml) to the
     hosting account, usually via the host's file manager or FTP/SFTP.
  4. To update the placeholder domain (see section 4 above) to your real
     address in index.html, robots.txt and sitemap.xml before or just
     after uploading.
  5. Optional but recommended: once real product photographs are in
     place, ask your host (or a developer) to confirm HTTPS is enabled,
     and submit sitemap.xml to Google Search Console so the site can be
     indexed.

The "Open C J Jewellery.command" file is only for previewing the site on
a Mac before publishing — it is not needed once the site is hosted online,
and does not need to be uploaded.


7. FULL LIST OF FILES IN THIS PROJECT
-----------------------------------------
  index.html                      The whole website (one page)
  styles.css                      All styling
  script.js                       Mobile menu, gallery lightbox, form logic
  404.html                        Shown if a visitor reaches a broken link
  robots.txt                      Search engine crawling instructions
  sitemap.xml                     Search engine sitemap (placeholder domain)
  favicon.png                     Browser tab icon (cropped from the logo)
  apple-touch-icon.png            Icon used if a visitor saves the site
                                   to their phone's home screen
  README.txt                      This file
  Open C J Jewellery.command      Double-click to preview on a Mac
  images/                         Logo and product photographs
    logo.png                      The real logo — used in header, hero
                                   and footer
    logo-card-photo.jpg           Photo of the real logo on a branded card
    icon-earrings.svg             Earrings gallery icon (no photo supplied)
    hero-bracelet.jpg             Hero photograph
    necklace-trio.jpg             Necklace gallery photograph
    bracelet-pearl-wrist.jpg      Bracelet gallery photograph
    bracelet-duo-wrist.jpg        Bracelet gallery photograph
    bracelet-pearl-display.jpg    Featured bracelet gallery photograph
    bracelet-personalised.jpg     Personalised bracelet gallery photograph
    og-image.jpg                  Image used when the site is shared on
                                   social media
