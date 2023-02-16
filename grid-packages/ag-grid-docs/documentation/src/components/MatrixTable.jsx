import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useJsonFileNodes } from './use-json-file-nodes';
import { convertUrl, convertMarkdown } from 'components/documentation-helpers';
import styles from './MatrixTable.module.scss';

/**
 * This presents a matrix of information, e.g. to show which features are available with different versions of the grid.
 */
const MatrixTable = ({
    src,
    rootnode: rootNode,
    columns,
    tree,
    booleanonly: booleanOnly,
    stringonly: stringOnly,
    childpropertyname: childPropertyName,
    showcondition: showCondition,
    framework }) => {
    const nodes = useJsonFileNodes();
    const file = JSON.parse(nodes.find(node => node.relativePath === src).internal.content);
    const allRows = getRowsToProcess(file, rootNode, showCondition);
    const allColumns = JSON.parse(columns);

    return createTable(framework, allColumns, allRows, tree, booleanOnly, stringOnly, childPropertyName);
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

const createTable = (framework, allColumns, allRows, isTree, booleanOnly, stringOnly, childPropertyName) => {
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
                {processRows(framework, allRows, columnFields, isTree, booleanOnly, stringOnly, childPropertyName, 0)}
            </tbody>
        </table>
    );
};

const wrapWithLink = (value, url, framework) => <a href={convertUrl(url, framework)}>{value}</a>;

const renderEnterprise = (value, isTree, rowData = {}) => {
    const processedValue = value.replace('<enterprise-icon></enterprise-icon>', '');
    if (processedValue.length !== value.length || (isTree && rowData.enterprise)) {
        return <React.Fragment>{processedValue}<enterprise-icon></enterprise-icon></React.Fragment>;
    }
    return processedValue;
};

const processRows = (framework, rowArray, columnFields, isTree, booleanOnly, stringOnly, childPropertyName, level, group = 'root') => {
    return rowArray.reduce((allRows, currentRow, rowIdx) => {
        let exclude = false;
        const rowItems = currentRow[childPropertyName];

        if (
            (isTree && currentRow.title) === 'See Also' ||
            (currentRow.frameworks && currentRow.frameworks.indexOf(framework) === -1)
        ) { exclude = true; }

        if (isTree && rowItems != null && !currentRow.matrixExcludeChildren && !exclude) {
            const titleField = columnFields[0];
            const title = currentRow[titleField];
            const newGroup = title ? `${group}-${title.toLowerCase().replace(/\s/g, '-')}` : group;

            const processedRow = processRows(framework, rowItems, columnFields, isTree, booleanOnly, stringOnly, childPropertyName, level + 1, newGroup);
            const titleRow = createTitleRow(framework, title, isTree, currentRow, level, `${newGroup}-title`);

            return allRows.concat(titleRow, processedRow);
        }

        const newRows = (currentRow.matrixExclude || (currentRow.matrixExcludeChildren && !currentRow.url) || exclude)
            ? allRows
            : allRows.concat(createRow(framework, columnFields, currentRow, isTree, booleanOnly, stringOnly, level, `${group}-${rowIdx}`));

        return newRows;
    }, []);
};

const createTitleRow = (framework, title, isTree, rowData, level, rowKey) => !title ? [] : [(
    <tr key={rowKey}>
        <td colSpan="3">
            {level === 1
                ? <span className={styles['matrix-table__title']}>{title}</span>
                : (
                    <span className={level > 2 ? styles[`matrix-table--pad${level}`] : ''}>
                        {wrapWithLink(renderEnterprise(title, isTree, rowData), rowData.url, framework)}
                    </span>
                )
            }
        </td>
    </tr>
)];

const createRow = (framework, columnFields, rowData, isTree, booleanOnly, stringOnly, level, rowKey) => (
    <tr key={rowKey}>{
        columnFields.map((column, colIdx) => {
            const match = column.match(/not\((.*)\)/);
            let fieldName = match ? match[1] : column;

            const value = rowData[fieldName];

            return (
                <td key={`${rowKey}-column-${colIdx}`}>{
                    colIdx === 0
                        ? renderPropertyColumn(framework, value, isTree, rowData, level)
                        : renderValue(value, booleanOnly, stringOnly, !!match)}
                </td>
            );
        })
    }
    </tr>
);

const renderPropertyColumn = (framework, value, isTree, rowData, level) => {
    if (isTree) {
        const processedValue = wrapWithLink(renderEnterprise(value, isTree, rowData), rowData.url, framework);

        return <span className={level > 2 ? styles[`matrix-table--pad${level}`] : ''}>{processedValue}</span>;
    }

    return <span dangerouslySetInnerHTML={{ __html: convertMarkdown(value, framework) }} />;
};

const renderCross = () => {
    return <FontAwesomeIcon icon={faTimes} fixedWidth className={styles['matrix-table__false']} />;
};

const renderTick = () => {
    return <FontAwesomeIcon icon={faCheck} fixedWidth className={styles['matrix-table__true']} />
};

const renderValue = (value, booleanOnly, stringOnly, notIn) => {
    if (stringOnly) { return value; }

    if (value === false || (value === true && notIn)) {
        return renderCross();
    }

    if (value instanceof Array && typeof value[0] === 'boolean' && typeof value[1] === 'string') {
        return (
            <div>
                {value[0] ? renderTick() : renderCross()}
                ({value[1]})
            </div>
        );
    }

    // Excel mode table mixes booleans with N/A
    if (value === 'N/A') { return value; }

    return (
        <div>
            {renderTick()}
            {typeof value === 'string' && !booleanOnly && ` (${value})`}
        </div>
    );
};

export default MatrixTable;