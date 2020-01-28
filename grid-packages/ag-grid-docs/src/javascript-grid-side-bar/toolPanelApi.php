<?php

$toolPanelApi = [
    ['setSideBarVisible',
        'Show/hide the entire side bar, including any visible panel and the tab buttons.'
    ],
    ['isSideBarVisible',
        'Returns <code>true</code> if the side bar is visible.'
    ],
    ['openToolPanel',
        'Opens a particular tool panel. Provide the ID of the tool panel to open.'
    ],
    ['closeToolPanel',
        'Closes the currently open tool panel (if any).'
    ],
    ['getOpenedToolPanel',
        'Returns the ID of the currently shown tool panel if any, otherwise <code>null</code>.'
    ],
    ['setSideBar',
        'Resets the side bar to the provided configuration. The parameter is the same as the sideBar grid property. The side bar is re-created from scratch with the new config.'
    ],
    ['getSideBar',
        'Returns the current side bar configuration. If a shortcut was used, returns the detailed long form.'
    ],
    ['setSideBarPosition',
        "Sets the side bar position relative to the grid. Possible values are: <code>'left'</code> or <code>'right'</code>,
         where <code>'right'</code> is the default option."
    ]
];
?>
