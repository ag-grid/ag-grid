import {Autowired, Context} from "../context/context";
import {IMenuFactory} from "../interfaces/iMenuFactory";
import {Column} from "../entities/column";
import {_, Promise} from "../utils";
import {SetLeftFeature} from "../rendering/features/setLeftFeature";
import {IFloatingFilterParams, IFloatingFilterComp, FloatingFilterChange} from "./floatingFilter";
import {Component} from "../widgets/component";
import {RefSelector} from "../widgets/componentAnnotations";
import {IAfterGuiAttachedParams, IComponent} from "../interfaces/iComponent";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Beans} from "../rendering/beans";

export interface IFloatingFilterWrapperParams<M, F extends FloatingFilterChange, P extends IFloatingFilterParams<M, F>> {
    column:Column;
    floatingFilterComp:Promise<IFloatingFilterComp<M, F, P>>;
    suppressFilterButton: boolean;
}

export interface IFloatingFilterWrapper <M>{
    onParentModelChanged(parentModel:M):void;
}

export interface IFloatingFilterWrapperComp<M, F extends FloatingFilterChange, PC extends IFloatingFilterParams<M, F>, P extends IFloatingFilterWrapperParams<M, F, PC>> extends IFloatingFilterWrapper<M>, IComponent<P> { }

export abstract class BaseFilterWrapperComp<M, F extends FloatingFilterChange, PC extends IFloatingFilterParams<M, F>, P extends IFloatingFilterWrapperParams<M, F, PC>> extends Component implements IFloatingFilterWrapperComp<M, F, PC, P> {

    @Autowired('context') private context: Context;
    @Autowired('beans') private beans: Beans;

    column: Column;

    init (params:P):void | Promise<void>{
        this.column = params.column;


        let base:HTMLElement = _.loadTemplate(`<div class="ag-header-cell" aria-hidden="true"><div class="ag-floating-filter-body" aria-hidden="true"></div></div>`);
        this.enrichBody(base);

        this.setTemplateFromElement(base);
        this.setupWidth();

        let setLeftFeature = new SetLeftFeature(this.column, this.getGui(), this.beans);
        setLeftFeature.init();
        this.addDestroyFunc(setLeftFeature.destroy.bind(setLeftFeature));
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

    @Autowired('menuFactory')
    private menuFactory: IMenuFactory;
    @Autowired('gridOptionsWrapper')
    private gridOptionsWrapper: GridOptionsWrapper;

    floatingFilterCompPromise:Promise<IFloatingFilterComp<M, F, PC>>;
    suppressFilterButton:boolean;


    init(params: P): void{
        this.floatingFilterCompPromise = params.floatingFilterComp;
        this.suppressFilterButton = params.suppressFilterButton;
        super.init(params);

        this.addEventListeners();


    }

    private addEventListeners ():void{
        if (!this.suppressFilterButton && this.eButtonShowMainFilter){
            this.addDestroyableEventListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
        }
    }

    enrichBody(body:HTMLElement):void{
        this.floatingFilterCompPromise.then(floatingFilterComp=>{
            let floatingFilterBody:HTMLElement = <HTMLElement>body.querySelector('.ag-floating-filter-body');
            let floatingFilterCompUi = floatingFilterComp.getGui();
            if (this.suppressFilterButton){
                floatingFilterBody.appendChild(floatingFilterCompUi);
                _.removeCssClass(floatingFilterBody, 'ag-floating-filter-body');
                _.addCssClass(floatingFilterBody, 'ag-floating-filter-full-body')
            } else {
                floatingFilterBody.appendChild(floatingFilterCompUi);
                body.appendChild(_.loadTemplate(`<div class="ag-floating-filter-button" aria-hidden="true">
                        <button ref="eButtonShowMainFilter"></button>
                </div>`));

                let eIcon = _.createIconNoSpan('filter', this.gridOptionsWrapper, this.column);
                body.querySelector('button').appendChild(eIcon);
            }
            if (floatingFilterComp.afterGuiAttached){
                floatingFilterComp.afterGuiAttached();
            }

            this.wireQuerySelectors();
            this.addEventListeners();
        });
    }

    onParentModelChanged(parentModel:M):void{
        this.floatingFilterCompPromise.then(floatingFilterComp=>{
            floatingFilterComp.onParentModelChanged(parentModel);
        })
    }

    private showParentFilter(){
        this.menuFactory.showMenuAfterButtonClick(this.column, this.eButtonShowMainFilter, 'filterMenuTab', ['filterMenuTab']);
    }

}

export class EmptyFloatingFilterWrapperComp extends BaseFilterWrapperComp<any, any, any, any> {
    enrichBody(body:HTMLElement):void{

    }

    onParentModelChanged(parentModel:any):void{
    }
}
