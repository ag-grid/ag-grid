import { Icon } from '@ag-website-shared/components/icon/Icon';
import { useRef, useState } from 'react';

import styles from './InstallText.module.scss';

interface InstallTextProps {
    packageName: string;
}

export function InstallText({ packageName }: InstallTextProps) {
    const [iconState, setIconState] = useState<'copy' | 'animating' | 'tick'>('copy');
    const installTextRef = useRef<HTMLSpanElement>(null);

    const installCommand = `npm install ${packageName}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(installCommand).then(() => {
            setIconState('animating');

            setTimeout(() => {
                setIconState('tick');

                setTimeout(() => {
                    setIconState('copy');
                }, 2000);
            }, 200);
        });
    };

    return (
        <div className={styles.installTextContainer} onClick={copyToClipboard}>
            <span ref={installTextRef} className={styles.installText}>
                <span className={styles.installCommand}>
                    <span className={styles.noSelection}>$ </span>
                    {installCommand}
                </span>
            </span>

            <span className={`${styles.copyButton} ${styles.copyIconAnimationContainer}`}>
                {iconState === 'copy' && (
                    <Icon key="copy-icon" svgClasses={`${styles.copyToClipboardIcon} ${styles.copyIcon}`} name="copy" />
                )}
                {iconState === 'animating' && <div className={styles.iconPlaceholder}></div>}
                {iconState === 'tick' && (
                    <Icon key="tick-icon" svgClasses={`${styles.copyToClipboardIcon} ${styles.tickIcon}`} name="tick" />
                )}
            </span>
        </div>
    );
}
