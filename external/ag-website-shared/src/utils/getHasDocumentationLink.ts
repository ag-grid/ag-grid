import type { Library } from '@ag-grid-types';
import { versionIsGreaterOrEqual } from '@ag-website-shared/utils/versionIsGreaterOrEqual';

const FIRST_GRID_VERSION_WITH_HOMEPAGE = '27.3.0';

export function getHasDocumentationLink({ version, site }: { version: string; site: Library }) {
    const hasDocumentationLink =
        (site === 'grid' && versionIsGreaterOrEqual(version, FIRST_GRID_VERSION_WITH_HOMEPAGE)) || site === 'charts';

    return hasDocumentationLink;
}
