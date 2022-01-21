---
title: "Expressions and Context"
---

Below shows a complex example making use of value getters (using expressions) and class rules (again using expressions). The grid shows 'actual vs budget data and yearly total' for widget sales split by city and country.

- The **Location** column is showing the aggregation groups, grouping by city and country.
- The **Monthly Data** columns are affected by the context. Depending on the selected period, the data displayed is either actual (`x_act`) or budgeted (`x_bud`) data for the month (eg. `jan_act` when Jan is green, or `jan_bud` when Jan is red). Similarly, the background color is also changed using class rules dependent on the selected period.
- **sum(YTD)** is the total of the 'actual' figures, i.e. adding up all the green. This also changes as the period is changed.

## Example

Notice that the example (including calculating the expression on the fly, the grid only calculates what's needed to be displayed) runs very fast (once the data is loaded) despite having over 6,000 rows.

This example is best viewed by opening it in a new tab.

<grid-example title='Monthly Sales' name='monthly-sales' type='typescript' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "setfilter", "filterpanel"], "extras": ["fontawesome", "bootstrap"] }'></grid-example>
