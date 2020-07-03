import {
    AgEvent,
    Autowired,
    Component,
    Constants,
    GridOptionsWrapper,
    MenuItemDef,
    PostConstruct,
    RefSelector,
    TooltipFeature,
    _
} from "@ag-grid-community/core";

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
    event: MouseEvent | KeyboardEvent;
}

export class MenuItemComponent extends Component {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eIcon') private eIcon: HTMLElement;

    public static EVENT_ITEM_SELECTED = 'itemSelected';

    private params: MenuItemDef;
    private tooltip: string;

    constructor(params: MenuItemDef) {
        super(/* html */`
            <div class="ag-menu-option" tabindex="-1">
                <span ref="eIcon" class="ag-menu-option-part ag-menu-option-icon"></span>
                <span ref="eName" class="ag-menu-option-part ag-menu-option-text">${params.name}</span>
            </div>`);

        this.params = params;
    }

    @PostConstruct
    private init() {
        this.addIcon();
        this.addTooltip();;
        this.addShortcut();
        this.addSubMenu();

        if (this.params.disabled) {
            _.addCssClass(this.getGui(), 'ag-menu-option-disabled');
        } else {
            this.addGuiEventListener('click', this.onOptionSelected.bind(this));
            this.addGuiEventListener('keydown', (e: KeyboardEvent) => {
                if (e.keyCode === Constants.KEY_ENTER || e.keyCode === Constants.KEY_SPACE) {
                    this.onOptionSelected(e);
                }
            });
        }

        if (this.params.cssClasses) {
            this.params.cssClasses.forEach(it => _.addCssClass(this.getGui(), it));
        }
    }

    private addIcon(): void {
        if (this.params.checked) {
            this.eIcon.appendChild(_.createIconNoSpan('check', this.gridOptionsWrapper));
        } else if (this.params.icon) {
            if (_.isNodeOrElement(this.params.icon)) {
                this.eIcon.appendChild(this.params.icon as HTMLElement);
            } else if (typeof this.params.icon === 'string') {
                this.eIcon.innerHTML = this.params.icon;
            } else {
                console.warn('ag-Grid: menu item icon must be DOM node or string');
            }
        }
    }

    private addTooltip(): void {
        if (this.params.tooltip) {
            this.tooltip = this.params.tooltip;

            if (this.gridOptionsWrapper.isEnableBrowserTooltips()) {
                this.getGui().setAttribute('title', this.tooltip);
            } else {
                this.createManagedBean(new TooltipFeature(this, 'menu'));
            }
        }
    }

    private addShortcut(): void {
        if (this.params.shortcut) {
            const shortcut = _.loadTemplate(/* html */
                `<span ref="eShortcut" class="ag-menu-option-part ag-menu-option-shortcut">${this.params.shortcut}</span>`);

            this.getGui().appendChild(shortcut);
        }
    }

    private addSubMenu(): void {
        if (this.params.subMenu) {
            const pointer = _.loadTemplate(/* html */
                `<span ref="ePopupPointer" class="ag-menu-option-part ag-menu-option-popup-pointer"></span>`);

            const iconName = this.gridOptionsWrapper.isEnableRtl() ? 'smallLeft' : 'smallRight';

            pointer.appendChild(_.createIconNoSpan(iconName, this.gridOptionsWrapper));

            this.getGui().appendChild(pointer);
        }
    }

    public getTooltipText(): string {
        return this.tooltip;
    }

    public getComponentHolder(): undefined {
        return undefined;
    }

    private onOptionSelected(event: MouseEvent | KeyboardEvent): void {
        const e: MenuItemSelectedEvent = {
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
            event
        };

        this.dispatchEvent(e);

        if (this.params.action) {
            this.params.action();
        }
    }

    protected destroy(): void {
        // console.log('MenuItemComponent->destroy() ' + this.instance);
        super.destroy();
    }
}
