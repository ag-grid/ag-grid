import {
    Autowired,
    Component,
    DetailGridInfo,
    Environment,
    Grid,
    GridApi,
    GridOptions,
    ICellRendererParams,
    ICellRenderer,
    RefSelector,
    RowNode,
    _
} from "@ag-grid-community/core";

export class DetailCellRenderer extends Component implements ICellRenderer {

    private static TEMPLATE = /* html */
        `<div class="ag-details-row">
            <div ref="eDetailGrid" class="ag-details-grid"/>
        </div>`;

    @Autowired('environment') private environment: Environment;
    @RefSelector('eDetailGrid') private eDetailGrid: HTMLElement;

    private static REFRESH_STRATEGY_ROWS = 'rows';
    private static REFRESH_STRATEGY_EVERYTHING = 'everything';
    private static REFRESH_STRATEGY_NOTHING = 'nothing';

    private detailGridOptions: GridOptions;

    private needRefresh = false;

    private params: IDetailCellRendererParams;

    private loadRowDataVersion = 0;

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    public refresh(): boolean {
        const GET_GRID_TO_REFRESH = false;
        const GET_GRID_TO_DO_NOTHING = true;

        const refreshStrategy = this.getRefreshStrategy();

        // if we return true, it means we pretend to the grid
        // that we have refreshed, so refresh will never happen.
        const doNotRefresh = !this.needRefresh || refreshStrategy===DetailCellRenderer.REFRESH_STRATEGY_NOTHING;
        if (doNotRefresh) {
            // we do nothing in this refresh method, and also tell the grid to do nothing
            return GET_GRID_TO_DO_NOTHING;
        }

        // reset flag, so don't refresh again until more data changes.
        this.needRefresh = false;

        if (refreshStrategy===DetailCellRenderer.REFRESH_STRATEGY_EVERYTHING) {
            // we want full refresh, so tell the grid to destroy and recreate this cell
            return GET_GRID_TO_REFRESH;
        } else {
            // do the refresh here, and tell the grid to do nothing
            this.loadRowData();
            return GET_GRID_TO_DO_NOTHING;
        }
    }

    private checkForDeprecations(): void {
        if (this.params.suppressRefresh) {
            console.warn(`ag-Grid: as of v23.2.0, cellRendererParams.suppressRefresh for Detail Cell Renderer is no longer used. Please set cellRendererParams.refreshStrategy = ${DetailCellRenderer.REFRESH_STRATEGY_NOTHING} instead.`);
            this.params.refreshStrategy = DetailCellRenderer.REFRESH_STRATEGY_NOTHING;
        }
    }

    private getRefreshStrategy(): string {
        if (this.params.refreshStrategy===DetailCellRenderer.REFRESH_STRATEGY_NOTHING) {
            return DetailCellRenderer.REFRESH_STRATEGY_NOTHING;
        } else if (this.params.refreshStrategy===DetailCellRenderer.REFRESH_STRATEGY_EVERYTHING) {
            return DetailCellRenderer.REFRESH_STRATEGY_EVERYTHING;
        } else {
            // this is the default, so no need to check explicitly, if it isn't the other two strategies,
            // we always use this one.
            return DetailCellRenderer.REFRESH_STRATEGY_ROWS;
        }
    }

    public init(params: IDetailCellRendererParams): void {

        // if embedFullWidthRows=true, then this component could be in a pinned section. we should not show detail
        // component if in the pinned section, on in the main body section.
        if (params.pinned) {
            this.setTemplate('<div class="ag-details-row"></div>');
            return;
        }

        this.params = params;

        this.checkForDeprecations();
        this.selectAndSetTemplate();

        if (_.exists(this.eDetailGrid)) {
            this.addThemeToDetailGrid();
            this.createDetailsGrid();
            this.registerDetailWithMaster();
            this.loadRowData();

            window.setTimeout(() => {
                // ensure detail grid api still exists (grid may be destroyed when async call tries to set data)
                if (this.detailGridOptions.api) {
                    this.detailGridOptions.api.doLayout();
                }
            }, 0);
        } else {
            console.warn('ag-Grid: reference to eDetailGrid was missing from the details template. ' +
                'Please add ref="eDetailGrid" to the template.');
        }

        this.addManagedListener(params.node.parent!, RowNode.EVENT_DATA_CHANGED, () => {
            this.needRefresh = true;
        });
    }

    private addThemeToDetailGrid(): void {
        // this is needed by environment service of the child grid, the class needs to be on
        // the grid div itself - the browser's CSS on the other hand just inherits from the parent grid theme.
        const { theme } = this.environment.getTheme();
        if (theme) {
            _.addCssClass(this.eDetailGrid, theme);
        }
    }

    private registerDetailWithMaster(): void {
        const rowId = this.params.node.id;
        const masterGridApi = this.params.api;

        const gridInfo: DetailGridInfo = {
            id: rowId,
            api: this.detailGridOptions.api,
            columnApi: this.detailGridOptions.columnApi
        };

        const rowNode = this.params.node;

        // register with api
        masterGridApi.addDetailGridInfo(rowId, gridInfo);

        // register with node
        rowNode.detailGridInfo = gridInfo;

        this.addDestroyFunc(() => {
            masterGridApi.removeDetailGridInfo(rowId); // unregister from api
            rowNode.detailGridInfo = null; // unregister from node
        });
    }

    private selectAndSetTemplate(): void {
        if (_.missing(this.params.template)) {
            // use default template
            this.setTemplate(DetailCellRenderer.TEMPLATE);
        } else {
            // use user provided template
            if (typeof this.params.template === 'string') {
                this.setTemplate(this.params.template);
            } else if (typeof this.params.template === 'function') {
                const templateFunc = this.params.template as TemplateFunc;
                const template = templateFunc(this.params);
                this.setTemplate(template);
            } else {
                console.warn('ag-Grid: detailCellRendererParams.template should be function or string');
                this.setTemplate(DetailCellRenderer.TEMPLATE);
            }
        }
    }

    private createDetailsGrid(): void {
        // we clone the detail grid options, as otherwise it would be shared
        // across many instances, and that would be a problem because we set
        // api and columnApi into gridOptions

        const gridOptions = this.params.detailGridOptions;
        if (_.missing(gridOptions)) {
            console.warn('ag-Grid: could not find detail grid options for master detail, ' +
                'please set gridOptions.detailCellRendererParams.detailGridOptions');
        }

        // IMPORTANT - gridOptions must be cloned
        this.detailGridOptions = _.cloneObject(gridOptions);
        // tslint:disable-next-line
        new Grid(this.eDetailGrid, this.detailGridOptions, {
            $scope: this.params.$scope,
            $compile: this.params.$compile,
            providedBeanInstances: {
                // a temporary fix for AG-1574
                // AG-1715 raised to do a wider ranging refactor to improve this
                agGridReact: this.params.agGridReact,
                // AG-1716 - directly related to AG-1574 and AG-1715
                frameworkComponentWrapper: this.params.frameworkComponentWrapper
            }
        });

        this.addDestroyFunc(() => {
            if (this.detailGridOptions.api) {
                this.detailGridOptions.api.destroy();
            }
        });
    }

    private loadRowData(): void {

        // in case a refresh happens before the last refresh completes (as we depend on async
        // application logic) we keep track on what the latest call was.
        this.loadRowDataVersion++;
        const versionThisCall = this.loadRowDataVersion;

        const userFunc = this.params.getDetailRowData;
        if (!userFunc) {
            console.warn('ag-Grid: could not find getDetailRowData for master / detail, ' +
                'please set gridOptions.detailCellRendererParams.getDetailRowData');
            return;
        }

        const successCallback = (rowData: any[])=> {
            const mostRecentCall = this.loadRowDataVersion!==versionThisCall;
            if (mostRecentCall) {
                this.setRowData(rowData);
            }
        };

        const funcParams: any = {
            node: this.params.node,
            data: this.params.data,
            successCallback: successCallback
        };
        userFunc(funcParams);
    }

    private setRowData(rowData: any[]): void {
        // ensure detail grid api still exists (grid may be destroyed when async call tries to set data)
        if (this.detailGridOptions.api) {
            this.detailGridOptions.api.setRowData(rowData);
        }
    }
}

export interface IDetailCellRendererParams extends ICellRendererParams {
    detailGridOptions: GridOptions;
    getDetailRowData: GetDetailRowData;
    refreshStrategy: string;
    agGridReact: any;
    frameworkComponentWrapper: any;
    $compile: any;
    pinned: string;
    template: string | TemplateFunc;
    /** @deprecated */
    suppressRefresh: boolean;
}

export interface GetDetailRowData {
    (params: GetDetailRowDataParams): void;
}

export interface GetDetailRowDataParams {
    // details for the request,
    node: RowNode;
    data: any;

    // success callback, pass the rows back the grid asked for
    successCallback(rowData: any[]): void;
}

interface TemplateFunc {
    (params: ICellRendererParams): string;
}
