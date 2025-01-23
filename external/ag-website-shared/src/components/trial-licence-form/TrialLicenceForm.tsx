import type { FunctionComponent } from 'react';

import styles from './TrialLicenceForm.module.scss';

export const TrialLicenceForm: FunctionComponent = () => {
    return (
        <form className={styles.trailForm}>
            <div className={styles.inputs}>
                <div className="input-field">
                    <label htmlFor="first-name">First Name</label>
                    <input placeholder="First Name" type="text" id="first-name" name="first-name" required />
                </div>
                <div className="input-field">
                    <label htmlFor="last-name">Last Name</label>
                    <input placeholder="Last Name" type="text" id="last-name" name="last-name" required />
                </div>
                <div className={`input-field ${styles.emailField}`}>
                    <label htmlFor="email">Email</label>
                    <input placeholder="Email" type="email" id="email" name="email" required />
                </div>
            </div>
            <button className={styles.submit} type="submit">
                Request a trial licence
            </button>
        </form>
    );
};
