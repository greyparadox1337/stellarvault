#!/usr/bin/env bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
# ============================================================
#  StarVote — Antigravity x Stellar Level 3 Requirement Check
# ============================================================
#  Run this from the root of your project directory:
#    chmod +x verify_level3.sh && ./verify_level3.sh
# ============================================================

PASS=0
FAIL=0
WARN=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

pass() { echo -e "  ${GREEN}✅ PASS${RESET}  $1"; ((PASS++)); }
fail() { echo -e "  ${RED}❌ FAIL${RESET}  $1"; ((FAIL++)); }
warn() { echo -e "  ${YELLOW}⚠️  WARN${RESET}  $1"; ((WARN++)); }
header() { echo -e "\n${CYAN}${BOLD}━━━  $1  ━━━${RESET}"; }
info()  { echo -e "  ${CYAN}ℹ${RESET}  $1"; }

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   Antigravity x Stellar — Level 3 Audit Script  ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════╝${RESET}"
echo -e "  Directory: ${CYAN}$(pwd)${RESET}"
echo -e "  Date:      $(date '+%Y-%m-%d %H:%M')"


# ─────────────────────────────────────────────
header "1. PROJECT STRUCTURE"
# ─────────────────────────────────────────────

if [ -f "package.json" ]; then
  pass "package.json found"
else
  fail "package.json not found — is this a Node/Next.js project?"
fi

README_FILE=$(find . -maxdepth 1 -iname "readme.md" | head -1)
if [ -n "$README_FILE" ]; then
  pass "README.md found"
else
  fail "README.md missing — required for submission"
fi

SRC_DIR=""
for d in src app pages components; do
  if [ -d "$d" ]; then SRC_DIR="$d"; break; fi
done
if [ -n "$SRC_DIR" ]; then
  pass "Source directory found: $SRC_DIR/"
else
  warn "Could not detect a standard source directory (src/, app/, pages/)"
fi

# Check dApp is "fully functional" heuristic — has both UI and contract interaction
UI_FILES=$(find . \( -name "*.tsx" -o -name "*.jsx" \) ! -path "*/node_modules/*" ! -path "*/__tests__/*" ! -path "*/*.test.*" | wc -l | tr -d ' ')
if [ "$UI_FILES" -ge 3 ]; then
  pass "UI components present ($UI_FILES .tsx/.jsx files)"
else
  warn "Very few UI files found ($UI_FILES) — ensure mini-dApp is fully functional"
fi


# ─────────────────────────────────────────────
header "2. GIT COMMITS (min 3 meaningful)"
# ─────────────────────────────────────────────

if git rev-parse --is-inside-work-tree &>/dev/null; then
  COMMIT_COUNT=$(git log --oneline | wc -l | tr -d ' ')
  if [ "$COMMIT_COUNT" -ge 3 ]; then
    pass "$COMMIT_COUNT commits found (≥ 3 required)"
  else
    fail "Only $COMMIT_COUNT commit(s) — need at least 3 meaningful commits"
  fi

  echo ""
  echo -e "  ${BOLD}Last 6 commits:${RESET}"
  git log --oneline -6 | while read -r line; do
    echo -e "    ${CYAN}→${RESET} $line"
  done

  BOILERPLATE=$(git log --oneline | grep -iE "^[a-f0-9]+ (initial commit|init|first commit|update|fix|wip)$" | wc -l | tr -d ' ')
  if [ "$BOILERPLATE" -gt 0 ]; then
    warn "$BOILERPLATE commit(s) have generic messages — use descriptive feature/fix messages"
  fi
else
  fail "Not a git repository or git not installed"
fi


# ─────────────────────────────────────────────
header "3. TESTING (min 3 tests passing)"
# ─────────────────────────────────────────────

# Detect test framework
TEST_FRAMEWORK=""
if grep -q '"jest"' package.json 2>/dev/null || [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then
  TEST_FRAMEWORK="jest"
elif grep -q '"vitest"' package.json 2>/dev/null || [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
  TEST_FRAMEWORK="vitest"
elif grep -q '"mocha"' package.json 2>/dev/null; then
  TEST_FRAMEWORK="mocha"
fi

if [ -n "$TEST_FRAMEWORK" ]; then
  pass "Test framework detected: $TEST_FRAMEWORK"
else
  fail "No test framework found (jest/vitest/mocha) — add one to package.json"
fi

# Find test files
TEST_FILES=$(find . \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.test.js" -o -name "*.spec.ts" -o -name "*.spec.tsx" -o -name "*.spec.js" \) ! -path "*/node_modules/*" 2>/dev/null)
TEST_FILE_COUNT=$(echo "$TEST_FILES" | grep -c . || echo 0)

if [ "$TEST_FILE_COUNT" -ge 1 ]; then
  pass "$TEST_FILE_COUNT test file(s) found"
  echo ""
  echo -e "  ${BOLD}Test files:${RESET}"
  echo "$TEST_FILES" | while read -r f; do
    echo -e "    ${CYAN}→${RESET} $f"
  done
else
  fail "No test files found (*.test.ts / *.spec.ts etc.)"
fi

# Also check for Rust/Soroban contract tests
RUST_TESTS=$(find . -name "*.rs" ! -path "*/node_modules/*" 2>/dev/null | xargs grep -l "#\[test\]" 2>/dev/null | wc -l | tr -d ' ')
if [ "$RUST_TESTS" -gt 0 ]; then
  pass "Rust/Soroban contract tests found in $RUST_TESTS .rs file(s)"
fi

# Count individual it()/test()/describe() blocks
TEST_CASE_COUNT=$(grep -rE "it\(|test\(|describe\(" . --include="*.test.ts" --include="*.test.tsx" --include="*.test.js" --include="*.spec.ts" --include="*.spec.tsx" --include="*.spec.js" 2>/dev/null | grep -vE "^\s*//" | wc -l | tr -d ' ')
if [ "$TEST_CASE_COUNT" -ge 3 ]; then
  pass "$TEST_CASE_COUNT test case(s) defined (≥ 3 required)"
else
  fail "Only $TEST_CASE_COUNT test case(s) found — need at least 3 passing tests"
fi

# Check test script exists in package.json
if grep -q '"test"' package.json 2>/dev/null; then
  pass "\"test\" script present in package.json"
  TEST_CMD=$(node -e "const p=require('./package.json'); console.log(p.scripts?.test || '')" 2>/dev/null)
  info "Test command: $TEST_CMD"
else
  fail "No \"test\" script in package.json — add one so reviewers can run tests"
fi

# Attempt to actually run tests (dry run check only, don't block)
echo ""
echo -e "  ${BOLD}Attempting test run (timeout 60s)...${RESET}"
if [ -n "$TEST_FRAMEWORK" ] && [ -f "package.json" ]; then
  if command -v npx &>/dev/null; then
    RESULT=$(timeout 60 npx --yes "$TEST_FRAMEWORK" --passWithNoTests 2>&1 | tail -20)
    if echo "$RESULT" | grep -qiE "passed|passing|✓|Tests:.*[1-9]"; then
      pass "Tests ran successfully"
      echo "$RESULT" | grep -iE "passed|passing|Tests:|Suites:" | while read -r line; do
        echo -e "    ${GREEN}→${RESET} $line"
      done
    elif echo "$RESULT" | grep -qiE "failed|error|FAIL"; then
      fail "Tests ran but failures detected"
      echo "$RESULT" | grep -iE "failed|FAIL|error" | head -5 | while read -r line; do
        echo -e "    ${RED}→${RESET} $line"
      done
    else
      warn "Tests may have run — check output manually"
      info "Run: npm test"
    fi
  else
    warn "npx not available — run tests manually with: npm test"
  fi
fi

# Check for test screenshot in README
if [ -n "$README_FILE" ]; then
  README=$(cat "$README_FILE")
  if echo "$README" | grep -qiE "test.*screenshot|screenshot.*test|!\[.*test|test.*output|test.*pass"; then
    pass "Test output screenshot referenced in README"
  else
    fail "No test output screenshot in README — required: screenshot showing 3+ tests passing"
  fi
fi


# ─────────────────────────────────────────────
header "4. LOADING STATES & PROGRESS INDICATORS"
# ─────────────────────────────────────────────

if grep -rqiE "isLoading|loading.*state|setLoading|useState.*loading|Loading\b" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
  pass "Loading state variable(s) found"
else
  fail "No loading state found — add isLoading / loading indicators"
fi

if grep -rqiE "Spinner|spinner|skeleton|Skeleton|ProgressBar|progress.*bar|loading.*indicator|animate.*spin|animate-pulse" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
  pass "Loading UI component found (spinner/skeleton/progress bar)"
else
  warn "No loading UI component detected — add a visible spinner or skeleton"
fi


# ─────────────────────────────────────────────
header "5. BASIC CACHING"
# ─────────────────────────────────────────────

if grep -rqiE "localStorage|sessionStorage|cache|Cache|useSWR|useQuery|staleTime|cacheTime|revalidate" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
  pass "Caching implementation found"
else
  fail "No caching found — implement basic caching (localStorage, SWR, React Query, etc.)"
fi

# Bonus: SWR or React Query is best practice
if grep -rqiE "useSWR|useQuery|react-query|@tanstack/query" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" package.json 2>/dev/null; then
  pass "Data-fetching cache library used (SWR / React Query) ✨"
fi


# ─────────────────────────────────────────────
header "6. DOCUMENTATION (README completeness)"
# ─────────────────────────────────────────────

if [ -n "$README_FILE" ]; then
  README=$(cat "$README_FILE")
  WORD_COUNT=$(echo "$README" | wc -w | tr -d ' ')
  if [ "$WORD_COUNT" -ge 200 ]; then
    pass "README has substantial content ($WORD_COUNT words)"
  else
    warn "README is short ($WORD_COUNT words) — Level 3 requires 'complete documentation'"
  fi

  if echo "$README" | grep -qiE "## |# "; then
    pass "README uses structured headings"
  else
    warn "README has no section headings — add sections for Setup, Usage, Architecture, etc."
  fi

  if echo "$README" | grep -qiE "npm install|yarn install|getting started|installation|setup"; then
    pass "Setup / installation instructions present"
  else
    fail "Setup instructions missing from README"
  fi

  if echo "$README" | grep -qiE "vercel\.app|netlify\.app|https://[a-z].*\.(app|io|dev|xyz|com)"; then
    pass "Live demo link present in README"
  else
    fail "Live demo link missing — required: deployed on Vercel/Netlify/similar"
  fi

  if echo "$README" | grep -qiE "demo.*video|video.*demo|loom\.com|youtube\.com|youtu\.be|vimeo|watch\?v=|drive\.google"; then
    pass "Demo video link present in README"
  else
    fail "Demo video link missing — required: 1-minute demo video link in README"
  fi

  if echo "$README" | grep -qiE "architecture|how it works|overview|tech stack|built with"; then
    pass "Architecture / tech stack section found"
  else
    warn "No architecture section — add a brief explanation of how the dApp works"
  fi

  if echo "$README" | grep -qiE "contract|soroban|stellar|blockchain"; then
    pass "Contract / Stellar info documented in README"
  else
    warn "No mention of smart contract or Stellar details in README"
  fi
else
  fail "README.md not found — cannot check documentation"
fi


# ─────────────────────────────────────────────
header "7. DEMO VIDEO"
# ─────────────────────────────────────────────

if [ -n "$README_FILE" ]; then
  README=$(cat "$README_FILE")
  if echo "$README" | grep -qiE "loom\.com|youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com|demo.*video|video.*demo"; then
    pass "Video link found in README"

    VIDEO_URL=$(echo "$README" | grep -oiE "(https?://(www\.)?(loom|youtube|youtu\.be|vimeo|drive\.google)\.com[^\s)\"']+)" | head -1)
    if [ -n "$VIDEO_URL" ]; then
      info "Video URL: $VIDEO_URL"
    fi
  else
    fail "No demo video link found — record a 1-minute walkthrough and add the link to README"
  fi
else
  fail "README.md not found — cannot check for video link"
fi

# Check for local video file (not ideal but counts)
LOCAL_VIDEO=$(find . \( -name "*.mp4" -o -name "*.mov" -o -name "*.webm" \) ! -path "*/node_modules/*" 2>/dev/null | head -1)
if [ -n "$LOCAL_VIDEO" ]; then
  warn "Local video file found ($LOCAL_VIDEO) — upload to YouTube/Loom and link in README instead"
fi


# ─────────────────────────────────────────────
header "8. FULL DAPP FUNCTIONALITY CHECK"
# ─────────────────────────────────────────────

# Soroban contract interaction
if grep -rqiE "soroban|SorobanRpc|invokeHostFunction|simulateTransaction" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
  pass "Soroban contract interaction found"
else
  fail "No Soroban contract interaction — Level 3 builds on Level 2 requirements"
fi

# Wallet connection
if grep -rqiE "StellarWalletsKit|Freighter|stellar-wallets-kit" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" package.json 2>/dev/null; then
  pass "Wallet integration present"
else
  fail "No wallet integration found"
fi

# Error boundaries or error handling
if grep -rqiE "ErrorBoundary|try.*catch|\.catch\(|onError" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
  pass "Error handling present"
else
  warn "Error handling not clearly detected"
fi

# Transaction feedback
if grep -rqiE "toast|Toast|notification|Notification|alert.*tx|tx.*alert|success.*message|snackbar" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
  pass "User feedback / toast notifications found"
else
  warn "No toast/notification UI detected — add feedback for transaction results"
fi


# ─────────────────────────────────────────────
header "9. DEPLOYMENT"
# ─────────────────────────────────────────────

if [ -f "vercel.json" ] || [ -f ".vercel/project.json" ]; then
  pass "Vercel config found"
elif [ -f "netlify.toml" ] || [ -f "_redirects" ]; then
  pass "Netlify config found"
else
  warn "No deployment config (vercel.json / netlify.toml) — ensure project is deployed"
fi

if [ -n "$README_FILE" ]; then
  README=$(cat "$README_FILE")
  if echo "$README" | grep -qiE "vercel\.app|netlify\.app|https://[a-z].*\.(app|io|dev|xyz|com)"; then
    pass "Deployed URL found in README"
  else
    fail "No deployed URL in README — deploy to Vercel/Netlify and add the link"
  fi
fi


# ─────────────────────────────────────────────
#  FINAL SUMMARY
# ─────────────────────────────────────────────

TOTAL=$((PASS + FAIL + WARN))
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║                  AUDIT SUMMARY                  ║${RESET}"
echo -e "${BOLD}╠══════════════════════════════════════════════════╣${RESET}"
echo -e "  ${GREEN}✅ Passed  :${RESET} $PASS"
echo -e "  ${RED}❌ Failed  :${RESET} $FAIL"
echo -e "  ${YELLOW}⚠️  Warnings:${RESET} $WARN"
echo -e "${BOLD}╚══════════════════════════════════════════════════╝${RESET}"
echo ""

if [ "$FAIL" -eq 0 ] && [ "$WARN" -le 2 ]; then
  echo -e "${GREEN}${BOLD}  🎉 All hard requirements met — ready to submit for Level 3!${RESET}"
elif [ "$FAIL" -eq 0 ]; then
  echo -e "${YELLOW}${BOLD}  🔧 No hard failures, but $WARN warning(s) to address for best results.${RESET}"
elif [ "$FAIL" -le 2 ]; then
  echo -e "${YELLOW}${BOLD}  🔧 Almost there — fix the $FAIL failing item(s) before submitting.${RESET}"
else
  echo -e "${RED}${BOLD}  🚨 $FAIL requirement(s) failing — significant work needed before submission.${RESET}"
fi

echo ""
echo -e "  ${BOLD}${CYAN}Level 3 quick-fix checklist:${RESET}"
echo -e "  → Run tests          : npm test"
echo -e "  → Record demo        : https://loom.com  (free, easy)"
echo -e "  → Deploy             : vercel deploy --prod"
echo -e "  → Stellar Explorer   : https://stellar.expert/explorer/testnet"
echo ""
