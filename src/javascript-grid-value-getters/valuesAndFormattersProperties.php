<?php

$valuesAndFormattersProperties = [
    ['valueGetter(params)',
        'Function or expression. Gets the value from your data for display.'
    ],
    ['valueSetter(params)',
        'Function or expression. Sets the value into your data for saving. Return true if the data changed (and gui refresh is needed)'
    ],
    ['valueFormatter(params)',
        'Function or expression. Formats the value for display.'
    ],
    ['valueParser(params)',
        'Function or expression. Parses the value for saving.'
    ]
];

$valuesAndFormattersMoreProperties = [
    ['headerValueGetter(params)',
        'Function or expression. Gets the value for display in the header.'
    ],
    ['floatingCellFormatter(params)',
        'Function or expression. Formatter to use for a floating row. If missing, the normal valueFormatter will be used.'
    ]
];

?>
