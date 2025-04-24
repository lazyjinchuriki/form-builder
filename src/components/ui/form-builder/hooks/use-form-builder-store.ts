import { create } from "zustand";
import { defaultFormElements } from "@/components/ui/form-builder/constant/default-form-element";
import { medicalTemplates } from "@/components/ui/form-builder/constant/medical-templates";
import { templates } from "@/components/ui/form-builder/constant/templates";
import {
  AppendElement,
  DropElement,
  EditElement,
  FormElement,
  FormElementList,
  FormElementOrList,
  FormStep,
  ReorderElements,
  SetTemplate,
} from "@/components/ui/form-builder/form-types";
import {
  dropAtIndex,
  flattenFormSteps,
  insertAtIndex,
  transformToStepFormList,
} from "@/components/ui/form-builder/libs/form-elements-helpers";

type LayoutType = "row" | "column";

type CreateLayoutOptions = {
  type: LayoutType;
  fieldIndex: number;
  stepIndex?: number;
};

type MSForm = {
  formElements: FormStep[];
  isMS: true;
};
type SingleForm = {
  formElements: FormElementList;
  isMS: false;
};
type FormBuilderState = {
  isMS: boolean;
  appendElement: AppendElement;
  dropElement: DropElement;
  editElement: EditElement;
  reorder: ReorderElements;
  setTemplate: SetTemplate;
  resestFormElements: () => void;

  setIsMS: (isMS: boolean) => void;

  addFormStep: (position?: number) => void;
  removeFormStep: (stepIndex: number) => void;
} & (MSForm | SingleForm);

const initialFormElements = templates["contactUs"]
  .template as FormElementOrList[];

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  formElements: initialFormElements,
  isMS: false,
  appendElement: (options) => {
    const { fieldIndex, fieldType } = options || { fieldIndex: null };
    set((state) => {
      const { isMS } = state;
      switch (isMS) {
        case true: {
          const stepIndex = options?.stepIndex as number;
          const clonedFormElements = [...state.formElements];

          const stepFields = clonedFormElements[stepIndex].stepFields;
          const newFormElement = {
            ...defaultFormElements[fieldType],
            fieldType,
            name: `${fieldType}-${stepFields.length + 100}`,
          } as FormElement;
          if (typeof fieldIndex == "number") {
            // Append to a nested array
            stepFields[fieldIndex] = [
              stepFields[fieldIndex] as FormElement,
              newFormElement,
            ];
          } else {
            stepFields.push(newFormElement);
          }
          state.formElements[stepIndex].stepFields = stepFields;

          return { formElements: clonedFormElements };
        }
        default: {
          const newFormElement = {
            ...defaultFormElements[fieldType],
            fieldType,
            name: `${fieldType}-${state.formElements.length + 1}`,
          } as FormElement;
          const clonedFormElements = [...state.formElements];
          if (typeof fieldIndex == "number") {
            // update form element at fieldIndex, with a form element array
            clonedFormElements[fieldIndex] = [
              clonedFormElements[fieldIndex] as FormElement,
              newFormElement,
            ];
          } else {
            // Append to the main array
            clonedFormElements.push(newFormElement);
          }

          return {
            formElements: clonedFormElements,
          };
        }
      }
    });
  },
  dropElement: (options) => {
    set((state) => {
      const { j, fieldIndex } = options;
      const { isMS } = state;
      switch (isMS) {
        case true: {
          const stepIndex = options?.stepIndex as number;
          const clonedFormElements = [...state.formElements];
          const stepFields = clonedFormElements[stepIndex].stepFields;
          if (typeof j === "number") {
            // Remove from a nested array
            stepFields[fieldIndex] = dropAtIndex(
              stepFields[fieldIndex] as FormElement[],
              j
            )[0];
            state.formElements[stepIndex].stepFields = stepFields;
          } else {
            // Remove from the main array;
            state.formElements[stepIndex].stepFields = dropAtIndex(
              stepFields as FormElement[],
              fieldIndex
            );
          }

          return {
            formElements: clonedFormElements,
          };
        }
        default: {
          const clonedFormElements = [...state.formElements];
          if (
            typeof j === "number" &&
            Array.isArray(state.formElements[fieldIndex])
          ) {
            // Remove from a nested array
            clonedFormElements[fieldIndex] = dropAtIndex(
              clonedFormElements[fieldIndex] as FormElement[],
              j
            )[0];

            return { formElements: clonedFormElements };
          } else {
            return {
              // Remove from the main array;
              formElements: dropAtIndex(
                state.formElements as FormElement[],
                fieldIndex
              ),
            };
          }
        }
      }
    });
  },
  editElement: (options) => {
    const { j, fieldIndex, modifiedFormElement } = options;
    set((state) => {
      const { isMS } = state;
      switch (isMS) {
        case true: {
          const stepIndex = options.stepIndex as number;
          const clonedFormElements = [...state.formElements];
          const stepFields = clonedFormElements[stepIndex].stepFields;
          const currentFormElement = stepFields[fieldIndex] as FormElement[];
          if (typeof j == "number") {
            currentFormElement[j] = {
              ...currentFormElement[j],
              ...modifiedFormElement,
            } as FormElement;
            stepFields[fieldIndex] = currentFormElement;
            state.formElements[stepIndex].stepFields = stepFields;
          } else {
            stepFields[fieldIndex] = {
              ...currentFormElement,
              ...modifiedFormElement,
            } as FormElement;
            state.formElements[stepIndex].stepFields = stepFields;
          }

          return { formElements: clonedFormElements };
        }
        default: {
          const clonedFormElements = [...state.formElements];
          if (typeof j == "number") {
            // Edit nested elements
            const currentFormElement = [
              ...(clonedFormElements[fieldIndex] as FormElement[]),
            ];
            currentFormElement[j] = {
              ...currentFormElement[j],
              ...modifiedFormElement,
            } as FormElement;
            clonedFormElements[fieldIndex] = currentFormElement;

            return { formElements: clonedFormElements };
          }
          clonedFormElements[fieldIndex] = {
            ...clonedFormElements[fieldIndex],
            ...modifiedFormElement,
          } as FormElement;

          return { formElements: clonedFormElements };
        }
      }
    });
  },
  reorder: (options): void => {
    const { newOrder, fieldIndex } = options;
    set((state) => {
      const { isMS } = state;

      switch (isMS) {
        case true: {
          const clonedFormElements = [...state.formElements];
          const stepIndex = options.stepIndex as number;
          if (typeof fieldIndex === "number") {
            // Reorder nested elements
            clonedFormElements[stepIndex].stepFields[fieldIndex] =
              newOrder as FormElement[];
          } else {
            clonedFormElements[stepIndex].stepFields =
              newOrder as FormElementList;
          }

          return { formElements: clonedFormElements };
        }
        default:
          if (typeof fieldIndex === "number") {
            // Reorder nested elements
            const clonedFormElements = [...state.formElements];
            clonedFormElements[fieldIndex] = newOrder as FormElementOrList;

            return { formElements: clonedFormElements };
          } else {
            // Reorder main elements

            return { formElements: newOrder };
          }
      }
    });
  },
  setTemplate: (
    templateName: string,
    templateType: "builtin" | "medical" = "builtin"
  ) => {
    let template;

    if (templateType === "medical") {
      template =
        medicalTemplates[templateName as keyof typeof medicalTemplates]
          .template;
    } else {
      template = templates[templateName as keyof typeof templates].template;
    }

    const isTemplateMSForm = Object.prototype.hasOwnProperty.call(
      template[0],
      "stepFields"
    );
    set((state) => {
      return isTemplateMSForm
        ? {
            ...state,
            formElements: template as FormStep[],
            isMS: true,
          }
        : {
            ...state,
            formElements: template as FormElementOrList[],
            isMS: false,
          };
    });
  },

  setCustomTemplate: (templateKey: string) => {
    try {
      const savedTemplates = localStorage.getItem("customTemplates");
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        const customTemplate = parsed[templateKey];

        if (customTemplate) {
          const template = customTemplate.template;
          const isMS = customTemplate.isMS;

          set((state) => ({
            ...state,
            formElements: template,
            isMS: isMS,
          }));
        }
      }
    } catch (error) {
      console.error("Error loading custom template:", error);
    }
  },
  resestFormElements: () => {
    set({ formElements: [] });
  },
  setIsMS: (isMS) => {
    set((state) => {
      let formElements = state.formElements;
      if (isMS) {
        formElements = transformToStepFormList(
          formElements as FormElementOrList[]
        );

        return {
          ...state,
          isMS,
          formElements,
        } as MSForm;
      } else {
        formElements = flattenFormSteps(
          formElements as FormStep[]
        ) as FormElementOrList[];

        return { ...state, isMS, formElements } as SingleForm;
      }
    });
  },
  addFormStep: (currentPosition) => {
    set((state) => {
      const defaultStep = {
        id: `${state.formElements.length + 10}`,
        stepFields: [],
      };
      if (typeof currentPosition === "number") {
        const nextPosition = currentPosition + 1;

        return {
          formElements: insertAtIndex(
            state.formElements as FormStep[],
            defaultStep,
            nextPosition
          ),
        };
      }

      return {
        formElements: [...state.formElements, defaultStep] as FormStep[],
      };
    });
  },
  removeFormStep: (stepIndex) => {
    set((state) => {
      return {
        formElements: dropAtIndex(state.formElements as FormStep[], stepIndex),
      };
    });
  },

  createLayout: (options: CreateLayoutOptions) => {
    const { type, fieldIndex, stepIndex } = options;

    set((state) => {
      const { isMS } = state;

      if (isMS) {
        // Multi-step form
        if (typeof stepIndex !== "undefined") {
          const clonedFormElements = [...state.formElements] as FormStep[];
          const stepFields = [...clonedFormElements[stepIndex].stepFields];
          const currentElement = stepFields[fieldIndex];

          // Create a new array with the current element
          if (type === "row") {
            stepFields[fieldIndex] = [currentElement];
          }

          clonedFormElements[stepIndex].stepFields = stepFields;
          return { formElements: clonedFormElements };
        }
      } else {
        // Single-step form
        const clonedFormElements = [
          ...state.formElements,
        ] as FormElementOrList[];
        const currentElement = clonedFormElements[fieldIndex];

        // Create a new array with the current element
        if (type === "row") {
          clonedFormElements[fieldIndex] = [currentElement];
        }

        return { formElements: clonedFormElements };
      }

      return state;
    });
  },
}));

export default useFormBuilderStore;
