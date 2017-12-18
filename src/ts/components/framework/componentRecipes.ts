import {Autowired, Bean} from "../../context/context";
import {IDateComp, IDateParams} from "../../rendering/dateComponent";
import {GridOptions} from "../../entities/gridOptions";
import {IComponent} from "../../interfaces/iComponent";
import {ColDef} from "../../entities/colDef";
import {IHeaderGroupComp, IHeaderGroupParams} from "../../headerRendering/headerGroup/headerGroupComp";
import {IHeaderComp, IHeaderParams} from "../../headerRendering/header/headerComp";
import {IFloatingFilterComp, IFloatingFilterParams} from "../../filter/floatingFilter";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {IFloatingFilterWrapperComp, IFloatingFilterWrapperParams} from "../../filter/floatingFilterWrapper";
import {Column} from "../../entities/column";
import {IFilterComp} from "../../interfaces/iFilter";
import {FilterManager} from "../../filter/filterManager";
import {ComponentResolver} from "./componentResolver";
import {ICellRendererComp, ICellRendererParams} from "../../rendering/cellRenderers/iCellRenderer";
import {GroupCellRendererParams} from "../../rendering/cellRenderers/groupCellRenderer";
import {ISetFilterParams} from "../../interfaces/iSetFilterParams";
import {IRichCellEditorParams} from "../../interfaces/iRichCellEditorParams";
import {Promise} from "../../utils";
import {IOverlayWrapperComp} from "../../rendering/overlays/overlayWrapperComponent";
import {ILoadingOverlayComp} from "../../rendering/overlays/loadingOverlayComponent";
import {INoRowsOverlayComp} from "../../rendering/overlays/noRowsOverlayComponent";

enum ComponentType {
    AG_GRID, FRAMEWORK
}

/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
interface ComponentToUse<A extends IComponent<any> & B, B> {
    component:{new(): A}|{new(): B},
    type:ComponentType
}


@Bean('componentRecipes')
export class ComponentRecipes {
    @Autowired("componentResolver")
    private componentResolver:ComponentResolver;

    @Autowired("gridOptions")
    private gridOptions: GridOptions;

    @Autowired("gridOptionsWrapper")
    private gridOptionsWrapper: GridOptionsWrapper;

    @Autowired('filterManager')
    private filterManager: FilterManager;

    public newDateComponent (params: IDateParams): Promise<IDateComp>{
        return this.componentResolver.createAgGridComponent<IDateComp>(this.gridOptions, params, "dateComponent", "agDateInput");
    }

    public newHeaderComponent(params:IHeaderParams): Promise<IHeaderComp> {
        return this.componentResolver.createAgGridComponent<IHeaderComp>(params.column.getColDef(), params, "headerComponent", "agColumnHeader");
    }

    public newHeaderGroupComponent(params:IHeaderGroupParams): Promise<IHeaderGroupComp> {
        return this.componentResolver.createAgGridComponent(params.columnGroup.getColGroupDef(), params, "headerGroupComponent", "agColumnGroupHeader");
    }

    private newFloatingFilterComponent<M> (typeRaw:string, colDef:ColDef, params:IFloatingFilterParams<M, any>):Promise<IFloatingFilterComp<M, any, any>>{
        let type:string = typeRaw;
        //type if populated must be one of ['set','number','text','date']
        if (typeRaw.indexOf('ag') === 0) {
            let filterPos: number = typeRaw.length - "Filter".length;
            if (typeRaw.indexOf('Filter') === filterPos) {
                type = typeRaw.substr(0, filterPos)
            }
        }
        let floatingFilterName: string = type + "FloatingFilter";
        return this.componentResolver.createAgGridComponent<IFloatingFilterComp<M, any, any>>(
            colDef,
            params,
            "floatingFilterComponent",
            floatingFilterName,
            false
        );
    }

    public newFloatingFilterWrapperComponent<M, P extends IFloatingFilterParams<M, any>> (column:Column, params:IFloatingFilterParams<M, any>):Promise<IFloatingFilterWrapperComp<M, any, any, any>>{
        let colDef:ColDef = column.getColDef();

        if (colDef.suppressFilter){
            return this.newEmptyFloatingFilterWrapperComponent(column);
        }

        let floatingFilterType: string;

        if (typeof  colDef.filter === 'string' && this.isBasicFilterType (<string>colDef.filter)) {
            floatingFilterType = (<string>colDef.filter);
        } else if (!colDef.filter){
            floatingFilterType= this.gridOptionsWrapper.isEnterprise() ? 'agSetColumnFilter' : 'agTextColumnFilter';
        } else {
            floatingFilterType= 'agCustomColumn';
        }

        let floatingFilter:Promise<IFloatingFilterComp<M, any, P>> = this.newFloatingFilterComponent(floatingFilterType, colDef, params);
        let floatingFilterWrapperComponentParams : IFloatingFilterWrapperParams <M, any, any> = <any>{
            column: column,
            floatingFilterComp: floatingFilter,
            suppressFilterButton: this.componentResolver.mergeParams(colDef, 'floatingFilterComponent',params).suppressFilterButton
        };

        if (!floatingFilter){
            let filterComponent:ComponentToUse<any, any> = this.getFilterComponentPrototype(colDef);

            if (filterComponent && !filterComponent.component.prototype.getModelAsString){
                return this.newEmptyFloatingFilterWrapperComponent(column);
            }

            let rawModelFn = params.currentParentModel;
            params.currentParentModel = ():M=>{
                let parentPromise:Promise<IFilterComp> = this.filterManager.getFilterComponent(column);
                return <any>parentPromise.resolveNow(null, parent=>parent.getModelAsString ? parent.getModelAsString(rawModelFn()) : null);
            };
            floatingFilterWrapperComponentParams.floatingFilterComp = this.newFloatingFilterComponent<M>('agReadModelAsString', colDef, params);
        }


        return this.componentResolver.createAgGridComponent<IFloatingFilterWrapperComp<any, any, any, any>> (
            colDef,
            floatingFilterWrapperComponentParams,
            "floatingFilterWrapper",
            "agFloatingFilterWrapper"
        );
    }

    private isBasicFilterType (type:string):boolean {
        switch (type){
            case 'text':
            case 'agTextColumnFilter':
            case 'number':
            case 'agNumberColumnFilter':
            case 'date':
            case 'agDateColumnFilter':
            case 'set':
            case 'agSetColumnFilter':
                return true;

            default:
                return false
        }

    }

    public newFullWidthGroupRowInnerCellRenderer (params:ICellRendererParams):Promise<ICellRendererComp>{
        return this.componentResolver.createAgGridComponent<ICellRendererComp>(this.gridOptions, params, "groupRowInnerRenderer", "agGroupRowInnerCellRenderer", false);
    }

    public newCellRenderer (target: ColDef | ISetFilterParams | IRichCellEditorParams, params:ICellRendererParams):Promise<ICellRendererComp>{
        return this.componentResolver.createAgGridComponent<ICellRendererComp>(target, params, "cellRenderer", "agCellRenderer", false);
    }

    public newInnerCellRenderer (target: GroupCellRendererParams, params:ICellRendererParams):Promise<ICellRendererComp>{
        return this.componentResolver.createAgGridComponent<ICellRendererComp>(target, params, "innerRenderer", "agInnerCellRenderer");
    }

    public newFullRowGroupRenderer (params:ICellRendererParams):Promise<ICellRendererComp>{
        return this.componentResolver.createAgGridComponent<ICellRendererComp>(this.gridOptionsWrapper, params, "fullWidthCellRenderer", "agFullWidthCellRenderer");
    }

    public newOverlayWrapperComponent(): Promise<IOverlayWrapperComp> {
        return this.componentResolver.createAgGridComponent<IOverlayWrapperComp>(this.gridOptions, null, "overlayWrapperComponent", "agOverlayWrapper");
    }

    public newLoadingOverlayComponent(): Promise<ILoadingOverlayComp> {
        return this.componentResolver.createAgGridComponent<ILoadingOverlayComp>(this.gridOptions, null, "loadingOverlayComponent", "agLoadingOverlay");
    }

    public newNoRowsOverlayComponent(): Promise<INoRowsOverlayComp> {
        return this.componentResolver.createAgGridComponent<INoRowsOverlayComp>(this.gridOptions, null, "noRowsOverlayComponent", "agNoRowsOverlay");
    }

    private getFilterComponentPrototype<A extends IComponent<any> & B, B>
    (colDef: ColDef): ComponentToUse<A, B> {
        return <ComponentToUse<A, B>>this.componentResolver.getComponentToUse(colDef, "filter", "agFilter");
    }

    private newEmptyFloatingFilterWrapperComponent(column:Column): Promise<IFloatingFilterWrapperComp<any, any, any, any>> {
        let floatingFilterWrapperComponentParams : IFloatingFilterWrapperParams <any, any, any> = <any>{
            column: column,
            floatingFilterComp: null
        };
        return this.componentResolver.createAgGridComponent<IFloatingFilterWrapperComp<any, any, any, any>>(
            column.getColDef(),
            floatingFilterWrapperComponentParams,
            "floatingFilterWrapper",
            "agEmptyFloatingFilterWrapper"
        );
    }
}