import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RenderFormElement } from "@/components/ui/form-builder/components/render-form-element";
import {
  FieldWeight,
  FormElement,
  RuleOperator,
} from "@/components/ui/form-builder/form-types";
import useFormBuilderStore from "@/components/ui/form-builder/hooks/use-form-builder-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ruleOperators: { value: RuleOperator; label: string }[] = [
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "greaterThan", label: "Greater Than" },
  { value: "lessThan", label: "Less Than" },
  { value: "isEmpty", label: "Is Empty" },
  { value: "isNotEmpty", label: "Is Not Empty" },
];

type FieldValueInputProps = {
  fieldType: string;
  operator: RuleOperator;
  value: any;
  onChange: (value: any) => void;
};

// Helper function to get field type-specific value input
const FieldValueInput = ({
  fieldType,
  operator,
  value,
  onChange,
}: FieldValueInputProps) => {
  // Handle different field types
  switch (fieldType) {
    case "Checkbox":
    case "Switch":
      return (
        <RadioGroup
          value={String(value)}
          onValueChange={(val) => onChange(val === "true")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="value-true" />
            <Label htmlFor="value-true">True</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="value-false" />
            <Label htmlFor="value-false">False</Label>
          </div>
        </RadioGroup>
      );

    case "Input":
      if (
        (fieldType === "Input" && operator === "greaterThan") ||
        operator === "lessThan"
      ) {
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            placeholder="Value"
          />
        );
      }

      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Value"
        />
      );

    default:
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Value"
        />
      );
  }
};

type FieldWeightEditorProps = {
  form: UseFormReturn<FormElement>;
  currentFieldName: string;
};

export function FieldWeightEditor({
  form,
  currentFieldName,
}: FieldWeightEditorProps) {
  // Get current weights from form
  const weights = form.watch("weights") || [];

  // Add a new empty weight
  const addWeight = () => {
    const newWeight: FieldWeight = {
      value: 0,
    };

    form.setValue("weights", [...weights, newWeight]);
  };

  // Remove a weight
  const removeWeight = (weightIndex: number) => {
    const updatedWeights = [...weights];
    updatedWeights.splice(weightIndex, 1);
    form.setValue("weights", updatedWeights);
  };

  // Add a condition to a weight
  const addCondition = (weightIndex: number) => {
    const updatedWeights = [...weights];
    updatedWeights[weightIndex].condition = {
      sourceField: currentFieldName,
      operator: "equals" as RuleOperator,
      value: "",
    };
    form.setValue("weights", updatedWeights);
  };

  // Remove a condition from a weight
  const removeCondition = (weightIndex: number) => {
    const updatedWeights = [...weights];
    if (updatedWeights[weightIndex].condition) {
      delete updatedWeights[weightIndex].condition;
      form.setValue("weights", updatedWeights);
    }
  };

  // Update a weight value
  const updateWeightValue = (weightIndex: number, value: number) => {
    const updatedWeights = [...weights];
    updatedWeights[weightIndex].value = value;
    form.setValue("weights", updatedWeights);
  };

  // Update a condition property
  const updateConditionProperty = <
    K extends keyof NonNullable<FieldWeight["condition"]>
  >(
    weightIndex: number,
    property: K,
    value: NonNullable<FieldWeight["condition"]>[K]
  ) => {
    const updatedWeights = [...weights];
    const weightCondition = updatedWeights[weightIndex].condition;

    if (weightCondition) {
      weightCondition[property] = value;
      form.setValue("weights", updatedWeights);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">Field Weights</CardTitle>
        <CardDescription>
          Assign weights to this field based on its value. These weights can be
          used for scoring or calculations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {weights.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              No weights defined yet
            </p>
            <Button size="sm" onClick={addWeight}>
              <Plus className="mr-1 h-4 w-4" /> Add Weight
            </Button>
          </div>
        ) : (
          <>
            {weights.map((weight, weightIndex) => (
              <div key={weightIndex} className="mb-6 border rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">
                    Weight {weightIndex + 1}
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeWeight(weightIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mb-3">
                  <label className="text-sm font-medium mb-1 block">
                    Weight Value
                  </label>
                  <Input
                    type="number"
                    value={weight.value || 0}
                    onChange={(e) =>
                      updateWeightValue(weightIndex, parseFloat(e.target.value))
                    }
                    placeholder="Enter weight value"
                  />
                </div>

                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">
                      Condition (Optional)
                    </label>
                    {!weight.condition ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addCondition(weightIndex);
                        }}
                        type="button"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Condition
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeCondition(weightIndex);
                        }}
                        type="button"
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    )}
                  </div>

                  {weight.condition && (
                    <div className="grid grid-cols-12 gap-2 mb-2 items-start">
                      <div className="col-span-4">
                        <p className="text-sm text-muted-foreground">
                          This field
                        </p>
                      </div>

                      <div className="col-span-3">
                        <Select
                          value={weight.condition.operator}
                          onValueChange={(value) =>
                            updateConditionProperty(
                              weightIndex,
                              "operator",
                              value as RuleOperator
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {ruleOperators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {weight.condition.operator !== "isEmpty" &&
                        weight.condition.operator !== "isNotEmpty" && (
                          <div className="col-span-5">
                            <FieldValueInput
                              fieldType={form.getValues().fieldType}
                              operator={weight.condition.operator}
                              value={weight.condition.value}
                              onChange={(value) =>
                                updateConditionProperty(
                                  weightIndex,
                                  "value",
                                  value
                                )
                              }
                            />
                          </div>
                        )}
                    </div>
                  )}

                  {!weight.condition && (
                    <p className="text-xs text-muted-foreground">
                      Without a condition, this weight will always be applied.
                    </p>
                  )}
                </div>
              </div>
            ))}

            <Button size="sm" onClick={addWeight} className="mt-2">
              <Plus className="mr-1 h-4 w-4" /> Add Weight
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
