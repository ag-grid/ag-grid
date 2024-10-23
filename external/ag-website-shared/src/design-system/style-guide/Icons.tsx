import { ICON_MAP, Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import React from 'react';
import type { FunctionComponent } from 'react';

import styles from './StyleGuide.module.scss';

export const Icons: FunctionComponent = () => {
    return (
        <>
            <h2>Icons</h2>
            <code>{`<Icon name="eye" />`}</code>

            <div className={styles.iconsList}>
                {Object.keys(ICON_MAP).map((iconName) => {
                    return (
                        <div key={iconName}>
                            <Icon name={iconName} />
                            <code>{iconName}</code>
                        </div>
                    );
                })}
            </div>

            <div className={styles.iconsElementsList}>
                <span>
                    Span with icon <Icon name="eye" />
                </span>
                <button>
                    Button with icon <Icon name="eye" />
                </button>
                <button className="button-secondary">
                    Secondary Button with icon <Icon name="eye" />
                </button>
                <button className="button-tertiary">
                    Tertiary Button with icon <Icon name="eye" />
                </button>
                <a href="#">
                    Link with icon <Icon name="eye" />
                </a>
            </div>

            <div className={styles.iconsElementsList}>
                <span className={styles.iconsSpan}>
                    Styled span with icon <Icon name="eye" />
                </span>
                <button className={styles.iconsButton}>
                    Styled button with icon <Icon name="eye" />
                </button>
                <button className={classnames(styles.iconsButton, 'button-secondary')}>
                    Styled Secondary Button with icon <Icon name="eye" />
                </button>
                <button className={classnames(styles.iconsButton, 'button-tertiary')}>
                    Styled Tertiary Button with icon <Icon name="eye" />
                </button>
                <a href="#" className={styles.iconsLink}>
                    Styled link with icon <Icon name="eye" />
                </a>
            </div>
        </>
    );
};
