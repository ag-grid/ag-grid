import { createAutomatedExampleManager } from '@components/automated-examples/lib/createAutomatedExampleManager';
import styles from '@legacy-design-system/modules/GridHomepage.module.scss';
import classNames from 'classnames';
import { type FunctionComponent, useEffect, useMemo, useState } from 'react';

import { AutomatedIntegratedCharts } from './AutomatedIntegratedCharts';
import { AutomatedRowGrouping } from './AutomatedRowGrouping';
import type { LogLevel } from './lib/scriptDebugger';

export const AutomatedExamples: FunctionComponent = () => {
    const [isCI, setIsCI] = useState(false);
    const [runOnce, setRunOnce] = useState(false);
    const automatedExampleManager = useMemo(
        () =>
            createAutomatedExampleManager({
                debugCanvasClassname: styles.automatedExampleDebugCanvas,
                debugPanelClassname: styles.automatedExampleDebugPanel,
            }),
        []
    );

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const debugValue = searchParams.get('debug');
        const debugLogLevel = searchParams.get('debugLogLevel') as LogLevel;
        setIsCI(searchParams.get('isCI') === 'true');
        setRunOnce(searchParams.get('runOnce') === 'true');

        automatedExampleManager.setDebugEnabled(Boolean(debugValue));
        automatedExampleManager.setDebugLogLevel(debugLogLevel);
        automatedExampleManager.setDebugInitialDraw(debugValue === 'draw');
    }, []);

    return (
        <>
            <section className={styles.automatedRowGroupingOuter}>
                <div className={classNames('layout-max-width-small', styles.homepageExample)}>
                    <div className={styles.automatedRowGrouping}>
                        <AutomatedRowGrouping
                            automatedExampleManager={automatedExampleManager}
                            useStaticData={isCI}
                            runOnce={runOnce}
                            visibilityThreshold={0.2}
                            darkMode={true}
                        />
                    </div>
                </div>
            </section>

            <section className={styles.automatedIntegratedChartsOuter}>
                <div className={classNames('layout-max-width-small', styles.homepageExample)}>
                    <div className={styles.automatedIntegratedCharts}>
                        <AutomatedIntegratedCharts
                            automatedExampleManager={automatedExampleManager}
                            useStaticData={isCI}
                            runOnce={runOnce}
                            visibilityThreshold={0.8}
                        />
                    </div>
                </div>
            </section>
        </>
    );
};
