import {
    _,
    Grid,
    GridApi,
    RowNode,
    Component,
    Autowired,
    RefSelector,
    GridOptions,
    DetailGridInfo,
    GridOptionsWrapper,
    ICellRendererParams,
    Environment
} from "ag-grid/main";

export class DetailCellRenderer extends Component {

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

    public init(params: IDetailCellRendererParams): void {

        this.rowId = params.node.id;
        this.masterGridApi = params.api;

        this.selectAndSetTemplate(params);

        if (_.exists(this.eDetailGrid)) {
            this.addThemeToDetailGrid();
            this.createDetailsGrid(params);
            this.registerDetailWithMaster(params.node);
            this.loadRowData(params);
            this.setupGrabMouseWheelEvent();

            setTimeout(() => this.detailGridOptions.api.doLayout(), 0);
        } else {
            console.warn('ag-Grid: reference to eDetailGrid was missing from the details template. ' +
                'Please add ref="eDetailGrid" to the template.');
        }
    }

    private addThemeToDetailGrid(): void {
        // this is needed by environment service of the child grid, the class needs to be on
        // the grid div itself - the browser's CSS on the other hand just inherits from the parent grid theme.
        let theme = this.environment.getTheme();
        if (_.exists(theme)) {
            _.addCssClass(this.eDetailGrid, theme);
        }
    }

    private setupGrabMouseWheelEvent(): void {
        let mouseWheelListener = (event: WheelEvent) => {
            event.stopPropagation();
        };

        // event is 'mousewheel' for IE9, Chrome, Safari, Opera
        this.eDetailGrid.addEventListener('mousewheel', mouseWheelListener);
        // event is 'DOMMouseScroll' Firefox
        this.eDetailGrid.addEventListener('DOMMouseScroll', mouseWheelListener);
    }

    private registerDetailWithMaster(rowNode: RowNode): void {
        let gridInfo: DetailGridInfo = {
            id: this.rowId,
            api: this.detailGridOptions.api,
            columnApi: this.detailGridOptions.columnApi
        };

        // register with api
        this.masterGridApi.addDetailGridInfo(this.rowId, gridInfo);

        // register with node
        rowNode.detailGridInfo = gridInfo;

        this.addDestroyFunc( ()=> {
            this.masterGridApi.removeDetailGridInfo(this.rowId); // unregister from api
            rowNode.detailGridInfo = null; // unregister from node
        });
    }

    private selectAndSetTemplate(params: ICellRendererParams): void {
        let paramsAny = <any> params;

        if (_.missing(paramsAny.template)) {
            // use default template
            this.setTemplate(DetailCellRenderer.TEMPLATE)
        } else {
            // use user provided template
            if (typeof paramsAny.template === 'string') {
                this.setTemplate(<string>paramsAny.template);
            } else if (typeof paramsAny.template === 'function') {
                let templateFunc: TemplateFunc = <TemplateFunc> paramsAny.template;
                let template = templateFunc(params);
                this.setTemplate(template);
            } else {
                console.warn('ag-Grid: detailCellRendererParams.template should be function or string');
                this.setTemplate(DetailCellRenderer.TEMPLATE)
            }
        }
    }

    private createDetailsGrid(params: IDetailCellRendererParams): void {
        // we clone the detail grid options, as otherwise it would be shared
        // across many instances, and that would be a problem because we set
        // api and columnApi into gridOptions

        let gridOptions = params.detailGridOptions;
        if (_.missing(gridOptions)) {
            console.warn('ag-Grid: could not find detail grid options for master detail, ' +
                'please set gridOptions.detailCellRendererParams.detailGridOptions');
        }

        // IMPORTANT - gridOptions must be cloned
        this.detailGridOptions = _.cloneObject(gridOptions);
        //Passing a dummy agGridReact bean in case this is for a REACT grid
        new Grid(this.eDetailGrid, this.detailGridOptions, {
            seedBeanInstances: {
                agGridReact: {}
            }
        });

        this.addDestroyFunc( () => this.detailGridOptions.api.destroy() );
    }

    private loadRowData(params: IDetailCellRendererParams): void {
        let userFunc = params.getDetailRowData;
        if (!userFunc) {
            console.warn('ag-Grid: could not find getDetailRowData for master / detail, ' +
                'please set gridOptions.detailCellRendererParams.getDetailRowData');
            return;
        }
        let funcParams: any = {
            node: params.node,
            data: params.data,
            successCallback: this.setRowData.bind(this)
        };
        userFunc(funcParams);
    }

    private setRowData(rowData: any[]): void {
        this.detailGridOptions.api.setRowData(rowData);
    }

}

export interface IDetailCellRendererParams extends ICellRendererParams {
    detailGridOptions: GridOptions;
    getDetailRowData: GetDetailRowData;
}

export interface GetDetailRowData {
    (params: GetDetailRowDataParams): void;
}

export interface GetDetailRowDataParams {
    // details for the request,
    node:  RowNode;
    data: any;

    // success callback, pass the rows back the grid asked for
    successCallback(rowData: any[]): void;
}

interface TemplateFunc {
    (params: ICellRendererParams): string;
}