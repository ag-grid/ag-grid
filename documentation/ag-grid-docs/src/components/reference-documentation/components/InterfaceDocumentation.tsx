import type { Framework } from '@ag-grid-types';
import { type FunctionComponent } from 'react';

import type { Config, DocProperties } from '../types';
import { Section } from './Section';

interface Props {
    framework: Framework;
    model: DocProperties;
    config: Config;
    isInline: boolean;
}

export const InterfaceDocumentation: FunctionComponent<Props> = ({ framework, model, config, isInline }) => {
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
};
