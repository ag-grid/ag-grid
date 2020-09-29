import React from "react";
import FrameworkSelector from '../components/FrameworkSelector';
import Menu from '../components/Menu';
import './index.scss';

export default function Layout({ path, children, pageContext: { framework } }) {
    return <div className="main_container">
        <div className="header">
            <a href="/" className="header__logo"></a>

            <FrameworkSelector path={path} currentFramework={framework} />
        </div>
        <div className="content_viewport">
            {
                framework && (
                    <div className="main_menu">
                        <Menu currentFramework={framework} />
                    </div>
                )
            }
            <div className="content container">
                {children}
            </div>
        </div>
        <div className="footer">
            &copy; AG-Grid Ltd 2020
        </div>
    </div>;
}