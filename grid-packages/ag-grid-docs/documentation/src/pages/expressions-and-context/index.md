---
title: "Expressions and Context"
---

Below shows a complex example making use of value getters (using expressions) and class rules (again using expressions). The grid shows 'actual vs budget data and yearly total' for widget sales split by city and country.

- **Location** column is showing the aggregation groups, grouping by city and country.

- **Months** are affected by the context. The data displayed is either `x_act` or `x_bud` data for the month (eg. `jan_act` when jan is green, or `jan_bud` when jan is red). Likewise the background color is also changed using class rules dependent on the selected month.

- **Total** is the total 'actual' figures display, ie adding up all the green. This also changes (which columns to include) as the month is changed.

Notice that the example (including calculating the expression on the fly, the grid only calculates what's needed to be displayed) runs very fast (once the data is loaded) despite over 6,000 rows.

This example is best viewed by opening it in a new tab (click the link on the top right of the example).

<grid-example title='Monthly Sales' name='monthly-sales' type='vanilla' options='{ "enterprise": true, "extras": ["fontawesome", "bootstrap"] }'></grid-example>

