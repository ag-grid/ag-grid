import {Component} from "../widgets/component";
import {RefSelector} from "../widgets/componentAnnotations";
import {Autowired} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {GetDetailRowDataParams, GridOptions} from "../entities/gridOptions";
import {_} from "../utils";
import {Grid} from "../grid";
import {ICellRendererParams} from "./cellRenderers/iCellRenderer";
import {DetailGridInfo, GridApi} from "../gridApi";
import {RowNode} from "../entities/rowNode";

export class DetailCellRenderer extends Component {

    private static TEMPLATE =
        `<div class="ag-details-row">
            <div ref="eDetailGrid" class="ag-details-grid"/>
        </div>`;

    @RefSelector('eDetailGrid') private eDetailGrid: HTMLElement;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private detailGridOptions: GridOptions;

    private masterGridApi: GridApi;

    private rowId: string;

    public init(params: ICellRendererParams): void {

        this.rowId = params.node.id;
        this.masterGridApi = params.api;

        this.selectAndSetTemplate(params);

        if (_.exists(this.eDetailGrid)) {
            this.createDetailsGrid();
            this.registerDetailWithMaster(params.node);
            this.loadRowData(params);
        } else {
            console.warn('ag-Grid: reference to eDetailGrid was missing from the details template. ' +
                'Please add ref="eDetailGrid" to the template.');
        }
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

    public selectAndSetTemplate(params: ICellRendererParams): void {
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
                console.warn('ag-Grid: detailCellRendererParams.template should be function or string')
                this.setTemplate(DetailCellRenderer.TEMPLATE)
            }
        }
    }

    private createDetailsGrid(): void {
        // we clone the detail grid options, as otherwise it would be shared
        // across many instances, and that would be a problem because we set
        // api and columnApi into gridOptions

        let gridOptions = this.gridOptionsWrapper.getDetailGridOptions();
        if (_.missing(gridOptions)) {
            console.warn('ag-Grid: could not find detail grid options for master detail');
        }

        // IMPORTANT - gridOptions must be cloned
        this.detailGridOptions = _.cloneObject(gridOptions);
        new Grid(this.eDetailGrid, this.detailGridOptions);

        this.addDestroyFunc( () => this.detailGridOptions.api.destroy() );
    }

    private loadRowData(params: ICellRendererParams): void {
        let userFunc = this.gridOptionsWrapper.getDetailRowDataFunc();
        if (!userFunc) {
            console.warn('ag-Grid: grid property detailGridOptions is provided, but getDetailsRowData() is not. ' +
                'For master detail to work, please provide getDetailsRowData()');
            return;
        }
        let funcParams: GetDetailRowDataParams = {
            node: params.node,
            data: params.data,
            successCallback: this.setRowData.bind(this)
        };
        userFunc(funcParams);
    }

    public setRowData(rowData: any[]): void {
        this.detailGridOptions.api.setRowData(rowData);
    }

}

interface TemplateFunc {
    (params: ICellRendererParams): string;
}
