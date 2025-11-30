import { Icon } from '@ag-website-shared/components/icon/Icon';
import { useRef, useState } from 'react';

import styles from './InstallText.module.scss';

const PLAUSIBLE_EVENT_NAME = 'copy-install-code';

interface InstallTextProps {
    packageName: string;
    plausibleEventName?: string;
}

const InstallText = ({ packageName }: InstallTextProps) => {
    const [isCopied, setIsCopied] = useState(false);
    const installTextRef = useRef<HTMLSpanElement>(null);

    const copyToClipboard = () => {
        const text = installTextRef?.current?.innerText?.replace('$', '').trim();
        navigator.clipboard.writeText(text || '').then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <>
            <span ref={installTextRef} className={styles.installText}>
                $ npm install {packageName}
            </span>
            <span
                id="copy-install-code"
                className={`plausible-event-name=${PLAUSIBLE_EVENT_NAME}`}
                onClick={copyToClipboard}
            >
                <Icon svgClasses={styles.copyToClipboardIcon} name={isCopied ? 'tick' : 'copy'} />
            </span>
        </>
    );
};

export default InstallText;
