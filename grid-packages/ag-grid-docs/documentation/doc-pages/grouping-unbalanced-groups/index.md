---
title: "Row Grouping - Unbalanced Groups"
enterprise: true
---

This section covers Unbalanced Groups - when grouping by rows that can contain `null` or `undefined` group values.  

## Handling Unbalanced Groups

If there are rows containing `null` or `undefined` values for the column that is being grouped then these rows will not 
be grouped. We refer to this scenario as **Unbalanced Groups** in that there is a mix of groups and rows as siblings. 

The following example demonstrates:

- Data is grouped by column 'State'. Rows are either grouped by state 'New York', 'California' or not grouped.
- Removing the grouping shows that the non grouped rows have no 'State' value.

<grid-example title='Unbalanced Groups' name='unbalanced-groups' type='mixed' options='{ "enterprise": true, "exampleHeight": 570, "modules": ["clientside", "rowgrouping"] }'></grid-example>

[[note]]
| If you do not want rows with null or undefined to be left out of groups, but want a group created to contain these empty
| values, then change your data and replace the null and undefined values with something (e.g. the string 'Empty' or a 
| string with a blank space character i.e. ' ').

