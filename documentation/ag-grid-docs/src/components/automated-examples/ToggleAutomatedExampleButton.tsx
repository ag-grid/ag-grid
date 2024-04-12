import { Icon } from '@ag-website-shared/components/icon/Icon';
import styles from '@legacy-design-system/modules/ToggleAutomatedExampleButton.module.scss';
import classnames from 'classnames';
import { type FunctionComponent } from 'react';

interface Props {
    isHoveredOver: boolean;
    onClick?: () => void;
    scriptIsActive: boolean;
}

export const ToggleAutomatedExampleButton: FunctionComponent<Props> = ({ isHoveredOver, onClick, scriptIsActive }) => {
    return (
        <span className={styles.buttonOuter}>
            <button
                className={classnames(styles.button, 'text-xl', {
                    hover: isHoveredOver,
                    [styles.isActive]: scriptIsActive,
                })}
                onClick={() => {
                    onClick && onClick();
                }}
            >
                <span className={styles.controlInner}>
                    Give me control <Icon name="takeControl" />{' '}
                </span>

                <span className={styles.replayInner}>
                    Replay demo <Icon name="replaydemo" />{' '}
                </span>
            </button>
        </span>
    );
};
