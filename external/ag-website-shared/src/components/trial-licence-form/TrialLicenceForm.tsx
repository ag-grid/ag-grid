import type { FunctionComponent } from 'react';

import styles from './TrialLicenceForm.module.scss';

export const TrialLicenceForm: FunctionComponent = () => {
    return (
        <form className={styles.trailForm}>
            <div className={styles.inputs}>
                <div>
                    <label htmlFor="first-name">First Name</label>
                    <input type="text" id="first-name" name="first-name" required />
                </div>
                <div>
                    <label htmlFor="last-name">Last Name</label>
                    <input type="text" id="last-name" name="last-name" required />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" required />
                </div>
            </div>
            <button className={styles.submit} type="submit">
                Request a trial licence
            </button>
        </form>
    );
};
