import * as React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormErrorSummary } from "@/components/ui/form-builder/components/form-error-summary";
import { FormWeightDisplay } from "@/components/ui/form-builder/components/form-weight-display";
import { MultiStepViewer } from "@/components/ui/form-builder/components/multi-step-viewer";
import { RenderFormElement } from "@/components/ui/form-builder/components/render-form-element";
import type {
  FormElement,
  FormElementOrList,
  FormStep,
} from "@/components/ui/form-builder/form-types";
import { useFormBuilder } from "@/components/ui/form-builder/hooks/use-form-builder";
import useFormBuilderStore from "@/components/ui/form-builder/hooks/use-form-builder-store";
import { flattenFormSteps } from "@/components/ui/form-builder/libs/form-elements-helpers";
import { evaluateRules } from "@/components/ui/form-builder/libs/rule-evaluator";

interface FormPreviewProps {
  form: UseFormReturn<any, any, undefined>;
}

export function FormPreview({ form }: FormPreviewProps) {
  const { onSubmit } = useFormBuilder();
  const formElements = useFormBuilderStore((s) => s.formElements);
  const isMS = useFormBuilderStore((s) => s.isMS);
  const data = Object.keys(form.watch());
  const { formState } = form;

  return (
    <div className="w-full animate-in rounded-md border">
      {data.length > 0 ? (
        <Form {...form}>
          <form
            onSubmit={(e) => {
              // Trigger validation on all fields to show errors
              form.trigger();

              // Get all form elements flattened
              const flattenedElements = isMS
                ? flattenFormSteps(formElements as FormStep[]).flat()
                : (formElements.flat() as FormElement[]);

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
                return;
              }

              form.handleSubmit(onSubmit)(e);
            }}
            className="flex flex-col p-2 md:p-5 w-full gap-2"
          >
            {isMS ? (
              <MultiStepViewer
                formElements={formElements as unknown as FormStep[]}
                form={form}
              />
            ) : (
              (formElements as FormElementOrList[]).map((element, i) => {
                if (Array.isArray(element)) {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between flex-wrap sm:flex-nowrap w-full gap-2"
                    >
                      {element.map((el, ii) => (
                        <div key={el.name + ii} className="w-full">
                          <RenderFormElement formElement={el} form={form} />
                        </div>
                      ))}
                    </div>
                  );
                }

                return (
                  <div key={element.name + i} className="w-full">
                    <RenderFormElement formElement={element} form={form} />
                  </div>
                );
              })
            )}
            {!isMS && (
              <>
                {/* Display total weight based on field values */}
                <FormWeightDisplay form={form} />
                {/* Display validation errors */}
                <FormErrorSummary form={form} />
                <div className="flex-row-end w-full pt-3">
                  <Button type="submit" className="rounded-lg" size="sm">
                    {formState.isSubmitting
                      ? "Submitting..."
                      : formState.isSubmitted
                      ? "Submitted ✅"
                      : "Submit"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      ) : (
        <div className="h-full py-10 px-3">
          <p className="text-center text-muted-foreground text-lg">
            Add form elements to preview
          </p>
        </div>
      )}
    </div>
  );
}
