import { Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Option {
  value: string;
  label: string;
}

interface OptionsEditorProps {
  options: Option[];
  onChange: (options: Option[]) => void;
}

export function OptionsEditor({ options = [], onChange }: OptionsEditorProps) {
  const handleAddOption = () => {
    const newOptions = [
      ...options,
      {
        value: `option-${options.length + 1}`,
        label: `Option ${options.length + 1}`,
      },
    ];
    onChange(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    onChange(newOptions);
  };

  const handleOptionChange = (
    index: number,
    field: 'value' | 'label',
    value: string,
  ) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onChange(newOptions);
  };

  return (
    <div className='space-y-3'>
      <div className='flex justify-between items-center'>
        <Label>Options</Label>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={handleAddOption}
        >
          <Plus className='h-4 w-4 mr-1' /> Add Option
        </Button>
      </div>

      {options.length === 0 ? (
        <div className='text-center py-4 border rounded-md bg-muted/20'>
          <p className='text-sm text-muted-foreground'>No options added yet</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {options.map((option, index) => (
            <div key={index} className='flex items-center gap-2'>
              <div className='grid grid-cols-2 gap-2 flex-1'>
                <div>
                  <Input
                    value={option.value}
                    onChange={(e) =>
                      handleOptionChange(index, 'value', e.target.value)
                    }
                    placeholder='Value'
                    className='w-full'
                  />
                </div>
                <div>
                  <Input
                    value={option.label}
                    onChange={(e) =>
                      handleOptionChange(index, 'label', e.target.value)
                    }
                    placeholder='Label'
                    className='w-full'
                  />
                </div>
              </div>
              <Button
                type='button'
                size='icon'
                variant='ghost'
                onClick={() => handleRemoveOption(index)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
