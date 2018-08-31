<?php

$toolPanelProperties = [
    ['items',
        'A list of all the tool panel items to display. The items will be displayed in provided order from top to bottom.'
    ],
    ['defaultItem',
        'The item (identified by id) to open by default. If none specified, the tool panel is initially displayed closed.'
    ]
];

$toolPanelComponentProperties = [
    ['id',
        'The unique id for this component, used in the API and everywhere else to refer to this component'
    ],
    ['labelKey',
        'The key used for i18n'
    ],
    ['labelDefault',
        'The default label if not labelKey provided or if labelKey i18n does not have any matching'
    ],
    ['iconKey',
        'The <a href="../javascript-grid-icons/">key of the icon</a> to be used as a graphical aid on the side of the tool panel in the button to open/close it'
    ],
    ['component[framework/params]',
        'The configuration to provide the actual component used to render the content of the tool panel the default ag-components are "agColumnsToolPanel" and "agFiltersToolPanel". You can provide in here your own custom tool panel tab LINK TBC'
    ]
];
?>
