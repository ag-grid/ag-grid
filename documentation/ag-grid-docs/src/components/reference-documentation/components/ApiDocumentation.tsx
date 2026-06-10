import type { Framework } from '@ag-grid-types';
import { $queryClient } from '@stores/queryClientStore';
import { QueryClientProvider } from '@tanstack/react-query';
import type { FunctionComponent } from 'react';

import type { ApiDocumentationModel } from '../types';
import { Section } from './Section';

interface Props {
    framework: Framework;
    model: ApiDocumentationModel;
    isInline: boolean;
}

function ApiDocumentationInner({ framework, model, isInline }: Props) {
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
                codeSources={model.codeSources}
            />
        ));
    }

    return (
        <Section
            framework={framework}
            title={model.title}
            properties={model.properties}
            config={{ ...model.config, isSubset: true }}
            names={model.names}
            isInline={isInline}
            codeSources={model.codeSources}
        />
    );
}

export const ApiDocumentation: FunctionComponent<Props> = (props) => (
    <QueryClientProvider client={$queryClient.get()}>
        <ApiDocumentationInner {...props} />
    </QueryClientProvider>
);
