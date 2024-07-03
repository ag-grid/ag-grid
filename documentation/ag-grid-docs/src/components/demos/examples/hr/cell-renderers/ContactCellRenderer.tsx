import type { CustomCellRendererProps } from '@ag-grid-community/react';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { type FunctionComponent } from 'react';

import styles from './ContactCellRenderer.module.css';

export const ContactCellRenderer: FunctionComponent<CustomCellRendererProps> = ({ data }) => {
    const emailName = data.orgHierarchy.at(-1).toLowerCase().replace(' ', '.');

    return (
        <div className={styles.contactCell}>
            <div className={styles.iconContainer}>
                <button>
                    <a
                        href={`https://www.linkedin.com/company/ag-grid/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.iconLink}
                    >
                        <img className={styles.icon} src={urlWithBaseUrl(`/example/hr/linkedin.svg`)} alt="linkedin" />
                    </a>
                </button>
                <button>
                    <a href={`mailto:${emailName}@company.com`} className={styles.iconLink}>
                        <img className={styles.icon} src={urlWithBaseUrl(`/example/hr/email.svg`)} alt="email" />
                    </a>
                </button>
            </div>
        </div>
    );
};
