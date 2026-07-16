#!/bin/bash
# Opens the Padel Court Check partner preview in your default browser.
# Safe to double-click (via Finder > right-click > Open) or run from Terminal.

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
open "$DIR/index.html"
