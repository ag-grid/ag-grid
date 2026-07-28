import classnames from 'classnames';
import type { ComponentPropsWithRef, FunctionComponent, ReactNode } from 'react';

import styles from './ConsentCheckbox.module.scss';

interface Props {
    id: string;
    label: ReactNode;
    /** Validation message; presence of a message puts the field into its error state */
    error?: string;
    inputProps: ComponentPropsWithRef<'input'>;
}

export const ConsentCheckbox: FunctionComponent<Props> = ({ id, label, error, inputProps }: Props) => {
    return (
        <div className={classnames('input-field', { 'input-error': error })}>
            <label className={styles.consentLabel} htmlFor={id}>
                <input type="checkbox" id={id} {...inputProps} />
                <span>{label}</span>
            </label>
            <div className={styles.errorContainer}>{error && <p className="error">{error}</p>}</div>
        </div>
    );
};
