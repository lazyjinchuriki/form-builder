import type {
  FormElementOrList,
  FormStep,
} from '@/components/ui/form-builder/form-types';

type TemplateList = Record<
  string,
  {
    template: FormElementOrList[] | FormStep[];
    name: string;
    description: string;
  }
>;

export const medicalTemplates: TemplateList = {
  ransonCriteria: {
    name: 'Ranson Criteria',
    description: 'Scoring system for predicting severity of acute pancreatitis',
    template: [
      {
        name: 'Ranson Criteria',
        fieldType: 'H1',
        static: true,
        content: 'Ranson Criteria for Acute Pancreatitis',
      },
      {
        name: 'Paragraph',
        fieldType: 'P',
        static: true,
        content:
          'Criteria for predicting severity of acute pancreatitis. Score ≥3 indicates severe pancreatitis.',
      },
      {
        name: 'Divider1',
        fieldType: 'Divider',
        title: 'At Admission',
        description: 'Parameters measured at the time of admission',
        static: true,
      },
      {
        name: 'age',
        fieldType: 'Input',
        type: 'number',
        label: 'Age',
        placeholder: 'Enter age in years',
        description: 'Age in years',
        validations: [
          {
            type: 'required',
            message: 'Age is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'age',
              operator: 'greaterThan',
              value: 55,
            },
            value: 1,
          },
        ],
      },
      {
        name: 'wbc',
        fieldType: 'Input',
        type: 'number',
        label: 'White Blood Cell Count',
        placeholder: 'Enter WBC count',
        description: 'WBC count (cells/mm³)',
        validations: [
          {
            type: 'required',
            message: 'WBC count is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'wbc',
              operator: 'greaterThan',
              value: 16000,
            },
            value: 1,
          },
        ],
      },
      {
        name: 'glucose',
        fieldType: 'Input',
        type: 'number',
        label: 'Blood Glucose',
        placeholder: 'Enter blood glucose',
        description: 'Blood glucose (mg/dL)',
        validations: [
          {
            type: 'required',
            message: 'Blood glucose is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'glucose',
              operator: 'greaterThan',
              value: 200,
            },
            value: 1,
          },
        ],
      },
      {
        name: 'ldh',
        fieldType: 'Input',
        type: 'number',
        label: 'Serum LDH',
        placeholder: 'Enter LDH value',
        description: 'Serum LDH (IU/L)',
        validations: [
          {
            type: 'required',
            message: 'Serum LDH is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'ldh',
              operator: 'greaterThan',
              value: 350,
            },
            value: 1,
          },
        ],
      },
      {
        name: 'ast',
        fieldType: 'Input',
        type: 'number',
        label: 'Serum AST (SGOT)',
        placeholder: 'Enter AST value',
        description: 'Serum AST (IU/L)',
        validations: [
          {
            type: 'required',
            message: 'Serum AST is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'ast',
              operator: 'greaterThan',
              value: 250,
            },
            value: 1,
          },
        ],
      },
      {
        name: 'Divider2',
        fieldType: 'Divider',
        title: 'Within 48 Hours',
        description: 'Parameters measured during the first 48 hours',
        static: true,
      },
      {
        name: 'hematocrit',
        fieldType: 'Input',
        type: 'number',
        label: 'Hematocrit Decrease',
        placeholder: 'Enter hematocrit decrease',
        description: 'Hematocrit decrease (%)',
        validations: [
          {
            type: 'required',
            message: 'Hematocrit decrease is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'hematocrit',
              operator: 'greaterThan',
              value: 10,
            },
            value: 1,
          },
        ],
      },
      {
        name: 'bun',
        fieldType: 'Input',
        type: 'number',
        label: 'BUN Increase',
        placeholder: 'Enter BUN increase',
        description: 'BUN increase (mg/dL)',
        validations: [
          {
            type: 'required',
            message: 'BUN increase is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'bun',
              operator: 'greaterThan',
              value: 5,
            },
            value: 1,
          },
        ],
      },
      {
        name: 'calcium',
        fieldType: 'Input',
        type: 'number',
        label: 'Serum Calcium',
        placeholder: 'Enter serum calcium',
        description: 'Serum calcium (mg/dL)',
        validations: [
          {
            type: 'required',
            message: 'Serum calcium is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'calcium',
              operator: 'lessThan',
              value: 8,
            },
            value: 1,
          },
        ],
      },
      {
        name: 'pao2',
        fieldType: 'Input',
        type: 'number',
        label: 'Arterial PO2',
        placeholder: 'Enter arterial PO2',
        description: 'Arterial PO2 (mmHg)',
        validations: [
          {
            type: 'required',
            message: 'Arterial PO2 is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'pao2',
              operator: 'lessThan',
              value: 60,
            },
            value: 1,
          },
        ],
      },
      {
        name: 'baseDeficit',
        fieldType: 'Input',
        type: 'number',
        label: 'Base Deficit',
        placeholder: 'Enter base deficit',
        description: 'Base deficit (mEq/L)',
        validations: [
          {
            type: 'required',
            message: 'Base deficit is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'baseDeficit',
              operator: 'greaterThan',
              value: 4,
            },
            value: 1,
          },
        ],
      },
      {
        name: 'fluidSequestration',
        fieldType: 'Input',
        type: 'number',
        label: 'Fluid Sequestration',
        placeholder: 'Enter fluid sequestration',
        description: 'Estimated fluid sequestration (L)',
        validations: [
          {
            type: 'required',
            message: 'Fluid sequestration is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'fluidSequestration',
              operator: 'greaterThan',
              value: 6,
            },
            value: 1,
          },
        ],
      },
    ],
  },
  glasgowComaScale: {
    name: 'Glasgow Coma Scale',
    description: 'Neurological scale for assessing level of consciousness',
    template: [
      {
        name: 'Glasgow Coma Scale',
        fieldType: 'H1',
        static: true,
        content: 'Glasgow Coma Scale (GCS)',
      },
      {
        name: 'Paragraph',
        fieldType: 'P',
        static: true,
        content:
          'Assessment of consciousness level. Total score ranges from 3 to 15, with lower scores indicating more severe impairment.',
      },
      {
        name: 'eyeOpening',
        fieldType: 'RadioGroup',
        label: 'Eye Opening',
        description: 'Best eye opening response',
        options: [
          { value: '4', label: 'Spontaneous (4)' },
          { value: '3', label: 'To verbal stimuli (3)' },
          { value: '2', label: 'To pain (2)' },
          { value: '1', label: 'No response (1)' },
        ],
        validations: [
          {
            type: 'required',
            message: 'Eye opening response is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'eyeOpening',
              operator: 'equals',
              value: '4',
            },
            value: 4,
          },
          {
            condition: {
              sourceField: 'eyeOpening',
              operator: 'equals',
              value: '3',
            },
            value: 3,
          },
          {
            condition: {
              sourceField: 'eyeOpening',
              operator: 'equals',
              value: '2',
            },
            value: 2,
          },
          {
            condition: {
              sourceField: 'eyeOpening',
              operator: 'equals',
              value: '1',
            },
            value: 1,
          },
        ],
      },
      {
        name: 'verbalResponse',
        fieldType: 'RadioGroup',
        label: 'Verbal Response',
        description: 'Best verbal response',
        options: [
          { value: '5', label: 'Oriented (5)' },
          { value: '4', label: 'Confused conversation (4)' },
          { value: '3', label: 'Inappropriate words (3)' },
          { value: '2', label: 'Incomprehensible sounds (2)' },
          { value: '1', label: 'No response (1)' },
        ],
        validations: [
          {
            type: 'required',
            message: 'Verbal response is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'verbalResponse',
              operator: 'equals',
              value: '5',
            },
            value: 5,
          },
          {
            condition: {
              sourceField: 'verbalResponse',
              operator: 'equals',
              value: '4',
            },
            value: 4,
          },
          {
            condition: {
              sourceField: 'verbalResponse',
              operator: 'equals',
              value: '3',
            },
            value: 3,
          },
          {
            condition: {
              sourceField: 'verbalResponse',
              operator: 'equals',
              value: '2',
            },
            value: 2,
          },
          {
            condition: {
              sourceField: 'verbalResponse',
              operator: 'equals',
              value: '1',
            },
            value: 1,
          },
        ],
      },
      {
        name: 'motorResponse',
        fieldType: 'RadioGroup',
        label: 'Motor Response',
        description: 'Best motor response',
        options: [
          { value: '6', label: 'Obeys commands (6)' },
          { value: '5', label: 'Localizes to pain (5)' },
          { value: '4', label: 'Withdraws from pain (4)' },
          { value: '3', label: 'Abnormal flexion (3)' },
          { value: '2', label: 'Abnormal extension (2)' },
          { value: '1', label: 'No response (1)' },
        ],
        validations: [
          {
            type: 'required',
            message: 'Motor response is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'motorResponse',
              operator: 'equals',
              value: '6',
            },
            value: 6,
          },
          {
            condition: {
              sourceField: 'motorResponse',
              operator: 'equals',
              value: '5',
            },
            value: 5,
          },
          {
            condition: {
              sourceField: 'motorResponse',
              operator: 'equals',
              value: '4',
            },
            value: 4,
          },
          {
            condition: {
              sourceField: 'motorResponse',
              operator: 'equals',
              value: '3',
            },
            value: 3,
          },
          {
            condition: {
              sourceField: 'motorResponse',
              operator: 'equals',
              value: '2',
            },
            value: 2,
          },
          {
            condition: {
              sourceField: 'motorResponse',
              operator: 'equals',
              value: '1',
            },
            value: 1,
          },
        ],
      },
    ],
  },
  apacheII: {
    name: 'APACHE II Score',
    description: 'Severity of disease classification system',
    template: [
      {
        name: 'APACHE II Score',
        fieldType: 'H1',
        static: true,
        content: 'APACHE II Score',
      },
      {
        name: 'Paragraph',
        fieldType: 'P',
        static: true,
        content:
          'Acute Physiology and Chronic Health Evaluation II - Severity of disease classification system.',
      },
      {
        name: 'temperature',
        fieldType: 'Input',
        type: 'number',
        label: 'Temperature (°C)',
        placeholder: 'Enter temperature',
        description: 'Core temperature in Celsius',
        validations: [
          {
            type: 'required',
            message: 'Temperature is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'temperature',
              operator: 'greaterThan',
              value: 41,
            },
            value: 4,
          },
          {
            condition: {
              sourceField: 'temperature',
              operator: 'greaterThan',
              value: 39,
            },
            value: 3,
          },
          {
            condition: {
              sourceField: 'temperature',
              operator: 'greaterThan',
              value: 38.5,
            },
            value: 1,
          },
          {
            condition: {
              sourceField: 'temperature',
              operator: 'lessThan',
              value: 36,
            },
            value: 1,
          },
          {
            condition: {
              sourceField: 'temperature',
              operator: 'lessThan',
              value: 34,
            },
            value: 3,
          },
          {
            condition: {
              sourceField: 'temperature',
              operator: 'lessThan',
              value: 32,
            },
            value: 4,
          },
        ],
      },
      {
        name: 'meanArterialPressure',
        fieldType: 'Input',
        type: 'number',
        label: 'Mean Arterial Pressure (mmHg)',
        placeholder: 'Enter MAP',
        description: 'Mean arterial pressure',
        validations: [
          {
            type: 'required',
            message: 'Mean arterial pressure is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'meanArterialPressure',
              operator: 'greaterThan',
              value: 160,
            },
            value: 4,
          },
          {
            condition: {
              sourceField: 'meanArterialPressure',
              operator: 'greaterThan',
              value: 130,
            },
            value: 3,
          },
          {
            condition: {
              sourceField: 'meanArterialPressure',
              operator: 'greaterThan',
              value: 110,
            },
            value: 2,
          },
          {
            condition: {
              sourceField: 'meanArterialPressure',
              operator: 'lessThan',
              value: 70,
            },
            value: 2,
          },
          {
            condition: {
              sourceField: 'meanArterialPressure',
              operator: 'lessThan',
              value: 50,
            },
            value: 4,
          },
        ],
      },
      {
        name: 'heartRate',
        fieldType: 'Input',
        type: 'number',
        label: 'Heart Rate (beats/min)',
        placeholder: 'Enter heart rate',
        description: 'Heart rate',
        validations: [
          {
            type: 'required',
            message: 'Heart rate is required',
          },
        ],
        weights: [
          {
            condition: {
              sourceField: 'heartRate',
              operator: 'greaterThan',
              value: 180,
            },
            value: 4,
          },
          {
            condition: {
              sourceField: 'heartRate',
              operator: 'greaterThan',
              value: 140,
            },
            value: 3,
          },
          {
            condition: {
              sourceField: 'heartRate',
              operator: 'greaterThan',
              value: 110,
            },
            value: 2,
          },
          {
            condition: {
              sourceField: 'heartRate',
              operator: 'lessThan',
              value: 70,
            },
            value: 2,
          },
          {
            condition: {
              sourceField: 'heartRate',
              operator: 'lessThan',
              value: 55,
            },
            value: 3,
          },
          {
            condition: {
              sourceField: 'heartRate',
              operator: 'lessThan',
              value: 40,
            },
            value: 4,
          },
        ],
      },
    ],
  },
};
