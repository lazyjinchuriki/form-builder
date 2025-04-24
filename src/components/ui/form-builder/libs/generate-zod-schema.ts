import { type ZodTypeAny, z } from 'zod';
import type { FormElement } from '@/components/ui//form-builder/form-types';
import { isStatic } from '@/components/ui//form-builder/libs/utils';

export const generateZodSchema = (
  formElements: FormElement[],
): z.ZodObject<any> => {
  const schemaObject: Record<string, z.ZodTypeAny> = {};

  const addType = (element: FormElement): void => {
    if (isStatic(element.fieldType)) return;

    let elementSchema: z.ZodTypeAny;

    switch (element.fieldType) {
      case 'Input':
        if (element.type === 'email') {
          elementSchema = z.string().email();
          break;
        }
        if (element.type === 'number') {
          elementSchema = z.coerce.number();
          break;
        }
        elementSchema = z.string();
        break;
      case 'DatePicker':
        elementSchema = z.coerce.date();
        break;
      case 'Checkbox':
        elementSchema = z.boolean().default(true);
        break;
      case 'Slider':
        elementSchema = z.coerce.number();
        break;
      case 'Switch':
        elementSchema = z.boolean();
        break;
      case 'Select':
        elementSchema = z.string().min(1, 'Please an item');
        break;
      case 'ToggleGroup':
        elementSchema =
          element.type === 'single'
            ? z.string().min(1, 'Please an item')
            : z.array(z.string()).nonempty('Please select at least one item');
        break;
      case 'MultiSelect':
        elementSchema = z
          .array(z.string())
          .nonempty('Please select at least one item');
        break;
      case 'RadioGroup':
        elementSchema = z.string().min(1, 'Please select an item');
        break;
      case 'FilePicker': {
        const fileObjectSchema = z.object({
          name: z.string(),
          type: z.string(),
          size: z.number(),
          data: z.string(),
          preview: z.string().optional(),
        });

        // If multiple files are allowed, use an array schema
        if (element.multiple) {
          elementSchema = z.array(fileObjectSchema).optional();
        } else {
          elementSchema = fileObjectSchema.optional();
        }
        break;
      }
      default:
        elementSchema = z.string();
    }

    // Apply validations from the element's validations array
    if (
      'validations' in element &&
      element.validations &&
      element.validations.length > 0
    ) {
      element.validations.forEach((validation) => {
        switch (validation.type) {
          case 'required':
            if (
              elementSchema instanceof z.ZodString ||
              elementSchema instanceof z.ZodNumber
            ) {
              elementSchema = elementSchema.min(
                1,
                validation.message || 'This field is required',
              );
            }
            break;
          case 'minLength':
            if (elementSchema instanceof z.ZodString && validation.value) {
              elementSchema = elementSchema.min(
                validation.value,
                validation.message ||
                  `Must be at least ${validation.value} characters`,
              );
            }
            break;
          case 'maxLength':
            if (elementSchema instanceof z.ZodString && validation.value) {
              elementSchema = elementSchema.max(
                validation.value,
                validation.message ||
                  `Must be at most ${validation.value} characters`,
              );
            }
            break;
          case 'min':
            if (
              elementSchema instanceof z.ZodNumber &&
              validation.value !== undefined
            ) {
              elementSchema = elementSchema.min(
                validation.value,
                validation.message || `Must be at least ${validation.value}`,
              );
            }
            break;
          case 'max':
            if (
              elementSchema instanceof z.ZodNumber &&
              validation.value !== undefined
            ) {
              elementSchema = elementSchema.max(
                validation.value,
                validation.message || `Must be at most ${validation.value}`,
              );
            }
            break;
          case 'email':
            if (elementSchema instanceof z.ZodString) {
              elementSchema = elementSchema.email(
                validation.message || 'Invalid email address',
              );
            }
            break;
          case 'url':
            if (elementSchema instanceof z.ZodString) {
              elementSchema = elementSchema.url(
                validation.message || 'Invalid URL',
              );
            }
            break;
        }
      });
    }

    if (element.fieldType === 'Slider') {
      if (element.min !== undefined) {
        elementSchema = (elementSchema as any).min(
          element.min,
          `Must be at least ${element.min}`,
        );
      }
      if (element.max !== undefined) {
        elementSchema = (elementSchema as any).max(
          element.max,
          `Must be at most ${element.max}`,
        );
      }
    }

    // Make field optional if not required
    if (!('required' in element) || element.required !== true) {
      // Check if any of the validations is 'required'
      const hasRequiredValidation =
        'validations' in element &&
        element.validations?.some((v) => v.type === 'required');
      if (!hasRequiredValidation) {
        elementSchema = elementSchema.optional();
      }
    }

    // Ensure fieldSchema is of type ZodTypeAny
    schemaObject[element.name] = elementSchema as ZodTypeAny;
  };
  formElements.flat().forEach(addType);

  return z.object(schemaObject);
};

export const zodSchemaToString = (schema: z.ZodTypeAny): string => {
  if (schema instanceof z.ZodDefault) {
    return `${zodSchemaToString(schema._def.innerType)}.default(${JSON.stringify(schema._def.defaultValue())})`;
  }

  if (schema instanceof z.ZodBoolean) {
    return 'z.boolean()';
  }

  if (schema instanceof z.ZodNumber) {
    let result = 'z.number()';
    if ('checks' in schema._def) {
      for (const check of schema._def.checks) {
        if (check.kind === 'min') {
          result += `.min(${check.value})`;
        } else if (check.kind === 'max') {
          result += `.max(${check.value})`;
        }
      }
    }

    return result;
  }

  if (schema instanceof z.ZodString) {
    let result = 'z.string()';
    if ('checks' in schema._def) {
      for (const check of schema._def.checks) {
        if (check.kind === 'min') {
          result += `.min(${check.value})`;
        } else if (check.kind === 'max') {
          result += `.max(${check.value})`;
        }
      }
    }

    return result;
  }

  if (schema instanceof z.ZodDate) {
    return 'z.coerce.date()';
  }

  if (schema instanceof z.ZodArray) {
    return `z.array(${zodSchemaToString(schema.element)}).nonempty("Please at least one item")`;
  }

  if (schema instanceof z.ZodTuple) {
    return `z.tuple([${schema.items.map((item: z.ZodTypeAny) => zodSchemaToString(item)).join(', ')}])`;
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const shapeStrs = Object.entries(shape).map(
      ([key, value]) => `${key}: ${zodSchemaToString(value as ZodTypeAny)}`,
    );

    return `z.object({
  ${shapeStrs.join(',\n  ')}
})`;
  }

  if (schema instanceof z.ZodOptional) {
    return `${zodSchemaToString(schema.unwrap())}.optional()`;
  }

  return 'z.unknown()';
};

export const getZodSchemaString = (formElements: FormElement[]): string => {
  const schema = generateZodSchema(formElements);
  const schemaEntries = Object.entries(schema.shape)
    .map(([key, value]) => {
      return `"${key}": ${zodSchemaToString(value as ZodTypeAny)}`;
    })
    .join(',\n');

  return `
  import * as z from "zod"

  export interface ActionResponse<T = any> {
      success: boolean
      message: string
      errors?: {
          [K in keyof T]?: string[]
      }
      inputs?: T
  }
  export const formSchema = z.object({\n${schemaEntries}\n});`;
};
