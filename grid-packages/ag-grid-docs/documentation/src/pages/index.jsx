import React from 'react';
import { Link } from 'gatsby';
import styles from './index.module.scss';
import fwLogos from '../images/fw-logos';
import supportedFrameworks from '../utils/supported-frameworks';

const HomePage = () =>
  <div style={{ textAlign: 'center' }}>
    <h1>Welcome to the AG-Grid documentation</h1>

    <p>Which framework would you like to learn?</p>

    <div className={styles['getting-started']}>
      {supportedFrameworks.map(framework => (
        <div key={framework} className={styles['getting-started__card']}>
          <img alt={framework} src={fwLogos[framework]} className={styles['getting-started__card__logo']} />
          <div>
            <Link to={`/${framework}/getting-started/`} className={styles['getting-started__card__button']}>Get started</Link>
          </div>
        </div>
      ))}
    </div>
  </div>;

export default HomePage;