import { UserCompDetails } from "../../../components/framework/userComponentFactory";
import { PostConstruct, PreDestroy } from "../../../context/context";
import { Column } from "../../../entities/column";
import { removeAriaSort, setAriaDescription, setAriaSort } from "../../../utils/aria";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { AbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellComp";
import { HeaderCellCtrl, IHeaderCellComp } from "./headerCellCtrl";
import { IHeaderComp } from "./headerComp";

export class HeaderCellComp extends AbstractHeaderCellComp<HeaderCellCtrl> {

    private static TEMPLATE = /* html */
        `<div class="ag-header-cell" role="columnheader" tabindex="-1">
            <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>
            <div ref="eHeaderCompWrapper" class="ag-header-cell-comp-wrapper" role="presentation"></div>
        </div>`;

    @RefSelector('eResize') private eResize: HTMLElement;
    @RefSelector('eHeaderCompWrapper') private eHeaderCompWrapper: HTMLElement;

    protected readonly column: Column;
    protected readonly pinned: string | null;

    private headerComp: IHeaderComp | undefined;
    private headerCompGui: HTMLElement | undefined;
    private headerCompVersion = 0;

    constructor(ctrl: HeaderCellCtrl) {
        super(HeaderCellComp.TEMPLATE, ctrl);
        this.column = ctrl.getColumnGroupChild() as Column;
        this.pinned = ctrl.getPinned();
    }

    @PostConstruct
    private postConstruct(): void {

        const eGui = this.getGui();

        const setAttribute = (name: string, value: string | null | undefined, element?: HTMLElement) => {
            const actualElement = element ? element : eGui;
            if (value != null && value != '') {
                actualElement.setAttribute(name, value);
            } else {
                actualElement.removeAttribute(name);
            }
        };

        const compProxy: IHeaderCellComp = {
            setWidth: width => eGui.style.width = width,
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setColId: id => setAttribute('col-id', id),
            setTitle: title => setAttribute('title', title),
            setAriaDescription: label => setAriaDescription(eGui, label),
            setAriaSort: sort => sort ? setAriaSort(eGui, sort) : removeAriaSort(eGui),
            setUserCompDetails: compDetails => this.setUserCompDetails(compDetails),
            getUserCompInstance: () => this.headerComp
        };

        this.ctrl.setComp(compProxy, this.getGui(), this.eResize, this.eHeaderCompWrapper);

        const selectAllGui = this.ctrl.getSelectAllGui();
        this.eResize.insertAdjacentElement('afterend', selectAllGui);
    }

    @PreDestroy
    private destroyHeaderComp(): void {
        if (this.headerComp) {
            this.eHeaderCompWrapper.removeChild(this.headerCompGui!);
            this.headerComp = this.destroyBean(this.headerComp);
            this.headerCompGui = undefined;
        }
    }

    private setUserCompDetails(compDetails: UserCompDetails): void {
        this.headerCompVersion++;

        const versionCopy = this.headerCompVersion;

        compDetails.newAgStackInstance()!.then(comp => this.afterCompCreated(versionCopy, comp));
    }

    private afterCompCreated(version: number, headerComp: IHeaderComp): void {

        if (version != this.headerCompVersion || !this.isAlive()) {
            this.destroyBean(headerComp);
            return;
        }

        this.destroyHeaderComp();

        this.headerComp = headerComp;
        this.headerCompGui = headerComp.getGui();
        this.eHeaderCompWrapper.appendChild(this.headerCompGui);
        this.ctrl.setDragSource(this.headerCompGui!);
    }
}
