import {Autowired, Context} from "../context/context";
import {IMenuFactory} from "../interfaces/iMenuFactory";
import {Column} from "../entities/column";
import {_} from "../utils";
import {SetLeftFeature} from "../rendering/features/setLeftFeature";
import {IFloatingFilterParams, IFloatingFilterComp, FloatingFilterChange} from "./floatingFilter";
import {Component} from "../widgets/component";
import {RefSelector} from "../widgets/componentAnnotations";
import {IComponent} from "../interfaces/iComponent";

export interface IFloatingFilterWrapperParams<M, F extends FloatingFilterChange, P extends IFloatingFilterParams<M, F>> {
    column:Column;
    floatingFilterComp:IFloatingFilterComp<M, F, P>;
    suppressFilterButton: boolean;
}

export interface IFloatingFilterWrapper <M>{
    onParentModelChanged(parentModel:M):void;
}

export interface IFloatingFilterWrapperComp<M, F extends FloatingFilterChange, PC extends IFloatingFilterParams<M, F>, P extends IFloatingFilterWrapperParams<M, F, PC>> extends IFloatingFilterWrapper<M>, IComponent<P> { }


export abstract class BaseFilterWrapperComp<M, F extends FloatingFilterChange, PC extends IFloatingFilterParams<M, F>, P extends IFloatingFilterWrapperParams<M, F, PC>> extends Component implements IFloatingFilterWrapperComp<M, F, PC, P> {
    @Autowired('context') private context: Context;

    column: Column;

    init (params:P):void{
        this.column = params.column;


        let base:HTMLElement = _.loadTemplate(`<div class="ag-header-cell"><div class="ag-floating-filter-body"></div></div>`);
        this.enrichBody(base);

        this.setTemplateFromElement(base);
        this.setupWidth();
        this.addFeature(this.context, new SetLeftFeature(this.column, this.getGui()));

    }

    abstract onParentModelChanged(parentModel:M):void;
    abstract enrichBody(body:HTMLElement):void;


    private setupWidth(): void {
        this.addDestroyableEventListener(this.column, Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    }

    private onColumnWidthChanged(): void {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    }
}


export class FloatingFilterWrapperComp<M, F extends FloatingFilterChange, PC extends IFloatingFilterParams<M, F>, P extends IFloatingFilterWrapperParams<M, F, PC>> extends BaseFilterWrapperComp<M, F, PC, P> {
    @RefSelector('eButtonShowMainFilter')
    eButtonShowMainFilter: HTMLInputElement;

    @Autowired('menuFactory') private menuFactory: IMenuFactory;

    floatingFilterComp:IFloatingFilterComp<M, F, PC>;
    suppressFilterButton:boolean;


    init (params:P):void{
        this.floatingFilterComp = params.floatingFilterComp;
        this.suppressFilterButton = params.suppressFilterButton;
        super.init(params);
        if (!this.suppressFilterButton){
            this.addDestroyableEventListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
        }
    }

    enrichBody(body:HTMLElement):void{
        let floatingFilterBody:HTMLElement = <HTMLElement>body.querySelector('.ag-floating-filter-body');
        if (this.suppressFilterButton){
            floatingFilterBody.appendChild(this.floatingFilterComp.getGui());
            _.removeCssClass(floatingFilterBody, 'ag-floating-filter-body');
            _.addCssClass(floatingFilterBody, 'ag-floating-filter-full-body')
        } else {
            floatingFilterBody.appendChild(this.floatingFilterComp.getGui());
            body.appendChild(_.loadTemplate(`<div class="ag-floating-filter-button">
                    <button ref="eButtonShowMainFilter">...</button>            
            </div>`));
        }

    }

    onParentModelChanged(parentModel:M):void{
        this.floatingFilterComp.onParentModelChanged(parentModel);
    }

    private showParentFilter(){
        this.menuFactory.showMenuAfterButtonClick(this.column, this.eButtonShowMainFilter, 'filter');
    }

}

export class EmptyFloatingFilterWrapperComp extends BaseFilterWrapperComp<any, any, any, any> {
    enrichBody(body:HTMLElement):void{

    }

    onParentModelChanged(parentModel:any):void{
    }
}