import { setParamDocsProvider } from '@ag-website-shared/theming/ParamModel';

import themingApi from '../../../../../../dist/documentation/reference/theming-api.AUTO.json';

setParamDocsProvider((param) => (themingApi as Record<string, { meta?: { comment?: string } }>)[param]?.meta?.comment);
