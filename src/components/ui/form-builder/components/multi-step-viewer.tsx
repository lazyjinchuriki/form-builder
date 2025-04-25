"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormErrorSummary } from "@/components/ui/form-builder/components/form-error-summary";
import { FormWeightDisplay } from "@/components/ui/form-builder/components/form-weight-display";
import { RenderFormElement } from "@/components/ui/form-builder/components/render-form-element";
import type {
  FormElement,
  FormStep,
} from "@/components/ui/form-builder/form-types";
import { useMultiStepForm } from "@/components/ui/form-builder/hooks/use-multi-step-form";
import { Progress } from "@/components/ui/progress";
import { flattenFormSteps } from "../libs/form-elements-helpers";
import { evaluateRules } from "../libs/rule-evaluator";

/**
 * Used to render a multi-step form in preview mode
 */
export function MultiStepViewer({
  form,
  formElements,
}: {
  form: UseFormReturn<any, any, undefined>;
  formElements: FormStep[];
}) {
  const { currentStep, isLastStep, goToNext, goToPrevious } = useMultiStepForm({
    initialSteps: formElements as FormStep[],
    onStepValidation: async (step) => {
      const stepFields = (step.stepFields as FormElement[])
        .flat()
        .filter((o) => !o.static)
        .map((o) => o.name);
      const isValid = await form.trigger(stepFields);

      return isValid;
    },
  });
  const steps = formElements as FormStep[];
  const current = formElements[currentStep - 1] as FormStep;
  const {
    formState: { isSubmitting, isSubmitted },
  } = form;

  return (
    <div className="flex flex-col gap-2 pt-3">
      <div className="flex-col-start gap-1">
        <span className="">
          Step {currentStep} of {steps.length}
        </span>
        <Progress value={(currentStep / steps.length) * 100} />
      </div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="flex flex-col gap-2"
        >
          {current?.stepFields?.map((field, i) => {
            if (Array.isArray(field)) {
              return (
                <div
                  key={i}
                  className="flex items-center justify-between flex-wrap sm:flex-nowrap w-full gap-2"
                >
                  {field.map((el: FormElement, ii: number) => (
                    <div key={el.name + ii} className="w-full">
                      <RenderFormElement formElement={el} form={form} />
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <div key={i} className="w-full">
                <RenderFormElement formElement={field} form={form} />
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Only show weight display on the last step */}
      {isLastStep && <FormWeightDisplay form={form} />}

      {/* Show validation errors */}
      <FormErrorSummary form={form} />

      <div className="flex-row-between gap-3 w-full pt-3">
        <Button size="sm" variant="ghost" onClick={goToPrevious} type="button">
          Previous
        </Button>
        {isLastStep ? (
          <Button
            size="sm"
            type="submit"
            onClick={(e) => {
              // Trigger validation on all fields to show errors
              form.trigger();

              // Get all form elements flattened
              const flattenedElements = formElements.flatMap((step) =>
                flattenFormSteps([step]).flat()
              );

              // Filter errors to only consider visible fields
              const formValues = form.getValues();
              const visibleErrors = Object.entries(
                form.formState.errors
              ).filter(([fieldName, error]) => {
                // Find the form element for this field
                const element = flattenedElements.find(
                  (el) => el.name === fieldName
                );

                // If element not found or has no rules, consider it visible
                if (
                  !element ||
                  !("rules" in element) ||
                  !element.rules ||
                  element.rules.length === 0
                ) {
                  return true;
                }

                // Check if the field is visible based on rules
                const { visible } = evaluateRules(element.rules, formValues);
                return visible;
              });

              // Check if there are any visible errors
              const hasVisibleErrors = visibleErrors.length > 0;

              if (hasVisibleErrors) {
                e.preventDefault();
              }
            }}
          >
            {isSubmitting
              ? "Submitting..."
              : isSubmitted
              ? "Submitted ✅"
              : "Submit"}
          </Button>
        ) : (
          <Button
            size="sm"
            type="button"
            variant={"secondary"}
            onClick={goToNext}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
