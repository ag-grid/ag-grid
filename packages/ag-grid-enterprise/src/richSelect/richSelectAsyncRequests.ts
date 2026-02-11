import type {
    RichCellEditorParams,
    RichCellEditorValuesCallbackParams,
    RichCellEditorValuesPageParams,
    RichCellEditorValuesPageResult,
    _VerticalDirection,
} from 'ag-grid-community';
import { _consoleError, _warn } from 'ag-grid-community';

import type { AgRichSelect } from '../widgets/agRichSelect';

const DEFAULT_VALUES_PAGE_SIZE = 100;

interface RichSelectAsyncRequestsControllerParams<TData, TValue> {
    getEditor: () => AgRichSelect<TValue>;
    getParams: () => RichCellEditorParams<TData, TValue>;
    isFullAsync: () => boolean;
    onFirstValuesPageLoaded: () => void;
}

export class RichSelectAsyncRequestsController<TData = any, TValue = any> {
    private currentSearchRequest: number = 0;
    private currentValuesPageRequest: number = 0;
    private valuesPageLoading = false;
    private valuesPageHasMoreNext = false;
    private valuesPageHasMorePrev = false;
    private valuesPageLoadedValues: TValue[] = [];
    private valuesPageSearch = '';
    private valuesPageWindowStartRow = 0;
    private valuesPageNextCursor: string | null | undefined;
    private destroyed = false;

    constructor(private readonly ctrlParams: RichSelectAsyncRequestsControllerParams<TData, TValue>) {}

    public destroy(): void {
        this.destroyed = true;
        this.currentSearchRequest++;
        this.currentValuesPageRequest++;
    }

    public onSearch(searchString: string): void {
        if (this.destroyed) {
            return;
        }

        if (this.isValuesPaged()) {
            this.resetValuesPage(searchString);
            return;
        }

        const currentRequest = ++this.currentSearchRequest;
        const richSelect = this.ctrlParams.getEditor();
        richSelect.setValueList({ refresh: true, valueList: undefined }); // undefined removes any previous value list and also removes any label like 'No matches'
        const params = this.ctrlParams.getParams() as RichCellEditorValuesCallbackParams<TData, TValue>;

        if (!searchString) {
            // if search input is empty or has initial cell value, hide the picker
            // it is consistent with the requirement of not calling values() with empty search
            return;
        }

        if (typeof params.values !== 'function') {
            if (this.ctrlParams.isFullAsync()) {
                _warn(294);
            }
            // should be impossible, but potentially allow sync values here
            return;
        }
        const callbackParams: RichCellEditorValuesCallbackParams<TData, TValue> = { ...params, search: searchString };
        let valuesPromise: TValue[] | Promise<TValue[]>;

        try {
            valuesPromise = params.values(callbackParams);
        } catch (error) {
            _consoleError('Rich Select', error);
            if (currentRequest === this.currentSearchRequest) {
                richSelect.setValueList({ refresh: true, valueList: [] });
            }
            return;
        }

        if (Array.isArray(valuesPromise)) {
            // this is only possible due to grid misconfiguration, in which case handle it gracefully
            if (this.ctrlParams.isFullAsync()) {
                _warn(294);
            }
            richSelect.setValueList({ refresh: true, valueList: valuesPromise });
            return;
        }
        richSelect.setValueList({
            valueList: valuesPromise
                .then((results) => {
                    // only set the results if this is the latest search request
                    // this avoids out of order responses messing up the results
                    if (currentRequest === this.currentSearchRequest) {
                        return results;
                    }
                })
                .catch((error) => {
                    _consoleError('Rich Select', error);
                    if (currentRequest === this.currentSearchRequest) {
                        return [];
                    }
                }),
            refresh: true,
        });
    }

    public resetValuesPage(searchString: string): void {
        if (this.destroyed) {
            return;
        }

        this.valuesPageSearch = searchString;
        this.valuesPageLoadedValues = [];
        this.valuesPageWindowStartRow = this.resolveValuesPageStartRow(searchString);
        this.valuesPageNextCursor = undefined;
        this.valuesPageHasMoreNext = true;
        this.valuesPageHasMorePrev = this.valuesPageWindowStartRow > 0;
        this.valuesPageLoading = false;
        this.currentValuesPageRequest++;

        this.ctrlParams.getEditor().setValueList({ valueList: undefined, refresh: true, isInitial: true });
        this.loadValuesPage('down');
    }

    public loadValuesPage(direction: _VerticalDirection): void {
        if (this.destroyed) {
            return;
        }

        const valuesPage = this.ctrlParams.getParams().valuesPage;

        if (typeof valuesPage !== 'function' || this.valuesPageLoading) {
            return;
        }

        if (
            (direction === 'up' && !this.valuesPageHasMorePrev) ||
            (direction === 'down' && !this.valuesPageHasMoreNext)
        ) {
            return;
        }

        const params = this.ctrlParams.getParams();
        const pageSize = Math.max(params.valuesPageSize ?? DEFAULT_VALUES_PAGE_SIZE, 1);
        const startRow =
            direction === 'up'
                ? Math.max(this.valuesPageWindowStartRow - pageSize, 0)
                : this.valuesPageWindowStartRow + this.valuesPageLoadedValues.length;
        const endRow = direction === 'up' ? this.valuesPageWindowStartRow : startRow + pageSize;

        if (startRow >= endRow) {
            if (direction === 'up') {
                this.valuesPageHasMorePrev = false;
            } else {
                this.valuesPageHasMoreNext = false;
            }
            return;
        }

        const requestVersion = this.currentValuesPageRequest;
        const requestParams: RichCellEditorValuesPageParams<TData, TValue> = {
            ...params,
            search: this.valuesPageSearch,
            startRow,
            endRow,
            cursor: direction === 'down' ? this.valuesPageNextCursor : undefined,
        };

        this.valuesPageLoading = true;

        if (this.valuesPageLoadedValues.length === 0) {
            this.ctrlParams.getEditor().setIsLoading();
        }

        let pageResultOrPromise:
            | RichCellEditorValuesPageResult<TValue>
            | Promise<RichCellEditorValuesPageResult<TValue>>;
        try {
            pageResultOrPromise = valuesPage(requestParams);
        } catch (error) {
            this.handleValuesPageError(error, requestVersion);
            return;
        }

        Promise.resolve(pageResultOrPromise)
            .then((pageResult) =>
                this.applyValuesPageResult(pageResult, pageSize, requestVersion, direction, startRow, endRow)
            )
            .catch((error) => this.handleValuesPageError(error, requestVersion));
    }

    private applyValuesPageResult(
        pageResult: RichCellEditorValuesPageResult<TValue> | undefined,
        pageSize: number,
        requestVersion: number,
        direction: _VerticalDirection,
        requestStartRow: number,
        requestEndRow: number
    ): void {
        if (this.destroyed || requestVersion !== this.currentValuesPageRequest) {
            return;
        }

        this.valuesPageLoading = false;

        const isFirstLoadedPage = this.valuesPageLoadedValues.length === 0;
        const values = pageResult?.values ?? [];

        if (direction === 'up') {
            if (values.length) {
                this.valuesPageLoadedValues = [...values, ...this.valuesPageLoadedValues];
                this.valuesPageWindowStartRow = requestStartRow;
            }

            const expectedCount = requestEndRow - requestStartRow;
            this.valuesPageHasMorePrev = requestStartRow > 0 && values.length >= expectedCount;
        } else {
            if (values.length) {
                this.valuesPageLoadedValues = [...this.valuesPageLoadedValues, ...values];
            }

            this.valuesPageNextCursor = pageResult?.cursor;
            const loadedRowCount = this.valuesPageLoadedValues.length;

            if (typeof pageResult?.lastRow === 'number') {
                this.valuesPageHasMoreNext = this.valuesPageWindowStartRow + loadedRowCount < pageResult.lastRow;
            } else if (pageResult?.cursor !== undefined) {
                this.valuesPageHasMoreNext = !!pageResult.cursor;
            } else {
                this.valuesPageHasMoreNext = values.length >= pageSize;
            }
        }

        this.ctrlParams.getEditor().setValueList({
            valueList: this.valuesPageLoadedValues,
            refresh: true,
            isInitial: true,
            scrollToCurrentValue: isFirstLoadedPage,
        });

        if (isFirstLoadedPage) {
            this.ctrlParams.onFirstValuesPageLoaded();
        }
    }

    private handleValuesPageError(error: unknown, requestVersion: number): void {
        _consoleError('Rich Select', error);

        if (this.destroyed || requestVersion !== this.currentValuesPageRequest) {
            return;
        }

        this.valuesPageLoading = false;
        this.valuesPageHasMoreNext = false;
        this.valuesPageHasMorePrev = false;
        this.ctrlParams
            .getEditor()
            .setValueList({ valueList: this.valuesPageLoadedValues, refresh: true, isInitial: true });
    }

    private resolveValuesPageStartRow(searchString: string): number {
        if (searchString) {
            return 0;
        }

        const { valuesPageInitialStartRow, value } = this.ctrlParams.getParams();
        const startRow =
            typeof valuesPageInitialStartRow === 'function'
                ? valuesPageInitialStartRow(value)
                : valuesPageInitialStartRow;

        return Math.max(Math.floor(startRow ?? 0), 0);
    }

    private isValuesPaged(): boolean {
        return typeof this.ctrlParams.getParams().valuesPage === 'function';
    }
}
