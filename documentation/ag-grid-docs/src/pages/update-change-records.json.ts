/// <reference types="vite/client" />
import { createChangeRecordsEndpoint } from '@ag-website-shared/changes/endpoint';

import { VERSION } from '../../../../packages/ag-grid-community/src/version';

export const GET = createChangeRecordsEndpoint(import.meta.glob('../changes/versions/*.ts'), VERSION);
