import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './matrix-table.module.scss';

const MatrixTable = ({ src, rootnode, columns, tree, booleanonly, childnode }) => {
    const { allFile: { nodes } } = useStaticQuery(graphql`
    {
        allFile(filter: { sourceInstanceName: { in: ["pages", "data"] }, relativePath: { regex: "/.json$/" } }) {
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
    const path = (!!rootnode && rootnode.split('.')) || '';

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
                    { columnNames.map(column => <th>{ renderEnterprise(column, tree, {}) }</th>) }
                </tr>
            </thead>
            <tbody>
                { processRows(rows, columnFields, tree, booleanonly, childnode, 0) }
            </tbody>
        </table>
    );
}

const renderFirstColumn = (column, tree, row, level) => {
    const name = tree ? wrapWithLink(renderEnterprise(column, tree, row), row.url) : column;
    return <span className={level > 2 ? `${styles['matrixTablePad'+ level]}` : null }>{ name }</span>
}

const renderEnterprise = (value, tree, row) => {
    const name = value.replace('<enterprise-icon></enterprise-icon>', '');
    if (name.length !== value.length || (tree && row.enterprise)) {
        return <React.Fragment>{name}<enterprise-icon></enterprise-icon></React.Fragment>
    }
    return name;
}

const renderNodeWithChildren = (value, tree, row, level) => {
    if (!value) return [];
    
    return [(
        <tr>
            <td colSpan="3">
                { level === 1 
                    ? <h3>{ value }</h3> 
                    : (
                        <span className={level > 2 ? `${styles['matrixTablePad' + level]}` : null }>
                            {wrapWithLink(renderEnterprise(value, tree, row), row.url)}
                        </span>
                    )
                }
            </td>
        </tr>
    )]
}

const wrapWithLink = (value, url) => <a href={url}>{value}</a>;

const processRows = (rows, columnFields, tree, booleanonly, childnode, level) => {
    return rows.reduce((allRows, nextRow) => {
        const exclude = tree && nextRow.title === 'See Also';
        if (tree && nextRow[childnode] && !nextRow.matrixExcludeChildren && !exclude) {
            const processedRows = processRows(nextRow[childnode], columnFields, tree, booleanonly, childnode, level + 1);
            const title = renderNodeWithChildren(nextRow.title, tree, nextRow, level);

            return allRows.concat(title, processedRows);
        }

        const newRows = (nextRow.matrixExclude || (nextRow.matrixExcludeChildren && !nextRow.url) || exclude) ? allRows : 
        allRows.concat(
        <tr>
            {
                columnFields.map((column, idx) => {
                    const match = column.match(/not\((.*)\)/);
                    let fieldName = match ? match[1] : column;

                    return (
                        <td>{
                            idx === 0 
                                ? renderFirstColumn(nextRow[fieldName], tree, nextRow, level)
                                : renderValue(nextRow[fieldName], booleanonly, !!match)}
                        </td>
                    )
                })
            }
        </tr>)

        return newRows; 
    }, [])
}

const renderValue = (value, booleanonly, notIn) => {
    if (value === false || (value === true && notIn)) {
        return <FontAwesomeIcon icon={ faTimes } fixedWidth className={ styles.matrixTable__false } />
    }
    
    return (
        <div>
            <FontAwesomeIcon icon={ faCheck } fixedWidth className={ styles.matrixTable__true } />
            { typeof value === 'string' && !booleanonly ? value : null }
        </div>
    );
}

export default MatrixTable;