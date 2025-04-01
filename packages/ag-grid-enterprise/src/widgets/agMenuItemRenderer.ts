import type { ElementParams, IMenuItemComp, IMenuItemParams } from 'ag-grid-community';
import {
    Component,
    _createElement,
    _createIconNoSpan,
    _isNodeOrElement,
    _setAriaChecked,
    _setAriaExpanded,
    _warn,
} from 'ag-grid-community';

interface AgMenuItemRendererParams {
    cssClassPrefix?: string;
    isCompact?: boolean;
}
const MenuItemElement: ElementParams = { tag: 'div' };
export class AgMenuItemRenderer extends Component implements IMenuItemComp {
    private params: IMenuItemParams & AgMenuItemRendererParams;
    private cssClassPrefix: string;

    constructor() {
        super(MenuItemElement);
    }

    public init(params: IMenuItemParams & AgMenuItemRendererParams): void {
        this.params = params;
        this.cssClassPrefix = this.params.cssClassPrefix ?? 'ag-menu-option';

        this.addAriaAttributes();
        this.addIcon();
        this.addName();
        this.addShortcut();
        this.addSubMenu();
    }

    public configureDefaults(): boolean {
        return true;
    }

    private addAriaAttributes(): void {
        const { checked, subMenu } = this.params;

        const eGui = this.getGui();

        if (checked) {
            _setAriaChecked(eGui, checked);
        }

        if (subMenu) {
            _setAriaExpanded(eGui, false);
        }
    }

    private addIcon(): void {
        if (this.params.isCompact) {
            return;
        }

        const iconWrapper = _createElement({
            tag: 'span',
            ref: 'eIcon',
            cls: `${this.getClassName('part')} ${this.getClassName('icon')}`,
            role: 'presentation',
        });

        const { checked, icon } = this.params;

        if (checked) {
            iconWrapper.appendChild(_createIconNoSpan('check', this.beans)!);
        } else if (icon) {
            if (_isNodeOrElement(icon)) {
                iconWrapper.appendChild(icon);
            } else if (typeof icon === 'string') {
                // eslint-disable-next-line no-restricted-properties -- no other way to parse custom HTML strings from the user
                iconWrapper.innerHTML = icon;
            } else {
                _warn(227);
            }
        }

        this.getGui().appendChild(iconWrapper);
    }

    private addName(): void {
        const name = _createElement({
            tag: 'span',
            ref: 'eName',
            cls: `${this.getClassName('part')} ${this.getClassName('text')}`,
            children: this.params.name || '',
        });

        this.getGui().appendChild(name);
    }

    private addShortcut(): void {
        if (this.params.isCompact) {
            return;
        }

        const shortcut = _createElement({
            tag: 'span',
            ref: 'eShortcut',
            cls: `${this.getClassName('part')} ${this.getClassName('shortcut')}`,
            children: this.params.shortcut || '',
        });
        this.getGui().appendChild(shortcut);
    }

    private addSubMenu(): void {
        const pointer = _createElement({
            tag: 'span',
            ref: 'ePopupPointer',
            cls: `${this.getClassName('part')} ${this.getClassName('popup-pointer')}`,
        });

        const eGui = this.getGui();

        if (this.params.subMenu) {
            const iconName = this.gos.get('enableRtl') ? 'subMenuOpenRtl' : 'subMenuOpen';
            pointer.appendChild(_createIconNoSpan(iconName, this.beans)!);
        }

        eGui.appendChild(pointer);
    }

    private getClassName(suffix: string) {
        return `${this.cssClassPrefix}-${suffix}`;
    }
}
