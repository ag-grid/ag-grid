import type { BeanCollection } from 'ag-grid-community';

import { s } from '../schemaBuilder';

export const buildSideBarFeatureSchema = (beans: BeanCollection) => {
    const sideBar = beans.sideBar?.comp;
    if (!sideBar) {
        return;
    }

    const toolPanels = sideBar.getDef()?.toolPanels;
    if (!toolPanels?.length) {
        return;
    }

    const toolPanelIds = toolPanels.map((toolPanel) => (typeof toolPanel === 'string' ? toolPanel : toolPanel.id));

    return s.object(
        {
            visible: s.boolean('Whether the side bar is shown'),
            position: s.enum(['left', 'right'], 'Which side of the grid the side bar is docked to'),
            openToolPanel: s
                .enum(toolPanelIds, 'ID of the tool panel to open, or null to close the open panel')
                .nullable(),
        },
        'Side bar configuration for the grid'
    );
};
