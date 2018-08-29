<?php

$toolPanelProperties = [
    ['components',
        'A list of all the components that describe each of the tabs that we want to show in the tool panel in order of how they should be rendered (top to bottom)'
    ],
    ['defaultTab',
        'The key as specified in one of the provided components above to show opened by default when the tool panel is initialised'
    ]
];



$toolPanelComponentProperties = [
    ['key',
        'The unique key for this component, used in the API and everywhere else to refer to this component'
    ],
    ['buttonLabel',
        'The label text to be displayed on the side of the tool panel in the button to open/close it'
    ],
    ['iconKey',
        'The <a href="../javascript-grid-icons/">key of the icon</a> to be used as a graphical aid on the side of the tool panel in the button to open/close it'
    ],
    ['component[framework/params]',
        'The configuration to provide the actual component used to render the content of the tool panel the default ag-components are "agColumnsToolPanel" and "agFiltersToolPanel". You can provide in here your own custom tool panel tab LINK TBC'
    ]
];
?>
