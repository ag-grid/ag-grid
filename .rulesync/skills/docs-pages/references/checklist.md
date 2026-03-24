# Documentation Page Checklist

Use this during Phase 3 validation before finalising a docs page.

---

## Frontmatter

-   [ ] `title` present
-   [ ] `description` present and uses the `$framework` placeholder
-   [ ] `enterprise: true` set if and only if the entire page requires an enterprise licence

## Page Structure

-   [ ] Value proposition (page subtitle) is one declarative sentence — describes what the feature IS or DOES
-   [ ] Section ordering followed: value prop → basic config → core concepts → advanced → events → API
-   [ ] Show-then-tell: `{% gridExampleRunner %}` appears **before** the code snippet in each section
-   [ ] "The example above uses the following configuration:" connector phrase used consistently
-   [ ] No content duplicated from a child page (parent/overview pages only)

## Writing

-   [ ] Active voice and present tense throughout
-   [ ] Contractions used ("doesn't", "can't") rather than formal negations
-   [ ] No negative framing — limitations lead with alternatives or requirements instead
-   [ ] Section headings are concise noun or action phrases (not "Understanding X", "Customizing Y")
-   [ ] UK/British English in prose ("behaviour", "colour")

## Markdoc Components

-   [ ] `frameworkTransform=true` on every code fence that contains `gridOptions` with anything other than `colDefs`
-   [ ] `spaceBetweenProperties=true` added when snippet has 4+ top-level properties
-   [ ] Inline `{% apiDocumentation %}` blocks have at most 2 `names` entries
-   [ ] Pages with many API members use a dedicated bottom-of-page API section instead of multiple inline blocks
-   [ ] `{% apiDocumentation %}` used only for object/interface/callback types — not booleans, strings, or numbers
-   [ ] `{% warning %}` used for footguns and mutually-exclusive options; `{% note %}` for everything else
-   [ ] All internal links use `./page-path/` format (not `../`)

## Examples

-   [ ] Every `{% gridExampleRunner name="x" %}` has a matching folder under `_examples/x/`
-   [ ] `yarn nx generate-examples ag-grid-docs` passes with no errors
-   [ ] `yarn nx validate-examples ag-grid-docs` passes with no TypeScript errors
-   [ ] Dev server visual check done — page loads, examples render, interactive controls work
-   [ ] All framework variants spot-checked: `javascript-data-grid`, `react-data-grid`, `angular-data-grid`, `vue-data-grid`

## Integration

-   [ ] `nav.json` entry added (new pages only)
-   [ ] Parent/overview page updated with a 1–3 sentence intro for this child (new child pages only)
-   [ ] Cross-references added from closely related pages if users commonly confuse the two features
