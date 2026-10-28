import type { FC, ReactNode } from 'react';

import { ParamModel, useParamAtom } from '../../theming/ParamModel';
import { useSetAdvancedParamEnabled } from '../../theming/advanced-params';
import { type ParamType } from '../../theming/api';
import { useRenderedTheme } from '../../theming/rendered-theme';
import { type ThemeParam, getThemeDefaultParams } from '../../theming/utils';
import { BorderStyleValueEditor } from './BorderStyleValueEditor';
import { BorderSwitch, BorderValueEditor } from './BorderValueEditor';
import { Checkbox } from './Checkbox';
import { ColorSchemeValueEditor } from './ColorSchemeValueEditor';
import { ColorValueEditor } from './ColorValueEditor';
import { CssValueEditor } from './CssValueEditor';
import { withErrorBoundary } from './ErrorBoundary';
import { FontFamilyValueEditor } from './FontFamilyValueEditor';
import { FontWeightValueEditor } from './FontWeightValueEditor';
import { FormField } from './FormField';
import { ImageValueEditor } from './ImageValueEditor';
import { LengthValueEditor } from './LengthValueEditor';
import { ScaleValueEditor } from './ScaleValueEditor';
import { ScrollbarWidthValueEditor } from './ScrollbarWidthValueEditor';
import type { ValueEditorProps } from './ValueEditorProps';
import { renderColorValue } from './renderColorValue';

export type ParamEditorProps = {
    param: ThemeParam | ParamModel<unknown>;
    label?: string;
    showDocs?: boolean;
    /** A footnote under the control - see `FormFieldProps.note`. */
    note?: ReactNode;
    /** Sits in the input, or beside the heading of a field with a switch. */
    icon?: ReactNode;
    swipeAdjustmentDivisor?: number;
    isAdvancedSection?: boolean;
    // Optional clamp for numeric (length) params; ignored by other editor types.
    min?: number;
    max?: number;
    /** A switch in place of the field's own, for a host setting that shows the value without changing it. */
    labelSwitch?: { checked: boolean; onChange: (checked: boolean) => void };
};

export const ParamEditor = withErrorBoundary((props: ParamEditorProps) => {
    const param = ParamModel.for(props.param);
    const [value, setValue] = useParamAtom(param);
    const setAdvancedParamEnabled = useSetAdvancedParamEnabled();

    if (!props.isAdvancedSection && param.onlyEditableAsAdvancedParam) {
        throw new Error(`Add ${param.property} to nonAdvancedParams to allow editing outside the advanced section.`);
    }
    const theme = useRenderedTheme();
    let editorValue = value;
    if (editorValue == null) {
        const params = getThemeDefaultParams(theme);
        editorValue = renderColorValue(param.property, params, new Set());
    }

    const ValueEditorComponent = valueEditors[param.type] || CssValueEditor;
    const LabelControl = labelControls[param.type];
    const onChange = (v: unknown) => setValue(v ?? undefined);
    const label = props.label || param.label;
    const { labelSwitch } = props;
    const labelControl = labelSwitch ? (
        <Checkbox checked={labelSwitch.checked} onChange={labelSwitch.onChange} useSwitch ariaLabel={label} />
    ) : (
        LabelControl && <LabelControl param={param} value={editorValue} onChange={onChange} label={label} />
    );

    return (
        <FormField
            label={label}
            docs={props.showDocs ? param.docs : null}
            docsUrl={props.showDocs ? param.docsUrl : null}
            note={props.note}
            labelIcon={labelControl && props.icon}
            labelControl={labelControl}
            onCloseClick={
                props.isAdvancedSection
                    ? () => {
                          setAdvancedParamEnabled(param, false);
                          if (param.onlyEditableAsAdvancedParam) {
                              setValue(undefined);
                          }
                      }
                    : undefined
            }
        >
            {labelSwitch?.checked !== false && (
                <ValueEditorComponent
                    param={param}
                    value={editorValue}
                    onChange={onChange}
                    label={label}
                    icon={labelControl ? undefined : props.icon}
                    swipeAdjustmentDivisor={props.swipeAdjustmentDivisor}
                    min={props.min}
                    max={props.max}
                />
            )}
        </FormField>
    );
});

const valueEditors: Record<ParamType, FC<ValueEditorProps<any>>> = {
    color: ColorValueEditor,
    colorScheme: ColorSchemeValueEditor,
    length: LengthValueEditor,
    scale: ScaleValueEditor,
    border: BorderValueEditor,
    borderStyle: BorderStyleValueEditor,
    shadow: CssValueEditor,
    image: ImageValueEditor,
    fontFamily: FontFamilyValueEditor,
    fontWeight: FontWeightValueEditor,
    duration: LengthValueEditor,
    scrollbarWidth: ScrollbarWidthValueEditor,
};

const labelControls: Partial<Record<ParamType, FC<ValueEditorProps<any>>>> = {
    border: BorderSwitch,
};
