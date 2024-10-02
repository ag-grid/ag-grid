import type { _ColumnFilterGridApi, _FilterGridApi, _QuickFilterGridApi } from '../api/gridApi';
import { HeaderFilterCellCtrl } from '../headerRendering/cells/floatingFilter/headerFilterCellCtrl';
import type { ModuleWithApi } from '../interfaces/iModule';
import { baseCommunityModule } from '../interfaces/iModule';
import type { Module } from '../interfaces/iModule';
import { SharedMenuModule } from '../misc/menu/sharedMenuModule';
import { PopupModule } from '../widgets/popupModule';
import {
    destroyFilter,
    getColumnFilterInstance,
    getColumnFilterModel,
    getFilterModel,
    isColumnFilterPresent,
    setColumnFilterModel,
    setFilterModel,
    showColumnFilter,
} from './columnFilterApi';
import { ColumnFilterService } from './columnFilterService';
import { isAnyFilterPresent, onFilterChanged } from './filterApi';
import { FilterManager } from './filterManager';
import { FilterMenuFactory } from './filterMenuFactory';
import { FilterValueService } from './filterValueService';
import { ReadOnlyFloatingFilter } from './floating/provided/readOnlyFloatingFilter';
import { DateFilter } from './provided/date/dateFilter';
import { DateFloatingFilter } from './provided/date/dateFloatingFilter';
import { DefaultDateComponent } from './provided/date/defaultDateComponent';
import { NumberFilter } from './provided/number/numberFilter';
import { NumberFloatingFilter } from './provided/number/numberFloatingFilter';
import { TextFilter } from './provided/text/textFilter';
import { TextFloatingFilter } from './provided/text/textFloatingFilter';
import { getQuickFilter, isQuickFilterPresent, resetQuickFilter } from './quickFilterApi';
import { QuickFilterService } from './quickFilterService';

export const FilterCoreModule: Module = {
    ...baseCommunityModule('FilterCoreModule'),
    beans: [FilterManager],
};

export const FilterApiModule: ModuleWithApi<_FilterGridApi> = {
    ...baseCommunityModule('FilterApiModule'),
    apiFunctions: {
        isAnyFilterPresent,
        onFilterChanged,
    },
    dependsOn: [FilterCoreModule],
};

export const FilterValueModule: Module = {
    ...baseCommunityModule('FilterValueModule'),
    beans: [FilterValueService],
};

export const ColumnFilterModule: Module = {
    ...baseCommunityModule('ColumnFilterModule'),
    beans: [ColumnFilterService],
    dependsOn: [FilterCoreModule, PopupModule, FilterValueModule],
};

export const ColumnFilterMenuModule: Module = {
    ...baseCommunityModule('ColumnFilterMenuModule'),
    beans: [FilterMenuFactory],
    dependsOn: [ColumnFilterModule, PopupModule, SharedMenuModule],
};

export const ColumnFilterApiModule: ModuleWithApi<_ColumnFilterGridApi> = {
    ...baseCommunityModule('ColumnFilterApiModule'),
    apiFunctions: {
        isColumnFilterPresent,
        getColumnFilterInstance,
        destroyFilter,
        setFilterModel,
        getFilterModel,
        getColumnFilterModel,
        setColumnFilterModel,
        showColumnFilter,
    },
    dependsOn: [ColumnFilterModule, FilterApiModule],
};

export const FloatingFilterCoreModule: Module = {
    ...baseCommunityModule('FloatingFilterCoreModule'),
    controllers: [{ name: 'headerFilterCell', classImp: HeaderFilterCellCtrl as any }],
    dependsOn: [ColumnFilterModule],
};

export const FloatingFilterModule: Module = {
    ...baseCommunityModule('FloatingFilterModule'),
    dependsOn: [FloatingFilterCoreModule, ColumnFilterModule],
};

export const ReadOnlyFloatingFilterModule: Module = {
    ...baseCommunityModule('ReadOnlyFloatingFilterModule'),
    userComponents: [{ name: 'agReadOnlyFloatingFilter', classImp: ReadOnlyFloatingFilter }],
    dependsOn: [FloatingFilterCoreModule],
};

export const SimpleFilterModule: Module = {
    ...baseCommunityModule('SimpleFilterModule'),
    dependsOn: [ColumnFilterModule],
    userComponents: [
        { name: 'agTextColumnFilter', classImp: TextFilter },
        { name: 'agNumberColumnFilter', classImp: NumberFilter },
        { name: 'agDateColumnFilter', classImp: DateFilter },
        { name: 'agDateInput', classImp: DefaultDateComponent },
    ],
};

export const SimpleFloatingFilterModule: Module = {
    ...baseCommunityModule('SimpleFloatingFilterModule'),
    dependsOn: [SimpleFilterModule, FloatingFilterCoreModule],
    userComponents: [
        { name: 'agTextColumnFloatingFilter', classImp: TextFloatingFilter },
        { name: 'agNumberColumnFloatingFilter', classImp: NumberFloatingFilter },
        { name: 'agDateColumnFloatingFilter', classImp: DateFloatingFilter },
    ],
};

export const QuickFilterCoreModule: Module = {
    ...baseCommunityModule('QuickFilterCoreModulee'),
    beans: [QuickFilterService],
    dependsOn: [FilterCoreModule, FilterValueModule],
};

export const QuickFilterApiModule: ModuleWithApi<_QuickFilterGridApi> = {
    ...baseCommunityModule('QuickFilterApiModule'),
    apiFunctions: {
        isQuickFilterPresent,
        getQuickFilter,
        resetQuickFilter,
    },
    dependsOn: [QuickFilterCoreModule],
};

export const QuickFilterModule: Module = {
    ...baseCommunityModule('QuickFilterModule'),
    dependsOn: [QuickFilterCoreModule, QuickFilterApiModule],
};

export const FilterModule: Module = {
    ...baseCommunityModule('FilterModule'),
    dependsOn: [
        SimpleFloatingFilterModule,
        ReadOnlyFloatingFilterModule,
        QuickFilterModule,
        ColumnFilterApiModule,
        ColumnFilterMenuModule,
    ],
};
