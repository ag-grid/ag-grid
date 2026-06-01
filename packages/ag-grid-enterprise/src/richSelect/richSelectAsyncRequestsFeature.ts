import type { VerticalDirection } from 'ag-stack';

import { _consoleError } from 'ag-grid-community';

const DEFAULT_VALUES_PAGE_SIZE = 100;

interface RichSelectAsyncValuesPageParams {
    search: string;
    startRow: number;
    endRow: number;
    cursor?: string | null;
}

interface RichSelectAsyncValuesPageResult<TValue> {
    values: TValue[];
    lastRow?: number;
    cursor?: string | null;
}

interface RichSelectAsyncHost<TValue> {
    setValueList: (params: {
        valueList: TValue[] | Promise<TValue[] | undefined> | undefined;
        refresh?: boolean;
        isInitial?: boolean;
        scrollToCurrentValue?: boolean;
        prependedRowCount?: number;
    }) => void;
    setIsLoading: () => void;
}

interface RichSelectAsyncRequestsFeatureParams<TValue> {
    host: RichSelectAsyncHost<TValue>;
    source: RichSelectAsyncValuesSource<TValue>;
    onMisconfiguredSearchSource?: () => void;
    onFirstValuesPageLoaded: () => void;
}

export interface RichSelectAsyncValuesSource<TValue> {
    searchValues?: (searchString: string) => TValue[] | Promise<TValue[]>;
    loadValuesPage?: (
        params: RichSelectAsyncValuesPageParams
    ) => RichSelectAsyncValuesPageResult<TValue> | Promise<RichSelectAsyncValuesPageResult<TValue>>;
    valuesPageInitialStartRow?: (searchString: string) => number;
    valuesPageSize?: number;
}

export function createRichSelectAsyncRequestBindings<TValue>(params: {
    host: RichSelectAsyncHost<TValue>;
    source: RichSelectAsyncValuesSource<TValue>;
    useAsyncSearch?: boolean;
    onMisconfiguredSearchSource?: () => void;
    onFirstValuesPageLoaded?: () => void;
}): {
    controller: RichSelectAsyncRequestsFeature<TValue>;
    hasPagedSource: boolean;
    onSearch?: (searchString: string) => void;
    onLoadMoreRows?: (direction?: VerticalDirection) => void;
} {
    const { host, source, useAsyncSearch, onMisconfiguredSearchSource, onFirstValuesPageLoaded } = params;
    const controller = new RichSelectAsyncRequestsFeature<TValue>({
        host,
        source,
        onMisconfiguredSearchSource,
        onFirstValuesPageLoaded: onFirstValuesPageLoaded ?? (() => {}),
    });
    const hasPagedSource = typeof source.loadValuesPage === 'function';

    return {
        controller,
        hasPagedSource,
        onSearch: useAsyncSearch ? (searchString: string) => controller.onSearch(searchString) : undefined,
        onLoadMoreRows: hasPagedSource
            ? (direction?: VerticalDirection) => controller.loadValuesPage(direction ?? 'down')
            : undefined,
    };
}

export class RichSelectAsyncRequestsFeature<TValue = any> {
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

    constructor(private readonly ctrlParams: RichSelectAsyncRequestsFeatureParams<TValue>) {}

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
        const { host, source, onMisconfiguredSearchSource } = this.ctrlParams;
        host.setValueList({ refresh: true, valueList: undefined }); // undefined removes any previous value list and also removes any label like 'No matches'

        if (!searchString) {
            // if search input is empty or has initial cell value, hide the picker
            // it is consistent with the requirement of not calling values() with empty search
            return;
        }

        if (typeof source.searchValues !== 'function') {
            onMisconfiguredSearchSource?.();
            // should be impossible, but potentially allow sync values here
            return;
        }
        let valuesPromise: TValue[] | Promise<TValue[]>;

        try {
            valuesPromise = source.searchValues(searchString);
        } catch (error) {
            _consoleError('Rich Select', error);
            if (currentRequest === this.currentSearchRequest) {
                host.setValueList({ refresh: true, valueList: [] });
            }
            return;
        }

        if (Array.isArray(valuesPromise)) {
            // this is only possible due to grid misconfiguration, in which case handle it gracefully
            onMisconfiguredSearchSource?.();
            host.setValueList({ refresh: true, valueList: valuesPromise });
            return;
        }
        host.setValueList({
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

        this.ctrlParams.host.setValueList({ valueList: undefined, refresh: true, isInitial: true });
        this.loadValuesPage('down');
    }

    public loadValuesPage(direction: VerticalDirection): void {
        if (this.destroyed) {
            return;
        }

        const valuesPage = this.ctrlParams.source.loadValuesPage;

        if (typeof valuesPage !== 'function' || this.valuesPageLoading) {
            return;
        }

        if (
            (direction === 'up' && !this.valuesPageHasMorePrev) ||
            (direction === 'down' && !this.valuesPageHasMoreNext)
        ) {
            return;
        }

        const pageSize = Math.max(this.ctrlParams.source.valuesPageSize ?? DEFAULT_VALUES_PAGE_SIZE, 1);
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
        const requestParams: RichSelectAsyncValuesPageParams = {
            search: this.valuesPageSearch,
            startRow,
            endRow,
            cursor: direction === 'down' ? this.valuesPageNextCursor : undefined,
        };

        this.valuesPageLoading = true;

        if (this.valuesPageLoadedValues.length === 0) {
            this.ctrlParams.host.setIsLoading();
        }

        let pageResultOrPromise:
            | RichSelectAsyncValuesPageResult<TValue>
            | Promise<RichSelectAsyncValuesPageResult<TValue>>;
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
        pageResult: RichSelectAsyncValuesPageResult<TValue> | undefined,
        pageSize: number,
        requestVersion: number,
        direction: VerticalDirection,
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

        this.ctrlParams.host.setValueList({
            valueList: this.valuesPageLoadedValues,
            refresh: true,
            isInitial: true,
            scrollToCurrentValue: isFirstLoadedPage,
            prependedRowCount: direction === 'up' ? values.length : undefined,
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
        this.ctrlParams.host.setValueList({ valueList: this.valuesPageLoadedValues, refresh: true, isInitial: true });
    }

    private resolveValuesPageStartRow(searchString: string): number {
        if (searchString) {
            return 0;
        }

        const startRow = this.ctrlParams.source.valuesPageInitialStartRow?.(searchString);

        return Math.max(Math.floor(startRow ?? 0), 0);
    }

    private isValuesPaged(): boolean {
        return typeof this.ctrlParams.source.loadValuesPage === 'function';
    }
}
