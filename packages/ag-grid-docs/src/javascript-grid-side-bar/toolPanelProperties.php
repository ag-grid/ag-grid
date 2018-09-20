<?php

$toolPanelProperties = [
    ['toolPanels',
        'A list of all the panels to place in the side bar. The panels will be displayed in provided order from top to bottom.'
    ],
    ['defaultToolPanel',
        'The panel (identified by id) to open by default. If none specified, the side bar is initially displayed closed.'
    ]
];

$toolPanelComponentProperties = [
    ['id',
        'The unique id for this panel. Used in the API and eleswhere to refer to the panel.'
    ],
    ['labelKey',
        'The key used for <a href="../javascript-grid-internationalisation/">internationalisation</a> for displaying the label. The label is displayed in the tab button.'
    ],
    ['labelDefault',
        'The default label if labelKey is missing or does not map to a valid text through internationalisation.'
    ],
    ['iconKey',
        'The <a href="../javascript-grid-icons/">key of the icon</a> to be used as a graphical aid beside the label in the side bar.'
    ],
    ['toolPanel,<br/>toolPanelFramework,<br/>toolPanelParams',
        'The tool panel component to use as the panel. The provided panels use components "agColumnsToolPanel" and "agFiltersToolPanel". To provide your own custom panel component, you reference it by name here.'
    ]
];
?>
