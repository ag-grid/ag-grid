import { Alert } from '@ag-website-shared/components/alert/Alert';
import React from 'react';
import type { FunctionComponent } from 'react';

export const Alerts: FunctionComponent = () => {
    return (
        <>
            <h2>Alerts</h2>

            <Alert type="info">
                <p>
                    <b>I am a note</b>: Earum unde dolores sed similique ut dignissimos voluptatum iure quia. Nam
                    reiciendis doloribus. Blanditiis temporibus ducimus. Vel aspernatur sed quia quis id maxime rerum
                    numquam adipisci. Laudantium vel dolorum non.
                </p>
            </Alert>

            <Alert type="warning">
                <p>
                    <b>I am a warning</b>: Consequatur porro amet sunt omnis optio ipsam ad ut. Nobis porro quo sunt.
                    Natus ut quia et ea autem. Eaque consequatur est harum libero ipsa sit consequatur pariatur sit.
                </p>
            </Alert>

            <Alert type="idea">
                <p>
                    <b>I am an idea</b>: Labore tempore nihil aspernatur et repudiandae et vel. Autem illum deserunt
                    accusantium suscipit laboriosam magni totam corrupti aut. Repellat omnis nihil accusamus eius
                    laboriosam. Consequatur sit velit quas officiis delectus.
                </p>
            </Alert>
        </>
    );
};
