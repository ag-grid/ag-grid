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
            {
                framework ? (
                    <div className="main_menu">
                        <Menu currentFramework={ framework } />
                    </div>
                ) : null
            }
            <div className="content container">
                {children}
            </div>
        </div>
        <div className="footer">

        </div>
    </div>;
}