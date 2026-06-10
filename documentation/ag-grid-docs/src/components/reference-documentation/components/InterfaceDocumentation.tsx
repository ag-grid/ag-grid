import type { Framework } from '@ag-grid-types';
import { type FunctionComponent } from 'react';

import type { Config, DocProperties } from '../types';
import { ReferenceDataProvider } from './ReferenceDataContext';
import { Section } from './Section';

interface Props {
    framework: Framework;
    model: DocProperties;
    config: Config;
    isInline: boolean;
}

function InterfaceDocumentationInner({ framework, model, config, isInline }: Props) {
    return Object.entries(model.properties).map(([key, properties]) => (
        <Section
            key={key}
            framework={framework}
            title={key}
            properties={properties}
            config={config}
            meta={model.meta}
            isInline={isInline}
        />
    ));
}

export const InterfaceDocumentation: FunctionComponent<Props> = (props) => (
    <ReferenceDataProvider codeSources={props.model.codeSources}>
        <InterfaceDocumentationInner {...props} />
    </ReferenceDataProvider>
);
