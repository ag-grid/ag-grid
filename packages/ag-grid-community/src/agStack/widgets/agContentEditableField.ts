import type { AgComponentSelector } from '../interfaces/agComponent';
import { RefPlaceholder } from '../interfaces/agComponent';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _setAriaRole } from '../utils/aria';
import type { AgElementParams } from '../utils/dom';
import type { AgAbstractFieldEvent } from './agAbstractField';
import { AgAbstractField } from './agAbstractField';
import { agContentEditableFieldCSS } from './agContentEditableField.css-GENERATED';
import type { AgFieldParams } from './agFieldParams';
import type { AgWidgetSelectorType } from './agWidgetSelectorType';

type AgContentEditableFieldEvent = AgAbstractFieldEvent;

interface AgContentEditableFieldParams extends AgFieldParams {
    className?: string;
    contentEditable?: boolean | 'plaintext-only';
    ariaRole?: string;
    renderValueToElement?: boolean;
}

const AgContentEditableFieldElement: AgElementParams<any> = {
    tag: 'div',
    cls: 'ag-content-editable-field',
    role: 'presentation',
    children: [
        { tag: 'div', ref: 'eLabel' },
        {
            tag: 'div',
            ref: 'eWrapper',
            cls: 'ag-wrapper ag-content-editable-field-input',
            attrs: {
                contenteditable: 'plaintext-only',
            },
        },
    ],
};

export class AgContentEditableField<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TValue,
    TConfig extends AgContentEditableFieldParams = AgContentEditableFieldParams,
    TEventType extends string = AgContentEditableFieldEvent,
> extends AgAbstractField<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    TValue,
    TConfig,
    TEventType | AgContentEditableFieldEvent
> {
    protected readonly eLabel: HTMLElement = RefPlaceholder;
    protected readonly eWrapper: HTMLElement = RefPlaceholder;
    private renderValueToElement: boolean;

    constructor(config?: TConfig) {
        super(config, AgContentEditableFieldElement, [], config?.className);
        this.renderValueToElement = config?.renderValueToElement ?? true;
        this.registerCSS(agContentEditableFieldCSS);
    }

    public override postConstruct() {
        super.postConstruct();

        this.setupEditable();
        this.setupAria();

        this.addManagedElementListeners(this.eWrapper, {
            input: () => this.syncValueFromDom(),
            blur: () => this.syncValueFromDom(true),
        });

        if (this.renderValueToElement && this.value != null) {
            this.refreshDisplayedValue(this.value as unknown as string);
        }
    }

    protected setupAria(): void {
        const ariaEl = this.getAriaElement();
        _setAriaRole(ariaEl, this.config.ariaRole ?? 'textbox');
        ariaEl.setAttribute('tabindex', this.gos.get('tabIndex')!.toString());
    }

    protected setupEditable(): void {
        const editable = this.config.contentEditable ?? 'plaintext-only';

        if (editable === false) {
            this.eWrapper.removeAttribute('contenteditable');
        } else if (editable === true) {
            this.eWrapper.setAttribute('contenteditable', 'true');
        } else {
            this.eWrapper.setAttribute('contenteditable', editable);
        }
    }

    public override setValue(value?: TValue | null, silent?: boolean): this {
        const res = super.setValue(value, silent);

        if (this.renderValueToElement && !silent) {
            this.refreshDisplayedValue(value as unknown as string);
        }

        return res;
    }

    public setRenderValueToElement(render: boolean): void {
        this.renderValueToElement = render;
    }

    public setDisplayedValue(value?: string | null): void {
        this.refreshDisplayedValue(value ?? '');
    }

    public getContentElement(): HTMLElement {
        return this.eWrapper;
    }

    private refreshDisplayedValue(value?: string | null): void {
        this.eWrapper.textContent = value ?? '';
    }

    private syncValueFromDom(silent?: boolean): void {
        super.setValue((this.eWrapper.textContent ?? '') as unknown as TValue, silent);
    }

    public override getFocusableElement(): HTMLElement {
        return this.eWrapper;
    }
}

export const AgContentEditableFieldSelector: AgComponentSelector<AgWidgetSelectorType> = {
    selector: 'AG-CONTENT-EDITABLE-FIELD',
    component: AgContentEditableField,
};
