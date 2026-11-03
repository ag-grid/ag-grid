import { setParamDocsProvider, setParamDocsUrlProvider } from '@ag-website-shared/theming/ParamModel';
import themingApi from '@generated-reference/theming-api.AUTO.json';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import referenceSections from '../../content/api-documentation/theming-api/properties.json';

setParamDocsProvider((param) => (themingApi as Record<string, { meta?: { comment?: string } }>)[param]?.meta?.comment);

// The Theme Parameters Reference anchors each param's row as `reference-<section>-<param>`.
const sectionOfParam = new Map(
    Object.entries(referenceSections as Record<string, Record<string, unknown>>)
        .filter(([section]) => section !== '_config_')
        .flatMap(([section, params]) =>
            Object.keys(params)
                .filter((param) => param !== 'meta')
                .map((param) => [param, section] as const)
        )
);

setParamDocsUrlProvider((param) => {
    const section = sectionOfParam.get(param);
    return section && `${urlWithBaseUrl('/data-grid/theming-api/')}#reference-${section}-${param}`;
});
