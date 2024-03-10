import { UserCompDetails } from "../../../components/framework/userComponentFactory";
import { PostConstruct } from "../../../context/context";
import { setDisplayed } from "../../../utils/dom";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { AbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellComp";
import { HeaderGroupCellCtrl, IHeaderGroupCellComp } from "./headerGroupCellCtrl";
import { IHeaderGroupComp } from "./headerGroupComp";

export class HeaderGroupCellComp extends AbstractHeaderCellComp<HeaderGroupCellCtrl> {

    private static TEMPLATE = /* html */
        `<div class="ag-header-group-cell" role="columnheader">
            <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>
        </div>`;

    @RefSelector('eResize') private eResize: HTMLElement;

    private headerGroupComp: IHeaderGroupComp | undefined;

    constructor(ctrl: HeaderGroupCellCtrl) {
        super(HeaderGroupCellComp.TEMPLATE, ctrl);
    }

    @PostConstruct
    private postConstruct(): void {
        const eGui = this.getGui();

        const setAttribute = (key: string, value: string | undefined) =>
                value != undefined ? eGui.setAttribute(key, value) : eGui.removeAttribute(key);

        eGui.setAttribute("col-id", this.ctrl.getColId());

        const compProxy: IHeaderGroupCellComp = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setResizableDisplayed: (displayed) => setDisplayed(this.eResize, displayed),
            setWidth: width => eGui.style.width = width,
            setAriaExpanded: expanded => setAttribute('aria-expanded', expanded),
            setUserCompDetails: details => this.setUserCompDetails(details),
            getUserCompInstance: () => this.headerGroupComp,
        };

        this.ctrl.setComp(compProxy, eGui, this.eResize);
    }

    private setUserCompDetails(details: UserCompDetails): void {
        details.newAgStackInstance()!.then(comp => this.afterHeaderCompCreated(comp));
    }

    private afterHeaderCompCreated(headerGroupComp: IHeaderGroupComp): void {
        const destroyFunc = () => this.destroyBean(headerGroupComp);

        if (!this.isAlive()) {
            destroyFunc();
            return;
        }

        const eGui = this.getGui();
        const eHeaderGroupGui = headerGroupComp.getGui();

        eGui.appendChild(eHeaderGroupGui);
        this.addDestroyFunc(destroyFunc);

        this.headerGroupComp = headerGroupComp;
        this.ctrl.setDragSource(eGui);
    }

}
