import { navigate } from 'gatsby';
import classnames from 'classnames';
import React from 'react';
import fwLogos from 'images/fw-logos';
import styles from './FrameworkSelectorInsideDocs.module.scss';
import supportedFrameworks from "../utils/supported-frameworks";

export default function FrameworkSelectorInsideDocs({ path, currentFramework }) {
    const handleFrameworkChange = (event) => {
        const selectedFramework = event.target.value;
        navigate(path.replace(`/${currentFramework}-`, `/${selectedFramework}-`));
    };

    const currentFrameworkLogo = currentFramework ? fwLogos[currentFramework] : null;

    return (
        <div className={classnames(styles.frameworkSelector)}>
            <div className={styles.selectFrameworkContainer}>
                {currentFrameworkLogo && (
                    <img
                        src={currentFrameworkLogo}
                        alt={`${currentFramework} logo`}
                        className={styles.frameworkLogo}
                    />
                )}
                <select
                    value={currentFramework}
                    onChange={handleFrameworkChange}
                    className={styles.select}
                >
                    {supportedFrameworks.map(framework => (
                        <option value={framework} key={framework}>
                            {framework.charAt(0).toUpperCase() + framework.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
