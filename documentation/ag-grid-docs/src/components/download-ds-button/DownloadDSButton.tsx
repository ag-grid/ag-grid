import { Icon } from '@ag-website-shared/components/icon/Icon';
import styles from '@legacy-design-system/modules/DownloadDSButton.module.scss';
import { trackOnceDownloadDS } from '@utils/analytics';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classnames from 'classnames';

const DS_VERSION = '31.2.0';

export const DownloadDSButton = () => {
    return (
        <div className={styles.outer}>
            <a
                className={classnames(styles.button, 'button')}
                href={urlWithBaseUrl(`/downloads/ag-grid-design-system-${DS_VERSION}.zip`)}
                download
                onClick={() => {
                    trackOnceDownloadDS();
                }}
            >
                <span>Download the AG Grid</span>{' '}
                <span>
                    Design System <Icon name="download" />
                </span>
            </a>
        </div>
    );
};
