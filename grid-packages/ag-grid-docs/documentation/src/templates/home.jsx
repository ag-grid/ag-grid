import React from 'react';
import { Link } from 'gatsby';
import styles from './home.module.scss';
import fwLogos from '../images/fw-logos';
import supportedFrameworks from '../utils/supported-frameworks';
import MenuView from '../components/menu-view/MenuView';

const backgroundColor = {
    javascript: '#f8df1e',
    angular: '#1976d3',
    react: '#282c34',
    vue: '#50c297'
};

const logos = (() => {
    const obj = {};

    for (let framework of supportedFrameworks) {
        obj[framework] = fwLogos[framework === 'vue' ? 'vueInverted' : framework];
    }
    return obj;
})();


const HomePage = ({ path, pageContext }) => {
    const { framework: currentFramework } = pageContext;
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
                    <Link key={framework}
                        className={ cardClass }
                        to={path.replace(`/${currentFramework}/`, `/${framework}/`)}>
                        <div className={ styles['getting-started__card__logo-container'] } style={{ backgroundColor: cardBackgroundColor }}>
                            <img alt={framework} src={ logos[framework] } className={ styles['getting-started__card__logo'] } />
                        </div>
                        <div className={ styles['getting-started__card__header'] }>
                            <Link to={`/${framework}/getting-started/`} className={ styles['getting-started__card__button'] }>Get started</Link>
                        </div>
                    </Link>
                );
            })}
            </div>
            <MenuView framework={currentFramework} />
        </div>
    );
};

export default HomePage;