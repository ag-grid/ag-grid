import styled from '@emotion/styled';

import { ParamModel, useParamAtom } from '../../model/ParamModel';
import { useRenderedTheme } from '../../model/rendered-theme';
import { withErrorBoundary } from '../general/ErrorBoundary';
import { FormField } from './FormField';

export type ParamEditorProps = {
    param: string;
    label?: string;
    showDocs?: boolean;
};

export const ParamEditor = withErrorBoundary((props: ParamEditorProps) => {
    const param = ParamModel.for(props.param);
    const [value, setValue] = useParamAtom(param);

    const theme = useRenderedTheme();
    let editorValue = value;
    if (editorValue == null) {
        if (param.property in theme.paramDefaults) {
            editorValue = theme.paramDefaults[param.property];
        } else {
            throw new Error(`Param "${param.property}" does not exist.`);
        }
    }

    return (
        <FormField label={props.label || param.label} docs={props.showDocs ? param.docs : null}>
            <Input type="text" value={editorValue} onChange={(e) => setValue(e.target.value)} />
        </FormField>
    );
});

const Input = styled('input')`
    width: 100%;
`;
