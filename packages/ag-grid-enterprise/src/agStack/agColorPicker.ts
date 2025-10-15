import type {
    AgPickerFieldParams,
    _AgComponentSelector,
    _AgCoreBeanCollection,
    _AgWidgetSelectorType,
    _BaseEvents,
    _BaseProperties,
    _IPropertiesService,
} from 'ag-grid-community';
import { AgPickerField, _createElement } from 'ag-grid-community';

import { AgColorPanel } from './agColorPanel';
import type { AgDialogCallbacks } from './agDialog';
import { AgDialog } from './agDialog';
import type { IAgChartsExports } from './iAgChartsExports';

export interface AgColorPickerParams<TComponentSelectorType extends string>
    extends Omit<
        AgPickerFieldParams<TComponentSelectorType>,
        'pickerType' | 'pickerAriaLabelKey' | 'pickerAriaLabelValue'
    > {
    pickerType?: string;
    pickerAriaLabelKey?: string;
    pickerAriaLabelValue?: string;
    dialogCallbacks?: AgDialogCallbacks<any, any>;
}

export class AgColorPicker<
    TBeanCollection extends _AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends _BaseProperties,
    TGlobalEvents extends _BaseEvents,
    TCommon,
    TPropertiesService extends _IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
> extends AgPickerField<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    string,
    AgColorPickerParams<TComponentSelectorType> & AgPickerFieldParams<TComponentSelectorType>,
    string,
    AgDialog<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType>
> {
    private isDestroyingPicker: boolean;
    private eDisplayFieldColor: HTMLElement;
    private eDisplayFieldText: HTMLElement;

    constructor(config?: AgColorPickerParams<TComponentSelectorType>) {
        super({
            pickerAriaLabelKey: 'ariaLabelColorPicker',
            pickerAriaLabelValue: 'Color Picker',
            pickerType: 'ag-list',
            className: 'ag-color-picker',
            pickerIcon: 'chartsColorPicker',
            ...config,
        });
    }

    public override postConstruct() {
        this.eDisplayFieldColor = _createElement({
            tag: 'span',
            cls: 'ag-color-picker-color',
        });
        this.eDisplayFieldText = _createElement({
            tag: 'span',
            cls: 'ag-color-picker-value',
        });

        this.eDisplayField.append(this.eDisplayFieldColor, this.eDisplayFieldText);

        super.postConstruct();

        if (this.value) {
            this.setValue(this.value);
        }
    }

    protected createPickerComponent() {
        const eGuiRect = this.eWrapper.getBoundingClientRect();
        const parentRect = this.beans.popupSvc!.getParentRect();

        const colorDialog = this.createBean(
            new AgDialog<
                TBeanCollection,
                TProperties,
                TGlobalEvents,
                TCommon,
                TPropertiesService,
                TComponentSelectorType
            >(
                {
                    closable: false,
                    modal: true,
                    hideTitleBar: true,
                    minWidth: 190,
                    width: 190,
                    height: 250,
                    x: eGuiRect.right - parentRect.left - 190,
                    y: eGuiRect.top - parentRect.top - 250 - (this.config.pickerGap ?? 0),
                    postProcessPopupParams: {
                        type: 'colorPicker',
                        eventSource: this.eWrapper,
                    },
                },
                this.config.dialogCallbacks
            )
        );

        return colorDialog;
    }

    protected override renderAndPositionPicker(): () => void {
        const pickerComponent = this.pickerComponent!;
        const colorPanel = this.createBean(
            new AgColorPanel<
                TBeanCollection,
                TProperties,
                TGlobalEvents,
                TCommon,
                TPropertiesService,
                TComponentSelectorType
            >({ picker: this })
        );

        pickerComponent.addCss('ag-color-dialog');

        colorPanel.addDestroyFunc(() => {
            if (pickerComponent.isAlive()) {
                this.destroyBean(pickerComponent);
            }
        });

        pickerComponent.setParentComponent(this);
        pickerComponent.setBodyComponent(colorPanel);
        colorPanel.setValue(this.getValue());
        colorPanel.getGui().focus();

        pickerComponent.addDestroyFunc(() => {
            // here we check if the picker was already being
            // destroyed to avoid a stack overflow
            if (!this.isDestroyingPicker) {
                this.beforeHidePicker();
                this.isDestroyingPicker = true;

                if (colorPanel.isAlive()) {
                    this.destroyBean(colorPanel);
                }

                if (this.isAlive()) {
                    this.getFocusableElement().focus();
                }
            } else {
                this.isDestroyingPicker = false;
            }
        });

        return () => this.pickerComponent?.close();
    }

    public override setValue(color: string): this {
        if (this.value === color) {
            return this;
        }

        this.eDisplayFieldColor.style.backgroundColor = color;
        this.eDisplayFieldText.textContent = (this.beans.agChartsExports as IAgChartsExports)._Util.Color.fromString(
            color
        )
            .toHexString()
            .toUpperCase();

        return super.setValue(color);
    }

    public override getValue(): string {
        return this.value;
    }
}

export const AgColorPickerSelector: _AgComponentSelector<_AgWidgetSelectorType> = {
    selector: 'AG-COLOR-PICKER',
    component: AgColorPicker,
};
