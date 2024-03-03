import { FRAMEWORKS } from '@constants';
import styles from '@design-system/modules/FrameworkSelectorInsideDocs.module.scss';
import fwLogos from '@images/fw-logos';
import { getFrameworkDisplayText } from '@utils/framework';
import classnames from 'classnames';

import { getNewFrameworkPath } from '../../utils/framework';

export const FrameworkSelectorInsideDocs = ({ path, currentFramework }) => {
    const handleFrameworkChange = (selectedFramework) => {
        const newUrl = getNewFrameworkPath({
            path,
            currentFramework,
            newFramework: selectedFramework,
        });

        window.location.href = newUrl;
    };

    const currentFrameworkLogo = currentFramework ? fwLogos[currentFramework] : null;

    return (
        <div className={classnames(styles.frameworkSelector)}>
            <div className={styles.selectFrameworkContainer}>
                {currentFrameworkLogo && (
                    <img src={currentFrameworkLogo} alt={`${currentFramework} logo`} className={styles.frameworkLogo} />
                )}
                <span classnames={styles.divider}></span>
                <select
                    value={currentFramework}
                    onChange={(event) => handleFrameworkChange(event.target.value)}
                    onClick={(event) => event.stopPropagation()} // Prevent event propagation
                    className={styles.select}
                    aria-label="Framework selector"
                >
                    {FRAMEWORKS.map((framework) => (
                        <option value={framework} key={framework}>
                            {getFrameworkDisplayText(framework)}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};
