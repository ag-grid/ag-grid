import type { Library } from '@ag-grid-types';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { getDocumentationArchiveUrl } from '@ag-website-shared/utils/getArchiveUrl';
import type { FunctionComponent } from 'react';

interface Props {
    version: string;
    site: Library;
}

export const ArchiveLink: FunctionComponent<Props> = ({ version, site }) => {
    const archiveLink = getDocumentationArchiveUrl({ version, site });
    return (
        <a href={archiveLink}>
            Documentation <Icon name="arrowRight" />
        </a>
    );
};
