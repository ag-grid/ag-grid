import type { AgPromise } from '../agStack/utils/promise';
import type { AgColumn } from '../entities/agColumn';
import type {
    CreateFilterHandlerFunc,
    DoesFilterPassParams,
    FilterAction,
    FilterDisplayComp,
    FilterDisplayParams,
    FilterDisplayState,
    FilterHandler,
    FilterHandlerBaseParams,
    FilterHandlerParams,
    FilterModel,
    FilterWrapperParams,
    IFilterComp,
    IFilterParams,
} from '../interfaces/iFilter';
import type { UserCompDetails } from '../interfaces/iUserCompDetails';

export const FILTER_HANDLER_MAP = {
    agSetColumnFilter: 'agSetColumnFilterHandler',
    agMultiColumnFilter: 'agMultiColumnFilterHandler',
    agGroupColumnFilter: 'agGroupColumnFilterHandler',
    agNumberColumnFilter: 'agNumberColumnFilterHandler',
    agDateColumnFilter: 'agDateColumnFilterHandler',
    agTextColumnFilter: 'agTextColumnFilterHandler',
} as const;

export const FILTER_HANDLERS = new Set(Object.values(FILTER_HANDLER_MAP));

export type FilterHandlerName = (typeof FILTER_HANDLER_MAP)[keyof typeof FILTER_HANDLER_MAP];

interface BaseFilterUi<TComp = IFilterComp, TParams = IFilterParams> {
    create: (update?: boolean) => AgPromise<TComp>;
    filterParams: TParams;
    compDetails: UserCompDetails;
    /**
     * True if has been refreshed but not created yet
     */
    refreshed?: boolean;
}

interface CreatedFilterUi<TComp = IFilterComp, TParams = IFilterParams> extends BaseFilterUi<TComp, TParams> {
    created: true;
    promise: AgPromise<TComp>;
}

interface UncreatedFilterUi<TComp = IFilterComp, TParams = IFilterParams> extends BaseFilterUi<TComp, TParams> {
    created: false;
}

export type FilterUi<TComp = IFilterComp, TParams = IFilterParams> =
    | CreatedFilterUi<TComp, TParams>
    | UncreatedFilterUi<TComp, TParams>;

interface BaseFilterWrapper<
    TComp extends IFilterComp | FilterDisplayComp = IFilterComp,
    TParams extends IFilterParams | FilterDisplayParams = IFilterParams,
> {
    column: AgColumn;
    /**
     * `null` if invalid
     */
    filterUi: FilterUi<TComp, TParams> | null;
}

export interface LegacyFilterWrapper extends BaseFilterWrapper<IFilterComp, IFilterParams> {
    isHandler: false;
    filter?: IFilterComp;
}

interface HandlerFilterWrapper extends BaseFilterWrapper<FilterDisplayComp, FilterDisplayParams> {
    isHandler: true;
    handler: FilterHandler;
    /** This is only used to see whether the handler has changed */
    handlerGenerator: CreateFilterHandlerFunc | FilterHandlerName | ((params: DoesFilterPassParams) => boolean);
    handlerParams: FilterHandlerBaseParams;
}

export type FilterWrapper = LegacyFilterWrapper | HandlerFilterWrapper;

export function getFilterUiFromWrapper<TComp extends IFilterComp | FilterDisplayComp>(
    filterWrapper: FilterWrapper,
    skipCreate?: boolean
): AgPromise<TComp> | null {
    const filterUi = filterWrapper.filterUi;
    if (!filterUi) {
        return null;
    }
    if (filterUi.created) {
        return filterUi.promise as AgPromise<TComp>;
    }
    if (skipCreate) {
        return null;
    }
    const promise = filterUi.create(filterUi.refreshed) as AgPromise<TComp>;
    const createdFilterUi = filterUi as unknown as CreatedFilterUi<TComp>;
    createdFilterUi.created = true;
    createdFilterUi.promise = promise;
    return promise;
}

export function _refreshHandlerAndUi(
    getFilterUi: () => AgPromise<{ filter: FilterDisplayComp; filterParams: FilterDisplayParams } | undefined>,
    handler: FilterHandler,
    handlerParams: FilterHandlerBaseParams,
    model: any,
    state: FilterDisplayState,
    source: 'ui' | 'api' | 'colDef' | 'floating' | 'handler',
    additionalEventAttributes?: any
): AgPromise<void> {
    handler.refresh?.({ ...handlerParams, model, source, additionalEventAttributes } as FilterHandlerParams);

    return getFilterUi().then((filterUi) => {
        if (filterUi) {
            const { filter, filterParams } = filterUi;
            _refreshFilterUi(filter, filterParams, model, state, source, additionalEventAttributes);
        }
    });
}

export function _refreshFilterUi(
    filter: FilterDisplayComp | null | undefined,
    filterParams: FilterDisplayParams,
    model: any,
    state: FilterDisplayState,
    source: 'ui' | 'api' | 'colDef' | 'floating' | 'handler' | 'init',
    additionalEventAttributes?: any
): void {
    filter?.refresh?.({
        ...filterParams,
        model,
        state,
        source,
        additionalEventAttributes,
    });
}

export function getAndRefreshFilterUi(
    getFilterUi: () => FilterUi<FilterDisplayComp, FilterDisplayParams> | undefined,
    getModel: () => any,
    getState: () => FilterDisplayState | undefined
): void {
    const filterUi = getFilterUi();
    if (filterUi?.created) {
        filterUi.promise.then((filter) => {
            const model = getModel();
            _refreshFilterUi(filter, filterUi.filterParams, model, getState() ?? { model }, 'ui');
        });
    }
}

export function _updateFilterModel(params: {
    action: FilterAction;
    filterParams?: FilterWrapperParams;
    getFilterUi: () => FilterUi<FilterDisplayComp, FilterDisplayParams> | undefined;
    getModel: () => any;
    getState: () => FilterDisplayState | undefined;
    updateState: (state: FilterDisplayState) => void;
    updateModel: (model: any) => void;
    processModelToApply?: (model: any) => any;
}): void {
    let state: FilterDisplayState;
    let shouldUpdateModel = false;
    let model: any;

    const { action, filterParams, getFilterUi, getModel, getState, updateState, updateModel, processModelToApply } =
        params;

    switch (action) {
        case 'apply': {
            const oldState = getState();
            model = oldState?.model ?? null;
            if (processModelToApply) {
                model = processModelToApply(model);
            }
            state = {
                // keep the other UI state
                state: oldState?.state,
                model,
            };
            shouldUpdateModel = true;
            break;
        }
        case 'clear': {
            state = {
                // wipe other UI state
                model: null,
            };
            if (!filterParams?.buttons?.includes('apply')) {
                // if no apply button, equivalent to reset
                shouldUpdateModel = true;
                model = null;
            }
            break;
        }
        case 'reset': {
            state = {
                // wipe other UI state
                model: null,
            };
            shouldUpdateModel = true;
            model = null;
            break;
        }
        case 'cancel': {
            state = {
                // wipe other UI state
                model: getModel(),
            };
            break;
        }
    }

    updateState(state);
    if (shouldUpdateModel) {
        updateModel(model);
    } else {
        getAndRefreshFilterUi(getFilterUi, getModel, getState);
    }
}

export function _getFilterModel<TModel = any>(model: FilterModel, colId: string): TModel | null {
    return model[colId] ?? null;
}
