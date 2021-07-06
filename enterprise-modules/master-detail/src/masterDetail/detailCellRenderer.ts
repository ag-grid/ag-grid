import {
    _,
    Autowired,
    Component,
    DetailGridInfo,
    Environment,
    Grid,
    GridOptions,
    ICellRenderer,
    ICellRendererParams,
    RefSelector,
    RowNode
} from "@ag-grid-community/core";

export class DetailCellRenderer extends Component implements ICellRenderer {

    private static TEMPLATE = /* html */
        `<div class="ag-details-row">
            <div ref="eDetailGrid" class="ag-details-grid"></div>
        </div>`;

    @Autowired('environment') private environment: Environment;
    @RefSelector('eDetailGrid') private eDetailGrid: HTMLElement;

    private detailGridOptions: GridOptions;

    private needRefresh = false;

    private params: IDetailCellRendererParams;

    private loadRowDataVersion = 0;

    public init(params: IDetailCellRendererParams): void {

        // if embedFullWidthRows=true, then this component could be in a pinned section. we should not show detail
        // component if in the pinned section, on in the main body section.
        if (params.pinned) {
            this.setTemplate('<div class="ag-details-row"></div>');
            return;
        }

        this.params = params;

        const autoHeight = this.gridOptionsWrapper.isDetailRowAutoHeight();

        this.checkForDeprecations();
        this.ensureValidRefreshStrategy();
        this.selectAndSetTemplate(autoHeight);

        if (_.exists(this.eDetailGrid)) {
            this.addThemeToDetailGrid();
            this.createDetailsGrid(autoHeight);
            this.registerDetailWithMaster();
            this.loadRowData();
        } else {
            console.warn('AG Grid: reference to eDetailGrid was missing from the details template. ' +
                'Please add ref="eDetailGrid" to the template.');
        }

        this.addManagedListener(params.node.parent!, RowNode.EVENT_DATA_CHANGED, () => {
            this.needRefresh = true;
        });
    }

    public refresh(): boolean {
        const GET_GRID_TO_REFRESH = false;
        const GET_GRID_TO_DO_NOTHING = true;

        // if we return true, it means we pretend to the grid
        // that we have refreshed, so refresh will never happen.
        const doNotRefresh = !this.needRefresh || this.params.refreshStrategy === 'nothing';
        if (doNotRefresh) {
            // we do nothing in this refresh method, and also tell the grid to do nothing
            return GET_GRID_TO_DO_NOTHING;
        }

        // reset flag, so don't refresh again until more data changes.
        this.needRefresh = false;

        if (this.params.refreshStrategy === 'everything') {
            // we want full refresh, so tell the grid to destroy and recreate this cell
            return GET_GRID_TO_REFRESH;
        } else {
            // do the refresh here, and tell the grid to do nothing
            this.loadRowData();
            return GET_GRID_TO_DO_NOTHING;
        }
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    private checkForDeprecations(): void {
        if (this.params.suppressRefresh) {
            console.warn("AG Grid: as of v23.2.0, cellRendererParams.suppressRefresh for Detail Cell Renderer is no " +
                "longer used. Please set cellRendererParams.refreshStrategy = 'nothing' instead.");
            this.params.refreshStrategy = 'nothing';
        }
    }

    private ensureValidRefreshStrategy(): void {
        switch (this.params.refreshStrategy) {
            case 'rows':
            case 'nothing':
            case 'everything':
                return;
        }

        // check for incorrectly supplied refresh strategy
        if (this.params.refreshStrategy) {
            console.warn("AG Grid: invalid cellRendererParams.refreshStrategy = '" + this.params.refreshStrategy +
                "' supplied, defaulting to refreshStrategy = 'rows'.");
        }

        // use default strategy
        this.params.refreshStrategy = 'rows';
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
        const rowId = this.params.node.id!;
        const masterGridApi = this.params.api;

        const gridInfo: DetailGridInfo = {
            id: rowId,
            api: this.detailGridOptions.api!,
            columnApi: this.detailGridOptions.columnApi!
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

    private selectAndSetTemplate(autoHeight: boolean): void {

        const setDefaultTemplate = () => {
            this.setTemplate(DetailCellRenderer.TEMPLATE);

            this.addCssClass(autoHeight ? 'ag-details-row-auto-height' : 'ag-details-row-fixed-height');
            _.addCssClass(this.eDetailGrid, autoHeight ? 'ag-details-grid-auto-height' : 'ag-details-grid-fixed-height');
        };

        if (_.missing(this.params.template)) {
            // use default template
            setDefaultTemplate();
        } else {
            // use user provided template
            if (typeof this.params.template === 'string') {
                this.setTemplate(this.params.template);
            } else if (typeof this.params.template === 'function') {
                const templateFunc = this.params.template;
                const template = templateFunc(this.params);
                this.setTemplate(template);
            } else {
                console.warn('AG Grid: detailCellRendererParams.template should be function or string');
                setDefaultTemplate();
            }
        }
    }

    private createDetailsGrid(autoHeight: boolean): void {
        // we clone the detail grid options, as otherwise it would be shared
        // across many instances, and that would be a problem because we set
        // api and columnApi into gridOptions

        const gridOptions = this.params.detailGridOptions;
        if (_.missing(gridOptions)) {
            console.warn('AG Grid: could not find detail grid options for master detail, ' +
                'please set gridOptions.detailCellRendererParams.detailGridOptions');
        }

        // IMPORTANT - gridOptions must be cloned
        this.detailGridOptions = _.cloneObject(gridOptions);
        if (autoHeight) {
            this.detailGridOptions.domLayout = 'autoHeight';
        }

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
            console.warn('AG Grid: could not find getDetailRowData for master / detail, ' +
                'please set gridOptions.detailCellRendererParams.getDetailRowData');
            return;
        }

        const successCallback = (rowData: any[]) => {
            const mostRecentCall = this.loadRowDataVersion === versionThisCall;
            if (mostRecentCall) {
                this.setRowData(rowData);
            }
        };

        const funcParams: any = {
            node: this.params.node,
            // we take data from node, rather than params.data
            // as the data could have been updated with new instance
            data: this.params.node.data,
            successCallback: successCallback,
            context: this.gridOptionsWrapper.getContext()
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
    refreshStrategy: 'rows' | 'everything' | 'nothing';
    agGridReact: any;
    frameworkComponentWrapper: any;
    $compile: any;
    pinned: string;
    template: string | TemplateFunc;
    /** @deprecated */
    autoHeight: boolean;
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
