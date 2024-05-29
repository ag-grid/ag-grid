import React from 'react';
import ReactDOM from 'react-dom/client';

import PortfolioExample from './components/portfolio-example/portfolio-example';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <PortfolioExample />
    </React.StrictMode>
);
