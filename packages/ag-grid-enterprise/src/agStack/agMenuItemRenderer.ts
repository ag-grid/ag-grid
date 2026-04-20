import type {
    IMenuItem,
    _AgCoreBeanCollection,
    _BaseEvents,
    _BaseProperties,
    _IPropertiesService,
} from 'ag-grid-community';
import {
    _AgComponentStub,
    _createAgElement,
    _isNodeOrElement,
    _setAriaChecked,
    _setAriaExpanded,
} from 'ag-grid-community';

import type { AgMenuItemParams } from './agMenuItemComponent';

interface AgMenuItemRendererParams {
    cssClassPrefix?: string;
    isCompact?: boolean;
}

export class AgMenuItemRenderer<
        TBeanCollection extends _AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
        TProperties extends _BaseProperties,
        TGlobalEvents extends _BaseEvents,
        TCommon,
        TPropertiesService extends _IPropertiesService<TProperties, TCommon>,
        TComponentSelectorType extends string,
        TMenuActionParams extends TCommon,
    >
    extends _AgComponentStub<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType
    >
    implements IMenuItem
{
    private params: AgMenuItemParams<TMenuActionParams, TCommon> & AgMenuItemRendererParams;
    private cssClassPrefix: string;

    constructor(
        private readonly callbacks?: {
            warnNoIcon?: () => void;
        }
    ) {
        super({ tag: 'div' });
    }

    public init(params: AgMenuItemParams<TMenuActionParams, TCommon> & AgMenuItemRendererParams): void {
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

        const iconWrapper = _createAgElement({
            tag: 'span',
            ref: 'eIcon',
            cls: `${this.getClassName('part')} ${this.getClassName('icon')}`,
            role: 'presentation',
        });

        const { checked, icon } = this.params;

        if (checked) {
            iconWrapper.appendChild(this.beans.iconSvc.createIconNoSpan('check')!);
        } else if (icon) {
            if (_isNodeOrElement(icon)) {
                iconWrapper.appendChild(icon);
            } else if (typeof icon === 'string') {
                // eslint-disable-next-line no-restricted-properties -- no other way to parse custom HTML strings from the user
                iconWrapper.innerHTML = icon;
            } else {
                this.callbacks?.warnNoIcon?.();
            }
        }

        this.getGui().appendChild(iconWrapper);
    }

    private addName(): void {
        const name = _createAgElement({
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

        const shortcut = _createAgElement({
            tag: 'span',
            ref: 'eShortcut',
            cls: `${this.getClassName('part')} ${this.getClassName('shortcut')}`,
            children: this.params.shortcut || '',
        });
        this.getGui().appendChild(shortcut);
    }

    private addSubMenu(): void {
        const pointer = _createAgElement({
            tag: 'span',
            ref: 'ePopupPointer',
            cls: `${this.getClassName('part')} ${this.getClassName('popup-pointer')}`,
        });

        const eGui = this.getGui();

        if (this.params.subMenu) {
            const iconName = this.gos.get('enableRtl') ? 'subMenuOpenRtl' : 'subMenuOpen';
            pointer.appendChild(this.beans.iconSvc.createIconNoSpan(iconName)!);
        }

        eGui.appendChild(pointer);
    }

    private getClassName(suffix: string) {
        return `${this.cssClassPrefix}-${suffix}`;
    }
}
