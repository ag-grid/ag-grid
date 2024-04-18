import LogoMark from '@components/logo/LogoMark';
import { useEffect, useState } from 'react';

import styles from './FigmaPreview.module.scss';

const previewSrc =
    'https://www.figma.com/embed?embed_host=fastma&community_viewer=true&hub_file_id=1360600846643230092';

// We can't get the actual loading state from the Figma iFrame.
// Set a 'sensible' delay for the Figma preview to load.
const fauxLoadingDelay = 7000;

export const FigmaPreview = () => {
    const [showLoading, setShowLoading] = useState(true);

    useEffect(() => {
        const loadingTimeout = setTimeout(() => {
            setShowLoading(false);
        }, fauxLoadingDelay);

        return () => {
            clearTimeout(loadingTimeout);
        };
    }, []);

    return (
        <div className={styles.previewOuter}>
            <iframe className={styles.previewIframe} src={previewSrc}></iframe>

            {showLoading && (
                <div className={styles.loading} style={{ '--faux-loading-delay': `${fauxLoadingDelay}ms` }}>
                    <LogoMark className={styles.spinner} isSpinning />
                </div>
            )}
        </div>
    );
};
