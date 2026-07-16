#!/bin/bash
# Starts the C J Jewellery website locally and opens it in your default browser.
# Double-click this file in Finder to run it. Leave the window open while you browse the site;
# closing it stops the local server.

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed on this Mac."
  echo "Install it from https://nodejs.org (choose the LTS version), then double-click this file again."
  read -n 1 -s -r -p "Press any key to close this window..."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Setting up the website for the first time — this only happens once."
  npm install
fi

echo "Starting C J Jewellery — your browser will open automatically."
echo "Leave this window open while you browse. Close it (or press Control+C) to stop."
npm run dev
