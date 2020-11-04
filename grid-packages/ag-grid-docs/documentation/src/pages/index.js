import React from 'react';
import { Link, withPrefix } from 'gatsby';
import styles from './index.module.scss';

export default function Home() {
  return <div style={{ textAlign: 'center' }}>
    <h1>Welcome to the AG-Grid documentation</h1>

    <p>Which framework would you like to learn?</p>

    <div className={styles.gettingStartedCards}>
      {['javascript', 'angular', 'react', 'vue'].map(framework => (
        <div key={framework} className={styles.gettingStartedCard}>
          <img alt={framework} src={withPrefix(`/images/fw-logos/${framework}.svg`)} className={styles.gettingStartedCard__logo} />
          <div>
            <Link to={`/${framework}/getting-started/`} className={styles.gettingStartedCard__button}>Get started</Link>
          </div>
        </div>
      ))}
    </div>
  </div>;
}
