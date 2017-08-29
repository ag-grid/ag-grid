import {Autowired, Bean} from "../../context/context";
import {IDateComp, IDateParams} from "../../rendering/dateComponent";
import {GridOptions} from "../../entities/gridOptions";
import {IAfterGuiAttachedParams, IComponent} from "../../interfaces/iComponent";
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




enum ComponentType {
    AG_GRID, FRAMEWORK
}

/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
interface ComponentToUse<A extends IComponent<any, IAfterGuiAttachedParams> & B, B> {
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



    public newDateComponent (params: IDateParams): IDateComp{
        return <IDateComp>this.componentResolver.createAgGridComponent(this.gridOptions, params, "dateComponent");
    }

    public newHeaderComponent (params:IHeaderParams): IHeaderComp{
        return <IHeaderComp>this.componentResolver.createAgGridComponent(params.column.getColDef(), params, "headerComponent");
    }

    public newHeaderGroupComponent (params:IHeaderGroupParams): IHeaderGroupComp{
        return <IHeaderGroupComp>this.componentResolver.createAgGridComponent(params.columnGroup.getColGroupDef(), params, "headerGroupComponent");
    }

    private newFloatingFilterComponent<M> (type:string, colDef:ColDef, params:IFloatingFilterParams<M, any>):IFloatingFilterComp<M, any, any>{
        //type if populated must be one of ['set','number','text','date']
        let floatingFilterName: string = type + "FloatingFilterComponent";
        return <IFloatingFilterComp<M, any, any>> this.componentResolver.createAgGridComponent(
            colDef,
            params,
            "floatingFilterComponent",
            floatingFilterName,
            false
        );
    }

    public newFloatingFilterWrapperComponent<M, P extends IFloatingFilterParams<M, any>> (column:Column, params:IFloatingFilterParams<M, any>):IFloatingFilterWrapperComp<M, any, any, any>{
        let colDef = column.getColDef();

        if (colDef.suppressFilter){
            return this.newEmptyFloatingFilterWrapperComponent(column);
        }

        let floatingFilterType: string;

        if (typeof  colDef.filter === 'string') {
            floatingFilterType = colDef.filter;
        } else if (!colDef.filter){
            floatingFilterType= this.gridOptionsWrapper.isEnterprise() ? 'set' : 'text';
        } else {
            floatingFilterType= 'custom';
        }

        let floatingFilter:IFloatingFilterComp<M, any, P> = this.newFloatingFilterComponent(floatingFilterType, colDef, params);
        let floatingFilterWrapperComponentParams : IFloatingFilterWrapperParams <M, any, any> = <any>{
            column: column,
            floatingFilterComp: floatingFilter,
            suppressFilterButton: this.componentResolver.mergeParams(colDef, 'floatingFilterComponent', params).suppressFilterButton
        };

        if (!floatingFilter){
            let filterComponent:ComponentToUse<any, any> = this.getFilterComponentPrototype(colDef);

            if (filterComponent && !filterComponent.component.prototype.getModelAsString){
                return this.newEmptyFloatingFilterWrapperComponent(column);
            }

            let rawModelFn = params.currentParentModel;
            params.currentParentModel = ():M=>{
                let parent:IFilterComp = <any>this.filterManager.getFilterComponent(column);
                return <any>parent.getModelAsString(rawModelFn());
            };
            floatingFilterWrapperComponentParams.floatingFilterComp = this.newFloatingFilterComponent('readModelAsString', colDef, params);
        }


        return <IFloatingFilterWrapperComp<any, any, any, any>> this.componentResolver.createAgGridComponent(
            colDef,
            floatingFilterWrapperComponentParams,
            "floatingFilterWrapperComponent"
        );
    }

    public newFullWidthGroupRowInnerCellRenderer (params:ICellRendererParams):ICellRendererComp{
        return <ICellRendererComp>this.componentResolver.createAgGridComponent(this.gridOptions, params, "groupRowInnerRenderer", "groupRowInnerRenderer", false);
    }

    public newCellRenderer (target: ColDef | ISetFilterParams, params:ICellRendererParams):ICellRendererComp{
        return <ICellRendererComp>this.componentResolver.createAgGridComponent(target, params, "cellRenderer", "cellRenderer", false);
    }

    public newInnerCellRenderer (target: GroupCellRendererParams, params:ICellRendererParams):ICellRendererComp{
        return <ICellRendererComp>this.componentResolver.createAgGridComponent(target, params, "innerRenderer");
    }

    public newFullRowGroupRenderer (params:ICellRendererParams):ICellRendererComp{
        return <ICellRendererComp>this.componentResolver.createAgGridComponent(this.gridOptionsWrapper, params, "fullWidthCellRenderer");
    }

    private getFilterComponentPrototype<A extends IComponent<any, IAfterGuiAttachedParams> & B, B>
    (colDef: ColDef): ComponentToUse<A, B> {
        return <ComponentToUse<A, B>>this.componentResolver.getComponentToUse(colDef, "filterComponent");
    }

    private newEmptyFloatingFilterWrapperComponent(column:Column) {
        let floatingFilterWrapperComponentParams : IFloatingFilterWrapperParams <any, any, any> = <any>{
            column: column,
            floatingFilterComp: null
        };
        return <IFloatingFilterWrapperComp<any, any, any, any>> this.componentResolver.createAgGridComponent(
            column.getColDef(),
            floatingFilterWrapperComponentParams,
            "floatingFilterWrapperComponent",
            "emptyFloatingFilterWrapperComponent"
        );
    }
}