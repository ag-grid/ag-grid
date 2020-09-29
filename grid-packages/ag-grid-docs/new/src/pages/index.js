import React from "react";
import './index.scss';

export default function Home() {
  return <div style={{ textAlign: 'center' }}>
    <h1>Welcome to the AG-Grid documentation</h1>

    <p>Which framework would you like to learn?</p>

    <div className="getting-started-cards">
      {['javascript', 'angular', 'react', 'vue'].map(framework => (
        <div key={framework} className="getting-started-card">
          <img alt={framework} src={`fw-logos/${framework}.svg`} className="getting-started-card__logo" />
          <div ckass="getting-started-body">
            <a href={`/${framework}/getting-started`} className="getting-started-card__button">Get started</a>
          </div>
        </div>
      ))}
    </div>
  </div>;
}
