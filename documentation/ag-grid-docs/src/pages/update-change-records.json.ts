/// <reference types="vite/client" />
import { createChangeRecordsEndpoint } from '@ag-website-shared/changes/endpoint';

export const GET = createChangeRecordsEndpoint(import.meta.glob('../changes/versions/*.ts'));
