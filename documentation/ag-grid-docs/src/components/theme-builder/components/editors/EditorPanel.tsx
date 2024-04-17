import { ChevronDown } from '@carbon/icons-react';
import styled from '@emotion/styled';
import * as Accordion from '@radix-ui/react-accordion';
import { type ReactNode } from 'react';

import { FormField } from './FormField';
import { ParamEditor } from './ParamEditor';
import { PartEditor } from './PartEditor';

export const EditorPanel = () => {
    return (
        <AccordionRoot type="multiple" defaultValue={['General']}>
            <Section heading="General">
                <LeftBiasRow>
                    <ParamEditor param="fontFamily" />
                    <ParamEditor param="fontSize" />
                </LeftBiasRow>
                <ParamEditor param="backgroundColor" />
                <ParamEditor param="foregroundColor" />
                <ParamEditor param="accentColor" />
                <ParamEditor param="gridSize" label="Spacing" showDocs />
                <EvenSplitRow>
                    <ParamEditor param="wrapperBorderRadius" label="Wrapper radius" showDocs />
                    <ParamEditor param="borderRadius" label="Widget radius" showDocs />
                </EvenSplitRow>
            </Section>
            <Section heading="Borders (temporary)">
                <ParamEditor param="wrapperBorder" label="Around grid" />
                <ParamEditor param="rowBorder" label="Rows" />
                <ParamEditor param="columnBorder" label="Columns" />
            </Section>
            <Section heading="Header">
                <ParamEditor param="headerBackgroundColor" label="Background color" />
                <ParamEditor param="headerTextColor" label="Text color" />
                <LeftBiasRow>
                    <ParamEditor param="headerFontFamily" label="Font family" />
                    <ParamEditor param="headerFontSize" label="Font size" />
                </LeftBiasRow>
                <ParamEditor param="headerFontWeight" label="Font weight" />
                <ParamEditor param="headerVerticalPaddingScale" label="Adjust vertical padding" />
                <FormField label="Adjust horizontal padding">
                    <Note>(See cell horizontal padding)</Note>
                </FormField>
            </Section>
            <Section heading="Cells">
                <ParamEditor param="dataColor" label="Text color" />
                <ParamEditor param="oddRowBackgroundColor" label="Odd row background" />
                <ParamEditor param="rowVerticalPaddingScale" label="Adjust vertical padding" />
                <ParamEditor param="cellHorizontalPaddingScale" label="Adjust horizontal padding" />
            </Section>
            <Section heading="Icons">
                <PartEditor part="iconSet" />
                <ParamEditor param="iconSize" label="Size" />
            </Section>
        </AccordionRoot>
    );
};

const Section = (props: { heading: string; children: ReactNode }) => (
    <AccordionItem value={props.heading}>
        <AccordionHeader>
            <Trigger>
                {props.heading} <OpenCloseChevron />
            </Trigger>
        </AccordionHeader>
        <AccordionContent>
            <SectionContent>{props.children}</SectionContent>
        </AccordionContent>
    </AccordionItem>
);

const Note = styled('div')`
    color: var(--color-fg-tertiary);
    font-size: 14px;
    font-style: italic;
    margin-left: 12px;
`;

const SectionContent = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    margin-bottom: 32px;
`;

const AccordionRoot = styled(Accordion.Root)`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const AccordionItem = styled(Accordion.Item)`
    margin: 0;
`;

const AccordionHeader = styled(Accordion.Header)`
    margin-bottom: 16px;
    padding-left: 6px;
    padding-right: 10px;
`;

const AccordionContent = styled(Accordion.Content)`
    overflow: hidden;
    margin: 0;
    padding-left: 6px;
    padding-right: 10px;

    &[data-state='open'] {
        animation: slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards;
    }

    &[data-state='closed'] {
        animation: slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards;
    }

    @keyframes slideDown {
        from {
            height: 0;
        }
        to {
            height: var(--radix-accordion-content-height);
        }
    }

    @keyframes slideUp {
        from {
            height: var(--radix-accordion-content-height);
        }
        to {
            height: 0;
        }
    }
`;

const Trigger = styled(Accordion.Trigger)`
    all: unset;
    color: var(--color-fg-secondary) !important;
    background: none !important;
    font-size: 15px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;
    transition: all 0.5s;
    opacity: 0.9;
    &:hover {
        opacity: 0.6;
        transition: all 0.5s;
    }
`;

const EvenSplitRow = styled('div')`
    display: flex;
    gap: 12px;
    > * {
        flex: 1;
    }
`;

const LeftBiasRow = styled('div')`
    display: flex;
    gap: 12px;
    > :nth-of-type(1) {
        flex: 2;
    }
    > :nth-of-type(2) {
        flex: 1;
    }
`;

const OpenCloseChevron = styled(ChevronDown)`
    opacity: 0.6;
    transition: transform 300ms cubic-bezier(0.87, 0, 0.13, 1);
    [data-state='open'] & {
        transform: rotate(180deg);
    }
`;
