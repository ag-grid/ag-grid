import type { _ColumnFilterGridApi, _FilterGridApi, _QuickFilterGridApi } from '../api/gridApi';
import { HeaderFilterCellCtrl } from '../headerRendering/cells/floatingFilter/headerFilterCellCtrl';
import { defineCommunityModule } from '../interfaces/iModule';
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

export const FilterCoreModule = defineCommunityModule('@ag-grid-community/filter-core', {
    beans: [FilterManager],
});

export const FilterApiModule = defineCommunityModule<_FilterGridApi>('@ag-grid-community/filter-api', {
    apiFunctions: {
        isAnyFilterPresent,
        onFilterChanged,
    },
    dependsOn: [FilterCoreModule],
});

export const FilterValueModule = defineCommunityModule('@ag-grid-community/filter-value', {
    beans: [FilterValueService],
});

export const ColumnFilterModule = defineCommunityModule('@ag-grid-community/column-filter', {
    beans: [ColumnFilterService],
    dependsOn: [FilterCoreModule, PopupModule, FilterValueModule],
});

export const ColumnFilterMenuModule = defineCommunityModule('@ag-grid-community/column-filter-menu', {
    beans: [FilterMenuFactory],
    dependsOn: [ColumnFilterModule, PopupModule, SharedMenuModule],
});

export const ColumnFilterApiModule = defineCommunityModule<_ColumnFilterGridApi>(
    '@ag-grid-community/column-filter-api',
    {
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
    }
);

export const FloatingFilterCoreModule = defineCommunityModule('@ag-grid-community/floating-filter-core', {
    controllers: [{ name: 'headerFilterCell', classImp: HeaderFilterCellCtrl as any }],
    dependsOn: [ColumnFilterModule],
});

export const FloatingFilterModule = defineCommunityModule('@ag-grid-community/floating-filter', {
    dependsOn: [FloatingFilterCoreModule, ColumnFilterModule],
});

export const ReadOnlyFloatingFilterModule = defineCommunityModule('@ag-grid-community/read-only-floating-filter', {
    userComponents: [{ name: 'agReadOnlyFloatingFilter', classImp: ReadOnlyFloatingFilter }],
    dependsOn: [FloatingFilterCoreModule],
});

export const SimpleFilterModule = defineCommunityModule('@ag-grid-community/simple-filter', {
    dependsOn: [ColumnFilterModule],
    userComponents: [
        { name: 'agTextColumnFilter', classImp: TextFilter },
        { name: 'agNumberColumnFilter', classImp: NumberFilter },
        { name: 'agDateColumnFilter', classImp: DateFilter },
        { name: 'agDateInput', classImp: DefaultDateComponent },
    ],
});

export const SimpleFloatingFilterModule = defineCommunityModule('@ag-grid-community/simple-floating-filter', {
    dependsOn: [SimpleFilterModule, FloatingFilterCoreModule],
    userComponents: [
        { name: 'agTextColumnFloatingFilter', classImp: TextFloatingFilter },
        { name: 'agNumberColumnFloatingFilter', classImp: NumberFloatingFilter },
        { name: 'agDateColumnFloatingFilter', classImp: DateFloatingFilter },
    ],
});

export const QuickFilterCoreModule = defineCommunityModule('@ag-grid-community/quick-filter-core', {
    beans: [QuickFilterService],
    dependsOn: [FilterCoreModule, FilterValueModule],
});

export const QuickFilterApiModule = defineCommunityModule<_QuickFilterGridApi>('@ag-grid-community/quick-filter-api', {
    apiFunctions: {
        isQuickFilterPresent,
        getQuickFilter,
        resetQuickFilter,
    },
    dependsOn: [QuickFilterCoreModule],
});

export const QuickFilterModule = defineCommunityModule('@ag-grid-community/quick-filter', {
    dependsOn: [QuickFilterCoreModule, QuickFilterApiModule],
});

export const FilterModule = defineCommunityModule('@ag-grid-community/filter', {
    dependsOn: [
        SimpleFloatingFilterModule,
        ReadOnlyFloatingFilterModule,
        QuickFilterModule,
        ColumnFilterApiModule,
        ColumnFilterMenuModule,
    ],
});
