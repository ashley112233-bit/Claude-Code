# Padel Court Check — Partner Preview

This folder contains a private, offline prototype of a proposed landing page
for **Padel Court Check** — a concept, not a live product. It is intended to
be shown, one-to-one, to a senior contact at a padel booking platform (such
as Nettla, Padel Mates, MATCHi or Playtomic) to gauge interest in a small
pilot. It is not a public marketing site and is not indexed or discoverable.

## Version 2

This is Version 2 of the page. It keeps the same visual identity, hero
layout, colour palette, headline and pilot concept as the first version, but
rewrites the copy to be more confident about the opportunity while
consolidating the necessary caveats into one dedicated section ("What the
pilot is designed to prove"), rather than repeating hedging language
throughout. It also adds a worked example of the aggregated output a
partner would receive, a "what we ask / what we provide" collaboration
section, and a short "About the proposal" section with editable founder
placeholders. See "Where to insert final contact details" below for what
still needs completing.

## What this is

- A single, self-contained web page (`index.html`, `styles.css`,
  `script.js`) built with plain HTML, CSS and JavaScript.
- No React, no build step, no npm packages, no external frameworks.
- No external fonts, images, CDNs, analytics or cookies. Everything the
  page needs is in this folder.
- No internet connection is required to view it.

## How to open it

**Easiest:** double-click `start.sh`.
- If macOS asks how to open it, or opening it just shows the file's text,
  right-click `start.sh`, choose **Open With → Terminal**, and confirm any
  security prompt (**System Settings → Privacy & Security** may ask you to
  allow it once).

**From Terminal:**
```
cd ~/Desktop/Padel-Court-Check-Partner-Preview
./start.sh
```

**Simplest fallback:** just double-click `index.html` itself. It has been
built to work correctly when opened directly in a browser this way, with no
server and no setup.

## Wording that is intentionally provisional

Because Padel Court Check does not exist yet as a live service, the page is
written carefully to avoid overstating where things stand. In particular:

- The page consistently uses words like *proposed*, *could*, *pilot*,
  *designed to* and *subject to partner agreement* rather than stating
  things as fact.
- It does **not** claim any booking platform or venue has agreed to take
  part, that player reports already exist, or that the idea has produced
  bookings, revenue or improved retention.
- It does **not** promise increased bookings or revenue to a partner — the
  benefits section is deliberately written as things a pilot *could* help
  test, not guaranteed outcomes.
- It uses the phrase "privacy-preserving, aggregated court intelligence"
  rather than claiming answers are absolutely anonymous, and says plainly
  that the exact privacy and data-sharing structure would need to be agreed
  with a partner before any pilot began.
- The interactive "player journey" demo on the page is a visual
  demonstration only. No answer you click is saved, stored or sent
  anywhere — it only changes what is shown on screen in your browser.
- The page intentionally does **not** reveal the full questionnaire,
  scoring formula, publication threshold, abuse-detection approach,
  database design or any commercial pricing. Only enough detail is shown to
  explain the concept to a potential partner.

## Where to insert final contact details

This is Version 2 of the page. There are now three places with placeholder
text that must be completed before the page is shared with anyone. Open
`index.html` in a text editor (TextEdit works, though a code editor is
easier to read) and search for each one:

1. **Contact modal.** The "Get in touch" button (in the "About the
   proposal" section) opens a small pop-up with placeholder contact
   wording. Search for `FINAL CONTACT EMAIL GOES HERE` — you'll find it
   just above this line:
   ```html
   <p class="modal__placeholder">Contact: [insert contact email here]</p>
   ```
2. **About the proposal section.** Search for `FOUNDER PLACEHOLDER` to find
   the founder bio and contact details:
   ```html
   <p>Padel Court Check is an early-stage concept led by <strong>[FOUNDER NAME]</strong>, ...</p>
   <dl class="about-contact">
     <div><dt>Email</dt><dd>[Insert email address]</dd></div>
     <div><dt>Telephone</dt><dd>[Insert telephone number, if required]</dd></div>
   </dl>
   ```
   Replace `[FOUNDER NAME]`, `[Insert email address]` and the telephone line
   with real information, or remove the telephone row entirely if you don't
   want to share a number. No name, email address or phone number has been
   invented for you.
3. **Market context section.** This section is hidden by default (it has a
   `hidden` attribute and won't display even if you open the page) because
   it needs a verified UK padel participation figure, a verified court
   count, and a dated source before it can honestly be shown. Search for
   `Market context` in `index.html` to find it. Do not remove the `hidden`
   attribute until you have replaced every `[Insert ...]` placeholder with a
   real, sourced figure.

## Why this local page is not suitable for confidential online sharing yet

Right now this is a set of plain files sitting on your Mac. That's fine for
opening locally or attaching to a private email, but it is **not** an
appropriate way to publish something confidential on the open internet:

- There is no password, login or access control of any kind.
- If these files were simply uploaded to a normal web host as-is, the page
  would be reachable by anyone who found or guessed the address, even
  though it says "noindex" (which only asks search engines not to list it
  — it does not block direct access).

## A note on access protection

This preview deliberately does **not** include a JavaScript password
screen. A password check written in front-end JavaScript is not real
security — anyone can view the page's source code and read the password,
or simply bypass the check, because all the logic runs on the visitor's own
computer. Including one here would give a false sense of protection.

If and when you want to share this page online with a partner, real
protection needs to be added at the **hosting level** instead — for
example:
- Password-protected hosting (many simple static-site hosts offer this),
- A link that requires the recipient to log in or authenticate, or
- Sending it as a private file rather than a public web page at all.

That is a hosting decision to make later, with whichever service you choose
to use, and is outside the scope of this local prototype.

## Quick tour of the files

| File | Purpose |
|---|---|
| `index.html` | The page content and structure |
| `styles.css` | All visual styling (colours, layout, responsiveness) |
| `script.js` | The interactive demo and the contact pop-up |
| `start.sh` | Opens `index.html` in your default browser |
| `README.md` | This file |
