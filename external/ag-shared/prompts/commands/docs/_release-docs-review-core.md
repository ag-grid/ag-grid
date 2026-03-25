# Release Documentation Review Core Methodology

This file contains the shared release documentation review methodology. It is included by product-specific wrapper prompts that provide configuration (paths, page lists, branch patterns).

## Required Product Configuration

The product wrapper that references this file MUST define these sections (referenced by exact name below):

-   **Product** — product name, docs review command name
-   **Paths** — docs root, types root, docs file pattern, examples pattern, types file pattern
-   **Release Branch Pattern** — branch naming format, discovery command
-   **Priority Pages** — high-priority and medium-priority page lists
-   **Output Paths** — reports directory, filtered/complete task list paths, summary path
-   **Verification Paths** — files to confirm exist after each page review

## Help

If the user provides a command option of `help`:

-   Explain how to use this prompt.
-   Explain if they are missing any prerequisites or tooling requirements.
-   DO NOT proceed, exit the prompt immediately after these steps.

## Prerequisite - Determine Branches to Compare

**Checklist:**

-   [ ] Are you given multiple branches as command options?
        → Compare these two as previous and current releases respectively.
-   [ ] Are you given a single branch as command option?
        → Compare this branch against the highest-numbered release branch matching the **Release Branch Pattern**.
-   [ ] Are you given no command options?
        → Compare the current branch against the highest-numbered release branch, or the previous highest if already on a release branch.

If you are uncertain about which branches to compare, **halt and ask the user to clarify before continuing.**

## Task Overview

Perform a comprehensive documentation review for all docs pages that have been modified or affected by API changes between release branches. This includes:

1. Directly modified documentation pages
2. Pages containing modified examples
3. Pages referencing modified public APIs

## Critical Requirements

**READ THIS FIRST - MANDATORY EXECUTION RULES:**

### Rule 1: Use Skill Tool for ALL Reviews

**MANDATORY:** When executing documentation reviews (Step 8), you MUST:

-   Use: `Skill` tool with the docs review command specified in **Product** configuration
-   DO NOT: Create custom review prompts for sub-agents
-   DO NOT: Perform reviews manually
-   DO NOT: Implement alternative review methods

**Why:** The docs review command follows a standardised three-phase process with specific output formats and quality checks. Custom implementations bypass this standard.

**Verification:** After each review, confirm the files specified in **Verification Paths** exist.

### Rule 2: One Page Per Sub-Agent - NO BATCHING

**MANDATORY:** When spawning sub-agents (Step 8), you MUST:

-   SPAWN: One sub-agent per documentation page
-   DO NOT: Batch multiple pages into one sub-agent
-   DO NOT: Ask one sub-agent to review 10, 20, or any N>1 pages
-   DO NOT: Create "batches" for efficiency

**Why:** Batching causes:

1. Inconsistent review depth (later pages get less attention)
2. Context overflow and token exhaustion
3. Non-standard report locations and formats
4. Inability to track per-page completion

**Correct Pattern:**

```
Task 1: Review page-name-1 → /docs-review page-name-1
Task 2: Review page-name-2 → /docs-review page-name-2
Task 3: Review page-name-3 → /docs-review page-name-3
```

**Incorrect Pattern:**

```
Task 1: Review pages 1-20 → DO NOT DO THIS
```

### Rule 3: Parallel Execution for Efficiency

**RECOMMENDED:** Launch sub-agents in parallel:

-   USE: Single message with multiple Task tool calls
-   LAUNCH: 10-20 agents concurrently (one per page)
-   MONITOR: Wait for all agents to complete before aggregating

**Example:** For 50 pages, launch in 3 waves of ~17 agents each.

## Workflow

### Step 1: Identify Previous Release Branch

Determine the previous release branch to compare against using the checklist above.

Execute the discovery command from the **Release Branch Pattern** in the product configuration to list recent release branches, then store the branches for comparison:

```bash
export PREVIOUS_BRANCH=<previous_branch>
export CURRENT_BRANCH=<current_branch or HEAD>
```

### Step 1b: Pre-flight Permission Check

Before spawning review sub-agents, ensure the output directories exist and file writes are permitted. Sub-agents that cannot write output files waste significant tokens reporting permission failures.

```bash
# Create output directories (substitute paths from product config)
mkdir -p external/prompts/technical-review-plans
mkdir -p reports/docs-review

# Test write permission
touch external/prompts/technical-review-plans/.permission-test && rm external/prompts/technical-review-plans/.permission-test
touch reports/docs-review/.permission-test && rm reports/docs-review/.permission-test
echo "✓ Write permissions verified"
```

If either `mkdir` or `touch` fails due to permission restrictions, resolve the permission issue before proceeding to Step 8. All review sub-agents require Write access to these directories.

### Step 2: Identify Modified Documentation Pages

Find all directly modified documentation files using the **Paths** → Docs file pattern from the product configuration:

```bash
# Get list of modified docs files (substitute DOCS_PATH from product config Paths → Docs root)
git diff --name-only $PREVIOUS_BRANCH $CURRENT_BRANCH -- '${DOCS_PATH}/**/*.mdoc' | \
  grep -E '\.mdoc$' | \
  sed "s|${DOCS_PATH}/||" | \
  sed 's|/index\.mdoc$||' | \
  sort -u > modified-docs.txt

echo "Found $(wc -l < modified-docs.txt) directly modified documentation pages"
```

> **Note**: Replace `${DOCS_PATH}` with the actual docs root path from the product configuration **Paths** section.

### Step 3: Identify Modified Examples

Find all modified examples and their associated documentation pages:

```bash
# Get list of modified examples (substitute DOCS_PATH from product config)
git diff --name-only $PREVIOUS_BRANCH $CURRENT_BRANCH -- '${DOCS_PATH}/**/_examples/**' | \
  grep -E '/_examples/' | \
  sed "s|${DOCS_PATH}/||" | \
  sed 's|/_examples/.*||' | \
  sort -u > examples-docs.txt

echo "Found $(wc -l < examples-docs.txt) docs pages with modified examples"
```

### Step 4: Identify Modified Public APIs

Analyse changes to public APIs and find documentation pages that reference them:

```bash
# Get list of modified type files (substitute TYPES_PATH from product config Paths → Types root)
git diff --name-only $PREVIOUS_BRANCH $CURRENT_BRANCH -- '${TYPES_PATH}/' | \
  grep -E '\.(ts|d\.ts)$' > modified-types.txt

# Extract modified interface/type names
for file in $(cat modified-types.txt); do
  git diff $PREVIOUS_BRANCH $CURRENT_BRANCH -- "$file" | \
    grep -E '^[+-](export )?(interface|type|class|enum) ' | \
    sed -E 's/^[+-](export )?(interface|type|class|enum) ([A-Za-z0-9]+).*/\3/' | \
    sort -u
done > modified-api-names.txt

# Find docs that reference any modified API (single pass for performance)
API_PATTERN=$(paste -sd'|' modified-api-names.txt)
grep -rlE "$API_PATTERN" ${DOCS_PATH}/ --include="*.mdoc" | \
  sed "s|${DOCS_PATH}/||" | \
  sed 's|/index\.mdoc$||' | \
  sort -u > api-affected-docs.txt
echo "Found $(wc -l < api-affected-docs.txt) docs pages referencing modified APIs"
```

### Step 5: Consolidate Affected Documentation Pages

Combine all identified pages into a single list:

```bash
cat modified-docs.txt examples-docs.txt api-affected-docs.txt | \
  sort -u > all-affected-docs.txt

TOTAL_PAGES=$(wc -l < all-affected-docs.txt)
echo "Total documentation pages requiring review: $TOTAL_PAGES"

# Keep examples-docs.txt and api-affected-docs.txt for filtering step
rm modified-docs.txt modified-types.txt modified-api-names.txt
```

### Step 6: Filter Trivial Changes

Many documentation changes are trivial formatting standardisation that don't require review. Filter these out to focus on substantive changes.

First, get diff statistics for all pages:

```bash
# Get diff statistics for each page (substitute DOCS_PATH from product config)
cat all-affected-docs.txt | while read page; do
  file="${DOCS_PATH}/${page}/index.mdoc"
  stats=$(git diff $PREVIOUS_BRANCH $CURRENT_BRANCH --shortstat -- "$file" 2>/dev/null)
  if [ -n "$stats" ]; then
    insertions=$(echo "$stats" | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo "0")
    deletions=$(echo "$stats" | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo "0")
    total=$((insertions + deletions))
    echo "$total,$insertions,$deletions,$page"
  fi
done | sort -t',' -k1 -nr > /tmp/diff-stats.txt
```

Then, categorise changes using Python. The script uses these variables from the product configuration:

| Script Variable        | Product Config Section                |
| ---------------------- | ------------------------------------- |
| `DOCS_PATH`            | **Paths** → Docs root                |
| `high_priority_pages`  | **Priority Pages** → High priority   |
| `medium_priority_pages`| **Priority Pages** → Medium priority |
| `file_path` template   | **Paths** → Docs root + `/{page}/index.mdoc` |
| Trivial-change patterns| Generic (no product substitution needed) |

> **Substitute the values below** from the product configuration before executing.

````python
#!/usr/bin/env python3
import subprocess
import re

categories = {
    'SKIP_TRIVIAL': [],
    'SKIP_TEST_NEW': [],
    'REVIEW_NEEDED': []
}

# Load pages with example changes
example_pages = set()
try:
    with open('examples-docs.txt', 'r') as f:
        example_pages = set(line.strip() for line in f if line.strip())
except FileNotFoundError:
    pass

# Load pages with API changes
api_pages = set()
try:
    with open('api-affected-docs.txt', 'r') as f:
        api_pages = set(line.strip() for line in f if line.strip())
except FileNotFoundError:
    pass

def calculate_risk_score(page, total_lines, has_examples, has_api_changes, file_path, prev_branch, curr_branch):
    '''
    Calculate risk score (0-100) based on multiple factors.
    Higher score = higher priority for review.
    '''
    score = 0

    # Factor 1: Change source (0-40 points)
    if has_api_changes:
        score += 25  # API changes are high risk
    if has_examples:
        score += 25  # Example changes are high risk

    # Factor 2: Change magnitude (0-25 points)
    if total_lines > 200:
        score += 25
    elif total_lines > 100:
        score += 20
    elif total_lines > 50:
        score += 15
    elif total_lines > 20:
        score += 10
    elif total_lines > 0:
        score += 5

    # Factor 3: Content type analysis (0-20 points)
    result = subprocess.run(
        ['git', 'diff', prev_branch, curr_branch, '--', file_path],
        capture_output=True, text=True
    )
    diff = result.stdout

    # Check for high-risk content changes
    if '{% warning %}' in diff or '{% note %}' in diff:
        score += 8  # New warnings/notes are important
    if re.search(r'\+##[^#]', diff):  # New sections (but not subsections)
        score += 12  # New major sections are high priority

    # Factor 4: Page importance (0-15 points)
    # SUBSTITUTE these lists from the product configuration Priority Pages section
    high_priority_pages = [
        # *** REPLACE with values from product config Priority Pages → High priority ***
    ]
    medium_priority_pages = [
        # *** REPLACE with values from product config Priority Pages → Medium priority ***
    ]

    if any(p in page for p in high_priority_pages):
        score += 15
    elif any(p in page for p in medium_priority_pages):
        score += 10
    elif page.endswith('-test'):
        score -= 10  # Test pages are lower priority

    return min(100, max(0, score))  # Clamp to 0-100

def is_trivial_change(page, file_path, prev_branch, curr_branch):
    '''
    Determine if a change is trivial (formatting only).
    Returns True only if ALL changes match known trivial patterns.
    Errs on the side of reviewing when uncertain.
    '''
    # First check: ignore whitespace-only changes
    result_ws = subprocess.run(
        ['git', 'diff', '-w', '--ignore-blank-lines', prev_branch, curr_branch, '--', file_path],
        capture_output=True, text=True
    )

    # If no diff after ignoring whitespace, it's purely whitespace changes
    if not result_ws.stdout.strip():
        return True

    # Get full diff for detailed analysis
    result = subprocess.run(
        ['git', 'diff', prev_branch, curr_branch, '--', file_path],
        capture_output=True, text=True
    )
    diff = result.stdout

    # Extract all added lines (excluding diff metadata)
    added_lines = []
    for line in diff.split('\n'):
        if line.startswith('+') and not line.startswith('+++'):
            added_lines.append(line[1:])  # Remove the '+' prefix

    # If no added lines, skip (only deletions)
    if not added_lines:
        return False

    # Define trivial change patterns (whitelist approach)
    trivial_patterns = [
        # Code block metadata additions
        r'^\s*```\w+\s+format="snippet"\s*$',
        r'^\s*```\w+\s+format="generated"\s*$',
        # Frontmatter changes (within --- blocks at file start)
        r'^\s*enterprise:\s*(true|false)\s*$',
        r'^\s*title:\s*[\'"].*[\'\"]\s*$',
        # Empty lines or pure whitespace
        r'^\s*$',
        # Opening/closing braces for code wrapping (but be conservative)
        r'^\s*\{\s*$',
        r'^\s*\}\s*$',
    ]

    # Check if ALL added lines match trivial patterns
    all_trivial = True
    for added_line in added_lines:
        line_is_trivial = False
        for pattern in trivial_patterns:
            if re.match(pattern, added_line):
                line_is_trivial = True
                break

        if not line_is_trivial:
            all_trivial = False
            break

    # Additional check: look for substantive content changes
    has_substantive = (
        '##' in '\n'.join(added_lines) or  # New sections
        '{% warning %}' in diff or  # New warnings
        '{% note %}' in diff or  # New notes
        re.search(r'\+\s*[A-Z][a-z]+.*\w+', diff)  # New prose content
    )

    return all_trivial and not has_substantive

# SUBSTITUTE DOCS_PATH from the product configuration Paths → Docs root
DOCS_PATH = '*** REPLACE with Paths → Docs root from product config ***'

with open('/tmp/diff-stats.txt', 'r') as f:
    for line in f:
        parts = line.strip().split(',')
        total, insertions, deletions, page = int(parts[0]), int(parts[1]), int(parts[2]), parts[3]

        file_path = f"{DOCS_PATH}/{page}/index.mdoc"

        has_examples = page in example_pages
        has_api = page in api_pages

        # CRITICAL: Pages with example or API changes must ALWAYS be reviewed
        # even if their .mdoc files have trivial or no changes
        if has_examples or has_api:
            risk_score = calculate_risk_score(page, total, has_examples, has_api, file_path, '$PREVIOUS_BRANCH', '$CURRENT_BRANCH')
            categories['REVIEW_NEEDED'].append((risk_score, total, page))
        # Categorize based on .mdoc file changes
        elif page.endswith('-test') and deletions == 0:
            # New test pages with no deletions
            categories['SKIP_TEST_NEW'].append((0, total, page))
        elif is_trivial_change(page, file_path, '$PREVIOUS_BRANCH', '$CURRENT_BRANCH'):
            # Only trivial formatting changes
            categories['SKIP_TRIVIAL'].append((0, total, page))
        else:
            # Everything else needs review (err on the side of reviewing)
            risk_score = calculate_risk_score(page, total, has_examples, has_api, file_path, '$PREVIOUS_BRANCH', '$CURRENT_BRANCH')
            categories['REVIEW_NEEDED'].append((risk_score, total, page))

# Output results sorted by risk score (descending) for REVIEW_NEEDED
for category, pages in categories.items():
    if category == 'REVIEW_NEEDED':
        for risk_score, total, page in sorted(pages, key=lambda x: (-x[0], -x[1])):
            print(f"{category},{risk_score},{total},{page}")
    else:
        for risk_score, total, page in pages:
            print(f"{category},{risk_score},{total},{page}")
````

Save this as `/tmp/categorize.py` and run:

```bash
python3 /tmp/categorize.py > /tmp/categorized-docs.txt

# Generate summary with risk score statistics
echo "=== Filtering Results ==="
echo "SKIP_TRIVIAL: $(grep -c '^SKIP_TRIVIAL,' /tmp/categorized-docs.txt) pages"
echo "SKIP_TEST_NEW: $(grep -c '^SKIP_TEST_NEW,' /tmp/categorized-docs.txt) pages"
echo "REVIEW_NEEDED: $(grep -c '^REVIEW_NEEDED,' /tmp/categorized-docs.txt) pages"
echo ""
echo "=== Risk Score Distribution (REVIEW_NEEDED pages) ==="
echo "Critical (80-100): $(grep '^REVIEW_NEEDED,' /tmp/categorized-docs.txt | awk -F',' '$2 >= 80' | wc -l) pages"
echo "High (60-79): $(grep '^REVIEW_NEEDED,' /tmp/categorized-docs.txt | awk -F',' '$2 >= 60 && $2 < 80' | wc -l) pages"
echo "Medium (40-59): $(grep '^REVIEW_NEEDED,' /tmp/categorized-docs.txt | awk -F',' '$2 >= 40 && $2 < 60' | wc -l) pages"
echo "Low (0-39): $(grep '^REVIEW_NEEDED,' /tmp/categorized-docs.txt | awk -F',' '$2 < 40' | wc -l) pages"

# Clean up tracking files after categorisation
rm examples-docs.txt api-affected-docs.txt
```

**Risk Scoring System (0-100):**

Pages requiring review are prioritised by risk score based on multiple factors:

1. **Change Source (0-40 points)**:

    - API changes: +25 points (may require doc updates)
    - Example changes: +25 points (code users copy must be correct)
    - Both API and examples: +50 points (maximum source risk)

2. **Change Magnitude (0-25 points)**:

    - > 200 lines: +25 points
    - 100-200 lines: +20 points
    - 50-100 lines: +15 points
    - 20-50 lines: +10 points
    - <20 lines: +5 points

3. **Content Type (0-20 points)**:

    - New major sections (`## Heading`): +12 points
    - New warnings/notes: +8 points

4. **Page Importance (0-15 points)**:
    - High priority (from **Priority Pages** → High priority): +15 points
    - Medium priority (from **Priority Pages** → Medium priority): +10 points
    - Test pages: -10 points (lower priority)

**Risk Levels**:

-   **Critical (80-100)**: Review first - high impact/high risk changes
-   **High (60-79)**: Review early - significant changes or important pages
-   **Medium (40-59)**: Standard review - moderate impact
-   **Low (0-39)**: Review when time permits - minor changes or less critical pages

**Trivial Change Detection Strategy:**

The filtering uses a **whitelist approach** with the following criteria:

1. **Example/API Change Override**: Pages with modified examples or API references are **ALWAYS** marked for review (with appropriate risk score), regardless of their docs file changes. This is critical because:

    - Example changes may affect documentation accuracy even without docs file changes
    - API changes may require documentation updates even if not yet applied
    - These changes indicate functional updates that need validation

2. **Whitespace-only changes**: For remaining pages, diff with `-w --ignore-blank-lines` to catch pure whitespace

3. **Known trivial patterns**: ALL added lines must match one of:

    - Code block metadata: `format="snippet"` or `format="generated"` attributes
    - Frontmatter changes: `enterprise:`, `title:` fields
    - Structural wrapping: `{` or `}` for code snippet wrapping
    - Empty lines

4. **No substantive content**: Must not contain:
    - New sections (`##` headings)
    - New warnings or notes (`{% warning %}`, `{% note %}`)
    - New prose content (sentences starting with capital letters)

**Conservative Approach**: If **any** line doesn't match a known trivial pattern, the page is marked for review. This errs on the side of over-reviewing rather than missing substantive changes.

**Test Page Pattern:**

-   Pages ending in `-test` with only additions (no deletions)
-   These are new test documentation pages that don't affect main documentation

### Step 7: Create Review Task Lists

Generate two task lists using the paths from **Output Paths** in the product configuration:

1. **Filtered list**: Only pages needing substantive review
2. **Complete list**: All modified pages (for reference)

> **Note**: In the bash below, substitute `${FILTERED_LIST}` and `${COMPLETE_LIST}` with the filtered and complete task list paths from **Output Paths**. Substitute `${DOCS_PATH}` with the docs root from **Paths**. Substitute the `/docs-review` command references with the docs review command from **Product** configuration.

**Create the filtered list:**

```bash
cat > ${FILTERED_LIST} << EOF
# Release Documentation Review (Filtered)

## Summary

- Previous Release: ${PREVIOUS_BRANCH}
- Current Release: ${CURRENT_BRANCH}
- Total Pages Modified: $(wc -l < all-affected-docs.txt)
- Pages Requiring Review: $(grep -c '^REVIEW_NEEDED,' /tmp/categorized-docs.txt)
- Pages Skipped (Trivial): $(grep -c '^SKIP_TRIVIAL,' /tmp/categorized-docs.txt)
- Pages Skipped (Test): $(grep -c '^SKIP_TEST_NEW,' /tmp/categorized-docs.txt)

## Risk Score Distribution

Pages are prioritised by risk score (0-100) based on:
- Change source (examples/API changes)
- Change magnitude (lines changed)
- Content type (new sections, warnings)
- Page importance (from **Priority Pages** configuration)

- **Critical (80-100)**: $(grep '^REVIEW_NEEDED,' /tmp/categorized-docs.txt | awk -F',' '\$2 >= 80' | wc -l) pages
- **High (60-79)**: $(grep '^REVIEW_NEEDED,' /tmp/categorized-docs.txt | awk -F',' '\$2 >= 60 && \$2 < 80' | wc -l) pages
- **Medium (40-59)**: $(grep '^REVIEW_NEEDED,' /tmp/categorized-docs.txt | awk -F',' '\$2 >= 40 && \$2 < 60' | wc -l) pages
- **Low (0-39)**: $(grep '^REVIEW_NEEDED,' /tmp/categorized-docs.txt | awk -F',' '\$2 < 40' | wc -l) pages

## Skipped Pages

### Trivial Formatting Changes
EOF

grep '^SKIP_TRIVIAL,' /tmp/categorized-docs.txt | cut -d',' -f4 | while read page; do
  echo "- ${page}" >> ${FILTERED_LIST}
done

cat >> ${FILTERED_LIST} << 'EOF'

### New Test Pages
EOF

grep '^SKIP_TEST_NEW,' /tmp/categorized-docs.txt | cut -d',' -f4 | while read page; do
  echo "- ${page}" >> ${FILTERED_LIST}
done

cat >> ${FILTERED_LIST} << 'EOF'

## Pages Requiring Review

Review in order of risk score (highest priority first).

### Critical Priority (Risk: 80-100)

EOF

# Add critical risk pages
grep '^REVIEW_NEEDED,' /tmp/categorized-docs.txt | awk -F',' '$2 >= 80' | while IFS=',' read category risk_score total_lines page; do
  cat >> ${FILTERED_LIST} << ENDTASK
- [ ] **${page}** - Risk: ${risk_score} (${total_lines} lines)
  - Command: \`/docs-review ${DOCS_PATH}/${page}/index.mdoc\`

ENDTASK
done

cat >> ${FILTERED_LIST} << 'EOF'

### High Priority (Risk: 60-79)

EOF

# Add high risk pages
grep '^REVIEW_NEEDED,' /tmp/categorized-docs.txt | awk -F',' '$2 >= 60 && $2 < 80' | while IFS=',' read category risk_score total_lines page; do
  cat >> ${FILTERED_LIST} << ENDTASK
- [ ] **${page}** - Risk: ${risk_score} (${total_lines} lines)
  - Command: \`/docs-review ${DOCS_PATH}/${page}/index.mdoc\`

ENDTASK
done

cat >> ${FILTERED_LIST} << 'EOF'

### Medium Priority (Risk: 40-59)

EOF

# Add medium risk pages
grep '^REVIEW_NEEDED,' /tmp/categorized-docs.txt | awk -F',' '$2 >= 40 && $2 < 60' | while IFS=',' read category risk_score total_lines page; do
  cat >> ${FILTERED_LIST} << ENDTASK
- [ ] **${page}** - Risk: ${risk_score} (${total_lines} lines)
  - Command: \`/docs-review ${DOCS_PATH}/${page}/index.mdoc\`

ENDTASK
done

cat >> ${FILTERED_LIST} << 'EOF'

### Low Priority (Risk: 0-39)

EOF

# Add low risk pages
grep '^REVIEW_NEEDED,' /tmp/categorized-docs.txt | awk -F',' '$2 < 40' | while IFS=',' read category risk_score total_lines page; do
  cat >> ${FILTERED_LIST} << ENDTASK
- [ ] **${page}** - Risk: ${risk_score} (${total_lines} lines)
  - Command: \`/docs-review ${DOCS_PATH}/${page}/index.mdoc\`

ENDTASK
done
```

**Create the complete list** (for reference):

```bash
# Create complete unfiltered task list (substitute COMPLETE_LIST and DOCS_PATH from product config)
cat all-affected-docs.txt | while read page; do
  cat >> ${COMPLETE_LIST} << ENDTASK
- [ ] **${page}**
  - Command: \`/docs-review ${DOCS_PATH}/${page}/index.mdoc\`

ENDTASK
done
```

**Use the filtered list** for actual reviews unless there's reason to suspect the filtering missed something important.

### Step 8: Execute Documentation Reviews

**CRITICAL REQUIREMENTS:**

1. **ONE PAGE PER SUB-AGENT - NO BATCHING**
2. **MUST USE Skill TOOL - NO CUSTOM IMPLEMENTATIONS**

#### Execution Pattern

For each documentation page in the **filtered task list**, spawn a dedicated sub-agent that:

1. **Reviews exactly ONE page** (no batching allowed)
2. **Uses the Skill tool** to invoke the docs review command from **Product** configuration
3. **Validates the review outputs** (files specified in **Verification Paths**)

#### Sub-Agent Prompt Template

Each sub-agent must receive this strict prompt (substitute product-specific values):

```
You are reviewing the [PAGE_NAME] documentation page for [PRODUCT_NAME] release from [PREVIOUS_BRANCH] to [CURRENT_BRANCH].

STRICT REQUIREMENTS:

1. MANDATORY: Use Skill tool to invoke the docs review command
   - Execute: Skill with command "/docs-review [DOCS_PATH]/[PAGE_NAME]/index.mdoc"
   - DO NOT create custom review implementations
   - DO NOT perform manual reviews
   - DO NOT skip the Skill tool

2. Single Page Only
   - Review ONLY: [PAGE_NAME]
   - DO NOT review multiple pages
   - DO NOT batch reviews

3. Verify Outputs
   - After the review completes, confirm the verification files exist
   - If files are missing, report failure

4. Return Summary
   - Report review status (PASSED / ISSUES FOUND / FAILED)
   - List critical issues if any found
   - Confirm Skill was used

Execute the review now.
```

#### Parallel Execution Strategy

Launch all sub-agents in parallel for maximum efficiency:

1. **Read the filtered task list** to get all pages requiring review
2. **Create one Task per page** in a single message (multiple tool calls)
3. **Monitor completion** of all agents
4. **Validate outputs** from each agent

#### Implementation Example

```bash
# Read filtered task list (substitute the filtered task list path from Output Paths)
PAGES=$(grep "^- \[ \]" ${FILTERED_LIST} | \
        grep -oP '\*\*\K[^*]+' | head -10)

# For each page, spawn a dedicated agent
# (In practice, you'll use multiple Task tool calls in one message)
```

#### Validation After Execution

After all agents complete, verify:

1. Each agent used Skill tool (check agent outputs)
2. Each page has the review files specified in **Verification Paths**
3. No agent reviewed multiple pages (batching violation)

**If validation fails:**

-   Identify which pages were not properly reviewed
-   Identify which agents didn't use Skill
-   Re-launch failed agents with corrected strict prompts

#### Handling Large Page Counts

For releases with many pages (e.g., 50+):

1. **Launch in waves** if needed (e.g., 20 agents at a time)
2. **Prioritise by risk score** (Critical → High → Medium → Low)
3. **Monitor token usage** across agents
4. **Wait for wave completion** before launching next wave

**Note**: Use the filtered list by default. Only review skipped pages if:

-   You find issues in related pages that suggest skipped pages may be affected
-   The release is high-risk and requires maximum thoroughness
-   Stakeholders specifically request full coverage

### Step 9: Generate Summary Report

After all individual page reviews are complete:

1. **Aggregate findings** from all technical review reports
2. **Identify patterns** across multiple pages
3. **Prioritise issues** by severity and frequency
4. **Generate release readiness assessment**

Write the final summary to the summary path from **Output Paths** in the product configuration.

## Output Format

### Filtered Task List (Primary Output)

Write to the filtered task list path from **Output Paths**.

This is the **primary list to use for reviews**. It excludes trivial formatting changes and focuses on substantive updates.

Format:

```markdown
# Release Documentation Review (Filtered)

## Summary

-   Previous Release: ${PREVIOUS_BRANCH}
-   Current Release: ${CURRENT_BRANCH}
-   Total Pages Modified: ${TOTAL_MODIFIED}
-   Pages Requiring Review: ${REVIEW_NEEDED_COUNT}
-   Pages Skipped (Trivial): ${SKIP_TRIVIAL_COUNT}
-   Pages Skipped (Test): ${SKIP_TEST_COUNT}

## Risk Score Distribution

Pages are prioritised by risk score (0-100) based on:
-   Change source (examples/API changes)
-   Change magnitude (lines changed)
-   Content type (new sections, warnings)
-   Page importance (from **Priority Pages** configuration)

-   **Critical (80-100)**: ${CRITICAL_COUNT} pages
-   **High (60-79)**: ${HIGH_COUNT} pages
-   **Medium (40-59)**: ${MEDIUM_COUNT} pages
-   **Low (0-39)**: ${LOW_COUNT} pages

## Analysis Summary

After analysing all modified documentation pages, categorised by change type.

### Skipped: Trivial Formatting Changes

These pages only have code formatting standardisation:

-   page-1
-   page-2

### Skipped: New Test Pages

New test documentation pages (all additions):

-   test-page-1
-   test-page-2

### Pages Requiring Review

-   [ ] **page-name**: /docs-review command...
```

### Complete Task List (Reference)

Write to the complete task list path from **Output Paths**.

This list includes **all** modified pages without filtering. Use for reference or when maximum thoroughness is required.

Format:

```markdown
# Release Documentation Review Tasks (Complete)

## Summary

-   Previous Release: ${PREVIOUS_BRANCH}
-   Current Release: ${CURRENT_BRANCH}
-   Total Pages Modified: ${TOTAL_PAGES}
-   Direct Doc Changes: ${DIRECT_COUNT}
-   Example Changes: ${EXAMPLE_COUNT}
-   API Impact: ${API_COUNT}

## All Modified Pages

-   [ ] page-1: /docs-review command...
-   [ ] page-2: /docs-review command...
```

### Final Summary Report

Write to the summary path from **Output Paths**.

Format:

```markdown
# Release Documentation Review Summary

## Executive Summary

[Brief overview of documentation status for release]

## Review Statistics

-   Total Pages Reviewed: X
-   Pages with Issues: Y
-   Critical Issues: Z
-   Estimated Fix Time: N hours

## Critical Issues Requiring Immediate Fix

[List of blocking documentation issues]

## Pattern Analysis

[Common issues found across multiple pages]

## Recommendations

[Prioritised list of documentation updates needed]

## Release Risk Assessment

[Overall documentation readiness: Low/Medium/High]
```

## Important Considerations

1. **Filtering and Triage**:

    - **Use the filtered list by default** - it uses risk scoring + conservative whitelist approach
    - **Risk scores (0-100) prioritise review order**: Critical (80-100) → High (60-79) → Medium (40-59) → Low (0-39)
    - **Example/API changes override all filtering**: Pages with modified examples or API references are ALWAYS reviewed, even if docs file changes are trivial or absent
    - **Whitespace-only changes** are automatically detected with `git diff -w`
    - **Trivial patterns** are explicitly whitelisted (code block metadata, frontmatter, structural wrapping)
    - **Conservative by design**: Any line that doesn't match a known trivial pattern → mark for review
    - New test pages (ending in `-test` with only additions) are skipped by default
    - If filtering reduces review load by >20%, mention this efficiency gain in reports
    - Review skipped pages only if issues found in related pages suggest impact

2. **Change Impact Analysis with Risk Scoring**:

    - **Change source** (40 points max): Example/API changes score highest
    - **Change magnitude** (25 points max): Larger changes = higher risk
    - **Content type** (20 points max): New sections/warnings increase risk
    - **Page importance** (15 points max): Pages listed in **Priority Pages** score highest
    - **Combined scores** guide review order - tackle high-risk pages first
    - Pages with >100 lines changed likely have major feature updates

3. **Review Scope Management**:

    - For large releases (>50 pages after filtering), use wave-based parallelism (launch multiple single-page sub-agents concurrently) rather than batching
    - Prioritise based on user-facing importance (getting started, key features, upgrade guides)
    - Start with largest changes first (they often reveal patterns)
    - Skip generated or auto-updated sections if identified

4. **Quality Gates**:
    - All HIGH priority issues must be resolved before release
    - MEDIUM priority issues should be documented in release notes
    - LOW priority issues can be addressed post-release
    - Formatting-only changes don't block releases

## Execution Tips

### Mandatory Practices

-   **Always run the filtering step (Step 6)** before creating task lists - it typically saves 20-40% of review effort
-   **ONE PAGE PER SUB-AGENT** - Never batch multiple pages into a single agent
-   **USE Skill TOOL** - Always invoke the docs review command via Skill, never create custom review implementations
-   **Validate outputs** - After reviews, confirm plan and report files exist at standard locations

### Performance Optimisation

-   **Launch agents in parallel** - Use single message with multiple Task tool calls for maximum efficiency
-   **Batch API calls, not reviews** - Launch 10-20 agents concurrently, but each reviews only ONE page
-   **Monitor completion** - Track which agents finish and which pages remain
-   **Cache git operations** - Store diff results in `/tmp/diff-stats.txt` and `/tmp/categorized-docs.txt`

### Quality Assurance

-   **Verify Skill usage** - Check agent outputs confirm they used Skill tool
-   **Validate standard outputs** - Ensure review plan and report files are in correct locations
-   **Check for batching violations** - Confirm no agent reviewed multiple pages
-   **Example validation** - If Step 3 found example changes, verify examples run correctly before reviewing docs

### Progress Tracking

-   **Provide status updates** - Report completion progress for long-running reviews (e.g., "35/77 pages reviewed")
-   **Identify failures early** - If agents don't use Skill or output goes to wrong location, stop and fix
-   **Wave-based execution** - For 50+ pages, review in waves of 15-20 agents each

## Benefits of Filtering

Typical filtering results across releases:

-   **Trivial formatting changes**: 5-10% of modified pages (pure formatting standardisation)
-   **New test pages**: 10-15% of modified pages (test documentation that doesn't affect main docs)
-   **Total efficiency gain**: 20-30% reduction in review workload while maintaining quality

Remember: This comprehensive review with intelligent filtering ensures documentation quality matches code quality for the release while optimising reviewer time.
