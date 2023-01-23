import React from 'react';
import './style-guide.scss';

import { Typography } from './typography';
import { Buttons } from './buttons';
import { Form } from './form';
import { Tables } from './tables';
import { Article } from './article';
import { Progress } from './progress';
import { Loading } from './loading';
import { Color } from './color';

const SECTIONS = [
    {
        id: 'color',
        name: 'Color',
        content: <Color />
    },
    {
        id: 'typography',
        name: 'Typography',
        content: <Typography />
    },
    {
        id: 'buttons',
        name: 'Buttons',
        content: <Buttons />
    },
    {
        id: 'form',
        name: 'Form elements',
        content: <Form />
    },
    {
        id: 'tables',
        name: 'Tables',
        content: <Tables />
    },
    {
        id: 'article',
        name: 'Article',
        content: <Article />
    },
    {
        id: 'progress',
        name: 'Progress bar',
        content: <Progress />
    },
    {
        id: 'loading',
        name: 'Loading',
        content: <Loading />
    },
]

export const StyleGuide = () => {
    return (
        <div className="ag-styles">
            <div className="style-guide page-margin">
                <header>
                    <h1>AG Style Guide</h1>
                    <p>All elements and components used in the AG Style Guide.</p>
                </header>

                <main>
                    {SECTIONS.map(({ id, name, content }) => {
                        return <section id={id}>
                            <h2>{name}</h2>
                            {content}
                        </section>
                    })}
                </main>

                <aside>
                    <ul className="list-style-none">
                        {SECTIONS.map(({ id, name }) => {
                            return <li>
                                <a href={`#${id}`}>{name}</a>
                            </li>
                        })}
                    </ul>
                </aside>
            </div>
        </div>
    );
};
