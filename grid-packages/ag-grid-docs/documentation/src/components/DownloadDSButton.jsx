import classnames from 'classnames';
import React from 'react';
import { trackOnceDownloadDS } from '../utils/analytics';
import styles from './DownloadDSButton.module.scss';
import { Icon } from './Icon';

const DownloadDSButton = () => {
    return (
        <div className={styles.outer}>
            <a
                className={classnames(styles.button, 'button')}
                href="../../../downloads/ag-grid-design-system-30.1.0.zip"
                download
                onClick={() => {
                    trackOnceDownloadDS();
                }}
            >
              <span>Download the AG Grid</span>{' '}
              <span>Design System <Icon name="download" /></span>
            </a>
        </div>
    );
};

export default DownloadDSButton;
