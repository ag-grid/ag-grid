import classnames from 'classnames';
import React from 'react';
import { trackOnceDownloadDS } from '../utils/analytics';
import { hostPrefix } from '../utils/consts';
import styles from '@design-system/modules/DownloadDSButton.module.scss';
import { Icon } from './Icon';

const DS_VERSION = "31.1.0";

const DownloadDSButton = () => {
    return (
        <div className={styles.outer}>
            <a
                className={classnames(styles.button, 'button')}
                href={`${hostPrefix}/../../downloads/ag-grid-design-system-${DS_VERSION}.zip`}
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
