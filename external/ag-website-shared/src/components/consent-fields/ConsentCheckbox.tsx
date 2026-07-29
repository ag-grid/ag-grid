import classnames from 'classnames';
import type { ComponentPropsWithRef, FunctionComponent, ReactNode } from 'react';

import styles from './ConsentCheckbox.module.scss';

interface Props {
    id: string;
    label: ReactNode;
    /** Validation message; presence of a message puts the field into its error state */
    error?: string;
    /** Indents the field, for a checkbox only revealed by the one above it */
    nested?: boolean;
    inputProps: ComponentPropsWithRef<'input'>;
}

export const ConsentCheckbox: FunctionComponent<Props> = ({ id, label, error, nested, inputProps }: Props) => {
    const errorId = `${id}-error`;

    return (
        <div className={classnames('input-field', { 'input-error': error }, { [styles.nested]: nested })}>
            <label className={styles.consentLabel} htmlFor={id}>
                <input
                    type="checkbox"
                    id={id}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    {...inputProps}
                />
                <span>{label}</span>
            </label>
            <div className={styles.errorContainer}>
                {error && (
                    <p className="error" id={errorId} role="alert">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};
