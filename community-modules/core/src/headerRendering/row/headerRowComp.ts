import { PostConstruct, PreDestroy } from '../../context/context';
import { setAriaRowIndex } from '../../utils/aria';
import { setDomChildOrder } from '../../utils/dom';
import { getAllValuesInObject, iterateObject } from '../../utils/object';
import { Component } from '../../widgets/component';
import { AbstractHeaderCellComp } from '../cells/abstractCell/abstractHeaderCellComp';
import { AbstractHeaderCellCtrl, HeaderCellCtrlInstanceId } from '../cells/abstractCell/abstractHeaderCellCtrl';
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

    private headerComps: { [key: HeaderCellCtrlInstanceId]: AbstractHeaderCellComp<AbstractHeaderCellCtrl>; } = {};

    constructor(ctrl: HeaderRowCtrl) {
        super();

        this.ctrl = ctrl;
        this.setTemplate(/* html */`<div class="${this.ctrl.getHeaderRowClass()}" role="row"></div>`);
    }

    //noinspection JSUnusedLocalSymbols
    @PostConstruct
    private init(): void {
        setAriaRowIndex(this.getGui(), this.ctrl.getAriaRowIndex());

        const compProxy: IHeaderRowComp = {
            setHeight: height => this.getGui().style.height = height,
            setTop: top => this.getGui().style.top = top,
            setHeaderCtrls: (ctrls, forceOrder) => this.setHeaderCtrls(ctrls, forceOrder),
            setWidth: width => this.getGui().style.width = width,
        };

        this.ctrl.setComp(compProxy);
    }

    @PreDestroy
    private destroyHeaderCtrls(): void {
        this.setHeaderCtrls([], false);
    }

    private setHeaderCtrls(ctrls: AbstractHeaderCellCtrl[], forceOrder: boolean): void {
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

        if (forceOrder) {
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
