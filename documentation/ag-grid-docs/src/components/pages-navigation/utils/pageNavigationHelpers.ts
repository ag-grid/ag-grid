import type { Framework } from '@ag-grid-types';
import { getExamplePageUrl } from '@components/docs/utils/urlPaths';

export function toElementId(str: string) {
    return 'menu-' + str.toLowerCase().replace('&', '').replace('/', '').replaceAll(' ', '-');
}

export function getLinkUrl({ framework, path, url }: { framework: Framework; path?: string; url?: string }) {
    return url ? url : getExamplePageUrl({ framework, path: path! });
}
