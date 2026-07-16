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


2. AN IMPORTANT NOTE ABOUT THE SUPPLIED IMAGES
------------------------------------------------
The logo file, the PDF and the six photographs listed in the project brief
(the wordmark logo, the CJ Jewellery.pdf, the "Generated Image" files, and
the photograph of a bracelet in its pouch) were not present anywhere in
the working environment this website was built in, so they could not be
opened, resized or used.

Rather than invent fake product photography, this first version uses:

  - An original wordmark, in the style described in the brief (serif
    "C J Jewellery" text next to a simple diamond mark), built as a clean
    SVG file: images/logo.svg
  - A soft, abstract decorative background wash for the hero section,
    generated from the brand colours: images/hero-wash.png
  - Simple line-art icons representing bracelets, necklaces, earrings and
    a gift pouch, used as honest, clearly non-photographic gallery cards:
    images/icon-bracelet.svg, images/icon-necklace.svg,
    images/icon-earrings.svg, images/icon-pouch.svg
  - A branded Open Graph image for social sharing: images/og-image.png

Once you have the real files, replace them like this:

  - Save your real logo as images/logo.svg (preferred) or images/logo.png,
    keeping its original proportions, and update the three <img> tags in
    index.html that reference images/logo.svg (header, hero and footer)
    if you change the file name.
  - Save the photograph of the bracelet in its pouch as, for example,
    images/bracelet-pouch.jpg, and in index.html find the gallery card
    with the comment "Presented with care" (search for
    "gallery-card--featured") and change its <img src="images/icon-pouch.svg">
    to <img src="images/bracelet-pouch.jpg">, updating the alt text to
    describe the photo.
  - Add further bracelet, necklace and earring photographs the same way:
    save them into the images folder with short, web-safe file names
    (letters, numbers and hyphens only, no spaces), then swap the relevant
    icon <img> tag for your photo and write accurate alt text.
  - Compress large photos before adding them (aim for well under 500KB
    each) so the site stays quick to load. On a Mac, Preview's
    File > Export can reduce JPEG quality and file size.

The site will keep working exactly as it does now while you do this —
nothing needs to be rebuilt, you are simply swapping image files and the
odd <img> tag.


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
     styles.css, script.js, the images folder, favicon.svg, favicon.png,
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
  favicon.svg / favicon.png       Browser tab icon
  apple-touch-icon.png            Icon used if a visitor saves the site
                                   to their phone's home screen
  README.txt                      This file
  Open C J Jewellery.command      Double-click to preview on a Mac
  images/                         Logo, icons and generated brand imagery
    logo.svg                      Wordmark used in header, hero and footer
    icon-bracelet.svg             Bracelet gallery icon
    icon-necklace.svg             Necklace gallery icon
    icon-earrings.svg             Earrings gallery icon
    icon-pouch.svg                Gift pouch icon (featured bracelet card)
    hero-wash.png                 Decorative hero background
    og-image.png                  Image used when the site is shared on
                                   social media
