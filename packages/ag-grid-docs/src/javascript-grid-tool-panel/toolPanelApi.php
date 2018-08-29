<?php

$toolPanelApi = [
    ['showToolPanel',
        'It takes a boolean or a string. <uL><li>If true, will show the default tab for the tool panel</li><li>If false, it will hide the tool panel tab.</li><li>If it is a string, it must match the key of a provided component (the default ones are "columns" and "filters"). It will swap the show/hide status for that tab key</li></ul>'
    ],
    ['isToolPanelShowing',
        'Returns true if any tool panel tab is showing, otherwise false.'
    ],
    ['getActiveToolPanelItem',
        'Returns the key of the currently shown tab if any, otherwise it returns null.'
    ],
    ['setToolPanel',
        'It takes one of the different flavours that are <a href="../javascript-grid-tool-panel/">valid gridOptions.toolPanel configurations</a> and redraws the toolpanel accordingly..'
    ]
];
?>
