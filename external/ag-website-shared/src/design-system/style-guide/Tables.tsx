import React from 'react';
import type { FunctionComponent } from 'react';

export const Tables: FunctionComponent = () => {
    return (
        <>
            <h2>Tables</h2>
            <code>{`<table>`}</code>
            <figure>
                <table role="grid">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Year</th>
                            <th scope="col">Month</th>
                            <th scope="col">Day</th>
                            <th scope="col">Hour</th>
                            <th scope="col">Minute</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td scope="row" data-column="#">
                                1
                            </td>
                            <td data-column="Year">2023</td>
                            <td data-column="Month">January</td>
                            <td data-column="Day">
                                24<sup>th</sup>
                            </td>
                            <td data-column="Hour">12</td>
                            <td data-column="Minute">42</td>
                        </tr>
                        <tr>
                            <td scope="row" data-column="#">
                                2
                            </td>
                            <td data-column="Year">1997</td>
                            <td data-column="Month">October</td>
                            <td data-column="Day">
                                3<sup>rd</sup>
                            </td>
                            <td data-column="Hour">09</td>
                            <td data-column="Minute">12</td>
                        </tr>
                        <tr>
                            <td scope="row" data-column="#">
                                2
                            </td>
                            <td data-column="Year">2096</td>
                            <td data-column="Month">March</td>
                            <td data-column="Day">
                                31<sup>st</sup>
                            </td>
                            <td data-column="Hour">18</td>
                            <td data-column="Minute">55</td>
                        </tr>
                    </tbody>
                </table>
            </figure>
            <code>{`<table class="small-header no-zebra">`}</code>
            <figure>
                <table role="grid" className="small-header no-zebra">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Year</th>
                            <th scope="col">Month</th>
                            <th scope="col">Day</th>
                            <th scope="col">Hour</th>
                            <th scope="col">Minute</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td scope="row" data-column="#">
                                1
                            </td>
                            <td data-column="Year">2023</td>
                            <td data-column="Month">January</td>
                            <td data-column="Day">
                                24<sup>th</sup>
                            </td>
                            <td data-column="Hour">12</td>
                            <td data-column="Minute">42</td>
                        </tr>
                        <tr>
                            <td scope="row" data-column="#">
                                2
                            </td>
                            <td data-column="Year">1997</td>
                            <td data-column="Month">October</td>
                            <td data-column="Day">
                                3<sup>rd</sup>
                            </td>
                            <td data-column="Hour">09</td>
                            <td data-column="Minute">12</td>
                        </tr>
                        <tr>
                            <td scope="row" data-column="#">
                                2
                            </td>
                            <td data-column="Year">2096</td>
                            <td data-column="Month">March</td>
                            <td data-column="Day">
                                31<sup>st</sup>
                            </td>
                            <td data-column="Hour">18</td>
                            <td data-column="Minute">55</td>
                        </tr>
                    </tbody>
                </table>
            </figure>
            <code>{`<table class="stack>`}</code> / <code>{`table { @incldue stack-table(); }`}</code>
            <figure style={{ maxWidth: '300px' }}>
                <table role="grid" className="stack">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Year</th>
                            <th scope="col">Month</th>
                            <th scope="col">Day</th>
                            <th scope="col">Hour</th>
                            <th scope="col">Minute</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td scope="row" data-column="#">
                                1
                            </td>
                            <td data-column="Year">2023</td>
                            <td data-column="Month">January</td>
                            <td data-column="Day">
                                24<sup>th</sup>
                            </td>
                            <td data-column="Hour">12</td>
                            <td data-column="Minute">42</td>
                        </tr>
                        <tr>
                            <td scope="row" data-column="#">
                                2
                            </td>
                            <td data-column="Year">1997</td>
                            <td data-column="Month">October</td>
                            <td data-column="Day">
                                3<sup>rd</sup>
                            </td>
                            <td data-column="Hour">09</td>
                            <td data-column="Minute">12</td>
                        </tr>
                        <tr>
                            <td scope="row" data-column="#">
                                2
                            </td>
                            <td data-column="Year">2096</td>
                            <td data-column="Month">March</td>
                            <td data-column="Day">
                                31<sup>st</sup>
                            </td>
                            <td data-column="Hour">18</td>
                            <td data-column="Minute">55</td>
                        </tr>
                    </tbody>
                </table>
            </figure>
        </>
    );
};
