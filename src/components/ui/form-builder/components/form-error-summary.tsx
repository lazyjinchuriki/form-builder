import { AlertCircle } from "lucide-react";
import { useFormState } from "react-hook-form";
import { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormElement, FormStep } from "@/components/ui/form-builder/form-types";
import useFormBuilderStore from "@/components/ui/form-builder/hooks/use-form-builder-store";
import { flattenFormSteps } from "@/components/ui/form-builder/libs/form-elements-helpers";
import { evaluateRules } from "@/components/ui/form-builder/libs/rule-evaluator";

export function FormErrorSummary({
  form,
}: {
  form: UseFormReturn<any, any, undefined>;
}) {
  const {
    formState: { errors },
  } = form;
  const formElements = useFormBuilderStore((s) => s.formElements);
  const isMS = useFormBuilderStore((s) => s.isMS);
  const formValues = useWatch({ control: form.control });

  // Get all form elements flattened
  const flattenedElements = isMS
    ? flattenFormSteps(formElements as FormStep[]).flat()
    : (formElements.flat() as FormElement[]);

  // Filter errors to only show for visible fields
  const visibleErrors = Object.entries(errors).filter(([fieldName, error]) => {
    // Find the form element for this field
    const element = flattenedElements.find((el) => el.name === fieldName);

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

  if (!hasVisibleErrors) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Validation Errors</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-5 mt-2">
          {visibleErrors.map(([fieldName, error]) => (
            <li key={fieldName}>
              {error?.message ? (
                <span>{error.message as string}</span>
              ) : (
                <span>{fieldName} has an error</span>
              )}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
