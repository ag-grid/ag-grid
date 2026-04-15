import { getExportMenuItems } from '../../menu/exportMenuItems';
import { createToolbarMenuButton } from './createToolbarMenuButton';

export const ExportToolbarItem = createToolbarMenuButton({
    icon: 'save',
    localeKey: 'export',
    defaultLabel: 'Export',
    getMenuItems: (beans, localeTextFunc) => getExportMenuItems(beans, localeTextFunc),
});
