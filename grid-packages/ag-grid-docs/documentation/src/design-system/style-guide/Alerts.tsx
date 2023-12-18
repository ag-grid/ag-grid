import Idea from '@components/alert/Idea';
import Note from '@components/alert/Note';
import Warning from '@components/alert/Warning';
import type { FunctionComponent } from 'react';

import styles from './StyleGuide.module.scss';

export const Alerts: FunctionComponent = () => {
    return (
        <>
            <h2>Alerts</h2>

            <Note>
                <p>
                    <b>I am a note</b>: Earum unde dolores sed similique ut dignissimos voluptatum iure quia. Nam
                    reiciendis doloribus. Blanditiis temporibus ducimus. Vel aspernatur sed quia quis id maxime rerum
                    numquam adipisci. Laudantium vel dolorum non.
                </p>
            </Note>

            <Warning>
                <p>
                    <b>I am a warning</b>: Consequatur porro amet sunt omnis optio ipsam ad ut. Nobis porro quo sunt.
                    Natus ut quia et ea autem. Eaque consequatur est harum libero ipsa sit consequatur pariatur sit.
                </p>
            </Warning>

            <Idea>
                <p>
                    <b>I am an idea</b>: Labore tempore nihil aspernatur et repudiandae et vel. Autem illum deserunt
                    accusantium suscipit laboriosam magni totam corrupti aut. Repellat omnis nihil accusamus eius
                    laboriosam. Consequatur sit velit quas officiis delectus.
                </p>
            </Idea>
        </>
    );
};
