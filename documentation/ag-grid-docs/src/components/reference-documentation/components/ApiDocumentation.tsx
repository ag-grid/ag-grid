import type { Framework } from '@ag-grid-types';
import { loadCodeLookup, loadInterfaceLookup } from '@stores/referenceDataStore';
import { type FunctionComponent, useEffect } from 'react';

import type { ApiDocumentationModel } from '../types';
import { Section } from './Section';

interface Props {
    framework: Framework;
    model: ApiDocumentationModel;
    isInline: boolean;
}

export const ApiDocumentation: FunctionComponent<Props> = ({ framework, model, isInline }) => {
    useEffect(() => {
        loadInterfaceLookup();
        loadCodeLookup(model.codeSources);
    }, []);

    if (model.type === 'multiple') {
        return model.entries.map(([name, { properties, meta }]) => (
            <Section
                key={name}
                framework={framework}
                title={name}
                properties={properties}
                config={model.config}
                meta={meta}
                isInline={isInline}
            />
        ));
    }

    return (
        <Section
            framework={framework}
            title={model.title}
            properties={model.properties}
            config={{ ...model.config, isSubset: true }}
            isInline={isInline}
        />
    );
};
