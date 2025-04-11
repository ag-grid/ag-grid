import type { HeaderStyle } from '../../../entities/colDef';
import type { UserCompDetails } from '../../../interfaces/iUserCompDetails';
import type { ElementParams } from '../../../utils/dom';
import { _addStylesToElement, _setDisplayed } from '../../../utils/dom';
import { RefPlaceholder } from '../../../widgets/component';
import { AbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellComp';
import type { HeaderGroupCellCtrl, IHeaderGroupCellComp } from './headerGroupCellCtrl';
import type { IHeaderGroupComp } from './headerGroupComp';

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
    private eResize: HTMLElement = RefPlaceholder;
    private readonly eHeaderCompWrapper: HTMLElement = RefPlaceholder;

    private headerGroupComp: IHeaderGroupComp | undefined;

    constructor(ctrl: HeaderGroupCellCtrl) {
        super(HeaderGroupCellCompElement, ctrl);
    }

    public postConstruct(): void {
        const eGui = this.getGui();

        const setAttribute = (key: string, value: string | undefined) =>
            value != undefined ? eGui.setAttribute(key, value) : eGui.removeAttribute(key);

        eGui.setAttribute('col-id', this.ctrl.column.getUniqueId());

        const compProxy: IHeaderGroupCellComp = {
            toggleCss: (cssClassName, on) => this.toggleCss(cssClassName, on),
            setUserStyles: (styles: HeaderStyle) => _addStylesToElement(eGui, styles),
            setHeaderWrapperHidden: (hidden) => {
                if (hidden) {
                    this.eHeaderCompWrapper.style.setProperty('display', 'none');
                } else {
                    this.eHeaderCompWrapper.style.removeProperty('display');
                }
            },
            setHeaderWrapperMaxHeight: (value) => {
                if (value != null) {
                    this.eHeaderCompWrapper.style.setProperty('max-height', `${value}px`);
                } else {
                    this.eHeaderCompWrapper.style.removeProperty('max-height');
                }
                this.eHeaderCompWrapper.classList.toggle('ag-header-cell-comp-wrapper-limited-height', value != null);
            },
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

    private addOrRemoveHeaderWrapperStyle(style: string, value: string | null): void {
        const { eHeaderCompWrapper } = this;

        if (value) {
            eHeaderCompWrapper.style.setProperty(style, value);
        } else {
            eHeaderCompWrapper.style.removeProperty(style);
        }
    }
}
