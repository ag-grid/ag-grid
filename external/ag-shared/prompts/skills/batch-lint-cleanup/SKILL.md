---
targets: ['*']
name: batch-lint-cleanup
description: 'Analyze ESLint violations and auto-fix specific rules in isolation'
invocable: user-only
---

# ESLint Auto-Fix Tool

Analyze ESLint violations or fix a specific rule in isolation.

## Usage

### Report Mode (No Arguments)

```
/lint-fix
```

Shows top ESLint violations by count with recommendations.

### Fix Mode (With Rule Name)

```
/lint-fix <rule-name>
```

**Examples:**

-   `/lint-fix unicorn/no-zero-fractions`
-   `/lint-fix unicorn/prefer-number-properties`
-   `/lint-fix unicorn/no-array-for-each`

---

## Instructions for AI Agent

### When Invoked WITHOUT Arguments (Report Mode)

1. **Run ESLint and analyze violations:**

    ```bash
    nx run-many -t lint:eslint 2>&1 | tee /tmp/eslint-output.txt
    ```

2. **Count violations by rule:**

    ```bash
    grep -oE 'unicorn/[a-z-]+|@typescript-eslint/[a-z-]+|no-[a-z-]+|sonarjs/[a-z-]+' /tmp/eslint-output.txt | sort | uniq -c | sort -rn | head -20
    ```

3. **Generate a formatted report showing:**

    - Top 10-15 violations ranked by type (error > warning) then by count
    - Which rules are auto-fixable (✅) vs manual (❌)
    - Recommended next rule to fix (highest count auto-fixable)
    - Brief description of what each rule fixes
    - Total warning/error count

4. **Format output as a table:**

    ```markdown
    ## ESLint Violations Report

    | Rank | Rule                             | Count | Auto-Fix | Description                            |
    | ---- | -------------------------------- | ----- | -------- | -------------------------------------- |
    | 1    | unicorn/prefer-number-properties | 170   | ✅       | Use `Number.*` APIs instead of globals |
    | 2    | unicorn/no-array-for-each        | 166   | ✅       | Prefer for...of over .forEach()        |
    | 3    | no-negated-condition             | 37    | ❌       | Prefer positive conditions             |

    ...
    ```

5. **Provide actionable recommendation:**

    ```markdown
    ### 🎯 Recommended Next Fix

    **`unicorn/prefer-number-properties`** - 170 violations

    -   Auto-fixable: ✅ Yes
    -   Changes: `isNaN()` → `Number.isNaN()`, `parseInt()` → `Number.parseInt()`
    -   Impact: Better global scope hygiene
    -   Risk: Low - semantically equivalent

    **To fix:** `/lint-fix unicorn/prefer-number-properties`
    ```

---

### When Invoked WITH Arguments (Fix Mode)

**Input:** Rule name (e.g., `unicorn/no-zero-fractions`)

**CRITICAL: Isolated Fixing Strategy**

Each rule MUST be fixed in complete isolation to prevent merge conflicts and allow precise review:

1. **Start fresh** - ensure clean working directory
2. **Fix ONLY the specified rule** - no opportunistic fixes
3. **Single commit per rule** - never batch multiple rules
4. **Verify before committing** - ensure fix doesn't break anything

---

### Step-by-Step Fix Process

#### 1. Verify Clean Working Directory

```bash
git status
```

If there are uncommitted changes:

-   STOP and warn user
-   Suggest they stash or commit existing changes first
-   Only proceed if user explicitly confirms

#### 2. Attempt Auto-Fix

```bash
nx run-many -t lint:eslint -- --rule "<rule-name>: error" --fix 2>&1 | tee /tmp/lint-fix.txt
```

Check results:

```bash
# Count remaining violations
grep -c "<rule-name>" /tmp/lint-fix.txt || echo "0"
```

#### 3. If Auto-Fix Successful

```bash
# Format all changes
yarn nx format --sort-root-tsconfig-paths=false

# Run full lint to ensure no new issues
yarn nx lint <affected-packages>

# Run type-check
yarn nx build:types <affected-packages>
```

If all pass:

```bash
git add -A
git commit -m "fix(lint): auto-fix <rule-name> violations"
```

#### 4. If Manual Fix Required

For non-auto-fixable rules or remaining violations after auto-fix:

1. **List all remaining violations:**

    ```bash
    nx run-many -t lint:eslint -- --rule "<rule-name>: error" 2>&1 | grep "<rule-name>"
    ```

2. **Group by file/pattern** for efficient fixing

3. **Fix each file systematically:**

    - Open file
    - Apply fix pattern consistently
    - Move to next file

4. **After each batch of fixes:**

    ```bash
    # Verify the fix works
    nx run-many -t lint:eslint -- --rule "<rule-name>: error"
    ```

5. **When complete:**

    ```bash
    yarn nx format --sort-root-tsconfig-paths=false
    yarn nx lint <affected-packages>
    yarn nx build:types <affected-packages>

    git add -A
    git commit -m "fix(lint): manually fix <rule-name> violations"
    ```

---

### Common Auto-Fixable Rules Reference

| Rule                                | Auto-Fix | Typical Change               |
| ----------------------------------- | -------- | ---------------------------- |
| `unicorn/prefer-number-properties`  | ✅       | `isNaN()` → `Number.isNaN()` |
| `unicorn/no-array-for-each`         | ✅       | `.forEach()` → `for...of`    |
| `unicorn/no-zero-fractions`         | ✅       | `1.0` → `1`                  |
| `unicorn/prefer-string-slice`       | ✅       | `.substr()` → `.slice()`     |
| `@typescript-eslint/no-unused-vars` | ❌       | Remove or use variable       |
| `no-negated-condition`              | ❌       | Invert condition logic       |
| `sonarjs/cognitive-complexity`      | ❌       | Refactor complex function    |

---

### Safety Checks

**Before ANY commit:**

1. ✅ `yarn nx format --sort-root-tsconfig-paths=false` passes
2. ✅ `yarn nx lint <affected-packages>` passes
3. ✅ `yarn nx build:types <affected-packages>` passes
4. ✅ Only files related to the rule are changed
5. ✅ No unrelated "opportunistic" fixes included

**If any check fails:** STOP and report to user
