import React from 'react';
import type { FunctionComponent } from 'react';

import styles from './StyleGuide.module.scss';

export const Buttons: FunctionComponent = () => {
    return (
        <>
            <h2>Buttons</h2>

            <div className={styles.buttonExamples}>
                <label>Default: </label>
                <button>Primary</button>
                <button className="button-secondary">Secondary</button>
                <button className="button-tertiary">Tertiary</button>
                <button className="button-as-link">Button as link</button>
                <button className="button-style-none">Button style none</button>
            </div>

            <div className={styles.buttonExamples}>
                <label>Hover: </label>
                <button className="hover">Primary</button>
                <button className="button-secondary hover">Secondary</button>
                <button className="button-tertiary hover">Tertiary</button>
                <button className="button-as-link hover">Button as link</button>
                <button className="button-style-none hover">Button style none</button>
            </div>

            <div className={styles.buttonExamples}>
                <label>Focus: </label>
                <button className="focus">Primary</button>
                <button className="button-secondary focus">Secondary</button>
                <button className="button-tertiary focus">Tertiary</button>
                <button className="button-as-link focus">Button as link</button>
                <button className="button-style-none focus">Button style none</button>
            </div>

            <div className={styles.buttonExamples}>
                <label>Disabled: </label>
                <button disabled>Primary</button>
                <button className="button-secondary" disabled>
                    Secondary
                </button>
                <button className="button-tertiary" disabled>
                    Tertiary
                </button>
                <button className="button-as-link" disabled>
                    Button as link
                </button>
                <button className="button-style-none" disabled>
                    Button style none
                </button>
            </div>

            <div className={styles.buttonExamples}>
                <label>Aria Disabled: </label>
                <button disabled>Primary</button>
                <button className="button-secondary" aria-disabled>
                    Secondary
                </button>
                <button className="button-tertiary" aria-disabled>
                    Tertiary
                </button>
                <button className="button-as-link" aria-disabled>
                    Button as link
                </button>
                <button className="button-style-none" aria-disabled>
                    Button style none
                </button>
            </div>
        </>
    );
};
