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
  FieldRule,
  FormElement,
  RuleActionType,
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
import { Separator } from "@/components/ui/separator";

const ruleOperators: { value: RuleOperator; label: string }[] = [
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "greaterThan", label: "Greater Than" },
  { value: "lessThan", label: "Less Than" },
  { value: "isEmpty", label: "Is Empty" },
  { value: "isNotEmpty", label: "Is Not Empty" },
];

const ruleActions: { value: RuleActionType; label: string }[] = [
  { value: "show", label: "Show Field" },
  { value: "hide", label: "Hide Field" },
  { value: "enable", label: "Enable Field" },
  { value: "disable", label: "Disable Field" },
];

const logicOperators = [
  { value: "AND", label: "All conditions must be true (AND)" },
  { value: "OR", label: "Any condition can be true (OR)" },
];

// Helper function to get field type-specific value input
const FieldValueInput = ({
  sourceField,
  operator,
  value,
  onChange,
  availableFields,
}: {
  sourceField: string;
  operator: RuleOperator;
  value: any;
  onChange: (value: any) => void;
  availableFields: FormElement[];
}) => {
  // Find the source field to determine its type
  const sourceFieldObj = availableFields.find(
    (field) => field.name === sourceField
  );

  if (!sourceFieldObj) {
    return (
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Value"
      />
    );
  }

  // Handle different field types
  switch (sourceFieldObj.fieldType) {
    case "Checkbox":
    case "Switch":
      return (
        <RadioGroup
          value={String(value)}
          onValueChange={(val) => onChange(val === "true")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="true" />
            <Label htmlFor="true">True</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="false" />
            <Label htmlFor="false">False</Label>
          </div>
        </RadioGroup>
      );

    case "Select":
    case "RadioGroup":
    case "ToggleGroup":
      if (sourceFieldObj.options) {
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {sourceFieldObj.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Value"
        />
      );

    case "Input":
      if (sourceFieldObj.type === "number") {
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

export function FieldRuleEditor({
  form,
  currentFieldName,
}: {
  form: UseFormReturn<FormElement>;
  currentFieldName: string;
}) {
  const formElements = useFormBuilderStore((s) => s.formElements);
  const isMS = useFormBuilderStore((s) => s.isMS);

  // Get all form fields except the current one and static fields
  const availableFields = React.useMemo(() => {
    let allFields: FormElement[] = [];

    if (isMS) {
      // Handle multi-step form
      const steps = formElements as any[];
      steps.forEach((step) => {
        const fields = step.stepFields.flat();
        allFields = [...allFields, ...fields];
      });
    } else {
      // Handle regular form
      allFields = (formElements as any[]).flat();
    }

    return allFields.filter(
      (field: FormElement) => !field.static && field.name !== currentFieldName
    );
  }, [formElements, currentFieldName, isMS]);

  // Get current rules from form
  const rules = form.watch("rules") || [];

  // Add a new empty rule
  const addRule = () => {
    const newRule: FieldRule = {
      conditions: [
        {
          sourceField: "",
          operator: "equals",
          value: "",
        },
      ],
      action: "show",
      logicOperator: "AND",
    };

    form.setValue("rules", [...rules, newRule]);
  };

  // Remove a rule
  const removeRule = (ruleIndex: number) => {
    const updatedRules = [...rules];
    updatedRules.splice(ruleIndex, 1);
    form.setValue("rules", updatedRules);
  };

  // Add a condition to a rule
  const addCondition = (ruleIndex: number) => {
    const updatedRules = [...rules];
    updatedRules[ruleIndex].conditions.push({
      sourceField: "",
      operator: "equals",
      value: "",
    });
    form.setValue("rules", updatedRules);
  };

  // Remove a condition from a rule
  const removeCondition = (ruleIndex: number, conditionIndex: number) => {
    const updatedRules = [...rules];
    updatedRules[ruleIndex].conditions.splice(conditionIndex, 1);
    form.setValue("rules", updatedRules);
  };

  // Update a rule property
  const updateRuleProperty = (
    ruleIndex: number,
    property: keyof FieldRule,
    value: FieldRule[keyof FieldRule] // More specific type for value
  ) => {
    const updatedRules = [...rules];

    // Type assertion to handle the assignment
    (updatedRules[ruleIndex][property] as FieldRule[keyof FieldRule]) = value;

    form.setValue("rules", updatedRules);
  };

  // Update a condition property
  const updateConditionProperty = (
    ruleIndex: number,
    conditionIndex: number,
    property: keyof FieldRule["conditions"][0],
    value: FieldRule["conditions"][0][keyof FieldRule["conditions"][0]] // More specific type for value
  ) => {
    const updatedRules = [...rules];

    // Type assertion to handle the assignment
    (updatedRules[ruleIndex].conditions[conditionIndex][
      property
    ] as FieldRule["conditions"][0][keyof FieldRule["conditions"][0]]) = value;

    form.setValue("rules", updatedRules);
  };

  if (availableFields.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Field Rules</CardTitle>
          <CardDescription>
            Add other form fields first to create rules based on their values.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">Field Rules</CardTitle>
        <CardDescription>
          Create rules to show/hide or enable/disable this field based on other
          fields&apos; values.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              No rules defined yet
            </p>
            <Button size="sm" onClick={addRule}>
              <Plus className="mr-1 h-4 w-4" /> Add Rule
            </Button>
          </div>
        ) : (
          <>
            {rules.map((rule, ruleIndex) => (
              <div key={ruleIndex} className="mb-6 border rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Rule {ruleIndex + 1}</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeRule(ruleIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mb-3">
                  <label className="text-sm font-medium mb-1 block">
                    Action
                  </label>
                  <Select
                    value={rule.action}
                    onValueChange={(value) =>
                      updateRuleProperty(
                        ruleIndex,
                        "action",
                        value as RuleActionType
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {ruleActions.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-3">
                  <label className="text-sm font-medium mb-1 block">
                    Logic
                  </label>
                  <Select
                    value={rule.logicOperator}
                    onValueChange={(value) =>
                      updateRuleProperty(
                        ruleIndex,
                        "logicOperator",
                        value as "AND" | "OR"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select logic" />
                    </SelectTrigger>
                    <SelectContent>
                      {logicOperators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Conditions</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addCondition(ruleIndex)}
                      disabled={rule.conditions.length >= 3}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>

                  {rule.conditions.map((condition, conditionIndex) => (
                    <div
                      key={conditionIndex}
                      className="grid grid-cols-12 gap-2 mb-2 items-start"
                    >
                      <div className="col-span-4">
                        <Select
                          value={condition.sourceField}
                          onValueChange={(value) =>
                            updateConditionProperty(
                              ruleIndex,
                              conditionIndex,
                              "sourceField",
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Field" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields.map((field: FormElement) => (
                              <SelectItem key={field.name} value={field.name}>
                                {"label" in field ? field.label : field.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-3">
                        <Select
                          value={condition.operator}
                          onValueChange={(value) =>
                            updateConditionProperty(
                              ruleIndex,
                              conditionIndex,
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

                      {condition.operator !== "isEmpty" &&
                        condition.operator !== "isNotEmpty" && (
                          <div className="col-span-4">
                            <FieldValueInput
                              sourceField={condition.sourceField}
                              operator={condition.operator}
                              value={condition.value}
                              onChange={(value) =>
                                updateConditionProperty(
                                  ruleIndex,
                                  conditionIndex,
                                  "value",
                                  value
                                )
                              }
                              availableFields={availableFields}
                            />
                          </div>
                        )}

                      <div
                        className={
                          condition.operator === "isEmpty" ||
                          condition.operator === "isNotEmpty"
                            ? "col-span-5"
                            : "col-span-1"
                        }
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            removeCondition(ruleIndex, conditionIndex)
                          }
                          disabled={rule.conditions.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Button size="sm" onClick={addRule} className="mt-2">
              <Plus className="mr-1 h-4 w-4" /> Add Rule
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
