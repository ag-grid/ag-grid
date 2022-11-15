import { PostConstruct, PreDestroy } from '../../context/context';
import { Constants } from '../../constants/constants';
import { setAriaRowIndex } from '../../utils/aria';
import { setDomChildOrder } from '../../utils/dom';
import { getAllValuesInObject, iterateObject } from '../../utils/object';
import { Component } from '../../widgets/component';
import { AbstractHeaderCellComp } from '../cells/abstractCell/abstractHeaderCellComp';
import { AbstractHeaderCellCtrl } from '../cells/abstractCell/abstractHeaderCellCtrl';
import { HeaderCellComp } from '../cells/column/headerCellComp';
import { HeaderCellCtrl } from '../cells/column/headerCellCtrl';
import { HeaderGroupCellComp } from '../cells/columnGroup/headerGroupCellComp';
import { HeaderGroupCellCtrl } from '../cells/columnGroup/headerGroupCellCtrl';
import { HeaderFilterCellComp } from '../cells/floatingFilter/headerFilterCellComp';
import { HeaderFilterCellCtrl } from '../cells/floatingFilter/headerFilterCellCtrl';
import { HeaderRowCtrl, IHeaderRowComp } from './headerRowCtrl';

export enum HeaderRowType {
    COLUMN_GROUP = 'group',
    COLUMN = 'column',
    FLOATING_FILTER = 'filter'
}

export class HeaderRowComp extends Component {

    private ctrl: HeaderRowCtrl;

    private headerComps: { [key: string]: AbstractHeaderCellComp<AbstractHeaderCellCtrl>; } = {};

    constructor(ctrl: HeaderRowCtrl) {
        super();

        const extraClass = ctrl.getType() == HeaderRowType.COLUMN_GROUP ? `ag-header-row-column-group` :
                            ctrl.getType() == HeaderRowType.FLOATING_FILTER ? `ag-header-row-column-filter` : `ag-header-row-column`;

        this.setTemplate(/* html */`<div class="ag-header-row ${extraClass}" role="row"></div>`);

        this.ctrl = ctrl;
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
            setAriaRowIndex: rowIndex => setAriaRowIndex(this.getGui(), rowIndex)
        };

        this.ctrl.setComp(compProxy);
    }

    @PreDestroy
    private destroyHeaderCtrls(): void {
        this.setHeaderCtrls([]);
    }

    private setHeaderCtrls(ctrls: AbstractHeaderCellCtrl[]): void {
        if (!this.isAlive()) { return; }

        const oldComps = this.headerComps;
        this.headerComps = {};

        ctrls.forEach(ctrl => {
            const id = ctrl.getInstanceId();
            let comp = oldComps[id];
            delete oldComps[id];

            if (comp == null) {
                comp = this.createHeaderComp(ctrl);
                this.getGui().appendChild(comp.getGui());
            }

            this.headerComps[id] = comp;
        });

        iterateObject(oldComps, (id: string, comp: AbstractHeaderCellComp<AbstractHeaderCellCtrl>) => {
            this.getGui().removeChild(comp.getGui());
            this.destroyBean(comp);
        });

        const isEnsureDomOrder = this.gridOptionsWrapper.isEnsureDomOrder();
        const isPrintLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;

        if (isEnsureDomOrder || isPrintLayout) {
            const comps = getAllValuesInObject(this.headerComps);
            // ordering the columns by left position orders them in the order they appear on the screen
            comps.sort((a: AbstractHeaderCellComp<AbstractHeaderCellCtrl>, b: AbstractHeaderCellComp<AbstractHeaderCellCtrl>) => {
                const leftA = a.getCtrl().getColumnGroupChild().getLeft()!;
                const leftB = b.getCtrl().getColumnGroupChild().getLeft()!;
                return leftA - leftB;
            });
            const elementsInOrder = comps.map(c => c.getGui());
            setDomChildOrder(this.getGui(), elementsInOrder);
        }
    }

    private createHeaderComp(headerCtrl: AbstractHeaderCellCtrl): AbstractHeaderCellComp<AbstractHeaderCellCtrl> {

        let result: AbstractHeaderCellComp<AbstractHeaderCellCtrl>;

        switch (this.ctrl.getType()) {
            case HeaderRowType.COLUMN_GROUP:
                result = new HeaderGroupCellComp(headerCtrl as HeaderGroupCellCtrl);
                break;
            case HeaderRowType.FLOATING_FILTER:
                result = new HeaderFilterCellComp(headerCtrl as HeaderFilterCellCtrl);
                break;
            default:
                result = new HeaderCellComp(headerCtrl as HeaderCellCtrl);
                break;
        }

        this.createBean(result);
        result.setParentComponent(this);

        return result;
    }
}
