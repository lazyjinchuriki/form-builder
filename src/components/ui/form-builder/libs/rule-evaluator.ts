import { FieldRule, FieldWeight, RuleCondition } from '../form-types';

/**
 * Evaluates a single condition against form data
 */
export const evaluateCondition = (
  condition: RuleCondition,
  formData: Record<string, any>,
): boolean => {
  const { sourceField, operator, value } = condition;
  const fieldValue = formData[sourceField];

  // Handle undefined or null field values
  if (fieldValue === undefined || fieldValue === null) {
    if (operator === 'isEmpty') return true;
    if (operator === 'isNotEmpty') return false;
    if (operator === 'equals' && (value === undefined || value === null))
      return true;
    if (operator === 'notEquals' && value !== undefined && value !== null)
      return true;

    return false;
  }

  // Convert values for comparison if needed
  let compareValue = value;
  let compareFieldValue = fieldValue;

  // Handle boolean values (from checkboxes, switches, etc.)
  if (typeof fieldValue === 'boolean') {
    if (typeof value === 'string') {
      compareValue = value.toLowerCase() === 'true';
    }
  }

  // Handle numeric comparisons
  if (operator === 'greaterThan' || operator === 'lessThan') {
    compareFieldValue = Number(fieldValue);
    compareValue = Number(value);
  }

  switch (operator) {
    case 'equals':
      return compareFieldValue === compareValue;
    case 'notEquals':
      return compareFieldValue !== compareValue;
    case 'contains':
      if (typeof compareFieldValue === 'string') {
        return compareFieldValue.includes(String(compareValue));
      } else if (Array.isArray(compareFieldValue)) {
        return compareFieldValue.includes(compareValue);
      }

      return false;
    case 'greaterThan':
      return compareFieldValue > compareValue;
    case 'lessThan':
      return compareFieldValue < compareValue;
    case 'isEmpty':
      return (
        compareFieldValue === '' ||
        (Array.isArray(compareFieldValue) && compareFieldValue.length === 0)
      );
    case 'isNotEmpty':
      return (
        compareFieldValue !== '' &&
        (!Array.isArray(compareFieldValue) || compareFieldValue.length > 0)
      );
    default:
      return false;
  }
};

/**
 * Evaluates all rules for a field against form data
 */
export const evaluateRules = (
  rules: FieldRule[] | undefined,
  formData: Record<string, any>,
): { visible: boolean; enabled: boolean } => {
  // Default state: visible and enabled
  const result = { visible: true, enabled: true };

  if (!rules || rules.length === 0) {
    return result;
  }

  // Process each rule
  for (const rule of rules) {
    const { conditions, action, logicOperator } = rule;

    if (!conditions || conditions.length === 0) {
      continue;
    }

    // Evaluate all conditions
    const conditionResults = conditions.map((condition) => {
      // Skip conditions with empty source fields
      if (!condition.sourceField) return false;

      return evaluateCondition(condition, formData);
    });

    // Determine if rule should be applied based on logic operator
    const shouldApplyRule =
      logicOperator === 'AND'
        ? conditionResults.every((result) => result)
        : conditionResults.some((result) => result);

    if (shouldApplyRule) {
      // Apply the rule action
      switch (action) {
        case 'show':
          result.visible = true;
          break;
        case 'hide':
          result.visible = false;
          break;
        case 'enable':
          result.enabled = true;
          break;
        case 'disable':
          result.enabled = false;
          break;
      }
    } else if (action === 'show') {
      // If the rule is a 'show' rule and conditions are not met, hide the field
      result.visible = false;
    } else if (action === 'enable') {
      // If the rule is an 'enable' rule and conditions are not met, disable the field
      result.enabled = false;
    }
  }

  // Log for debugging
  console.log('Rule evaluation result:', result);

  return result;
};

/**
 * Calculates the total weight for a field based on its value and weight rules
 */
export const calculateFieldWeight = (
  weights: FieldWeight[] | undefined,
  formData: Record<string, any>,
): number => {
  if (!weights || weights.length === 0) {
    return 0;
  }

  let totalWeight = 0;

  for (const weight of weights) {
    // If there's no condition, always apply the weight
    if (!weight.condition) {
      totalWeight += weight.value;
      continue;
    }

    // Otherwise, check if the condition is met
    if (evaluateCondition(weight.condition, formData)) {
      totalWeight += weight.value;
    }
  }

  return totalWeight;
};

/**
 * Calculates the total weight for all fields in the form
 */
export const calculateTotalWeight = (
  formElements: any[],
  formData: Record<string, any>,
): number => {
  let totalWeight = 0;

  // Flatten the form elements if needed
  const flattenedElements = flattenFormElements(formElements);

  // Calculate weight for each field
  for (const element of flattenedElements) {
    if (element.weights && !element.static) {
      totalWeight += calculateFieldWeight(element.weights, formData);
    }
  }

  return totalWeight;
};

/**
 * Helper function to flatten nested form elements
 */
const flattenFormElements = (elements: any[]): any[] => {
  const result: any[] = [];

  for (const element of elements) {
    if (Array.isArray(element)) {
      result.push(...flattenFormElements(element));
    } else if (element.stepFields) {
      // Handle multi-step form
      result.push(...flattenFormElements(element.stepFields));
    } else {
      result.push(element);
    }
  }

  return result;
};
