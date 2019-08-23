import {
    Autowired,
    Component,
    DetailGridInfo,
    Environment,
    Grid,
    GridApi,
    GridOptions,
    GridOptionsWrapper,
    ICellRendererParams,
    ICellRenderer,
    RefSelector,
    RowNode,
    _
} from "ag-grid-community";

export class DetailCellRenderer extends Component implements ICellRenderer {

    private static TEMPLATE =
        `<div class="ag-details-row">
            <div ref="eDetailGrid" class="ag-details-grid"/>
        </div>`;

    @RefSelector('eDetailGrid') private eDetailGrid: HTMLElement;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('environment') private environment: Environment;

    private detailGridOptions: GridOptions;

    private masterGridApi: GridApi;

    private rowId: string;

    private needRefresh = false;

    private suppressRefresh: boolean;

    public refresh(): boolean {
        // if we return true, it means we pretend to the grid
        // that we have refreshed, so refresh will never happen.
        if (this.suppressRefresh) { return true; }

        // otherwise we only refresh if the data has changed in the node
        // since the last time. this happens when user updates data using transaction.
        const res = !this.needRefresh;
        this.needRefresh = false;
        return res;
    }

    public init(params: IDetailCellRendererParams): void {

        this.rowId = params.node.id;
        this.masterGridApi = params.api;
        this.suppressRefresh = params.suppressRefresh;

        this.selectAndSetTemplate(params);

        if (_.exists(this.eDetailGrid)) {
            this.addThemeToDetailGrid();
            this.createDetailsGrid(params);
            this.registerDetailWithMaster(params.node);
            this.loadRowData(params);

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

        this.addDestroyableEventListener(params.node.parent!, RowNode.EVENT_DATA_CHANGED, () => {
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

    private registerDetailWithMaster(rowNode: RowNode): void {
        const gridInfo: DetailGridInfo = {
            id: this.rowId,
            api: this.detailGridOptions.api,
            columnApi: this.detailGridOptions.columnApi
        };

        // register with api
        this.masterGridApi.addDetailGridInfo(this.rowId, gridInfo);

        // register with node
        rowNode.detailGridInfo = gridInfo;

        this.addDestroyFunc(() => {
            this.masterGridApi.removeDetailGridInfo(this.rowId); // unregister from api
            rowNode.detailGridInfo = null; // unregister from node
        });
    }

    private selectAndSetTemplate(params: ICellRendererParams): void {
        const paramsAny = params as any;

        if (_.missing(paramsAny.template)) {
            // use default template
            this.setTemplate(DetailCellRenderer.TEMPLATE);
        } else {
            // use user provided template
            if (typeof paramsAny.template === 'string') {
                this.setTemplate(paramsAny.template as string);
            } else if (typeof paramsAny.template === 'function') {
                const templateFunc: TemplateFunc = paramsAny.template as TemplateFunc;
                const template = templateFunc(params);
                this.setTemplate(template);
            } else {
                console.warn('ag-Grid: detailCellRendererParams.template should be function or string');
                this.setTemplate(DetailCellRenderer.TEMPLATE);
            }
        }
    }

    private createDetailsGrid(params: IDetailCellRendererParams): void {
        // we clone the detail grid options, as otherwise it would be shared
        // across many instances, and that would be a problem because we set
        // api and columnApi into gridOptions

        const gridOptions = params.detailGridOptions;
        if (_.missing(gridOptions)) {
            console.warn('ag-Grid: could not find detail grid options for master detail, ' +
                'please set gridOptions.detailCellRendererParams.detailGridOptions');
        }

        // IMPORTANT - gridOptions must be cloned
        this.detailGridOptions = _.cloneObject(gridOptions);
        // tslint:disable-next-line
        new Grid(this.eDetailGrid, this.detailGridOptions, {
            $scope: params.$scope,
            $compile: params.$compile,
            seedBeanInstances: {
                // a temporary fix for AG-1574
                // AG-1715 raised to do a wider ranging refactor to improve this
                agGridReact: params.agGridReact,
                // AG-1716 - directly related to AG-1574 and AG-1715
                frameworkComponentWrapper: params.frameworkComponentWrapper
            }
        });

        this.addDestroyFunc(() => {
            if (this.detailGridOptions.api) {
                this.detailGridOptions.api.destroy();
            }
        });
    }

    private loadRowData(params: IDetailCellRendererParams): void {
        const userFunc = params.getDetailRowData;
        if (!userFunc) {
            console.warn('ag-Grid: could not find getDetailRowData for master / detail, ' +
                'please set gridOptions.detailCellRendererParams.getDetailRowData');
            return;
        }
        const funcParams: any = {
            node: params.node,
            data: params.data,
            successCallback: this.setRowData.bind(this)
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
    suppressRefresh: boolean;
    agGridReact: any;
    frameworkComponentWrapper: any;
    $compile: any;
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
