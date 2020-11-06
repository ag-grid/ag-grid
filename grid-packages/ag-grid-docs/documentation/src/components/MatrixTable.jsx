import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './matrix-table.module.scss';

const MatrixTable = ({ src, rootnode, columns }) => {
    const { allFile: { nodes } } = useStaticQuery(graphql`
    {
        allFile(filter: { sourceInstanceName: { eq: "pages" }, relativePath: { regex: "/.json$/" } }) {
            nodes {
                relativePath
                internal {
                    content
                }
            }
        }
    }
    `);
    columns = JSON.parse(columns);
    const columnFields = Object.keys(columns);
    const columnNames = columnFields.map(column => columns[column]);
    const file = JSON.parse(nodes.find(node => node.relativePath === src).internal.content);
    const path = rootnode.split('.');

    let rows = file;
    let currentPath;

    while(path.length) {
        currentPath = path.pop()
        rows = file[currentPath];
    }

    return (
        <table className={styles.matrixTable}>
            <thead>
                <tr>
                    {columnNames.map(column => <th>{ column }</th>)}
                </tr>
            </thead>
            <tbody>
                {rows.map(row => (
                    <tr>
                    {columnFields.map((column, idx) => (
                        <td>{idx === 0 ? row[column] : renderValue(row[column])}</td>
                    ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

const renderValue = (value) => {
    if (value === false) {
        return <FontAwesomeIcon icon={ faTimes } fixedWidth className={ styles.matrixTable__false } />
    }
    
    return (
        <div>
            <FontAwesomeIcon icon={ faCheck } fixedWidth className={ styles.matrixTable__true } />
            { typeof value === 'string' ? value : null }
        </div>
    );
}

export default MatrixTable;