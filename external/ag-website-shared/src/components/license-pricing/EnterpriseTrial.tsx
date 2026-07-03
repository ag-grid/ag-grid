import { Icon } from '@ag-website-shared/components/icon/Icon';
import { gridUrlWithPrefix } from '@ag-website-shared/utils/gridUrlWithPrefix';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import classnames from 'classnames';
import type { FunctionComponent } from 'react';

import styles from './license-pricing.module.scss';

interface Props {
    className?: string;
}

export const EnterpriseTrial: FunctionComponent<Props> = ({ className }) => {
    const framework = useFrameworkFromStore();

    return (
        <div className={classnames(styles.trialLicence, className)}>
            <div className={styles.trialLicenceCopy}>
                <h3 className="text-2xl" id="request-trial-licence">
                    <Icon name="enterprise" svgClasses={styles.enterpriseIcon} />
                    <span>Enterprise Bundle Trial</span>
                </h3>

                <p>See the differences between our community and enterprise versions and request a trial license</p>

                <a
                    className={classnames('button', styles.trialButton)}
                    href={gridUrlWithPrefix({
                        framework,
                        url: './community-vs-enterprise/#request-a-30-day-enterprise-bundle-trial-licence',
                    })}
                >
                    Get a trial license
                </a>
            </div>

            <div className={styles.trialLicenceSeparator}></div>

            <div className={classnames(styles.trialLicenceCopy, 'trial-licence-form')}>
                <div className={styles.trialLicenceCopyItem}>
                    <Icon name="alarm" svgClasses={styles.alarmIcon} />
                    <p>
                        <b>Two Week Trial</b>
                        <br />
                        Trial licences are valid for two weeks from the date of issue, or{' '}
                        <a href="mailto:info@ag-grid.com">contact&nbsp;us</a> to extend.
                    </p>
                </div>

                <div className={styles.trialLicenceSeparator}></div>

                <div className={styles.trialLicenceCopyItem}>
                    <Icon name="terminal" svgClasses={styles.terminalIcon} />
                    <p>
                        <b>Suppresses Console Warnings</b>
                        <br />
                        Removes console errors and watermarks from AG Grid and AG&nbsp;Chart&nbsp;components.
                    </p>
                </div>

                <div className={styles.trialLicenceSeparator}></div>

                <div className={styles.trialLicenceCopyItem}>
                    <Icon name="support" svgClasses={styles.supportIcon} />
                    <p>
                        <b>Access Support</b>
                        <br />
                        Access dedicated support from our engineering team via{' '}
                        <a href="https://ag-grid.zendesk.com/hc/en-us">Zendesk</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};
