import { PlusIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormElementsSelectorCommand } from '@/components/ui/form-builder/components/form-elements-selector-command';
import { TemplatesSelect } from '@/components/ui/form-builder/components/templates-select';
import { formElementsList } from '@/components/ui/form-builder/constant/form-elements-list';
import { FormElement } from '@/components/ui/form-builder/form-types';
import useFormBuilderStore from '@/components/ui/form-builder/hooks/use-form-builder-store';
import { ScrollArea } from '@/components/ui/scroll-area';

//======================================
export function FormElementSelector() {
  const appendElement = useFormBuilderStore((s) => s.appendElement);
  const formElements = useFormBuilderStore((s) => s.formElements);
  const isMS = useFormBuilderStore((s) => s.isMS);

  return (
    <ScrollArea
      className='border rounded-sm border-dashed overflow-auto p-3 w-full md:col-span-2'
      style={{
        height: '100%',
        maxHeight: '90%',
      }}
    >
      <TemplatesSelect />
      <FormElementsSelectorCommand />
      <div className='flex md:flex-col flex-wrap gap-2 flex-row'>
        {formElementsList.map((o) => (
          <Button
            key={o.name}
            size='sm'
            variant='secondary'
            onClick={() => {
              appendElement({
                fieldType: o.fieldType as FormElement['fieldType'],
                stepIndex: isMS ? formElements.length - 1 : undefined,
              });
            }}
            className='gap-1 justify-start rounded-lg w-fit md:w-full relative text-sm px-2'
          >
            <div className='flex items-center justify-start gap-1'>
              <PlusIcon size={16} />
              {o.name}
              {/* {o.isNew && <Badge className='text-sm rounded-full'>N</Badge>} */}
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
