import React from 'react';
import { Tabs } from '../tabs/Tabs';

export const Containers = () => {
    return (
        <>
            <p className="item-label">
                <span>Card:</span>
                <code>.card</code>
            </p>

            <div className="card">
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

            <p className="item-label">
                <span>Tabbed section:</span>
                <code>&lt;Tabs&gt;&lt;div tab-label="..."&gt;...&lt;/div&gt;&lt;/Tabs&gt;</code>
            </p>
            <Tabs>
                <div tab-label="Section ONE">
                    <b>Section ONE:</b> Et inventore est veniam expedita adipisci. Dolor rerum in ex illo. Rerum autem
                    deleniti aut eligendi tempora aliquam nihil id magnam. Porro eveniet quisquam voluptate labore
                    tempore saepe qui qui facilis.
                </div>
                <div tab-label="Section TWO">
                    <b>Section TWO:</b> Ut natus velit quaerat quas quis distinctio illo aut. Neque autem atque sunt
                    doloribus illum fuga quam est mollitia. Et molestiae quia vero quos ipsa est eius voluptates
                    repellendus. Placeat consequatur maiores provident.
                </div>
                <div tab-label="Section THREE">
                    <b>Section THREE:</b> Velit laboriosam sed numquam excepturi quam distinctio incidunt ut ut. Odit in
                    quia nemo officiis perferendis aspernatur animi molestiae. Quia recusandae dolorem hic repellat.
                </div>
            </Tabs>

            <p className="item-label">
                <span>Tabbed section with links:</span>
                <code>&lt;Tabs&gt;&lt;div tabs-links="true"&gt;...&lt;/div&gt;...&lt;/Tabs&gt;</code>
            </p>
            <Tabs>
                <div tabs-links="true">
                    <a href="https://ag-grid.com/">AG Grid</a>
                </div>
                <div tab-label="Section ONE">
                    <b>Section ONE:</b> Et inventore est veniam expedita adipisci. Dolor rerum in ex illo. Rerum autem
                    deleniti aut eligendi tempora aliquam nihil id magnam. Porro eveniet quisquam voluptate labore
                    tempore saepe qui qui facilis.
                </div>
                <div tab-label="Section TWO">
                    <b>Section TWO:</b> Ut natus velit quaerat quas quis distinctio illo aut. Neque autem atque sunt
                    doloribus illum fuga quam est mollitia. Et molestiae quia vero quos ipsa est eius voluptates
                    repellendus. Placeat consequatur maiores provident.
                </div>
                <div tab-label="Section THREE">
                    <b>Section THREE:</b> Velit laboriosam sed numquam excepturi quam distinctio incidunt ut ut. Odit in
                    quia nemo officiis perferendis aspernatur animi molestiae. Quia recusandae dolorem hic repellat.
                </div>
            </Tabs>
        </>
    );
};
