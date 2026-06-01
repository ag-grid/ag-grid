import { RefPlaceholder, _addStylesToElement, _setDisplayed } from 'ag-stack';

import type { HeaderStyle } from '../../../entities/colDef';
import type { UserCompDetails } from '../../../interfaces/iUserCompDetails';
import type { ElementParams } from '../../../utils/element';
import { AbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellComp';
import type { IHeaderGroupComp } from './agColumnGroupHeader';
import type { HeaderGroupCellCtrl, IHeaderGroupCellComp } from './headerGroupCellCtrl';
import { applyHeaderWrapperHidden, applyHeaderWrapperMaxHeight } from './headerGroupCellCtrl';

const HeaderGroupCellCompElement: ElementParams = {
    tag: 'div',
    cls: 'ag-header-group-cell',
    role: 'columnheader',
    children: [
        { tag: 'div', ref: 'eHeaderCompWrapper', cls: 'ag-header-cell-comp-wrapper', role: 'presentation' },
        { tag: 'div', ref: 'eResize', cls: 'ag-header-cell-resize', role: 'presentation' },
    ],
};

export class HeaderGroupCellComp extends AbstractHeaderCellComp<HeaderGroupCellCtrl> {
    private readonly eResize: HTMLElement = RefPlaceholder;
    private readonly eHeaderCompWrapper: HTMLElement = RefPlaceholder;

    private headerGroupComp: IHeaderGroupComp | undefined;

    constructor(ctrl: HeaderGroupCellCtrl) {
        super(HeaderGroupCellCompElement, ctrl);
    }

    public postConstruct(): void {
        const eGui = this.getGui();

        const setAttribute = (key: string, value: string | undefined) =>
            value != undefined ? eGui.setAttribute(key, value) : eGui.removeAttribute(key);

        const compProxy: IHeaderGroupCellComp = {
            toggleCss: (cssClassName, on) => this.toggleCss(cssClassName, on),
            setUserStyles: (styles: HeaderStyle) => _addStylesToElement(eGui, styles),
            setHeaderWrapperHidden: (hidden) => applyHeaderWrapperHidden(this.eHeaderCompWrapper, hidden),
            setHeaderWrapperMaxHeight: (value) => applyHeaderWrapperMaxHeight(this.eHeaderCompWrapper, value),
            setResizableDisplayed: (displayed) => _setDisplayed(this.eResize, displayed),
            setWidth: (width) => (eGui.style.width = width),
            setAriaExpanded: (expanded: 'true' | 'false' | undefined) => setAttribute('aria-expanded', expanded),
            setUserCompDetails: (details) => this.setUserCompDetails(details),
            getUserCompInstance: () => this.headerGroupComp,
        };

        this.ctrl.setComp(compProxy, eGui, this.eResize, this.eHeaderCompWrapper, undefined);
    }

    private setUserCompDetails(details: UserCompDetails): void {
        details.newAgStackInstance().then((comp) => this.afterHeaderCompCreated(comp));
    }

    private afterHeaderCompCreated(headerGroupComp: IHeaderGroupComp): void {
        const destroyFunc = () => this.destroyBean(headerGroupComp);

        if (!this.isAlive()) {
            destroyFunc();
            return;
        }

        const eGui = this.getGui();
        const eHeaderGroupGui = headerGroupComp.getGui();

        this.eHeaderCompWrapper.appendChild(eHeaderGroupGui);
        this.addDestroyFunc(destroyFunc);

        this.headerGroupComp = headerGroupComp;
        this.ctrl.setDragSource(eGui);
    }
}
