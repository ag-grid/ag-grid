import type { AgCheckbox } from '../agStack/widgets/agCheckbox';
import type { AgCheckboxParams } from '../agStack/widgets/agFieldParams';
import type { AgInputDateField } from '../agStack/widgets/agInputDateField';
import type { AgInputNumberField } from '../agStack/widgets/agInputNumberField';
import type { AgInputTextArea } from '../agStack/widgets/agInputTextArea';
import type {
    AgInputTextField,
    AgInputTextFieldEvent,
    AgInputTextFieldParams,
} from '../agStack/widgets/agInputTextField';
import type { AgRadioButton } from '../agStack/widgets/agRadioButton';
import type { AgSelect } from '../agStack/widgets/agSelect';
import type { AgToggleButton } from '../agStack/widgets/agToggleButton';
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
