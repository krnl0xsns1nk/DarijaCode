#!/usr/bin/env bash

set -euo pipefail

# DarijaCode Testing Infrastructure Setup
#
# Initializes a specification-based testing system where language specs
# are the source of truth, not compiler snapshots.

echo
echo "Setting up DarijaCode specification-based testing"
echo

read -p "Continue? (type YES): " -n 3 -r
if [[ "$REPLY" != "YES" ]]; then
    echo "Aborted."
    exit 1
fi

echo " "
# Color utilities
c_green()  { printf '\033[32m%s\033[0m' "$1"; }
c_red()    { printf '\033[31m%s\033[0m' "$1"; }
c_yellow() { printf '\033[33m%s\033[0m' "$1"; }
c_cyan()   { printf '\033[36m%s\033[0m' "$1"; }

say()  { echo "$(c_cyan "==>") $1"; }
warn() { echo "$(c_yellow "⚠") $1"; }
ok()   { echo "$(c_green "✓") $1"; }

# Find project root
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

find_root() {
  local dir="$1"
  while [ "$dir" != "/" ]; do
    if [ -f "$dir/package.json" ]; then
      echo "$dir"
      return 0
    fi
    dir="$(dirname "$dir")"
  done
  return 1
}

if ! ROOT="$(find_root "$ROOT")"; then
  echo "Error: Could not find package.json" >&2
  exit 1
fi

cd "$ROOT"

# Create directory structure
say "Creating directory structure"

mkdir -p tests/specs
mkdir -p tests/generated/{lexer,parser,checker,compiler,runtime,errors}
mkdir -p tests/snapshots/{lexer,parser}
mkdir -p tests/outputs
mkdir -p scripts

ok "Directories created"

# Create .gitignore for outputs
cat > tests/outputs/.gitignore <<'EOF'
*
!.gitignore
EOF

ok ".gitignore created"

# Update package.json with test scripts
say "Adding npm scripts to package.json"

node <<'NODE_EOF'
const fs = require('fs');
const path = require('path');

const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

pkg.scripts = pkg.scripts || {};

const newScripts = {
  generate: 'ts-node -r tsconfig-paths/register scripts/generate-tests.ts',
  test: 'npm run generate && ts-node -r tsconfig-paths/register scripts/test.ts',
  'test:update': 'npm run generate && ts-node -r tsconfig-paths/register scripts/test.ts --update',
  'test:lexer': 'npm run generate && ts-node -r tsconfig-paths/register scripts/test.ts lexer',
  'test:parser': 'npm run generate && ts-node -r tsconfig-paths/register scripts/test.ts parser',
  'test:checker': 'npm run generate && ts-node -r tsconfig-paths/register scripts/test.ts checker',
  'test:compiler': 'npm run generate && ts-node -r tsconfig-paths/register scripts/test.ts compiler',
  'test:runtime': 'npm run generate && ts-node -r tsconfig-paths/register scripts/test.ts runtime',
  'test:errors': 'npm run generate && ts-node -r tsconfig-paths/register scripts/test.ts errors',
};

for (const [key, value] of Object.entries(newScripts)) {
  if (pkg.scripts[key] && pkg.scripts[key] !== value) {
    console.log(`  overwriting: ${key}`);
  }
  pkg.scripts[key] = value;
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
NODE_EOF

ok "npm scripts added"

# Final instructions
echo
echo "$(c_cyan "✓ Testing infrastructure ready")"
echo
echo "Next steps:"
echo "  1. Create spec files in tests/specs/*.drj"
echo "  2. Run: npm run generate  (to create generated tests)"
echo "  3. Run: npm test          (to run all tests)"
echo "  4. Run: npm run test:update (to seed initial snapshots)"
echo

