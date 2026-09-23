import { _escapeString } from 'ag-stack';

import type { ExcelOOXMLTemplate, XmlElement } from 'ag-grid-community';

import type { ExcelComment } from '../../assets/excelInterfaces';
import { replaceInvisibleCharacters } from '../../assets/excelUtils';

const defaultRunProperties: XmlElement = {
    name: 'rPr',
    children: [
        { name: 'sz', properties: { rawMap: { val: '10' } } },
        { name: 'color', properties: { rawMap: { rgb: 'FF000000' } } },
        { name: 'rFont', properties: { rawMap: { val: 'Tahoma' } } },
        { name: 'family', properties: { rawMap: { val: '2' } } },
    ],
};

const boldRunProperties: XmlElement = {
    name: 'rPr',
    children: [{ name: 'b' }, ...defaultRunProperties.children!],
};

const buildTextElement = (value: string, preserveSpace: boolean): XmlElement => ({
    name: 't',
    properties: preserveSpace ? { rawMap: { 'xml:space': 'preserve' } } : undefined,
    textNode: _escapeString(replaceInvisibleCharacters(value) ?? ''),
});

const buildRichTextRun = (value: string, bold: boolean, preserveSpace: boolean): XmlElement => ({
    name: 'r',
    children: [bold ? boldRunProperties : defaultRunProperties, buildTextElement(value, preserveSpace)],
});

const buildNoteTextChildren = (text: string, author: string | undefined, prependAuthor: boolean): XmlElement[] => {
    if (!author || !prependAuthor) {
        return [buildRichTextRun(text, false, text.includes('\n') || text.trim().length !== text.length)];
    }

    return [
        buildRichTextRun(`${author}:\n`, true, true),
        buildRichTextRun(text, false, text.includes('\n') || text.trim().length !== text.length),
    ];
};

const commentsFactory: ExcelOOXMLTemplate = {
    getTemplate(params: { comments: ExcelComment[]; defaultAuthor: string; prependAuthor: boolean }) {
        const authorIds = new Map<string, number>();
        const authors: string[] = [];
        const comments = params.comments.map<XmlElement>((comment) => {
            const author = comment.author || params.defaultAuthor;
            let authorId = authorIds.get(author);

            if (authorId == null) {
                authorId = authors.length;
                authors.push(author);
                authorIds.set(author, authorId);
            }

            return {
                name: 'comment',
                properties: {
                    rawMap: {
                        ref: comment.ref,
                        authorId,
                    },
                },
                children: [
                    {
                        name: 'text',
                        children: buildNoteTextChildren(comment.text, author, params.prependAuthor),
                    },
                ],
            };
        });

        return {
            name: 'comments',
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                },
            },
            children: [
                {
                    name: 'authors',
                    children: authors.map((author) => ({
                        name: 'author',
                        textNode: _escapeString(author),
                    })),
                },
                {
                    name: 'commentList',
                    children: comments,
                },
            ],
        };
    },
};

export default commentsFactory;
