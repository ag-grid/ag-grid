---
root: false
targets: ['*']
description: 'Grid theming: keep Theming API CSS and Legacy Themes Sass in step during the transition'
globs:
    [
        'community-modules/styles/**/*.scss',
        'packages/*/src/**/*.css',
    ]
---

# Grid Styling

The grid is in transition from Legacy Themes (`.scss` files written in Sass under `community-modules/styles/`) to the Theming API (`.css` written in modern nested CSS under `packages/`).

While this transition is in progress, changes made to the Theming API should be applied to Legacy Themes as well.

When reviewing a PR with changes to the Theming API CSS, if the same PR does not have corresponding changes to Legacy Themes, flag it as a **P1** level issue.
