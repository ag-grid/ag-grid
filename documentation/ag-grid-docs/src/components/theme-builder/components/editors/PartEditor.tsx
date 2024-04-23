import type { PartId } from '@ag-grid-community/theming';

import { PartModel, VariantModel, useSelectedVariant } from '../../model/PartModel';
import { withErrorBoundary } from '../general/ErrorBoundary';
import { FormField } from './FormField';
import { Select } from './Select';

export type VariantSelectorProps = {
    part: PartId;
};

export const PartEditor = withErrorBoundary((props: VariantSelectorProps) => {
    const part = PartModel.for(props.part);
    const [variant, setVariant] = useSelectedVariant(part);
    return (
        <FormField label={part.label} docs={part.docs}>
            <Select
                options={part.variants.filter((v) => v.variantId !== 'base')}
                value={variant}
                getKey={getVariantId}
                onChange={setVariant}
            />
        </FormField>
    );
});

const getVariantId = ({ variantId }: VariantModel) => variantId;
