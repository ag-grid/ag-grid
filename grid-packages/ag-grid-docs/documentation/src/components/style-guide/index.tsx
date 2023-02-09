import React, { ReactElement } from 'react';
import { Buttons } from './buttons';
import { Color } from './color';
import { Containers } from './containers';
import { Form } from './form';
import { Sizes } from './sizes';
import './style-guide.scss';
import { Tables } from './tables';
import { TextElements } from './textElements';
import { Typography } from './typography';

interface Section {
    id: string;
    name: string;
    content: ReactElement;
}

interface SectionGroup {
    groupName: string;
    children: Section[];
}

const SECTIONS: SectionGroup[] = [
    {
        groupName: 'Base',
        children: [
            {
                id: 'typography',
                name: 'Typography',
                content: <Typography />,
            },
            {
                id: 'color',
                name: 'Color',
                content: <Color />,
            },
            {
                id: 'sizes',
                name: 'Sizes',
                content: <Sizes />,
            },
        ],
    },
    {
        groupName: 'HTML Elements',
        children: [
            {
                id: 'text',
                name: 'Text Elements',
                content: <TextElements />,
            },
            {
                id: 'buttons',
                name: 'Buttons',
                content: <Buttons />,
            },
            {
                id: 'form',
                name: 'Form elements',
                content: <Form />,
            },
            {
                id: 'tables',
                name: 'Tables',
                content: <Tables />,
            },
        ],
    },
    {
        groupName: 'Components',
        children: [
            {
                id: 'containers',
                name: 'Containers',
                content: <Containers />,
            },
        ],
    },
];

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
                            <section key={id} id={id}>
                                <h2>{name}</h2>
                                {content}
                            </section>
                        );
                    })}
                </main>

                <aside>
                    <ul className="list-style-none">
                        {SECTIONS.map(({ groupName, children }) => {
                            return (
                                <React.Fragment key={groupName}>
                                    <li className="group-name">{groupName}</li>
                                    {children.map(({ id, name }) => {
                                        return (
                                            <li key={id}>
                                                <a href={`#${id}`}>{name}</a>
                                            </li>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </ul>
                </aside>
            </div>
        </div>
    );
};
