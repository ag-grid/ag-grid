
import {Component} from "../widgets/component";
import {IComponent} from "../interfaces/iComponent";
import {SvgFactory} from "../svgFactory";
import {Utils as _} from "../utils";
import {ColumnGroup} from "../entities/columnGroup";
import {ColumnController} from "../columnController/columnController";
import {FilterManager} from "../filter/filterManager";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Autowired, PostConstruct} from "../context/context";
import {DropTarget, DragAndDropService} from "../dragAndDrop/dragAndDropService";
import {TouchListener} from "../widgets/touchListener";

var svgFactory = SvgFactory.getInstance();

export interface IHeaderGroupCompParams {
    columnGroup: ColumnGroup;
    displayName: string;
}

export interface IHeaderGroup {

}

export interface IHeaderGroupComp extends IHeaderGroup, IComponent<IHeaderGroupCompParams> {

}

export class HeaderGroupComp extends Component implements IHeaderGroupComp {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    static TEMPLATE =
        '<div class="ag-header-group-cell-label">' +
          '<span ref="agLabel" class="ag-header-group-text"></span>' +
          '<span ref="agColumnGroupOpened" class="ag-header-icon ag-header-expand-icon ag-header-expand-icon-expanded"></span>' +
          '<span ref="agColumnGroupClosed" class="ag-header-icon ag-header-expand-icon ag-header-expand-icon-collapsed"></span>' +
        '</div>';

    private params: IHeaderGroupCompParams;

    constructor() {
        super(HeaderGroupComp.TEMPLATE);
    }

    public init(params: IHeaderGroupCompParams) {
        this.params = params;

        this.setupLabel();
        this.addGroupExpandIcon();
    }

    private addInIcon(iconName: string, refName: string, defaultIconFactory: () => HTMLElement): void {
        var eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, null, defaultIconFactory);
        this.getRefElement(refName).appendChild(eIcon);
    }

    private addGroupExpandIcon() {

        var eOpenIcon = this.getRefElement('agColumnGroupOpened');
        var eCloseIcon = this.getRefElement('agColumnGroupClosed');

        if (!this.params.columnGroup.isExpandable()) {
            _.removeFromParent(eOpenIcon);
            _.removeFromParent(eCloseIcon);
            return;
        }

        var expandAction = ()=> {
            var newExpandedValue = !this.params.columnGroup.isExpanded();
            this.columnController.setColumnGroupOpened(this.params.columnGroup, newExpandedValue);
        };

        let iconForEvents: HTMLElement;

        if (this.params.columnGroup.isExpanded()) {
            this.addInIcon('columnGroupOpened', 'agColumnGroupOpened', svgFactory.createGroupContractedIcon);
            iconForEvents = eOpenIcon;
            _.removeFromParent(eCloseIcon);
        } else {
            this.addInIcon('columnGroupClosed', 'agColumnGroupClosed', svgFactory.createGroupExpandedIcon);
            iconForEvents = eCloseIcon;
            _.removeFromParent(eOpenIcon);
        }

        this.addDestroyableEventListener(iconForEvents, 'click', expandAction);

        let touchListener = new TouchListener(iconForEvents);
        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, expandAction);
        this.addDestroyFunc( ()=> touchListener.destroy() );
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
