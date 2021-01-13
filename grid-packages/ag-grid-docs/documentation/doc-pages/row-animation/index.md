---
title: "Row Animation"
---

Row animations occur after filtering, sorting, resizing height and expanding / collapsing a row group.
Each of these animations is turned OFF by default. They are all turned on
using the property `animateRows=true`.

The grid will animate the rows in the following scenarios:

- Column Animations:
    - Moving Columns
- Row Animations
    - Filtering Rows
    - Sorting Rows
    - Expanding / Collapsing Row Groups

[[note]]
|Column animations are **on** by default, row animations are **off** by default. 
| This is to keep with what is expected to be the most common configuration as default.

You do not need to know how the animations work, you just need to turn them on. However
if you are creating a theme or otherwise want to adjust the animations, it will be useful
for you to understand the sequence of rules which are as follows:

- **New Rows:** Rows that are new to the grid are placed in the new position and faded in.
- **Old Rows:** Rows that are no longer in the grid are left in the same position and faded out.
- **Moved Rows:** Rows that are in a new position get their position transitioned to the new position.
- **Resized Height Rows:** Rows that get their height change will have the height transitioned to the new height.


In addition to the transition animations, old rows are placed behind new rows such that moving rows are
on top of old rows when moved (hence old rows are not fading out on top of new rows, but behind new rows).

[[note]]
| Depending on your dataset and users, sometimes row animation looks good, sometimes it doesn't.
| A large dataset will not look as nice as a small dataset when sorting and filtering as there will
| be large changes in the rows displayed, sometimes always replacing all the rows. A small dataset
| will look much nicer, especially one that fits all the data on the screen in one go, as then all rows
| will animate to new positions. Users will also have their preference, with users in high pressure
| situations (e.g. finance traders or air traffic control) may prefer no animation to focus on the data.


## Example Animation
The example below shows the animations by the JavaScript calling the grid's API. So no touching, just looking!!!


<grid-example title='Animation' name='animation' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel"] }'></grid-example>

