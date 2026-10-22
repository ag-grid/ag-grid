import type { FilterHandler } from '../interfaces/iFilter';
import type { FilterHandlerName } from './columnFilterUtils';

/** Built-in filters whose UI keeps its state in their own handler, so it cannot run on the author's. */
export const STATEFUL_UI_FILTER_HANDLERS: ReadonlySet<FilterHandlerName> = new Set([
    'agSetColumnFilterHandler',
    'agMultiColumnFilterHandler',
    'agGroupColumnFilterHandler',
]);

interface PairedFilterHandler extends FilterHandler {
    readonly displayHandlerName: FilterHandlerName;
    readonly displayHandler: FilterHandler;
    readonly rowHandler: FilterHandler;
}

/**
 * The author's `handler` or `doesFilterPass` deciding the rows of a built-in filter that keeps its state in its own
 * handler: the grid's handler is kept beside it for the UI, and both receive every update.
 */
export function _createPairedFilterHandler(
    displayHandlerName: FilterHandlerName,
    displayHandler: FilterHandler,
    rowHandler: FilterHandler,
    destroyBean: (handler: FilterHandler) => void
): FilterHandler {
    const paired: PairedFilterHandler = {
        displayHandlerName,
        displayHandler,
        rowHandler,
        init: (params) => {
            displayHandler.init?.(params);
            rowHandler.init?.(params);
        },
        refresh: (params) => {
            const displayRefreshed = displayHandler.refresh?.(params);
            return rowHandler.refresh?.(params) === false || displayRefreshed === false ? false : undefined;
        },
        doesFilterPass: (params) => rowHandler.doesFilterPass(params),
        getModelAsString: (model, source) =>
            displayHandler.getModelAsString?.(model, source) ?? rowHandler.getModelAsString?.(model, source) ?? '',
        onAnyFilterChanged: () => {
            displayHandler.onAnyFilterChanged?.();
            rowHandler.onAnyFilterChanged?.();
        },
        onNewRowsLoaded: () => {
            displayHandler.onNewRowsLoaded?.();
            rowHandler.onNewRowsLoaded?.();
        },
        destroy: () => {
            destroyBean(displayHandler);
            destroyBean(rowHandler);
        },
    };
    const displayProcess = displayHandler.processModelToApply?.bind(displayHandler);
    const rowProcess = rowHandler.processModelToApply?.bind(rowHandler);
    if (displayProcess || rowProcess) {
        paired.processModelToApply = (model) => {
            const processed = displayProcess ? displayProcess(model) : model;
            return rowProcess ? rowProcess(processed) : processed;
        };
    }
    return paired;
}

const asPaired = (handler: FilterHandler | undefined): PairedFilterHandler | undefined =>
    handler && 'displayHandler' in handler ? (handler as PairedFilterHandler) : undefined;

/**
 * The handler a built-in filter's UI and the grid's readers work with.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getDisplayHandler<T extends FilterHandler | undefined>(handler: T): T {
    return (asPaired(handler)?.displayHandler as T) ?? handler;
}

/**
 * The handler the application supplied, which is what the API hands back.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getRowHandler<T extends FilterHandler | undefined>(handler: T): T {
    return (asPaired(handler)?.rowHandler as T) ?? handler;
}

export const getDisplayHandlerName = (handler: FilterHandler | undefined): FilterHandlerName | undefined =>
    asPaired(handler)?.displayHandlerName;
