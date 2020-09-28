import React from "react";
import './menu.scss';

const displayMenuItems = () => {
    return <div>Item</div>;
}

export default function Menu() {
    return (
        <div className="menu_view">
            { displayMenuItems() }
        </div>
    )
}