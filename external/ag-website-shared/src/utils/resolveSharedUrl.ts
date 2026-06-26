import type { Framework } from '@ag-grid-types';

import { chartsUrlWithPrefix } from './chartsUrlWithPrefix';
import { gridUrlWithPrefix } from './gridUrlWithPrefix';

export function resolveSharedUrl({ url, framework }: { url: string; framework?: Framework }): string {
    if (url.startsWith('grid:')) {
        return gridUrlWithPrefix({ url: url.slice('grid:'.length), framework });
    }
    if (url.startsWith('charts:')) {
        return chartsUrlWithPrefix({ url: url.slice('charts:'.length), framework });
    }
    return url;
}
