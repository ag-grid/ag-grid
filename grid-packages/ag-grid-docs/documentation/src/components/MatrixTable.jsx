import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useJsonFileNodes } from './use-json-file-nodes';
import styles from './MatrixTable.module.scss';

const MatrixTable = ({ src, rootnode: rootNode, columns, tree, booleanonly: booleanOnly, stringonly: stringOnly, childpropertyname: childPropertyName, showcondition: showCondition }) => {
    const nodes = useJsonFileNodes();
    const file = JSON.parse(nodes.find(node => node.relativePath === src).internal.content);
    const allRows = getRowsToProcess(file, rootNode, showCondition);
    const allColumns = JSON.parse(columns);

    return createTable(allColumns, allRows, tree, booleanOnly, stringOnly, childPropertyName);
};

const getRowsToProcess = (file, rootNode, showCondition) => {
    const path = (!!rootNode && rootNode.split('.')) || '';

    while (path.length) {
        file = file[path.pop()];
    }

    if (showCondition) {
        const isNotIn = showCondition.startsWith('notIn');
        let properties = showCondition.match(/\((\w+(?:,?\s*\w*)*)\)/);

        if (properties) {
            properties = properties[1].replace(/\s/g, '').split(',');
        }

        return !properties ? file : file.filter(row => {
            if (isNotIn) {
                return properties.every(property => !row[property]);
            }
            return properties.some(property => !!row[property]);
        });
    }

    return file;
};

const createTable = (allColumns, allRows, isTree, booleanOnly, stringOnly, childPropertyName) => {
    const columnFields = Object.keys(allColumns);
    const columnNames = columnFields.map(column => allColumns[column]);

    return (
        <table className={styles['matrix-table']}>
            <thead>
                <tr>
                    {columnNames.map((column, idx) => <th key={`header-column-${idx}`}>{renderEnterprise(column, isTree)}</th>)}
                </tr>
            </thead>
            <tbody>
                {processRows(allRows, columnFields, isTree, booleanOnly, stringOnly, childPropertyName, 0)}
            </tbody>
        </table>
    );
};

const wrapWithLink = (value, url) => <a href={url}>{value}</a>;

const renderEnterprise = (value, isTree, rowData = {}) => {
    const processedValue = value.replace('<enterprise-icon></enterprise-icon>', '');
    if (processedValue.length !== value.length || (isTree && rowData.enterprise)) {
        return <React.Fragment>{processedValue}<enterprise-icon></enterprise-icon></React.Fragment>;
    }
    return processedValue;
};

const processRows = (rowArray, columnFields, isTree, booleanOnly, stringOnly, childPropertyName, level, group = 'root') => {
    return rowArray.reduce((allRows, currentRow, rowIdx) => {
        const exclude = isTree && currentRow.title === 'See Also';
        const rowItems = currentRow[childPropertyName];

        if (isTree && rowItems != null && !currentRow.matrixExcludeChildren && !exclude) {
            const titleField = columnFields[0];
            const title = currentRow[titleField];
            const newGroup = title ? `${group}-${title.toLowerCase().replace(/\s/g, '-')}` : group;

            const processedRow = processRows(rowItems, columnFields, isTree, booleanOnly, stringOnly, childPropertyName, level + 1, newGroup);
            const titleRow = createTitleRow(title, isTree, currentRow, level, `${newGroup}-title`);

            return allRows.concat(titleRow, processedRow);
        }

        const newRows = (currentRow.matrixExclude || (currentRow.matrixExcludeChildren && !currentRow.url) || exclude)
            ? allRows
            : allRows.concat(createRow(columnFields, currentRow, isTree, booleanOnly, stringOnly, level, `${group}-${rowIdx}`));

        return newRows;
    }, []);
};

const createTitleRow = (title, isTree, rowData, level, rowKey) => !title ? [] : [(
    <tr key={rowKey}>
        <td colSpan="3">
            {level === 1
                ? <span className={styles['matrix-table__title']}>{title}</span>
                : (
                    <span className={level > 2 ? styles[`matrix-table--pad${level}`] : ''}>
                        {wrapWithLink(renderEnterprise(title, isTree, rowData), rowData.url)}
                    </span>
                )
            }
        </td>
    </tr>
)];

const createRow = (columnFields, rowData, isTree, booleanOnly, stringOnly, level, rowKey) => (
    <tr key={rowKey}>{
        columnFields.map((column, colIdx) => {
            const match = column.match(/not\((.*)\)/);
            let fieldName = match ? match[1] : column;

            const value = rowData[fieldName];

            return (
                <td key={`${rowKey}-column-${colIdx}`}>{
                    colIdx === 0
                        ? renderPropertyColumn(value, isTree, rowData, level)
                        : renderValue(value, booleanOnly, stringOnly, !!match)}
                </td>
            );
        })
    }
    </tr>
);

const renderPropertyColumn = (value, isTree, rowData, level) => {
    if (isTree) {
        const processedValue = wrapWithLink(renderEnterprise(value, isTree, rowData), rowData.url);

        return <span className={level > 2 ? styles[`matrix-table--pad${level}`] : ''}>{processedValue}</span>;
    }

    return <span dangerouslySetInnerHTML={{ __html: generateCodeTags(value) }} />;
};

const renderValue = (value, booleanOnly, stringOnly, notIn) => {
    if (stringOnly) { return value; }

    if (value === false || (value === true && notIn)) {
        return <FontAwesomeIcon icon={faTimes} fixedWidth className={styles['matrix-table__false']} />;
    }

    return (
        <div>
            <FontAwesomeIcon icon={faCheck} fixedWidth className={styles['matrix-table__true']} />
            {typeof value === 'string' && !booleanOnly && ` (${value})`}
        </div>
    );
};

const generateCodeTags = content => content.replace(/`(.*?)`/g, '<code>$1</code>');

export default MatrixTable;