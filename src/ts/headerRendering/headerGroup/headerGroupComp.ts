import {Component} from "../../widgets/component";
import {IComponent} from "../../interfaces/iComponent";
import {Utils as _} from "../../utils";
import {ColumnGroup} from "../../entities/columnGroup";
import {ColumnApi} from "../../columnController/columnApi";
import {ColumnController} from "../../columnController/columnController";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {Autowired} from "../../context/context";
import {TouchListener} from "../../widgets/touchListener";
import {RefSelector} from "../../widgets/componentAnnotations";
import {OriginalColumnGroup} from "../../entities/originalColumnGroup";
import {GridApi} from "../../gridApi";

export interface IHeaderGroupParams {
    columnGroup: ColumnGroup;
    displayName: string;
    setExpanded: (expanded:boolean)=>void;
    api: GridApi,
    columnApi: ColumnApi,
    context: any
}

export interface IHeaderGroup {

}

export interface IHeaderGroupComp extends IHeaderGroup, IComponent<IHeaderGroupParams> {

}

export class HeaderGroupComp extends Component implements IHeaderGroupComp {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    static TEMPLATE =
        `<div class="ag-header-group-cell-label" ref="agContainer">` +
          `<span ref="agLabel" class="ag-header-group-text"></span>` +
          `<span ref="agOpened" class="ag-header-icon ag-header-expand-icon ag-header-expand-icon-expanded"></span>` +
          `<span ref="agClosed" class="ag-header-icon ag-header-expand-icon ag-header-expand-icon-collapsed"></span>` +
        `</div>`;

    private params: IHeaderGroupParams;

    @RefSelector('agOpened') private eOpenIcon: HTMLElement;
    @RefSelector('agClosed') private eCloseIcon: HTMLElement;

    constructor() {
        super(HeaderGroupComp.TEMPLATE);
    }

    public init(params: IHeaderGroupParams) {
        this.params = params;

        this.setupLabel();
        this.addGroupExpandIcon();
        this.setupExpandIcons();
    }

    private setupExpandIcons(): void {

        this.addInIcon('columnGroupOpened', 'agOpened');
        this.addInIcon('columnGroupClosed', 'agClosed');

        let expandAction = ()=> {
            let newExpandedValue = !this.params.columnGroup.isExpanded();
            this.columnController.setColumnGroupOpened(this.params.columnGroup.getOriginalColumnGroup(), newExpandedValue, "uiColumnExpanded");
        };
        this.addTouchAndClickListeners(this.eCloseIcon, expandAction);
        this.addTouchAndClickListeners(this.eOpenIcon, expandAction);

        this.addDestroyableEventListener(this.getGui(), 'dblclick', expandAction);

        this.updateIconVisibility();

        let originalColumnGroup = this.params.columnGroup.getOriginalColumnGroup();
        this.addDestroyableEventListener(originalColumnGroup, OriginalColumnGroup.EVENT_EXPANDED_CHANGED, this.updateIconVisibility.bind(this));
        this.addDestroyableEventListener(originalColumnGroup, OriginalColumnGroup.EVENT_EXPANDABLE_CHANGED, this.updateIconVisibility.bind(this));
    }

    private addTouchAndClickListeners(eElement: HTMLElement, action: ()=>void): void {

        let touchListener = new TouchListener(this.eCloseIcon);

        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, action);
        this.addDestroyFunc( ()=> touchListener.destroy() );
        this.addDestroyableEventListener(eElement, 'click', action);
    }

    private updateIconVisibility(): void {
        let columnGroup = this.params.columnGroup;
        if (columnGroup.isExpandable()) {
            let expanded = this.params.columnGroup.isExpanded();
            _.setVisible(this.eOpenIcon, !expanded);
            _.setVisible(this.eCloseIcon, expanded);
        } else {
            _.setVisible(this.eOpenIcon, false);
            _.setVisible(this.eCloseIcon, false);
        }
    }

    private addInIcon(iconName: string, refName: string): void {
        let eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, null);
        this.getRefElement(refName).appendChild(eIcon);
    }

    private addGroupExpandIcon() {
        if (!this.params.columnGroup.isExpandable()) {
            _.setVisible(this.eOpenIcon, false);
            _.setVisible(this.eCloseIcon, false);
            return;
        }
    }

    private setupLabel(): void {
        // no renderer, default text render
        if (this.params.displayName && this.params.displayName !== '') {

            if (_.isBrowserSafari()) {
                this.getGui().style.display = 'table-cell';
            }

            let eInnerText = this.getRefElement('agLabel');
            eInnerText.innerHTML = this.params.displayName;
        }
    }
}
