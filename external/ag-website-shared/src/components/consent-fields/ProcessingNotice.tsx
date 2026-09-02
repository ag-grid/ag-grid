import type { FunctionComponent } from 'react';

import styles from './ProcessingNotice.module.scss';
import { PROCESSING_NOTICE } from './consentMessages';

export const ProcessingNotice: FunctionComponent = () => <p className={styles.processingNotice}>{PROCESSING_NOTICE}</p>;
