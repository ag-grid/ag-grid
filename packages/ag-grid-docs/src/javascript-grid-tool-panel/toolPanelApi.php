<?php

$toolPanelApi = [
    ['setToolPanelVisible',
        'It will show/hide all the tool panel, including the side bar that holds the item buttoms'
    ],
    ['isToolPanelVisible',
        'Will return true if visible'
    ],
    ['openToolPanel',
        'It takes a string that represents the key of the item to show open in the tool panel.'
    ],
    ['closeToolPanel',
        'It will make sure that all the items are closed in the tool panel.'
    ],
    ['getOpenedToolPanelItem',
        'Returns the key of the currently shown tab if any, otherwise it returns null.'
    ],
    ['setToolPanelDef',
        'It takes one of the different flavours that are <a href="../javascript-grid-tool-panel/">valid gridOptions.toolPanel configurations</a> and redraws the toolpanel accordingly..'
    ],
    ['getToolPanelDef',
        'It returns the current fully fledge configuration that is used for the tool panel'
    ]
];
?>
