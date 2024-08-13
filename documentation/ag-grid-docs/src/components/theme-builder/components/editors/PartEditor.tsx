import { Select } from '@ag-website-shared/components/select/Select';

import type { PartModel } from '../../model/PartModel';
import { GroupModel, useSelectedPart } from '../../model/PartModel';
import { withErrorBoundary } from '../general/ErrorBoundary';
import { FormField } from './FormField';

export type VariantSelectorProps = {
    partId: string;
};

export const PartEditor = withErrorBoundary((props: VariantSelectorProps) => {
    const group = GroupModel.for(props.partId);
    const [variant, setVariant] = useSelectedPart(group);
    return (
        <FormField label={group.label} docs={group.docs}>
            <Select options={group.parts} value={variant} getKey={getVariantId} onChange={setVariant} />
        </FormField>
    );
});

const getVariantId = ({ id }: PartModel) => id;
