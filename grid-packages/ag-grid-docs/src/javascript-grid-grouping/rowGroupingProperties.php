<?php

$rowGroupingProperties = [
    [
        'groupUseEntireRow',
        'If grouping, set to true or false (default is false). If true, a group row will span 
        all columns across the entire width of the table. If false, the cells will be rendered 
        as normal and you will have the opportunity to include a grouping column (normally the 
        first on the left) to show the group.',
        'See <a href="../javascript-grid-grouping/#fullWidthRows">Full Width Group Rows</a>.'
    ],
    [
        'groupDefaultExpanded',
        'If grouping, set to the number of levels to expand by default. Eg 0 for none, 1 first level only, etc.
         Default is 0 (expand none). Set to -1 for expand everything.',
        'See example <a href="../javascript-grid-grouping/#removeSingleChildren">Removing Single Children</a>.'
    ],
    [
        'autoGroupColumnDef',
        'Allows specifying the group \'auto column\' if you are not happy with the default. If grouping, this column def is included as the first column definition in the grid. If not grouping, this column is not included.',
        'See <a href="../javascript-grid-grouping/#configuring-auto-column">Configuring the Auto Group Column</a>.'
    ],
    [
        'groupSuppressAutoColumn',
        'If true, the grid will not swap in the grouping column when grouping is enabled. Use this if you want complete control on the column displayed and don\'t want the grids help. In other words, you already have a column in your column definitions that is responsible for displaying the groups.',
        'See <a href="../javascript-grid-grouping/#configuring-auto-column">Configuring the Auto Group Column</a>.'
    ],
    [
        'groupMultiAutoColumn',
        'If using auto column, set to true to have each group in its own column separate column, eg if group by Country then Year, two auto columns will be created, one for country and one for year.',
        'See <a href="../javascript-grid-grouping/#multi-auto-column-group">Multi Auto Column Group</a>.'
    ],
    [
        'groupSuppressRow',
        'If true, the group row won\'t be displayed and the groups will be expanded by default with no ability to expand / contract the groups. Useful when you want to just \'group\' the rows, but not add parent group row to each group.',
        'See <a href="../javascript-grid-grouping/#suppress-group-row">Suppress Group Row</a>.'
    ],
    [
        'groupSelectsChildren',
        'When true, if you select a group, the the children of the group will also get selected.',
        'See <a href="../javascript-grid-selection/#groupSelection">Group Selection</a>.'
    ],
    [
        'groupIncludeFooter',
        'If grouping, whether to show a group footer when the group is expanded. If true, then by default, the footer
         will contain aggregate data (if any) when shown and the header will be blank. When closed, the header will
         contain the aggregate data regardless of this setting (as footer is hidden anyway). This is handy for
         \'total\' rows, that are displayed below the data when the group is open, and alongside the group when
         it is closed',
        'See <a href="../javascript-grid-grouping/#grouping-footers">Grouping Footers</a>.'
    ],
    [
        'groupIncludeTotalFooter',
        'Set to true to show a \'grand\' total group footer across all groups.',
        'See <a href="../javascript-grid-grouping/#grouping-footers">Grouping Footers</a>.'
    ],
    [
        'groupSuppressBlankHeader',
        'If true, and showing footer, aggregate data will be displayed at both the header and footer levels always. This stops the possibly undesirable behaviour of the header details \'jumping\' to the footer on expand.'
    ],
    [
        'groupSelectsFiltered',
        'If using groupSelectsChildren, then only the children that pass the current filter will get selected.',
        'See <a href="../javascript-grid-selection/#groupSelection">Group Selection</a>.'
    ],
    [
        'groupRemoveSingleChildren',
        'Set to true to collapse groups that only have one child.',
        'See <a href="../javascript-grid-grouping/#removeSingleChildren">Remove Single Children</a>.'
    ],
    [
        'groupRemoveLowestSingleChildren',
        'Set to true to collapse lowest level groups that only have one child.',
        'See <a href="../javascript-grid-grouping/#removeSingleChildren">Remove Single Children</a>.'
    ],
    [
        'groupHideOpenParents',
        'Set to true to hide parents that are open. When used with multiple columns for showing groups, it can give more pleasing user experience.',
        'See <a href="../javascript-grid-grouping/#replacingChildren">Group Hide Open Parents</a>.'
    ],
    [
        'rowGroupPanelShow',
        'When to show the \'row group panel\' (where you drag rows to group) at the top. Default
                is never. Set to either \'always\' or \'onlyWhenGrouping\'.',
        'See <a href="../javascript-grid-tool-panel/#toolPanelExample">Tool Panel Example</a>.'
    ]
];
