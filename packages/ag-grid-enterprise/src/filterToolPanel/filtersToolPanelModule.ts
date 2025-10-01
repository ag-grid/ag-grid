import type { _ModuleWithoutApi } from 'ag-grid-community';
import { _ColumnFilterModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { SideBarModule } from '../sideBar/sideBarModule';
import { VERSION } from '../version';
import { FiltersToolPanel } from './filtersToolPanel';
import { FilterPanelService } from './newFilterToolPanel/filterPanelService';
import { SelectableFilterService } from './newFilterToolPanel/selectableFilterService';
import { WrapperToolPanel } from './newFilterToolPanel/wrapperToolPanel';

/**
 * @feature Accessories -> Filters Tool Panel
 */
export const FiltersToolPanelModule: _ModuleWithoutApi = {
    moduleName: 'FiltersToolPanel',
    version: VERSION,
    userComponents: { agFiltersToolPanel: FiltersToolPanel },
    icons: {
        // filter tool panel tab
        filtersToolPanel: 'filter',
    },
    dependsOn: [SideBarModule, EnterpriseCoreModule, _ColumnFilterModule],
};

/**
 * @feature Accessories -> New Filters Tool Panel
 */
export const NewFiltersToolPanelModule: _ModuleWithoutApi = {
    moduleName: 'NewFiltersToolPanel',
    version: VERSION,
    userComponents: { agNewFiltersToolPanel: WrapperToolPanel },
    beans: [FilterPanelService, SelectableFilterService],
    icons: {
        // filter add button in new filter tool panel
        filterAdd: 'filter-add',
        // filter tool panel tab
        filtersToolPanel: 'filter',
        // open icon for rich select
        richSelectOpen: 'small-down',
        // remove for rich select editor pills
        richSelectRemove: 'cancel',
        // button to expand filter card in new filter tool panel
        filterCardExpand: 'chevron-down',
        // button to collapse filter card in new filter tool panel
        filterCardCollapse: 'chevron-up',
        // indicates filter card in new filter tool panel has edits
        filterCardEditing: 'edit',
    },
    dependsOn: [SideBarModule, EnterpriseCoreModule, _ColumnFilterModule],
};
