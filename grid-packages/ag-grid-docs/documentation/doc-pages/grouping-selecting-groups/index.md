---
title: "Selecting Row Groups"
enterprise: true
---

Row Selection enables users to choose rows by clicking on them. This page describes configuration specific to Row Grouping.

See the [Row Selection](../row-selection/) page for basic selection configuration.

## Checkboxes with Auto Group Columns

*TODO* INSERT EXAMPLE DEMONSTRATING autoGroupColumnDef `checkbox` PROPERTY, SHOULD INCLUDE AN ON/OFF TOGGLE.

When used on a column displaying expand/collapse chevrons, the `checkboxSelection` property will display the checkbox to the left of the chevron. It may be preferable to enable the `checkbox` property via the `autoGroupColumnDef` property `cellRendererParams`. This will instead position the checkbox inside of the expand/collapse chevron.

## Group Selects Children

*TODO* INSERT EXAMPLE DEMONSTRATING `groupSelectsChildren` PROPERTY, SHOULD INCLUDE AN ON/OFF TOGGLE.

The `groupSelectsChildren` property changes the behaviour of selecting a Group Row. Instead of having a selected state, selecting the group row will select or deselect all of the children of that row.

This property also introduces a new indeterminate state which is displayed when not all of the Group Rows children conform to the same state of selection.

## Group Selects Filtered Children

Requires property `groupSelectsChildren` set to `true`

*TODO* INSERT EXAMPLE DEMONSTRATING `groupSelectsFiltered` PROPERTY, SHOULD INCLUDE AN ON/OFF TOGGLE.

The `groupSelectsFiltered` property modifies the behaviour of the `groupSelectsChildren` selection. Instead of selecting or deselecting all of the children of that row, only the children which pass the current filter will be selected or deselected.
