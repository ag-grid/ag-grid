import { PostConstruct, PreDestroy } from '../../context/context';
import { Column } from '../../entities/column';
import { ColumnGroupChild } from '../../entities/columnGroupChild';
import { FloatingFilterWrapper } from '../../filter/floating/floatingFilterWrapper';
import { setAriaRowIndex } from '../../utils/aria';
import { setDomChildOrder } from '../../utils/dom';
import { getAllValuesInObject, iterateObject } from '../../utils/object';
import { Component } from '../../widgets/component';
import { HeaderGroupWrapperComp } from '../columnGroupHeader/headerGroupWrapperComp';
import { AbstractHeaderWrapper } from '../columnHeader/abstractHeaderWrapper';
import { HeaderWrapperComp } from '../columnHeader/headerWrapperComp';
import { HeaderWrapperCtrl } from '../columnHeader/headerWrapperCtrl';
import { HeaderRowCtrl, IHeaderRowComp } from './headerRowCtrl';
import { find } from '../../utils/generic';

export enum HeaderRowType {
    COLUMN_GROUP = 'group',
    COLUMN = 'column', 
    FLOATING_FILTER = 'filter'
}
export class HeaderRowComp extends Component {

    private ctrl: HeaderRowCtrl;

    private headerComps: { [key: string]: AbstractHeaderWrapper; } = {};

    constructor(ctrl: HeaderRowCtrl) {
        super(/* html */`<div class="ag-header-row" role="row"></div>`);
        this.ctrl = ctrl;

        switch (ctrl.getType()) {
            case HeaderRowType.COLUMN: this.addCssClass(`ag-header-row-column`); break;
            case HeaderRowType.COLUMN_GROUP: this.addCssClass(`ag-header-row-column-group`); break;
            case HeaderRowType.FLOATING_FILTER: this.addCssClass(`ag-header-row-floating-filter`); break;
        }
    }

    //noinspection JSUnusedLocalSymbols
    @PostConstruct
    private init(): void {

        const compProxy: IHeaderRowComp = {
            setTransform: transform => this.getGui().style.transform = transform,
            setHeight: height => this.getGui().style.height = height,
            setTop: top => this.getGui().style.top = top,
            setHeaderCtrls: ctrls => this.setHeaderCtrls(ctrls),
            setWidth: width => this.getGui().style.width = width,
            getHtmlElementForColumnHeader: col => this.getHtmlElementForColumnHeader(col),
            setRowIndex: rowIndex => setAriaRowIndex(this.getGui(), rowIndex + 1)
        };

        this.ctrl.setComp(compProxy);
    }

    public getHtmlElementForColumnHeader(column: Column): HTMLElement | undefined {
        if (this.ctrl.getType() != HeaderRowType.COLUMN) { return; }

        const headerCompsList = Object.keys(this.headerComps).map( c => this.headerComps[c]) as (HeaderWrapperComp[]);
        const comp = find(headerCompsList, wrapper => wrapper.getColumn() == column);
        return comp ? comp.getGui() : undefined;
    }

    @PreDestroy
    private destroyHeaderCtrls(): void {
        this.setHeaderCtrls([]);
    }

    private setHeaderCtrls(ctrls: HeaderWrapperCtrl[]): void {
        if (!this.isAlive()) { return; }

        const oldComps = this.headerComps;
        this.headerComps = {};

        ctrls.forEach(ctrl => {
            const id = ctrl.getInstanceId();
            let comp = oldComps[id];
            delete oldComps[id];

            if (comp==null) {
                comp = this.createHeaderComp(ctrl);
                this.getGui().appendChild(comp.getGui());
            }

            this.headerComps[id] = comp;
        });

        iterateObject(oldComps, (id: string, comp: AbstractHeaderWrapper)=> {
            this.getGui().removeChild(comp.getGui());
            this.destroyBean(comp);
        });

        const ensureDomOrder = this.gridOptionsWrapper.isEnsureDomOrder();
        if (ensureDomOrder) {
            const comps = getAllValuesInObject(this.headerComps);
            // ordering the columns by left position orders them in the order they appear on the screen
            comps.sort( (a: AbstractHeaderWrapper, b: AbstractHeaderWrapper) => {
                const leftA = a.getColumn().getLeft()!;
                const leftB = b.getColumn().getLeft()!;
                return leftA - leftB;
            });
            const elementsInOrder = comps.map( c => c.getGui() );
            setDomChildOrder(this.getGui(), elementsInOrder);
        }
    }

    private createHeaderComp(headerCtrl: HeaderWrapperCtrl): AbstractHeaderWrapper {

        let result: AbstractHeaderWrapper;

        switch (this.ctrl.getType()) {
            case HeaderRowType.COLUMN_GROUP:
                result = new HeaderGroupWrapperComp(headerCtrl);
                break;
            case HeaderRowType.FLOATING_FILTER:
                result = new FloatingFilterWrapper(headerCtrl);
                break;
            default:
                result = new HeaderWrapperComp(headerCtrl);
                break;
        }

        this.createBean(result);
        result.setParentComponent(this);

        return result;
    }

    public getHeaderCompForColumn(column: ColumnGroupChild): AbstractHeaderWrapper {
        const headerCompsList = getAllValuesInObject(this.headerComps);
        return find(headerCompsList, comp => comp.getColumn() == column );
    }
}
