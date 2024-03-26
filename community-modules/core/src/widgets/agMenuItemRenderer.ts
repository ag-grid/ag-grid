import { Component } from './component';
import { createIconNoSpan } from '../utils/icon';
import { isNodeOrElement, loadTemplate } from '../utils/dom';
import { setAriaExpanded } from '../utils/aria';
import { IMenuItemComp, IMenuItemParams } from '../interfaces/menuItem';

interface AgMenuItemRendererParams {
    cssClassPrefix?: string;
    isCompact?: boolean;
}

export class AgMenuItemRenderer extends Component implements IMenuItemComp {
    private params: IMenuItemParams & AgMenuItemRendererParams;
    private cssClassPrefix: string;

    constructor() {
        super();

        this.setTemplate(/* html */`<div></div>`);
    }

    public init(params: IMenuItemParams & AgMenuItemRendererParams): void {
        this.params = params;
        this.cssClassPrefix = this.params.cssClassPrefix ?? 'ag-menu-option';

        this.addIcon();
        this.addName();
        this.addShortcut();
        this.addSubMenu();
    }

    public configureDefaults(): boolean {
        return true;
    }

    private addIcon(): void {
        if (this.params.isCompact) { return; }
        const icon = loadTemplate(/* html */
            `<span ref="eIcon" class="${this.getClassName('part')} ${this.getClassName('icon')}" role="presentation"></span>`
        );

        if (this.params.checked) {
            icon.appendChild(createIconNoSpan('check', this.gos)!);
        } else if (this.params.icon) {
            if (isNodeOrElement(this.params.icon)) {
                icon.appendChild(this.params.icon as HTMLElement);
            } else if (typeof this.params.icon === 'string') {
                icon.innerHTML = this.params.icon;
            } else {
                console.warn('AG Grid: menu item icon must be DOM node or string');
            }
        }

        this.getGui().appendChild(icon);
    }

    private addName(): void {
        const name = loadTemplate(/* html */
            `<span ref="eName" class="${this.getClassName('part')} ${this.getClassName('text')}">${this.params.name || ''}</span>`
        );

        this.getGui().appendChild(name);
    }

    private addShortcut(): void {
        if (this.params.isCompact) { return; }
        const shortcut = loadTemplate(/* html */
            `<span ref="eShortcut" class="${this.getClassName('part')} ${this.getClassName('shortcut')}">${this.params.shortcut || ''}</span>`
        );

        this.getGui().appendChild(shortcut);
    }

    private addSubMenu(): void {
        const pointer = loadTemplate(/* html */
            `<span ref="ePopupPointer" class="${this.getClassName('part')} ${this.getClassName('popup-pointer')}"></span>`
        );

        const eGui = this.getGui();

        if (this.params.subMenu) {
            const iconName = this.gos.get('enableRtl') ? 'smallLeft' : 'smallRight';
            setAriaExpanded(eGui, false);

            pointer.appendChild(createIconNoSpan(iconName, this.gos)!);
        }

        eGui.appendChild(pointer);
    }

    private getClassName(suffix: string) {
        return `${this.cssClassPrefix}-${suffix}`;
    }

    public destroy(): void {
        super.destroy();
    }
}
