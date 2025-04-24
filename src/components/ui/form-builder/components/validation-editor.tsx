import { Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ValidationRule } from '@/components/ui/form-builder/form-types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ValidationEditorProps {
  validations: ValidationRule[];
  onChange: (validations: ValidationRule[]) => void;
  fieldType: string;
}

export function ValidationEditor({
  validations = [],
  onChange,
  fieldType,
}: ValidationEditorProps) {
  // Get validation types based on field type
  const getValidationTypes = () => {
    const commonValidations = [{ value: 'required', label: 'Required' }];

    const textValidations = [
      { value: 'minLength', label: 'Minimum Length' },
      { value: 'maxLength', label: 'Maximum Length' },
      { value: 'pattern', label: 'Pattern (Regex)' },
    ];

    const numberValidations = [
      { value: 'min', label: 'Minimum Value' },
      { value: 'max', label: 'Maximum Value' },
    ];

    const emailValidations = [{ value: 'email', label: 'Email Format' }];

    const urlValidations = [{ value: 'url', label: 'URL Format' }];

    const dateValidations = [
      { value: 'minDate', label: 'Minimum Date' },
      { value: 'maxDate', label: 'Maximum Date' },
      { value: 'afterToday', label: 'After Today' },
      { value: 'beforeToday', label: 'Before Today' },
    ];

    const fileValidations = [{ value: 'maxSize', label: 'Maximum File Size' }];

    switch (fieldType) {
      case 'Input':
        return [
          ...commonValidations,
          ...textValidations,
          ...emailValidations,
          ...urlValidations,
        ];
      case 'Textarea':
        return [...commonValidations, ...textValidations];
      case 'PasswordInput':
        return [...commonValidations, ...textValidations];
      case 'Slider':
      case 'Rating':
        return [...commonValidations, ...numberValidations];
      case 'DatePicker':
        return [...commonValidations, ...dateValidations];
      case 'FilePicker':
        return [...commonValidations, ...fileValidations];
      default:
        return commonValidations;
    }
  };

  const validationTypes = getValidationTypes();

  const handleAddValidation = () => {
    const newValidation: ValidationRule = {
      type: 'required',
      message: 'This field is required',
    };
    onChange([...validations, newValidation]);
  };

  const handleRemoveValidation = (index: number) => {
    const newValidations = [...validations];
    newValidations.splice(index, 1);
    onChange(newValidations);
  };

  const handleValidationChange = (
    index: number,
    field: keyof ValidationRule,
    value: any,
  ) => {
    const newValidations = [...validations];
    newValidations[index] = { ...newValidations[index], [field]: value };

    // Set default message based on validation type
    if (field === 'type') {
      switch (value) {
        case 'required':
          newValidations[index].message = 'This field is required';
          break;
        case 'minLength':
          newValidations[index].message =
            'Must be at least ${value} characters';
          newValidations[index].value = 3;
          break;
        case 'maxLength':
          newValidations[index].message = 'Must be at most ${value} characters';
          newValidations[index].value = 100;
          break;
        case 'min':
          newValidations[index].message = 'Must be at least ${value}';
          newValidations[index].value = 0;
          break;
        case 'max':
          newValidations[index].message = 'Must be at most ${value}';
          newValidations[index].value = 100;
          break;
        case 'pattern':
          newValidations[index].message = 'Invalid format';
          newValidations[index].value = '';
          break;
        case 'email':
          newValidations[index].message = 'Must be a valid email address';
          break;
        case 'url':
          newValidations[index].message = 'Must be a valid URL';
          break;
        case 'minDate':
          newValidations[index].message = 'Date must be after ${value}';
          newValidations[index].value = new Date().toISOString().split('T')[0];
          break;
        case 'maxDate':
          newValidations[index].message = 'Date must be before ${value}';
          newValidations[index].value = new Date().toISOString().split('T')[0];
          break;
        case 'afterToday':
          newValidations[index].message = 'Date must be after today';
          break;
        case 'beforeToday':
          newValidations[index].message = 'Date must be before today';
          break;
        case 'maxSize':
          newValidations[index].message =
            'File must be smaller than ${value}MB';
          newValidations[index].value = 5;
          break;
      }
    }

    onChange(newValidations);
  };

  // Render value input based on validation type
  const renderValueInput = (validation: ValidationRule, index: number) => {
    if (
      !validation.type ||
      validation.type === 'required' ||
      validation.type === 'email' ||
      validation.type === 'url' ||
      validation.type === 'afterToday' ||
      validation.type === 'beforeToday'
    ) {
      return null;
    }

    switch (validation.type) {
      case 'minLength':
      case 'maxLength':
      case 'min':
      case 'max':
        return (
          <Input
            type='number'
            value={validation.value || ''}
            onChange={(e) =>
              handleValidationChange(index, 'value', parseFloat(e.target.value))
            }
            placeholder='Value'
            className='w-full'
          />
        );
      case 'pattern':
        return (
          <Input
            type='text'
            value={validation.value || ''}
            onChange={(e) =>
              handleValidationChange(index, 'value', e.target.value)
            }
            placeholder='Regular expression'
            className='w-full'
          />
        );
      case 'minDate':
      case 'maxDate':
        return (
          <Input
            type='date'
            value={validation.value || ''}
            onChange={(e) =>
              handleValidationChange(index, 'value', e.target.value)
            }
            className='w-full'
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='space-y-3'>
      <div className='flex justify-between items-center'>
        <Label>Validations</Label>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={handleAddValidation}
        >
          <Plus className='h-4 w-4 mr-1' /> Add Validation
        </Button>
      </div>

      {validations.length === 0 ? (
        <div className='text-center py-4 border rounded-md bg-muted/20'>
          <p className='text-sm text-muted-foreground'>
            No validations added yet
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {validations.map((validation, index) => (
            <div key={index} className='p-3 border rounded-md'>
              <div className='flex justify-between items-center mb-2'>
                <h4 className='text-sm font-medium'>Validation {index + 1}</h4>
                <Button
                  type='button'
                  size='icon'
                  variant='ghost'
                  onClick={() => handleRemoveValidation(index)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>

              <div className='grid grid-cols-1 gap-3'>
                <div>
                  <Label className='mb-1 block'>Type</Label>
                  <Select
                    value={validation.type}
                    onValueChange={(value) =>
                      handleValidationChange(index, 'type', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select validation type' />
                    </SelectTrigger>
                    <SelectContent>
                      {validationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {renderValueInput(validation, index)}

                <div>
                  <Label className='mb-1 block'>Error Message</Label>
                  <Input
                    value={validation.message || ''}
                    onChange={(e) =>
                      handleValidationChange(index, 'message', e.target.value)
                    }
                    placeholder='Error message'
                    className='w-full'
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
