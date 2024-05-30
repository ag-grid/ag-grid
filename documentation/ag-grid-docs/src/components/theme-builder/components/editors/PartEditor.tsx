import type { PartId } from '@ag-grid-community/theming';
import { Select } from '@ag-website-shared/components/select/Select';

import type { VariantModel } from '../../model/PartModel';
import { PartModel, useSelectedVariant } from '../../model/PartModel';
import { withErrorBoundary } from '../general/ErrorBoundary';
import { FormField } from './FormField';

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
