import type { IDragAndDropImageParams } from '../../dragAndDrop/dragAndDropImageComponent';
import type { ColDef } from '../../entities/colDef';
import type { IFloatingFilterParams } from '../../filter/floating/floatingFilter';
import type { IHeaderParams } from '../../headerRendering/cells/column/headerComp';
import type { IHeaderGroupParams } from '../../headerRendering/cells/columnGroup/headerGroupComp';
import type { IDateParams } from '../../interfaces/dateComponent';
import type { ICellEditorParams } from '../../interfaces/iCellEditor';
import type { AgGridCommon, WithoutGridCommon } from '../../interfaces/iCommon';
import type { IFilterDef, IFilterParams } from '../../interfaces/iFilter';
import type { IFrameworkOverrides } from '../../interfaces/iFrameworkOverrides';
import type { ComponentType, UserCompDetails } from '../../interfaces/iUserCompDetails';
import type { ICellRendererParams } from '../../rendering/cellRenderers/iCellRenderer';
import type { ILoadingOverlayParams } from '../../rendering/overlays/loadingOverlayComponent';
import type { INoRowsOverlayParams } from '../../rendering/overlays/noRowsOverlayComponent';
import type { ITooltipParams } from '../../rendering/tooltipComponent';
import { _getUserCompKeys } from './userComponentFactory';
import type { UserComponentFactory } from './userComponentFactory';

const DateComponent: ComponentType = {
    name: 'dateComponent',
    mandatoryMethods: ['getDate', 'setDate'],
    optionalMethods: ['afterGuiAttached', 'setInputPlaceholder', 'setInputAriaLabel', 'setDisabled', 'refresh'],
};

const DragAndDropImageComponent: ComponentType = {
    name: 'dragAndDropImageComponent',
    mandatoryMethods: ['setIcon', 'setLabel'],
};

const HeaderComponent: ComponentType = { name: 'headerComponent', optionalMethods: ['refresh'] };

const HeaderGroupComponent: ComponentType = { name: 'headerGroupComponent' };

const CellRendererComponent: ComponentType = {
    name: 'cellRenderer',
    optionalMethods: ['refresh', 'afterGuiAttached'],
    cellRenderer: true,
};

const EditorRendererComponent: ComponentType = {
    name: 'cellRenderer',
    optionalMethods: ['refresh', 'afterGuiAttached'],
};

const LoadingCellRendererComponent: ComponentType = { name: 'loadingCellRenderer', cellRenderer: true };

const CellEditorComponent: ComponentType = {
    name: 'cellEditor',
    mandatoryMethods: ['getValue'],
    optionalMethods: [
        'isPopup',
        'isCancelBeforeStart',
        'isCancelAfterEnd',
        'getPopupPosition',
        'focusIn',
        'focusOut',
        'afterGuiAttached',
        'refresh',
    ],
};

const LoadingOverlayComponent: ComponentType = { name: 'loadingOverlayComponent', optionalMethods: ['refresh'] };

const NoRowsOverlayComponent: ComponentType = { name: 'noRowsOverlayComponent', optionalMethods: ['refresh'] };

const TooltipComponent: ComponentType = { name: 'tooltipComponent' };

const FilterComponent: ComponentType = {
    name: 'filter',
    mandatoryMethods: ['isFilterActive', 'doesFilterPass', 'getModel', 'setModel'],
    optionalMethods: [
        'afterGuiAttached',
        'afterGuiDetached',
        'onNewRowsLoaded',
        'getModelAsString',
        'onFloatingFilterChanged',
        'onAnyFilterChanged',
        'refresh',
    ],
};

const FloatingFilterComponent: ComponentType = {
    name: 'floatingFilterComponent',
    mandatoryMethods: ['onParentModelChanged'],
    optionalMethods: ['afterGuiAttached', 'refresh'],
};

const FullWidth: ComponentType = {
    name: 'fullWidthCellRenderer',
    optionalMethods: ['refresh', 'afterGuiAttached'],
    cellRenderer: true,
};

const FullWidthLoading: ComponentType = { name: 'loadingCellRenderer', cellRenderer: true };

const FullWidthGroup: ComponentType = {
    name: 'groupRowRenderer',
    optionalMethods: ['afterGuiAttached'],
    cellRenderer: true,
};

const FullWidthDetail: ComponentType = { name: 'detailCellRenderer', optionalMethods: ['refresh'], cellRenderer: true };

export function _getDragAndDropImageCompDetails(
    userComponentFactory: UserComponentFactory,
    params: WithoutGridCommon<IDragAndDropImageParams>
): UserCompDetails {
    return userComponentFactory.getCompDetailsFromGridOptions(
        DragAndDropImageComponent,
        'agDragAndDropImage',
        params,
        true
    )!;
}

export function _getHeaderCompDetails(
    userComponentFactory: UserComponentFactory,
    colDef: ColDef,
    params: WithoutGridCommon<IHeaderParams>
): UserCompDetails | undefined {
    return userComponentFactory.getCompDetails(colDef, HeaderComponent, 'agColumnHeader', params);
}

export function _getHeaderGroupCompDetails(
    userComponentFactory: UserComponentFactory,
    params: WithoutGridCommon<IHeaderGroupParams>
): UserCompDetails | undefined {
    const colGroupDef = params.columnGroup.getColGroupDef()!;
    return userComponentFactory.getCompDetails(colGroupDef, HeaderGroupComponent, 'agColumnGroupHeader', params);
}
// this one is unusual, as it can be LoadingCellRenderer, DetailCellRenderer, FullWidthCellRenderer or GroupRowRenderer.
// so we have to pass the type in.

export function _getFullWidthCellRendererDetails(
    userComponentFactory: UserComponentFactory,
    params: WithoutGridCommon<ICellRendererParams>
): UserCompDetails {
    return userComponentFactory.getCompDetailsFromGridOptions(FullWidth, null, params, true)!;
}

export function _getFullWidthLoadingCellRendererDetails(
    userComponentFactory: UserComponentFactory,
    params: WithoutGridCommon<ICellRendererParams>
): UserCompDetails {
    return userComponentFactory.getCompDetailsFromGridOptions(FullWidthLoading, 'agLoadingCellRenderer', params, true)!;
}

export function _getFullWidthGroupCellRendererDetails(
    userComponentFactory: UserComponentFactory,
    params: WithoutGridCommon<ICellRendererParams>
): UserCompDetails {
    return userComponentFactory.getCompDetailsFromGridOptions(FullWidthGroup, 'agGroupRowRenderer', params, true)!;
}

export function _getFullWidthDetailCellRendererDetails(
    userComponentFactory: UserComponentFactory,
    params: WithoutGridCommon<ICellRendererParams>
): UserCompDetails {
    return userComponentFactory.getCompDetailsFromGridOptions(FullWidthDetail, 'agDetailCellRenderer', params, true)!;
}
// CELL RENDERER

export function _getCellRendererDetails<TDefinition = ColDef, TParams = ICellRendererParams>(
    userComponentFactory: UserComponentFactory,
    def: TDefinition,
    params: WithoutGridCommon<TParams>
): UserCompDetails | undefined {
    return userComponentFactory.getCompDetails(def, CellRendererComponent, null, params);
}

export function _getEditorRendererDetails<TDefinition, TEditorParams extends AgGridCommon<any, any>>(
    userComponentFactory: UserComponentFactory,
    def: TDefinition,
    params: WithoutGridCommon<TEditorParams>
): UserCompDetails | undefined {
    return userComponentFactory.getCompDetails<TDefinition>(def, EditorRendererComponent, null, params);
}

export function _getLoadingCellRendererDetails(
    userComponentFactory: UserComponentFactory,
    def: ColDef,
    params: WithoutGridCommon<ICellRendererParams>
): UserCompDetails | undefined {
    return userComponentFactory.getCompDetails(
        def,
        LoadingCellRendererComponent,
        'agSkeletonCellRenderer',
        params,
        true
    );
}
// CELL EDITOR

export function _getCellEditorDetails(
    userComponentFactory: UserComponentFactory,
    def: ColDef,
    params: WithoutGridCommon<ICellEditorParams>
): UserCompDetails | undefined {
    return userComponentFactory.getCompDetails(def, CellEditorComponent, 'agCellEditor', params, true);
}
// FILTER

export function _getFilterDetails(
    userComponentFactory: UserComponentFactory,
    def: IFilterDef,
    params: WithoutGridCommon<IFilterParams>,
    defaultFilter: string
): UserCompDetails | undefined {
    return userComponentFactory.getCompDetails(def, FilterComponent, defaultFilter, params, true);
}

export function _getDateCompDetails(
    userComponentFactory: UserComponentFactory,
    params: WithoutGridCommon<IDateParams>
): UserCompDetails {
    return userComponentFactory.getCompDetailsFromGridOptions(DateComponent, 'agDateInput', params, true)!;
}

export function _getLoadingOverlayCompDetails(
    userComponentFactory: UserComponentFactory,
    params: WithoutGridCommon<ILoadingOverlayParams>
): UserCompDetails {
    return userComponentFactory.getCompDetailsFromGridOptions(
        LoadingOverlayComponent,
        'agLoadingOverlay',
        params,
        true
    )!;
}

export function _getNoRowsOverlayCompDetails(
    userComponentFactory: UserComponentFactory,
    params: WithoutGridCommon<INoRowsOverlayParams>
): UserCompDetails {
    return userComponentFactory.getCompDetailsFromGridOptions(NoRowsOverlayComponent, 'agNoRowsOverlay', params, true)!;
}

export function _getTooltipCompDetails(
    userComponentFactory: UserComponentFactory,
    params: WithoutGridCommon<ITooltipParams>
): UserCompDetails {
    return userComponentFactory.getCompDetails(params.colDef!, TooltipComponent, 'agTooltipComponent', params, true)!;
}

export function _getFloatingFilterCompDetails(
    userComponentFactory: UserComponentFactory,
    def: IFilterDef,
    params: WithoutGridCommon<IFloatingFilterParams<any>>,
    defaultFloatingFilter: string | null
): UserCompDetails | undefined {
    return userComponentFactory.getCompDetails(def, FloatingFilterComponent, defaultFloatingFilter, params);
}

export function _getFilterCompKeys(frameworkOverrides: IFrameworkOverrides, def: IFilterDef) {
    return _getUserCompKeys(frameworkOverrides, def, FilterComponent);
}

export function _mergeFilterParamsWithApplicationProvidedParams(
    userComponentFactory: UserComponentFactory,
    defObject: ColDef,
    paramsFromGrid: IFilterParams
): IFilterParams {
    return userComponentFactory.mergeParamsWithApplicationProvidedParams(defObject, FilterComponent, paramsFromGrid);
}
