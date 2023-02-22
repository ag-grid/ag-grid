import React from 'react';

export const Containers = () => {
    return (
        <>
            <p className="item-label">
                <span>Card:</span>
                <code>.card</code>
            </p>

            {/* `.ag-card` used because of bootstrap clash with `.card`. (.ag-styles issue)*/}
            <div className="ag-card">
                <header>
                    <h3>Card header example</h3>
                </header>

                <div className="content">
                    <p>
                        <b>Example content:</b> Non aut explicabo enim vel quos porro repellendus iure. Dolor sed
                        provident aut consequatur in.
                    </p>

                    <ul>
                        <li>
                            Boston's most advanced compression wear technology increases muscle oxygenation, stabilizes
                            active muscles
                        </li>
                        <li>
                            New ABC 13 9370, 13.3, 5th Gen CoreA5-8250U, 8GB RAM, 256GB SSD, power UHD Graphics, OS 10
                            Home, OS Office A & J 2016
                        </li>
                        <li>
                            Ergonomic executive chair upholstered in bonded black leather and PVC padded seat and back
                            for all-day comfort and support
                        </li>
                        <li>
                            Andy shoes are designed to keeping in mind durability as well as trends, the most stylish
                            range of shoes & sandals
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};
