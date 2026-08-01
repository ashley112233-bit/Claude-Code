#!/bin/bash
# Opens the C J Jewellery website.
# Double-click this file in Finder to run it.
#
# No installation is required — the ready-built site in the "dist" folder
# opens straight in your browser. If Node.js happens to be installed, this
# starts a live preview instead, so edits to the site appear as you save.

cd "$(dirname "$0")"

open_built_site() {
  if [ -f "dist/index.html" ]; then
    echo "Opening C J Jewellery in your browser..."
    open "dist/index.html"
    exit 0
  fi
  echo "Could not find the built website (dist/index.html)."
  echo "Please re-download the project folder — the 'dist' folder should be inside it."
  read -n 1 -s -r -p "Press any key to close this window..."
  exit 1
}

# No Node.js? Just open the ready-built site. Nothing to install.
if ! command -v node >/dev/null 2>&1; then
  open_built_site
fi

# Node.js is available — offer the live preview, which is nicer for editing.
if [ ! -d "node_modules" ]; then
  echo "Setting up the live preview for the first time — this happens once."
  if ! npm install; then
    echo
    echo "Setup did not complete. Opening the ready-built site instead."
    open_built_site
  fi
fi

echo "Starting C J Jewellery — your browser will open automatically."
echo "Leave this window open while you browse. Close it (or press Control+C) to stop."
npm run dev || open_built_site
