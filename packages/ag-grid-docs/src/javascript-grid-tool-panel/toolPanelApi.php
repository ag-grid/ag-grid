<?php

$toolPanelApi = [
    ['setSideBarVisible',
        'It will show/hide the entire side bar, including and any displaying panel and the tab buttons.'
    ],
    ['isSideBarVisible',
        'Returns true if visible.'
    ],
    ['openToolPanel',
        'Opens a particular tool panel. Provide the ID of the rool panel to open.'
    ],
    ['closeToolPanel',
        'Closes the currently open (if any) tool panel.'
    ],
    ['getOpenedToolPanel',
        'Returns the ID of the currently shown tool panel if any, otherwise null.'
    ],
    ['setSideBar',
        'Resets the side bar to the provided configuration. The parameter is the same as the sideBar grid property. The side bar is re-created from scratch with the new config.'
    ],
    ['getSideBar',
        'Returns the current side bar configuration. If a short cut was used, returns the detailed long form.'
    ]
];
?>
