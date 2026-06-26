import classnames from 'classnames';
import type { FunctionComponent } from 'react';

import styles from './ButtonGroup.module.scss';

export type ButtonType = {
    text: string;
    className?: string;
    onClick?: () => void;
    active?: boolean;
};

interface Props {
    buttons: ButtonType[];
    preText?: string;
    className?: string;
}

const ButtonGroup: FunctionComponent<Props> = ({ preText, buttons, className }) => {
    return (
        <section className={classnames(styles.buttonGroupContainer, className)}>
            {preText && preText}
            <div className={styles.buttonGroup}>
                {buttons.map(({ text, className: buttonClassName, onClick, active }) => (
                    <button
                        key={text}
                        className={classnames(styles.groupButton, 'button-secondary', buttonClassName, {
                            [styles.active]: active,
                        })}
                        onClick={onClick}
                        aria-label={text}
                    >
                        {text}
                    </button>
                ))}
            </div>
        </section>
    );
};

export default ButtonGroup;
