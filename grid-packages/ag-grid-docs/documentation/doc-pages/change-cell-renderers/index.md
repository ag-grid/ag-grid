---
title: "Showing Changes"
---

The grid provides two Cell Components for animating changes to data.

1. **Animate Show Changed**: The previous value is temporarily shown beside the old value with a directional arrow showing increase or decrease in value. The old value is then faded out. Set with `cellRenderer="agAnimateShowChangeCellRenderer"`
2. **Animate Slide Cell**: The previous value shown in a faded fashion and slides, giving a ghosting effect as the old value fades and slides away. Set with `cellRenderer="agAnimateSlideCellRenderer"`.

The example below demonstrates these.

- Columns A, B are editable.
- Columns C and D are updated via clicking the button.
- Changes to any of the first 4 columns results in animations in the Total and Average column.
- The example demonstrates setting custom colours for up and down changes using the `--ag-value-change-delta-up-color` and `--ag-value-change-delta-down-color` CSS Variables.

<grid-example title='Animation Renderers' name='animation-renderers' type='generated' options='{ "exampleHeight": 530 }'></grid-example>
