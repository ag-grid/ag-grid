import { Select } from '@ag-website-shared/components/select/Select';

import type { PartModel } from '../../model/PartModel';
import { FeatureModel, useSelectedPart } from '../../model/PartModel';
import { withErrorBoundary } from '../general/ErrorBoundary';
import { FormField } from './FormField';

export type VariantSelectorProps = {
    featureName: string;
};

export const PartEditor = withErrorBoundary((props: VariantSelectorProps) => {
    const feature = FeatureModel.for(props.featureName);
    const [variant, setVariant] = useSelectedPart(feature);
    return (
        <FormField label={feature.label} docs={feature.docs}>
            <Select options={feature.parts} value={variant} getKey={getVariantId} onChange={setVariant} />
        </FormField>
    );
});

const getVariantId = ({ id }: PartModel) => id;
