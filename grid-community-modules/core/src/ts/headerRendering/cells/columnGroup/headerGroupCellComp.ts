import { UserCompDetails, UserComponentFactory } from "../../../components/framework/userComponentFactory";
import { Autowired, PostConstruct } from "../../../context/context";
import { setDisplayed } from "../../../utils/dom";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { AbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellComp";
import { HeaderGroupCellCtrl, IHeaderGroupCellComp } from "./headerGroupCellCtrl";
import { IHeaderGroupComp } from "./headerGroupComp";

export class HeaderGroupCellComp extends AbstractHeaderCellComp<HeaderGroupCellCtrl> {

    private static TEMPLATE = /* html */
        `<div class="ag-header-group-cell" role="columnheader" tabindex="-1">
            <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>
        </div>`;

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    @RefSelector('eResize') private eResize: HTMLElement;

    constructor(ctrl: HeaderGroupCellCtrl) {
        super(HeaderGroupCellComp.TEMPLATE, ctrl);
    }

    @PostConstruct
    private postConstruct(): void {

        const eGui = this.getGui();

        const setAttribute = (key: string, value: string | undefined) =>
                value != undefined ? eGui.setAttribute(key, value) : eGui.removeAttribute(key);

        const compProxy: IHeaderGroupCellComp = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setResizableDisplayed: (displayed) => setDisplayed(this.eResize, displayed),
            setWidth: width => eGui.style.width = width,
            setColId: id => eGui.setAttribute("col-id", id),
            setAriaExpanded: expanded => setAttribute('aria-expanded', expanded),
            setTitle: title => setAttribute("title", title),
            setUserCompDetails: details => this.setUserCompDetails(details)
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

        this.getGui().appendChild(headerGroupComp.getGui());
        this.addDestroyFunc(destroyFunc);

        this.ctrl.setDragSource(headerGroupComp.getGui());
    }

}
