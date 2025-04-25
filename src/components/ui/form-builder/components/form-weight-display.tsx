import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormElement,
  FormElementOrList,
  FormStep,
} from "@/components/ui/form-builder/form-types";
import useFormBuilderStore from "@/components/ui/form-builder/hooks/use-form-builder-store";
import { flattenFormSteps } from "@/components/ui/form-builder/libs/form-elements-helpers";
import { calculateTotalWeight } from "@/components/ui/form-builder/libs/rule-evaluator";
import { Progress } from "@/components/ui/progress";

export function FormWeightDisplay({
  form,
}: {
  form: UseFormReturn<any, any, undefined>;
}) {
  const formElements = useFormBuilderStore((s) => s.formElements);
  const isMS = useFormBuilderStore((s) => s.isMS);
  const formValues = useWatch({ control: form.control });
  const [totalWeight, setTotalWeight] = useState(0);
  const [maxWeight, setMaxWeight] = useState(0);

  useEffect(() => {
    // Calculate total weight based on form values
    const weight = calculateTotalWeight(formElements as any[], formValues);
    setTotalWeight(weight);

    // Calculate max weight by summing all possible weights
    const calculateMaxWeight = () => {
      let max = 0;
      const flattenedElements = isMS
        ? flattenFormSteps(formElements as FormStep[]).flat()
        : (formElements.flat() as FormElement[]);

      // First, count how many fields have weights
      let fieldsWithWeights = 0;

      flattenedElements.forEach((element) => {
        if (
          "weights" in element &&
          element.weights &&
          element.weights.length > 0 &&
          !element.static
        ) {
          fieldsWithWeights++;

          // Sum up all weights for this field
          let fieldMaxWeight = 0;
          element.weights.forEach((weight) => {
            // If there's no condition, this weight is always applicable
            if (!weight.condition) {
              fieldMaxWeight = Math.max(fieldMaxWeight, weight.value);
            } else {
              // For conditional weights, we need to check if they can be applied
              // For now, we'll just take the maximum possible weight
              fieldMaxWeight = Math.max(fieldMaxWeight, weight.value);
            }
          });

          max += fieldMaxWeight;
        }
      });

      // If no weights are defined, default to 100
      return max > 0 ? max : 100;
    };

    setMaxWeight(calculateMaxWeight());
  }, [formValues, formElements, isMS]);

  // Calculate percentage for progress bar
  const weightPercentage = Math.min((totalWeight / maxWeight) * 100, 100);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between">
          <span>Total Score</span>
          <span>
            {totalWeight} / {maxWeight}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={weightPercentage} className="h-2" />
      </CardContent>
    </Card>
  );
}
