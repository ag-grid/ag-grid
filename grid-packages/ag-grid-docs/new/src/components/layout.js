import React from "react";
import FrameworkSelector from './FrameworkSelector';
import './layout.scss';

export default function Layout({ children, framework }) {
    return <div className="container">
        <div className="header">
            <a href="/" className="header__logo"></a>

            <FrameworkSelector currentFramework={framework} />
        </div>
        <div className="content">
            {children}
        </div>
        <div className="footer">

        </div>
    </div>;
}