# Documentation Review Core Methodology

This file contains the shared documentation review methodology. It is included by product-specific wrapper prompts that provide configuration (paths, conventions, resolution rules).

## Required Product Configuration

The product wrapper that references this file MUST define these sections (referenced by exact name below):

-   **Input Requirements** — documentation page path pattern, dev URL
-   **File Resolution Rules** — table mapping documentation references to TypeScript definition files
-   **Implementation Resolution Rules** — table mapping features to source implementation files
-   **Example Path Pattern** — directory layout for examples
-   **Exceptions File Path** — location of the per-page exceptions file
-   **Output Paths** — where review plans, reports, and summaries are written
-   **Default Value Verification Hierarchy** — how runtime defaults are resolved in the product
-   **Product-Specific Conventions** — accepted patterns, known pitfalls, enablement conventions

Optional sections:

-   **Orchestration Indicator** — if the product has a batch orchestration script, name it here so Strict Mode can be detected
-   **Browser Testing Tips** — file path to product-specific browser testing guidance, read at the start of browser testing
-   **Example Direct URL Pattern** — URL template with `${pageName}` and `${exampleName}` placeholders for opening examples at standalone direct URLs (no iframe, no docs page chrome). When configured, browser testing of examples is delegated to a sub-agent.

## Execution Mode Detection

Check for any of these indicators:

-   "EXECUTION CONTEXT: ORCHESTRATED" in the prompt
-   Session ID provided
-   Invoked via the orchestrator script named in **Orchestration Indicator** (if provided)

**If found**: **STRICT MODE** - All MCP tools REQUIRED. If ANY tool is missing, STOP immediately with error message: `ERROR: Cannot proceed in orchestrated mode - missing required MCP tool [name]`. Do NOT attempt review or fallbacks.

**If not found**: Proceed with the layered review approach described below.

## Review Approach: Static Analysis + Browser Testing

Every review performs **static analysis** — reading files, validating APIs, checking examples against TypeScript definitions. This always happens regardless of tool availability.

When browser tools (claude-in-chrome) are available, **browser testing is additionally performed** on top of static analysis. Browser testing verifies rendering, interactive behaviour, and visual correctness that static analysis cannot check.

### Browser Availability Check

At the **start of Phase 2**, determine browser availability:

1. Call `mcp__claude-in-chrome__tabs_context_mcp` to test browser connectivity.
2. If the call **succeeds**: browser testing is **MANDATORY** for this review, in addition to static analysis.
3. If the call **fails** or the tool does not exist: note the limitation and proceed with static analysis only. Display the warning below.

IMPORTANT: When `tabs_context_mcp` succeeds, browser testing is REQUIRED in addition to static analysis. DO NOT skip browser testing. DO NOT report "[SKIPPED] VISUAL TESTING" when browser tools are available. DO NOT assume browser tools are unavailable without first calling `tabs_context_mcp`.

### Browser Unavailable Warning Template

Display this warning only when `tabs_context_mcp` fails or is not available:

```
[WARNING] BROWSER TOOLS UNAVAILABLE

Missing capabilities:
- Browser automation (claude-in-chrome)

Limitations:
- Static code analysis only for examples
- No automated screenshots
- No runtime behavior validation
- No interactive testing

Still included:
- Full API and TypeScript validation
- Configuration consistency checking
- Static example code analysis
- Documentation accuracy assessment
```

## Three-Phase Review Process

### Phase 1: Create Review Plan

**Goal**: Analyse documentation and create structured validation plan using mechanical file resolution.

#### Step 1: Discover Files to Review

**A. Read documentation page**: Use the path pattern from **Input Requirements** in the product configuration.

**B. Extract API surface systematically**:

1. **Scan for code blocks** containing configuration objects to extract property names
2. **Extract interface references** from docs (look for product-specific interface naming patterns)
3. **List all example references** (pattern: `<framework-example.*example='${exampleName}'`)
4. **Note chart/component types mentioned** (e.g., "bar", "line", "pie", "scatter")

**C. Resolve TypeScript definition files**: Apply the **File Resolution Rules** table in the product configuration sequentially for each API/interface mentioned in docs.

**D. Resolve implementation files**: Apply the **Implementation Resolution Rules** table in the product configuration based on feature/type.

**E. Resolve example files**: Use the **Example Path Pattern** in the product configuration. For each example name extracted:

-   Check the required file (typically `main.ts`)
-   Check optional files (`data.ts`, `styles.css`, etc.) if they exist

**F. Check for exceptions file**: Look at the path specified in **Exceptions File Path** in the product configuration.

#### Step 2: Create Structured Plan

Document all discovered files and create validation tasks in the review plan output location (see **Output Paths** in product configuration):

1. **List TypeScript definitions to verify** (with full paths from Step 1C)
2. **List implementation files to cross-check** (with full paths from Step 1D)
3. **List module files to check for theme template defaults** (with full paths from Step 1D)
4. **List examples to test** with:
    - Example name and path
    - What the docs claim it demonstrates
    - Key configurations mentioned in docs
    - Expected behaviours described
5. **List interactive features** to test
6. **List visual states** to capture (when browser available)

**Output**: Write to the review plans path specified in **Output Paths**.

### Phase 2: Execute Review

**Prerequisites**:

-   The review plan output file must exist and have been updated with the review plan from Step 1.

**Goal**: Validate technical accuracy, example consistency, and content quality through static analysis and browser testing.

1. **Establish Browser Session**:

    Determine browser availability before any other review work:

    1. Call `mcp__claude-in-chrome__tabs_context_mcp` to test browser connectivity.
    2. If successful, create a new tab with `mcp__claude-in-chrome__tabs_create_mcp`.
    3. If the product configuration includes a **Browser Testing Tips** section, read that file for navigation guidance.
    4. Navigate to the dev URL from **Input Requirements**.
    5. Take an initial full-page screenshot to confirm the page loaded.

    If `tabs_context_mcp` fails or is not available, display the **Browser Unavailable Warning Template** and proceed with static analysis only for the rest of Phase 2.

2. **Clean reports directory**: Delete existing files in the reports directory for this page (see **Output Paths** in product configuration).

3. **Technical Accuracy Review** (always performed):

    > **Default Value Verification**: When checking defaults, always verify against the hierarchy described in the **Default Value Verification Hierarchy** in the product configuration. Theme/module defaults override decorator defaults and represent actual runtime behaviour.

    - Verify APIs against TypeScript definitions using paths from **File Resolution Rules**
    - Check implementations using paths from **Implementation Resolution Rules**
    - Validate default values using the hierarchy from product configuration
    - Verify code snippets work correctly
    - Document findings with:
        - Status indicators: `[CRITICAL]`, `[WARNING]`, or `[PASSED]`
        - Specific file:line locations
        - Code examples showing incorrect vs correct
        - For defaults: Show all layers of the verification hierarchy

4. **Example Testing — Static Analysis** (always performed):

    For each example, perform static analysis:

    - Read source files from the **Example Path Pattern**
    - Extract documentation claims about the example
    - Validate: configuration consistency, API usage, property validation, data compatibility, best practices
    - Report format:

    ```
    #### [Example Name] - Static Analysis
    **Location**: `_examples/[example-name]/`

    [PASSED] **Configuration Verified**: [list validated configurations]

    [CRITICAL] **Configuration Issues**:
    - **Issue**: [Specific mismatch]
    - **Documentation claims**: [What docs say]
    - **Actual code**: [What's in example]
    - **Fix Required**: [Specific action]
    ```

5. **Example Testing — Browser Verification** (when browser available):

    **If the product configuration includes an Example Direct URL Pattern**, delegate browser testing to parallel `docs-example-browser-tester` sub-agents (one per example):

    1. **Construct direct example URLs** by substituting `${pageName}` and `${exampleName}` into the URL pattern for each example identified in the review plan.
    2. **Prepare testing context** — for each example, assemble:
        - `name`: the example identifier
        - `url`: the direct standalone URL
        - `docClaims`: what the documentation says the example demonstrates
        - `expectedControls`: interactive controls expected (from static analysis in step 4)
        - `expectedBehaviours`: behaviours to verify when interacting
    3. **Spawn one `docs-example-browser-tester` sub-agent per example** via parallel Task tool calls in a single message (haiku model). Each sub-agent receives context for its single example only, plus the **Browser Testing Tips** file path (if configured) and the reports directory path.

        IMPORTANT: Issue ALL Task calls in a SINGLE message to run them in parallel.
        Do NOT spawn one agent, wait for it to finish, then spawn the next.
        Example pattern for a page with 3 examples:

        ```
        Task call 1: { subagent_type: "docs-example-browser-tester", prompt: "Test example 'foo' at https://...foo/vanilla ..." }
        Task call 2: { subagent_type: "docs-example-browser-tester", prompt: "Test example 'bar' at https://...bar/vanilla ..." }
        Task call 3: { subagent_type: "docs-example-browser-tester", prompt: "Test example 'baz' at https://...baz/vanilla ..." }
        ```

        Each Task call must contain the full testing context for exactly ONE example
        (name, url, docClaims, expectedControls, expectedBehaviours). Do not combine
        multiple examples into a single Task call.
    4. **Collect results** from all sub-agents and integrate into the report under each example's section.

    **If Example Direct URL Pattern is NOT configured**, perform inline browser testing (fallback):

    For each example identified in the review plan:

    1. Scroll to the example on the page (scroll over prose text or margins, NOT over grid iframes — grids capture scroll events)
    2. Take a screenshot of the example in its default state
    3. Identify interactive controls (buttons, dropdowns) rendered above the grid iframe
    4. Click each documented interactive control and screenshot the result state
    5. Compare the rendered output against documentation claims
    6. Check browser console for errors after interactions (ignore known warnings like licence messages)

    Report format (used by both approaches):

    ```
    #### [Example Name] - Browser Verification
    **URL**: [direct example URL or dev URL with anchor]

    [PASSED] **Renders correctly**: [description of what was verified]
    [PASSED] **Interactive control [name]**: Clicking [control] produced [expected result]

    [CRITICAL] **Rendering Issue**:
    - **Documentation claims**: [What docs say]
    - **Actual rendering**: [What was observed]
    - **Screenshot**: [reference to screenshot file]

    [WARNING] **Console Errors**: [list any unexpected errors]
    ```

6. **Visual & Interaction Testing** (when browser available):

    Test interactive features described in the documentation beyond individual examples:

    1. Test page-level interactive features (e.g., theme switchers, framework selectors)
    2. Test any documented keyboard interactions or accessibility features
    3. Verify cross-references and internal links navigate correctly
    4. Take screenshots as evidence for each test
    5. Check browser console for errors throughout testing
    6. Save screenshots to the reports directory for this page

7. **Content Quality** (always performed):
    - Completeness of feature coverage
    - Accuracy against code analysis (static and browser-based if available)
    - Missing documentation for discovered features

**Output**: Write to the reports path specified in **Output Paths** (see Report Structure below).

### Phase 3: Generate Summary

**Goal**: Aggregate findings from all reviewed pages.

Process page reports in batches to avoid context limits:

1. Process ~10 pages per batch → temporary `batch-summary-{n}.json`
2. Aggregate batch summaries → final report
3. Identify patterns and prioritise recommendations

**Output**: Write to the summary path specified in **Output Paths**.

## Report Structure Requirements (Phase 2)

All reports must include these sections in order. Use the specified structure and include all required elements.

### 1. Executive Summary

Required elements:

-   Brief assessment of page
-   Browser testing status: whether browser tools were available and used
-   Overall status: `[CRITICAL ISSUES]`, `[ISSUES FOUND]`, or `[ALL PASSED]`
-   Issue counts by category: Technical Accuracy, Example Consistency (static + browser if available), Visual/Interaction (or SKIPPED if browser unavailable), Content Quality

### 2. Review Limitations (if browser unavailable)

Include this section only when `tabs_context_mcp` failed or was not available. List what was skipped (browser testing, screenshots, interactions) and what was completed (static analysis, configuration verification, API validation).

### 3. Known Exceptions

List exceptions from the exceptions file (see **Exceptions File Path** in product configuration) if any exist, or note if no exceptions file found.

### 4. Technical Accuracy Issues

Structure each finding as:

-   Status indicator: `[PASSED]`, `[WARNING]`, or `[CRITICAL]`
-   Specific file:line reference
-   Code comparison (incorrect → correct)
-   Implementation file reference

Example:

```
[CRITICAL] **Default Value Mismatch** at `index.mdoc:45`
- Docs claim: `spacing: 10` (default)
- Decorator default: `spacing: number = 1` (Properties.ts:95)
- Theme/module default: `spacing: 20` (Module.ts:51) <-- Actual runtime default
- TypeScript comment: `spacing: 10` (Options.ts:74) <-- Stale
- Fix: Update documentation and TypeScript comment to reflect runtime default of 20
```

### 5. Example Consistency Issues

Structure findings by example with clear headers. Include appropriate status labels (CRITICAL FAILURE, DOCUMENTATION MISMATCH, etc.). Provide specific fix instructions.

Always include static analysis findings for every example. When browser testing was performed, additionally include browser verification findings (rendering, interaction results, screenshots) for each example.

### 6. Visual and Interaction Testing Results

-   **Browser available**: Reference specific screenshots as evidence (e.g., "See `reports/screenshots/tooltip-hover.png`"). Include interaction test results and console error checks.
-   **Browser unavailable**: Note "[SKIPPED] VISUAL TESTING — `tabs_context_mcp` was not available or failed". Only use this marker when browser tools were genuinely unavailable.
-   List any console errors found during testing

### 7. Content Quality Issues

Document:

-   Missing property documentation
-   Incomplete feature coverage
-   Unclear explanations
-   Gaps between implementation and documentation

### 8. Recommendations

Organise by priority with specific fix instructions:

```
### High Priority (Critical Fixes Required)
1. **[Specific Issue]**:
   - [Specific fix instruction]
   - Update file: `[exact file path]` at line [X]

### Medium Priority
[List medium priority fixes]

### Low Priority
[List low priority improvements]
```

### 9. Summary

Overall assessment including:

-   Files requiring updates (with full paths)
-   Evidence locations (screenshots, test results if available)
-   Any limitations due to browser unavailability
-   Next steps

## Documentation Style Principles

When reviewing documentation, apply these principles to avoid over-documentation:

### Do NOT Recommend Adding:

1. **Default values in prose** - Don't add sentences like "The default value is X" unless the default is surprising or essential for understanding. Users can check the API Reference for defaults.

2. **Redundant enablement explanations** - If something is enabled by default, don't explain how to enable it. Only document how to disable.

    - Bad: "The toolbar can be enabled by setting `enabled: true`, or disabled by setting `enabled: false`"
    - Good: "The toolbar is enabled by default. Use `enabled: false` to disable."

3. **New sections for minor properties** - Not every property needs its own documentation section. Properties like `spacing`, `padding`, or simple numeric values are adequately covered in the API Reference.

4. **Implementation details** - Don't document internal behaviour like callback return value handling, fallback mechanisms, or edge case handling unless it's essential for correct usage.

5. **Verbose explanations** - Keep documentation concise. If something can be explained in one sentence, don't use three.

### Example Titles

Example titles should describe what the example demonstrates, not just the chart/component type:

-   Bad: "Overlapping Series" (describes the data, not the feature)
-   Good: "Simple Highlight" (describes what's being demonstrated)
-   Bad: "Bar Chart with Tooltip" (generic)
-   Good: "Custom Tooltip Content" (specific feature demonstrated)

### When Flagging Issues

Only flag documentation as incomplete if:

-   A **primary feature** is undocumented (not minor styling properties)
-   The documentation is **factually incorrect** (wrong API names, broken examples)
-   An example **doesn't match** what the documentation claims it shows
-   There's a **critical default** that affects common use cases

Do NOT flag:

-   Missing documentation for every property (that's what API Reference is for)
-   Missing default value mentions
-   Opportunities to add more detail to already-clear explanations

## Language Conventions

Documentation must follow these spelling and language conventions:

| Content Type                  | Language                              | Examples                                                      |
| ----------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| **Documentation text**        | UK/British English                    | colour, centre, behaviour, customisation, visualise, minimise |
| **Code comments in examples** | UK/British English                    | `// Customise the colour`                                     |
| **API option names**          | US English (as defined in TypeScript) | `color`, `center`, `behavior`                                 |
| **JSDoc comments**            | UK/British English                    | `/** Customises the series colour. */`                        |

**Key Spelling Differences to Check**:

-   colour (UK) vs color (US) - use UK in prose, US in API names
-   centre (UK) vs center (US) - use UK in prose, US in API names
-   behaviour (UK) vs behavior (US) - use UK in prose
-   customisation (UK) vs customization (US) - use UK
-   visualise (UK) vs visualize (US) - use UK
-   minimise (UK) vs minimize (US) - use UK
-   licence (UK noun) vs license (US) - use UK in prose
-   organisation (UK) vs organization (US) - use UK
-   cancelled (UK) vs canceled (US) - use UK
-   labelling (UK) vs labeling (US) - use UK

**Grammar Checks**:

-   Consistent tense usage (prefer present tense)
-   Subject-verb agreement
-   Proper punctuation (Oxford comma optional but be consistent)
-   Correct use of articles (a/an/the)
-   No sentence fragments in explanatory text

## Tool Usage by Phase

| Phase                         | Required Tools | Additional Tools (when browser available)                                              |
| ----------------------------- | -------------- | -------------------------------------------------------------------------------------- |
| Phase 1                       | Read, Write    | -                                                                                      |
| Phase 2 — Static Analysis     | Read, Write    | -                                                                                      |
| Phase 2 — Browser Testing     | -              | Task (parallel per-example docs-example-browser-tester sub-agents), or claude-in-chrome inline as fallback |
| Phase 3                       | Read, Write    | -                                                                                      |

## Usage

1. **Phase 1**: Provide page path → receive review plan
2. **Phase 2**: Provide page path → receive detailed report (with static analysis always, browser testing when available)
3. **Phase 3**: Run after all pages reviewed → receive summary report
