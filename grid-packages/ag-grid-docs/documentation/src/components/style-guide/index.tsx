import React from 'react';
import './style-guide.scss';

import { Typography } from './typography';
import { Buttons } from './buttons';
import { Form } from './form';
import { Tables } from './tables';
import { Loading } from './loading';
import { Color } from './color';


const SECTIONS = [
    {
        groupName: 'Base',
    },
    {
        id: 'typography',
        name: 'Typography',
        content: <Typography />
    },
    {
        id: 'color',
        name: 'Color',
        content: <Color />
    },
    {
        groupName: 'HTML Elements',
    },
    {
        id: 'text',
        name: 'Text Elements',
        content: <Buttons />
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
        groupName: 'Components',
    },
    {
        name: 'Example components',
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
                    {SECTIONS.filter(({ groupName }) => {
                        return !groupName;
                    }).map(({ id, name, content }) => {
                        return (
                            <section id={id}>
                                <h2>{name}</h2>
                                {content}
                            </section>
                        );
                    })}
                </main>

                <aside>
                    <ul className="list-style-none">
                        {SECTIONS.map(({ id, name, groupName }) => {
                            return <li className={groupName ? 'group-name': ''}>{groupName ? <span>{groupName}</span> : <a href={`#${id}`}>{name}</a>}</li>;
                        })}
                    </ul>
                </aside>
            </div>
        </div>
    );
};
