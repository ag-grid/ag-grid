<?php

$headerHeightProperties = [
    ['headerHeight',
    '<p>The height for the row containing the column label header. If not specified the default is 25px.</p>'
    ],
    ['groupHeaderHeight',
    '<p>The height for the rows containing header column groups. If not specified, it uses <i>headerHeight</i></p>'],
    ['floatingFiltersHeight',
    '<p>The height for the row containing the floating filters. If not specified the default is 20px.</p> '],
    ['pivotHeaderHeight',
    '<p>The height for the row containing the columns when in pivot mode. If not specified, it uses <i>headerHeight</i></p> '],
    ['pivotGroupHeaderHeight',
    '<p>The height for the row containing header column groups when in pivot mode. If not specified, it uses <i>groupHeaderHeight</i></p> ']
];

$headerHeightApi = [
    ['setHeaderHeight(heightInPx)',
        '<p>Sets the height for the row containing the column label header.</p>'
    ],
    ['setGroupHeaderHeight(heightInPx)',
        '<p>Sets the height for the rows containing header column groups.</p>'],
    ['setFloatingFiltersHeight(heightInPx)',
        '<p>Sets the height for the row containing the floating filters.</p> '],
    ['setPivotHeaderHeight(heightInPx)',
        '<p>Sets the height for the row containing the columns when in pivot mode.</p> '],
    ['setPivotGroupHeaderHeight(heightInPx)',
        '<p>Sets the height for the row containing header column groups when in pivot mode.</p> ']
];
?>