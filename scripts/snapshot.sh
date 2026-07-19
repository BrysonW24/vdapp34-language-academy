#!/usr/bin/env bash
#
# snapshot.sh - self-verifying byte-exact snapshot generator for the Language Academy app.
#
# Produces up to three artifacts in the app root:
#   SNAPSHOT.md                reproduction protocol + every inlined text source file
#   SNAPSHOT.manifest.sha256   sha256 hash + byte size of every snapshotted file
#   SNAPSHOT.content.tar.gz    bulk content/ + public/ files (only when run with --content)
#
# An agent given these artifacts can rebuild the app to byte-exact parity and
# verify success against the manifest, without access to the original repo.
#
# Usage:
#   npm run snapshot        md + manifest (source only, no bulk content tarball)
#   npm run snapshot:full   md + manifest + content tarball (the portable backup)
#
# The artifacts are deliberately gitignored - they are a generated backup, not source.
# This script IS tracked, so the snapshot can always be regenerated from a clean checkout.
#
set -euo pipefail

# Resolve the app root (this script lives in <app>/scripts/).
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

WITH_CONTENT=0
if [ "${1:-}" = "--content" ]; then
  WITH_CONTENT=1
fi

MD="SNAPSHOT.md"
MANIFEST="SNAPSHOT.manifest.sha256"
TARBALL="SNAPSHOT.content.tar.gz"

# Bulk dirs go into the tarball; every other text file is inlined into the md.
is_bulk() {
  case "$1" in
    content/*|public/*) return 0 ;;
    *) return 1 ;;
  esac
}

# Files we never snapshot: our own outputs plus build junk that can slip past gitignore.
is_excluded() {
  case "$1" in
    "$MD"|"$MANIFEST"|"$TARBALL") return 0 ;;
    *.tsbuildinfo|node_modules/*|.next/*|.turbo/*) return 0 ;;
    *) return 1 ;;
  esac
}

# Binary file extensions get a manifest entry but are not inlined into the md.
is_binary() {
  case "$1" in
    *.png|*.jpg|*.jpeg|*.gif|*.webp|*.ico|*.woff|*.woff2|*.ttf|*.otf|*.eot|*.mp3|*.mp4|*.pdf|*.zip|*.gz) return 0 ;;
    *) return 1 ;;
  esac
}

# Portable byte size (BSD stat on macOS, GNU stat on Linux).
bytes_of() {
  stat -f%z "$1" 2>/dev/null || stat -c%s "$1"
}

# Fence info-string language by file extension.
lang_of() {
  case "$1" in
    *.ts|*.tsx) echo "typescript" ;;
    *.js|*.mjs|*.cjs) echo "javascript" ;;
    *.json) echo "json" ;;
    *.md) echo "markdown" ;;
    *.css) echo "css" ;;
    *.yaml|*.yml) echo "yaml" ;;
    *.py) echo "python" ;;
    *.sh) echo "bash" ;;
    *.svg|*.html) echo "html" ;;
    *) echo "" ;;
  esac
}

# A code fence longer than any run of backticks already in the file, so inlined
# content can never break out of its block. Minimum length is 3.
fence_for() {
  local longest
  longest="$(grep -oE '`+' "$1" 2>/dev/null | awk '{ if (length > m) m = length } END { print m + 0 }')"
  local n=$(( longest + 1 ))
  if [ "$n" -lt 3 ]; then n=3; fi
  printf '%*s' "$n" '' | tr ' ' '`'
}

echo "snapshot: scanning working tree..."

# Tracked + untracked (respecting .gitignore), minus excludes, stable order.
FILES="$(git ls-files --cached --others --exclude-standard | LC_ALL=C sort)"

# ---------------------------------------------------------------------------
# 1. Manifest - sha256 + byte size of every snapshotted file.
# ---------------------------------------------------------------------------
: > "$MANIFEST"
total_files=0
inline_files=0
bulk_files=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  is_excluded "$f" && continue
  [ -f "$f" ] || continue
  sha="$(shasum -a 256 "$f" | awk '{print $1}')"
  sz="$(bytes_of "$f")"
  printf '%s  %s  %s\n' "$sha" "$sz" "$f" >> "$MANIFEST"
  total_files=$(( total_files + 1 ))
  if is_bulk "$f"; then
    bulk_files=$(( bulk_files + 1 ))
  elif ! is_binary "$f"; then
    inline_files=$(( inline_files + 1 ))
  fi
done <<EOF
$FILES
EOF

ROOT_HASH="$(shasum -a 256 "$MANIFEST" | awk '{print $1}')"
echo "snapshot: manifest written ($total_files files), root parity hash ${ROOT_HASH:0:16}..."

# ---------------------------------------------------------------------------
# 2. Content tarball (optional, the bulk JSON curriculum + public assets).
# ---------------------------------------------------------------------------
TAR_NOTE="not generated - run with --content for the full portable backup"
if [ "$WITH_CONTENT" -eq 1 ]; then
  bulk_dirs=""
  for d in content public; do
    [ -d "$d" ] && bulk_dirs="$bulk_dirs $d"
  done
  if [ -n "$bulk_dirs" ]; then
    tar -czf "$TARBALL" $bulk_dirs
    TAR_NOTE="sha256 $(shasum -a 256 "$TARBALL" | awk '{print $1}'), $(bytes_of "$TARBALL") bytes"
    echo "snapshot: content tarball written ($bulk_files bulk files)"
  fi
fi

# ---------------------------------------------------------------------------
# 3. SNAPSHOT.md - reproduction protocol + inlined text source.
# ---------------------------------------------------------------------------
GEN_TS="$(date -u '+%Y-%m-%d %H:%M UTC')"
GIT_HEAD="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
NODE_VER="$(node --version 2>/dev/null || echo 'unknown')"
APP_NAME="$(basename "$APP_DIR")"

{
  printf '# Language Academy - Parity Snapshot\n'
  printf '> Generated %s  |  ROOT PARITY HASH `%s`\n\n' "$GEN_TS" "$ROOT_HASH"
  printf 'This is a self-verifying, byte-exact snapshot. An agent that follows the\n'
  printf 'Reproduction Protocol below recreates this project to provable parity and\n'
  printf 'confirms success against the embedded manifest, with no original repo needed.\n\n'
  printf 'Three artifacts ship together (same directory):\n\n'
  printf '| Artifact | What | Fingerprint |\n'
  printf '|----------|------|-------------|\n'
  printf '| `%s` | This file - protocol + all inlined text source | root `%s` |\n' "$MD" "${ROOT_HASH:0:16}"
  printf '| `%s` | sha256 + byte size of all %s files | (verify target) |\n' "$MANIFEST" "$total_files"
  printf '| `%s` | %s bulk content + public files | %s |\n\n' "$TARBALL" "$bulk_files" "$TAR_NOTE"
  printf -- '---\n\n'

  printf '## Reproduction Protocol (one-shot)\n\n'
  printf 'You are reconstructing the Language Academy app to byte-exact parity. Execute every step, then verify.\n\n'
  printf '**Prereqs:** Node `>=20` (snapshot taken on `%s`), npm. All artifacts present in the working directory.\n\n' "$NODE_VER"
  printf '1. Create the project directory and `cd` into it.\n'
  printf '2. Write every inlined source file from the *Inlined Source Files* section below. Each block\n'
  printf '   carries its path, sha256, and byte count. Reproduce the bytes exactly. After writing each\n'
  printf '   file, its sha256 must equal the header value.\n'
  printf '3. Restore the bulk content (the JSON curriculum + public assets, not inlined):\n\n'
  printf '   ```bash\n   tar -xzf %s\n   ```\n\n' "$TARBALL"
  printf '4. Install dependencies: `npm ci` (or `npm install` if no lockfile). Parity of `node_modules`\n'
  printf '   is not required, only of source + content.\n'
  printf '5. VERIFY PARITY against the manifest:\n\n'
  printf '   ```bash\n'
  printf '   while read -r want_sha want_bytes rel; do\n'
  printf '     [ -f "$rel" ] || { echo "MISSING: $rel"; continue; }\n'
  printf '     got=$(shasum -a 256 "$rel" | awk '"'"'{print $1}'"'"')\n'
  printf '     [ "$got" = "$want_sha" ] || echo "MISMATCH: $rel"\n'
  printf '   done < %s\n' "$MANIFEST"
  printf '   # Zero MISSING / MISMATCH lines means byte-exact parity.\n'
  printf '   ```\n\n'
  printf '6. Prove it builds: `npm run type-check && npm run build` (both must pass).\n\n'
  printf '**Done when:** manifest verification prints nothing, and `build` + `type-check` pass.\n\n'
  printf -- '---\n\n'
  printf '## Snapshot Environment\n\n'
  printf -- '- App: `%s`\n' "$APP_NAME"
  printf -- '- Source git HEAD at snapshot time: `%s`\n' "$GIT_HEAD"
  printf -- '- Node at snapshot time: `%s`\n' "$NODE_VER"
  printf -- '- Files in manifest: %s (%s inlined as text, %s in the content tarball)\n' "$total_files" "$inline_files" "$bulk_files"
  printf -- '- This snapshot captures the working tree (tracked + untracked, minus gitignored build junk).\n\n'
  printf -- '---\n\n'
  printf '## Inlined Source Files\n\n'
  printf 'Every text file outside the bulk content/public dirs, in sorted order.\n\n'
} > "$MD"

# Inline every non-bulk, non-binary text file.
while IFS= read -r f; do
  [ -z "$f" ] && continue
  is_excluded "$f" && continue
  is_bulk "$f" && continue
  [ -f "$f" ] || continue
  sha="$(shasum -a 256 "$f" | awk '{print $1}')"
  sz="$(bytes_of "$f")"
  if is_binary "$f"; then
    {
      printf '#### `%s`\n' "$f"
      printf '<sub>sha256: `%s` (%s bytes) - binary, restore from a separate copy</sub>\n\n' "$sha" "$sz"
    } >> "$MD"
    continue
  fi
  fence="$(fence_for "$f")"
  {
    printf '#### `%s`\n' "$f"
    printf '<sub>sha256: `%s` (%s bytes)</sub>\n\n' "$sha" "$sz"
    printf '%s%s\n' "$fence" "$(lang_of "$f")"
    cat "$f"
    printf '\n%s\n\n' "$fence"
  } >> "$MD"
done <<EOF
$FILES
EOF

MD_BYTES="$(bytes_of "$MD")"
echo "snapshot: ${MD} written (${inline_files} inlined files, ${MD_BYTES} bytes)"
echo "snapshot: done. Root parity hash: ${ROOT_HASH}"
