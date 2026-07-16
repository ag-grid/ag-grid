import { BorderStyleValueEditor } from '@ag-website-shared/components/theme-builder/BorderStyleValueEditor';
import { BorderValueEditor } from '@ag-website-shared/components/theme-builder/BorderValueEditor';
import { ColorSchemeValueEditor } from '@ag-website-shared/components/theme-builder/ColorSchemeValueEditor';
import { CssValueEditor } from '@ag-website-shared/components/theme-builder/CssValueEditor';
import { withErrorBoundary } from '@ag-website-shared/components/theme-builder/ErrorBoundary';
import { FontWeightValueEditor } from '@ag-website-shared/components/theme-builder/FontWeightValueEditor';
import { FormField } from '@ag-website-shared/components/theme-builder/FormField';
import type { ValueEditorProps } from '@ag-website-shared/components/theme-builder/ValueEditorProps';
import { ParamModel, useParamAtom } from '@ag-website-shared/theming/ParamModel';
import { useSetAdvancedParamEnabled } from '@ag-website-shared/theming/advanced-params';
import { type ColorValue, type ParamType } from '@ag-website-shared/theming/api';
import { useRenderedTheme } from '@ag-website-shared/theming/rendered-theme';
import { type ThemeParam, clamp, getThemeDefaultParams } from '@ag-website-shared/theming/utils';
import type { FC, ReactNode } from 'react';

import { ColorValueEditor } from './ColorValueEditor';
import { FontFamilyValueEditor } from './FontFamilyValueEditor';
import { ImageValueEditor } from './ImageValueEditor';
import { LengthValueEditor } from './LengthValueEditor';
import { ScaleValueEditor } from './ScaleValueEditor';

export type ParamEditorProps = {
    param: ThemeParam | ParamModel<unknown>;
    label?: string;
    showDocs?: boolean;
    icon?: ReactNode;
    swipeAdjustmentDivisor?: number;
    isAdvancedSection?: boolean;
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

    return (
        <FormField
            label={props.label || param.label}
            docs={props.showDocs ? param.docs : null}
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
            <ValueEditorComponent
                param={param}
                value={editorValue}
                onChange={(v) => setValue(v ?? undefined)}
                icon={props.icon}
                swipeAdjustmentDivisor={props.swipeAdjustmentDivisor}
            />
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
};

function renderColorValue(property: ThemeParam, params: any, stack: Set<ThemeParam>): string {
    const value: ColorValue = params[property];
    if (stack.has(property)) {
        throw new Error(`Circular reference detected resolving default value for ${property}`);
    }
    stack.add(property);
    try {
        if (!isRef(value)) {
            return value;
        }
        if (!value.mix) {
            return renderColorValue(value.ref, params, stack);
        }
        const colorExpr = renderColorValue(value.ref, params, stack);
        const backgroundExpr = value.onto ? renderColorValue(value.onto, params, stack) : 'transparent';
        return `color-mix(in srgb, ${backgroundExpr}, ${colorExpr} ${clamp(value.mix * 100, 0, 100)}%)`;
    } finally {
        stack.delete(property);
    }
}

const isRef = (value: unknown): value is { ref: string } =>
    typeof value === 'object' && value != null && 'ref' in value && typeof value.ref === 'string';
