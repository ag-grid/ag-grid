import {
    AgEvent,
    Autowired,
    Component,
    GridOptionsWrapper,
    MenuItemDef,
    PostConstruct,
    TooltipManager,
    _
} from "ag-grid-community";

export interface MenuItemSelectedEvent extends AgEvent {
    name: string;
    disabled?: boolean;
    shortcut?: string;
    action?: () => void;
    checked?: boolean;
    icon?: HTMLElement | string;
    subMenu?: (MenuItemDef | string)[];
    cssClasses?: string[];
    tooltip?: string;
    mouseEvent: MouseEvent;
}

export class MenuItemComponent extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('tooltipManager') private tooltipManager: TooltipManager;

    // private instance = Math.random();

    private static TEMPLATE =
        `<div class="ag-menu-option">
            <span id="eIcon" class="ag-menu-option-icon"></span>
            <span id="eName" class="ag-menu-option-text"></span>
            <span id="eShortcut" class="ag-menu-option-shortcut"></span>
            <span id="ePopupPointer" class="ag-menu-option-popup-pointer ag-icon"></span>
        </div>`;

    public static EVENT_ITEM_SELECTED = 'itemSelected';

    private params: MenuItemDef;
    private tooltip: string;

    constructor(params: MenuItemDef) {
        super(MenuItemComponent.TEMPLATE);
        this.params = params;
    }

    @PostConstruct
    private init() {

        if (this.params.checked) {
            this.queryForHtmlElement('#eIcon').innerHTML = '<span class="ag-icon ag-icon-tick"></span>';
        } else if (this.params.icon) {
            if (_.isNodeOrElement(this.params.icon)) {
                this.queryForHtmlElement('#eIcon').appendChild(this.params.icon as HTMLElement);
            } else if (typeof this.params.icon === 'string') {
                this.queryForHtmlElement('#eIcon').innerHTML = this.params.icon as string;
            } else {
                console.warn('ag-Grid: menu item icon must be DOM node or string');
            }
        } else {
            // if i didn't put space here, the alignment was messed up, probably
            // fixable with CSS but i was spending to much time trying to figure
            // it out.
            this.queryForHtmlElement('#eIcon').innerHTML = '&nbsp;';
        }

        if (this.params.tooltip) {
            this.tooltip = this.params.tooltip;
            if (this.gridOptionsWrapper.isEnableBrowserTooltips()) {
                this.getGui().setAttribute('title', this.tooltip);
            } else {
                this.tooltipManager.registerTooltip(this);
            }
        }

        if (this.params.shortcut) {
            this.queryForHtmlElement('#eShortcut').innerHTML = this.params.shortcut;
        }
        if (this.params.subMenu) {
            if (this.gridOptionsWrapper.isEnableRtl()) {
                // for RTL, we show arrow going left
                this.queryForHtmlElement('#ePopupPointer').classList.add('ag-icon-small-left');
            } else {
                // for normal, we show arrow going right
                this.queryForHtmlElement('#ePopupPointer').classList.add('ag-icon-small-right');
            }
        } else {
            this.queryForHtmlElement('#ePopupPointer').innerHTML = '&nbsp;';
        }
        this.queryForHtmlElement('#eName').innerHTML = this.params.name;

        if (this.params.disabled) {
            _.addCssClass(this.getGui(), 'ag-menu-option-disabled');
        } else {
            this.addGuiEventListener('click', this.onOptionSelected.bind(this));
        }

        if (this.params.cssClasses) {
            this.params.cssClasses.forEach(it => _.addCssClass(this.getGui(), it));
        }
    }

    public getTooltipText(): string {
        return this.tooltip;
    }

    public getComponentHolder(): undefined {
        return undefined;
    }

    private onOptionSelected(mouseEvent: MouseEvent): void {
        const event: MenuItemSelectedEvent = {
            type: MenuItemComponent.EVENT_ITEM_SELECTED,
            action: this.params.action,
            checked: this.params.checked,
            cssClasses: this.params.cssClasses,
            disabled: this.params.disabled,
            icon: this.params.icon,
            name: this.params.name,
            shortcut: this.params.shortcut,
            subMenu: this.params.subMenu,
            tooltip: this.params.tooltip,
            mouseEvent: mouseEvent
        };
        this.dispatchEvent(event);
        if (this.params.action) {
            this.params.action();
        }
    }

    public destroy(): void {
        // console.log('MenuItemComponent->destroy() ' + this.instance);
        super.destroy();
    }
}
