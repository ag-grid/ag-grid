import React from "react";
import FrameworkSelector from './FrameworkSelector';
import Menu from './Menu';
import './layout.scss';

export default function Layout({ children, framework }) {
    return <div className="main_container">
        <div className="header">
            <a href="/" className="header__logo"></a>

            <FrameworkSelector currentFramework={ framework } />
        </div>
        <div className="content_viewport">
            <div className="main_menu">
                <Menu currentFramework={ framework } />
            </div>
            <div className="content">
                {children}
            </div>
        </div>
        <div className="footer">

        </div>
    </div>;
}