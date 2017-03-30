
import {Component} from "../../widgets/component";
import {IComponent} from "../../interfaces/iComponent";
import {SvgFactory} from "../../svgFactory";
import {Utils as _} from "../../utils";
import {ColumnGroup} from "../../entities/columnGroup";
import {ColumnApi, ColumnController} from "../../columnController/columnController";
import {FilterManager} from "../../filter/filterManager";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {Autowired, PostConstruct} from "../../context/context";
import {DropTarget, DragAndDropService} from "../../dragAndDrop/dragAndDropService";
import {TouchListener} from "../../widgets/touchListener";
import {RefSelector, Listener} from "../../widgets/componentAnnotations";
import {OriginalColumnGroup} from "../../entities/originalColumnGroup";
import {GridApi} from "../../gridApi";

var svgFactory = SvgFactory.getInstance();

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
        `<div class="ag-header-group-cell-label">` +
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

        if (this.params.columnGroup.isExpandable()) {
            this.setupExpandIcons();
        } else {
            this.removeExpandIcons();
        }
    }

    private setupExpandIcons(): void {

        this.addInIcon('columnGroupOpened', 'agOpened', svgFactory.createGroupExpandedIcon);
        this.addInIcon('columnGroupClosed', 'agClosed', svgFactory.createGroupContractedIcon);

        this.addTouchAndClickListeners(this.eCloseIcon);
        this.addTouchAndClickListeners(this.eOpenIcon);

        this.updateIconVisibilty();

        this.addDestroyableEventListener(this.params.columnGroup.getOriginalColumnGroup(), OriginalColumnGroup.EVENT_EXPANDED_CHANGED, this.updateIconVisibilty.bind(this));
    }

    private addTouchAndClickListeners(eElement: HTMLElement): void {
        var expandAction = ()=> {
            var newExpandedValue = !this.params.columnGroup.isExpanded();
            this.columnController.setColumnGroupOpened(this.params.columnGroup, newExpandedValue);
        };

        let touchListener = new TouchListener(this.eCloseIcon);

        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, expandAction);
        this.addDestroyFunc( ()=> touchListener.destroy() );
        this.addDestroyableEventListener(eElement, 'click', expandAction);
    }

    private updateIconVisibilty(): void {
        let expanded = this.params.columnGroup.isExpanded();
        _.setVisible(this.eOpenIcon, !expanded);
        _.setVisible(this.eCloseIcon, expanded);
    }

    private removeExpandIcons(): void {
        _.setVisible(this.eOpenIcon, false);
        _.setVisible(this.eCloseIcon, false);
    }

    private addInIcon(iconName: string, refName: string, defaultIconFactory: () => HTMLElement): void {
        var eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, null, defaultIconFactory);
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

            var eInnerText = this.getRefElement('agLabel');
            eInnerText.innerHTML = this.params.displayName;
        }
    }
}
