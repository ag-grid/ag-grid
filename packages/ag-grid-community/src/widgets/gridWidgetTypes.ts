import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams, AllEventsWithoutGridCommon } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgCheckboxParams } from '../interfaces/agFieldParams';
import type { AgCheckbox } from './agCheckbox';
import type { AgInputDateField } from './agInputDateField';
import type { AgInputNumberField } from './agInputNumberField';
import type { AgInputTextArea } from './agInputTextArea';
import type { AgInputTextField, AgInputTextFieldEvent, AgInputTextFieldParams } from './agInputTextField';
import type { AgRadioButton } from './agRadioButton';
import type { AgToggleButton } from './agToggleButton';
import type { AgComponentSelectorType } from './component';

export type GridInputTextArea = AgInputTextArea<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AllEventsWithoutGridCommon,
    GridOptionsService,
    AgComponentSelectorType
>;

export type GridInputTextField<
    TConfig extends AgInputTextFieldParams<AgComponentSelectorType> = AgInputTextFieldParams<AgComponentSelectorType>,
    TEventType extends string = AgInputTextFieldEvent,
> = AgInputTextField<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AllEventsWithoutGridCommon,
    GridOptionsService,
    AgComponentSelectorType,
    TConfig,
    TEventType
>;

export type GridInputNumberField = AgInputNumberField<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AllEventsWithoutGridCommon,
    GridOptionsService,
    AgComponentSelectorType
>;

export type GridInputDateField = AgInputDateField<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AllEventsWithoutGridCommon,
    GridOptionsService,
    AgComponentSelectorType
>;

export type GridCheckbox<
    TConfig extends AgCheckboxParams<AgComponentSelectorType> = AgCheckboxParams<AgComponentSelectorType>,
> = AgCheckbox<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AllEventsWithoutGridCommon,
    GridOptionsService,
    AgComponentSelectorType,
    TConfig
>;

export type GridRadioButton = AgRadioButton<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AllEventsWithoutGridCommon,
    GridOptionsService,
    AgComponentSelectorType
>;

export type GridToggleButton = AgToggleButton<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AllEventsWithoutGridCommon,
    GridOptionsService,
    AgComponentSelectorType
>;
