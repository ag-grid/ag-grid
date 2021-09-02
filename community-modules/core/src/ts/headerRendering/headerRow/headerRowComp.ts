import { ColumnModel } from '../../columns/columnModel';
import { Autowired, PostConstruct, PreDestroy } from '../../context/context';
import { Column } from '../../entities/column';
import { ColumnGroupChild } from '../../entities/columnGroupChild';
import { FloatingFilterWrapper } from '../../filter/floating/floatingFilterWrapper';
import { FocusService } from '../../focusService';
import { setAriaRowIndex } from '../../utils/aria';
import { setDomChildOrder } from '../../utils/dom';
import { getAllValuesInObject, iterateObject } from '../../utils/object';
import { Component } from '../../widgets/component';
import { HeaderGroupWrapperComp } from '../columnGroupHeader/headerGroupWrapperComp';
import { AbstractHeaderWrapper } from '../columnHeader/abstractHeaderWrapper';
import { HeaderCtrl } from '../columnHeader/headerCtrl';
import { HeaderWrapperComp } from '../columnHeader/headerWrapperComp';
import { HeaderRowCtrl, IHeaderRowComp } from './headerRowCtrl';

export enum HeaderRowType {
    COLUMN_GROUP, COLUMN, FLOATING_FILTER
}
export class HeaderRowComp extends Component {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('focusService') private focusService: FocusService;

    private readonly pinned: string | null;

    private readonly type: HeaderRowType;
    private rowIndex: number;

    private headerComps: { [key: string]: AbstractHeaderWrapper; } = {};

    constructor(headerRowIndex: number, type: HeaderRowType, pinned: string | null) {
        super(/* html */`<div class="ag-header-row" role="row"></div>`);
        this.setRowIndex(headerRowIndex);
        this.type = type;
        this.pinned = pinned;

        switch (type) {
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
            setWidth: width => this.getGui().style.width = width
        };

        const ctrl = this.createManagedBean(new HeaderRowCtrl());
        ctrl.setComp(compProxy, this.rowIndex, this.pinned, this.type);
    }

    public getHeaderWrapperComp(column: Column): HeaderWrapperComp | undefined {
        if (this.type != HeaderRowType.COLUMN) { return; }

        const headerCompsList = Object.keys(this.headerComps).map( c => this.headerComps[c]) as (HeaderWrapperComp[]);
        const res = headerCompsList.find( wrapper => wrapper.getColumn() == column);

        return res;
    }

    private setRowIndex(rowIndex: number) {
        this.rowIndex = rowIndex;
        setAriaRowIndex(this.getGui(), rowIndex + 1);
    }

    public getRowIndex(): number {
        return this.rowIndex;
    }

    public getType(): HeaderRowType {
        return this.type;
    }

    @PreDestroy
    private destroyHeaderCtrls(): void {
        this.setHeaderCtrls([]);
    }

    private setHeaderCtrls(ctrls: HeaderCtrl[]): void {
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

    private createHeaderComp(headerCtrl: HeaderCtrl): AbstractHeaderWrapper {

        let result: AbstractHeaderWrapper;

        switch (this.type) {
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
        return headerCompsList.find( comp => comp.getColumn() == column );
    }
}
