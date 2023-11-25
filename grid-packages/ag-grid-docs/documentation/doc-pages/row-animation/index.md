---
title: "Row Animation"
---

Row animations occur after filtering, sorting, resizing height and expanding / collapsing a row group.

The grid will animate the rows in the following scenarios:

- Column Animations:
    - Moving Columns
- Row Animations
    - Filtering Rows
    - Sorting Rows
    - Expanding / Collapsing Row Groups

## Disable Animation

Row animations can be disabled by setting the grid option `animateRows = false`.

## Example Animation
The example below automatically triggers grid actions to demonstrate the animations.

<grid-example title='Animation' name='animation' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel"] }'></grid-example>

## Animation Sequence Details

You do not need to know how the animations work, however,
if you are creating a theme or otherwise want to adjust the animations, it will be useful
for you to understand the sequence of rules which are as follows:

- **New Rows:** Rows that are new to the grid are placed in the new position and faded in.
- **Old Rows:** Rows that are no longer in the grid are left in the same position and faded out.
- **Moved Rows:** Rows that are in a new position get their position transitioned to the new position.
- **Resized Height Rows:** Rows that get their height change will have the height transitioned to the new height.


In addition to the transition animations, old rows are placed behind new rows such that moving rows are
on top of old rows when moved (hence old rows are not fading out on top of new rows, but behind new rows).
