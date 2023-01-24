import React, { ReactElement } from 'react';
import './style-guide.scss';

import { Typography } from './typography';
import { Color } from './color';
import { TextElements } from './textElements';
import { Buttons } from './buttons';
import { Form } from './form';
import { Tables } from './tables';


interface Section {
    id: string,
    name: string,
    content: ReactElement
}

interface SectionGroup {
    groupName: string,
    children: Section[]
}

const SECTIONS: SectionGroup[] = [
    {
        groupName: 'Base',
        children: [
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
        ]
    },
    {
        groupName: 'HTML Elements',
        children: [
            {
                id: 'text',
                name: 'Text Elements',
                content: <TextElements />
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
        ]
    },
    {
        groupName: 'Components',
        children: [
            {
                id: 'example-components',
                name: 'Example components',
                content: <></>
            }
        ]
    },
]

export const StyleGuide = () => {
    const bodySections = SECTIONS.reduce<Section[]>((acc, value) => {
        return acc.concat(value.children);
    }, []);

    return (
        <div className="ag-styles">
            <div className="style-guide page-margin">
                <header>
                    <h1>AG Style Guide</h1>
                    <p>All elements and components used in the AG Style Guide.</p>
                </header>

                <main>
                    {bodySections.map(({ id, name, content }) => {
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
                        {SECTIONS.map(({ groupName, children }) => {
                            return <>
                                <li className='group-name'>{groupName}</li>
                                {children.map(({ id, name }) => {
                                    return <li><a href={`#${id}`}>{name}</a></li>
                                })}
                            </>;
                        })}
                    </ul>
                </aside>
            </div>
        </div>
    );
};
