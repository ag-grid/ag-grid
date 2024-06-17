import { getResourceUrl } from '@components/demos/examples/finance/utils/getResourceUrl';
import { type FunctionComponent } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import styles from './ContactCellRenderer.module.css';

export const ContactCellRenderer: FunctionComponent<CustomCellRendererProps> = ({ data }) => {
    const linkedinIcon = getResourceUrl(`/example/hr/linkedin.svg`);
    const emailIcon = getResourceUrl(`/example/hr/email.svg`);

    return (
        <div className={styles.contactCell}>
            <div className={styles.iconContainer}>
                <button className="button-secondary">
                    <a
                        href={`https://www.linkedin.com/in/${data.employeeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.iconLink}
                    >
                        <img className={styles.icon} src={linkedinIcon} alt="LinkedIn" />
                    </a>
                </button>
                <button className="button-secondary">
                    <a href={`mailto:${data.employeeId}@company.com`} className={styles.iconLink}>
                        <img className={styles.icon} src={emailIcon} alt="Email" />
                    </a>
                </button>
            </div>
        </div>
    );
};
