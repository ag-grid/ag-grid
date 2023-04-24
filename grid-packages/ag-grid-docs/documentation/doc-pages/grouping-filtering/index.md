---
title: "Row Grouping - Filtering Groups"
enterprise: true
---

This section compares the different ways filtering can be configured and customised on group columns when using Row Grouping.

Filtering behaves differently on group columns than on normal columns, as there can be multiple fields within a single group column. One of the following approaches is required to enable filtering on the group columns.

## Group Column Filter

The Group Column Filter provides a simple way to configure filters on group columns. Filters are defined on the underlying columns as they would be without Row Grouping. The Group Column Filter re-uses those filters in the group columns (for the columns included in the grouping), and provides a dropdown to switch between them if necessary.

<image-caption src="grouping-column-filter/resources/group-filter.png" alt="Group Column Filter" width="28rem" centered="true"></image-caption>

See the [Group Column Filter](../grouping-column-filter/) section for more details.

## Custom Group Filtering

When more customisation is required for group filtering, Custom Group Filtering can be used. Filters defined on the underlying columns will be ignored by the group columns, and instead any type of filter can be configured directly on the group columns. This allows different filter parameters to be used.

See the [Custom Group Filtering](../grouping-custom-filtering/) section for more details.

## Next Up

Continue to the next section to learn about the [Group Column Filter](../grouping-column-filter/).
