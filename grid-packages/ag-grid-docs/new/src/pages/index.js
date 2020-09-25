import React from "react";
import Layout from '../components/layout';
import './index.css';

export default function Home() {
  return <Layout>
    <div style={{ textAlign: 'center' }}>
      <h1>Welcome to the AG-Grid documentation</h1>

      <p>Which framework would you like to learn?</p>

      <div className="getting-started-cards">
        {['javascript', 'angular', 'react', 'vue'].map(framework => <div key={framework} className="getting-started-card">
          <img alt={framework} src={`fw-logos/${framework}.svg`} className="getting-started-card__logo" /><br />
          <a href={`/${framework}/getting-started`} className="getting-started-card__button">Get started</a>
        </div>)}
      </div>
    </div>
  </Layout>;
}
