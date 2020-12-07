import React, { useState } from 'react';
import { Link } from 'gatsby';
import styles from './index.module.scss';
import fwLogos from '../images/fw-logos';
import supportedFrameworks from '../utils/supported-frameworks';

const backgroundColor = {
    javascript: '#f8df1e',
    angular: '#1976d3',
    react: '#282c34',
    vue: '#50c297'
};

const logos = {
    javascript: fwLogos.javascript,
    angular: fwLogos.angular,
    react: fwLogos.react,
    vue: fwLogos.vueInverted
}


const HomePage = () => {
    const [currentFramework, setFramework] = useState('javascript');
    const updateFramework = (e, framework) => {
        if (typeof e === 'keydown') {
            if (e.key !== 'Enter' || e.key !== 'Space') {
                return;
            }
        }

        setFramework(framework);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Welcome to the AG-Grid documentation</h1>
            <p>Which framework would you like to learn?</p>

            <div className={styles['getting-started']}>
            {supportedFrameworks.map(framework => {
                const cardBackgroundColor = backgroundColor[framework];

                let cardClass = styles['getting-started__card'];

                if (framework === currentFramework) {
                    cardClass += ` ${styles['getting-started__card__selected']}`;
                }

                return (
                    <div key={framework}
                        className={ cardClass }
                        tabindex="0"
                        onKeyDown={(e) => updateFramework(e, framework)} onClick={(e) => updateFramework(e, framework)}>
                        <div className={ styles['getting-started__card__logo-container'] } style={{ backgroundColor: cardBackgroundColor }}>
                            <img alt={framework} src={ logos[framework] } className={ styles['getting-started__card__logo'] } />
                        </div>
                        <div className={ styles['getting-started__card__header'] }>
                            <Link to={`/${framework}/getting-started/`} className={ styles['getting-started__card__button'] }>Get started</Link>
                        </div>
                    </div>
                );
            })}
            </div>
        </div>
    );
};

export default HomePage;