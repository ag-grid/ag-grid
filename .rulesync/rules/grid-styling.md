---
root: false
targets: ['*']
description: 'Grid theming: keep Theming API CSS and Legacy Themes Sass in step during the transition'
globs:
    [
        'community-modules/styles/**/*.scss',
        'packages/*/src/**/*.css',
        '.stylelintrc.js',
    ]
---

# Grid Styling

The grid is in transition from Legacy Themes (`.scss` files written in Sass under `community-modules/styles/`) to the Theming API (`.css` written in modern nested CSS under `packages/`).

While this transition is in progress, changes made to the Theming API should be applied to Legacy Themes as well.

When reviewing a PR with changes to the Theming API CSS, if the same PR does not have corresponding changes to Legacy Themes, flag it as a **P1** level issue.

## CSS specificity

We use specificity of 0,1,0 (single classname) to make it easy for customers to override our styles. This is an important API contract. Every violation of this contract makes it harder for customers to style our library. We validate this with StyleLint. DO NOT USE LINT DISABLE COMMENTS TO CIRCUMVENT THIS. There is almost always a way to write CSS without having to disable this lint rule.

We make an exception for a small number of state classes whitelisted in .stylelintrc.js. So for example `.ag-standard-button:hover` or `.ag-row.ag-row-hover` (both 0,2,0) are acceptable. You may add classes to the list here if they are genuinely state or flag classes, not component identifiers.

To include more criteria in a rule without increasing specificity, use :where e.g. `:where(.ag-some-container) .ag-my-component`.

We rely on order of CSS files to determine which rules take priority. There is a consistent order that goes something like  `shared.css` -> `core.css` -> module CSS sorted alphabetically -> theme part css.

Within shared.css and core.css you can reorder files and rules to produce appropriate order. Within module and theme part CSS, all rules should be narrowly scoped to affect only the feature they relate to, and so reordering should not be necessary as there should be no interactions.

NEVER USE `!important`. In review, use of !important should be flagged as a P0 API contract failure, it will break customer applications with 100% certainty.
