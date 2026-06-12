import type { AgCheckbox } from '../agWidgets/agCheckbox';
import type { AgCheckboxParams } from '../agWidgets/agFieldParams';
import type { AgFieldSet } from '../agWidgets/agFieldSet';
import type { AgInputDateField } from '../agWidgets/agInputDateField';
import type { AgInputNumberField } from '../agWidgets/agInputNumberField';
import type { AgInputTextArea } from '../agWidgets/agInputTextArea';
import type { AgInputTextField, AgInputTextFieldEvent, AgInputTextFieldParams } from '../agWidgets/agInputTextField';
import type { AgRadioButton } from '../agWidgets/agRadioButton';
import type { AgSelect } from '../agWidgets/agSelect';
import type { AgToggleButton } from '../agWidgets/agToggleButton';
import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { AgComponentSelectorType } from './component';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type GridInputTextArea = AgInputTextArea<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType
>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type GridInputTextField<
    TConfig extends AgInputTextFieldParams<AgComponentSelectorType> = AgInputTextFieldParams<AgComponentSelectorType>,
    TEventType extends string = AgInputTextFieldEvent,
> = AgInputTextField<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType,
    TConfig,
    TEventType
>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type GridInputNumberField = AgInputNumberField<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType
>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type GridInputDateField = AgInputDateField<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType
>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type GridCheckbox<
    TConfig extends AgCheckboxParams<AgComponentSelectorType> = AgCheckboxParams<AgComponentSelectorType>,
> = AgCheckbox<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType,
    TConfig
>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type GridRadioButton = AgRadioButton<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType
>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type GridToggleButton = AgToggleButton<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType
>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type GridSelect<TValue = string | null> = AgSelect<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType,
    TValue
>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type GridFieldSet = AgFieldSet<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType
>;
