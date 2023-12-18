import React from 'react';
import type { FunctionComponent } from 'react';

import styles from './StyleGuide.module.scss';

export const Inputs: FunctionComponent = () => {
    return (
        <>
            <h2>Inputs</h2>

            <div className={styles.inputsOuter}>
                <div className={styles.inputsList}>
                    <div>
                        <label>Placeholder:</label>
                        <input type="text" placeholder="Enter email" />
                    </div>
                    <div>
                        <label>Filled:</label>
                        <input type="text" defaultValue="joe@ag-grid.com" />
                    </div>
                    <div>
                        <label>Hover:</label>
                        <input className="hover" type="text" defaultValue="joe@ag-grid.com" />
                    </div>
                    <div>
                        <label>Focused:</label>
                        <input className="focus" type="text" defaultValue="joe@ag-grid.com" />
                    </div>

                    <div>
                        <label>Disabled:</label>
                        <input className="disabled" type="text" defaultValue="joe@ag-grid.com" />
                    </div>
                </div>

                <div className={styles.checkboxList}>
                    <div>
                        <label>Default:</label>
                        <input type="checkbox" />
                    </div>
                    <div>
                        <label>Checked:</label>
                        <input type="checkbox" defaultChecked />
                    </div>
                    <div>
                        <label>Hover:</label>
                        <input type="checkbox" className="hover" />
                    </div>
                    <div>
                        <label>Focus:</label>
                        <input type="checkbox" className="focus" />
                    </div>
                    <div>
                        <label>Disabled:</label>
                        <input type="checkbox" disabled />
                    </div>
                </div>

                <div className={styles.radioList}>
                    <div>
                        <label>Default:</label>
                        <input type="radio" />
                    </div>
                    <div>
                        <label>Checked:</label>
                        <input type="radio" defaultChecked />
                    </div>
                    <div>
                        <label>Hover:</label>
                        <input type="radio" className="hover" />
                    </div>
                    <div>
                        <label>Focus:</label>
                        <input type="radio" className="focus" />
                    </div>
                    <div>
                        <label>Disabled:</label>
                        <input type="radio" disabled />
                    </div>
                </div>

                <div className={styles.switchList}>
                    <div>
                        <label>Default:</label>
                        <input type="checkbox" className="switch" />
                    </div>
                    <div>
                        <label>Checked:</label>
                        <input type="checkbox" className="switch" defaultChecked />
                    </div>
                    <div>
                        <label>Hover:</label>
                        <input type="checkbox" className="switch hover" />
                    </div>
                    <div>
                        <label>Focus:</label>
                        <input type="checkbox" className="switch focus" />
                    </div>
                    <div>
                        <label>Disabled:</label>
                        <input type="checkbox" className="switch" disabled />
                    </div>
                </div>

                <div className={styles.selectList}>
                    <div>
                        <label>Default:</label>
                        <select>
                            <option>Select</option>
                            <option>Option one</option>
                            <option>Option two</option>
                            <option>Option three</option>
                        </select>
                    </div>
                    <div>
                        <label>Hover:</label>
                        <select className="hover">
                            <option>Select</option>
                            <option>Option one</option>
                            <option>Option two</option>
                            <option>Option three</option>
                        </select>
                    </div>
                    <div>
                        <label>Focus:</label>
                        <select className="focus">
                            <option>Select</option>
                            <option>Option one</option>
                            <option>Option two</option>
                            <option>Option three</option>
                        </select>
                    </div>
                    <div>
                        <label>Disabled:</label>
                        <select disabled>
                            <option>Select</option>
                            <option>Option one</option>
                            <option>Option two</option>
                            <option>Option three</option>
                        </select>
                    </div>
                </div>
            </div>
        </>
    );
};
