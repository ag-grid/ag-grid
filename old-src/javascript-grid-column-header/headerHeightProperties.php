<?php

$headerHeightProperties = [
    ['headerHeight',
        'The height for the row containing the column label header. If not specified the default is 25px.',
        'See <a href="../javascript-grid-column-header/#headerHeight">Header Height</a> example.'
    ],
    ['groupHeaderHeight',
        'The height for the rows containing header column groups. If not specified, it uses <code>headerHeight</code>.',
        'See <a href="../javascript-grid-column-header/#headerHeight">Header Height</a> example.'
    ],
    ['floatingFiltersHeight',
        'The height for the row containing the floating filters. If not specified the default is 20px.',
        'See <a href="../javascript-grid-column-header/#headerHeight">Header Height</a> example.'
    ],
    ['pivotHeaderHeight',
        'The height for the row containing the columns when in pivot mode. If not specified, it uses <code>headerHeight</code>.',
        'See <a href="../javascript-grid-column-header/#headerHeight">Header Height</a> example.'
    ],
    ['pivotGroupHeaderHeight',
        'The height for the row containing header column groups when in pivot mode. If not specified, it uses <code>groupHeaderHeight</code>.',
        'See <a href="../javascript-grid-column-header/#headerHeight">Header Height</a> example.'
    ]
];

$headerHeightApi = [
    ['setHeaderHeight(heightInPx)',
        'Sets the height for the row containing the column label header.'
    ],
    ['setGroupHeaderHeight(heightInPx)',
        'Sets the height for the rows containing header column groups.'],
    ['setFloatingFiltersHeight(heightInPx)',
        'Sets the height for the row containing the floating filters.'],
    ['setPivotHeaderHeight(heightInPx)',
        'Sets the height for the row containing the columns when in pivot mode.'],
    ['setPivotGroupHeaderHeight(heightInPx)',
        'Sets the height for the row containing header column groups when in pivot mode.']
];
?>