import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { medicalTemplates } from '@/components/ui/form-builder/constant/medical-templates';
import { templates } from '@/components/ui/form-builder/constant/templates';
import useFormBuilderStore from '@/components/ui/form-builder/hooks/use-form-builder-store';
import { SaveTemplateDialog } from './save-template-dialog';

// Map built-in templates
const formTemplates = Object.entries(templates).map((template) => ({
  label: template[1].name,
  value: template[0],
  type: 'builtin',
}));

// Map medical templates
const medicalTemplatesList = Object.entries(medicalTemplates).map(
  (template) => ({
    label: template[1].name,
    value: template[0],
    description: template[1].description,
    type: 'medical',
  }),
);

type CustomTemplate = {
  label: string;
  value: string;
  description?: string;
  type: 'custom';
};

//======================================
export function TemplatesSelect() {
  const setTemplate = useFormBuilderStore((s) => s.setTemplate);
  const setCustomTemplate = useFormBuilderStore((s) => s.setCustomTemplate);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

  // Load custom templates from localStorage
  useEffect(() => {
    const loadCustomTemplates = () => {
      try {
        const savedTemplates = localStorage.getItem('customTemplates');
        if (savedTemplates) {
          const parsed = JSON.parse(savedTemplates);
          const templates = Object.entries(parsed).map(
            ([key, value]: [string, any]) => ({
              label: value.name,
              value: key,
              description: value.description,
              type: 'custom' as const,
            }),
          );
          setCustomTemplates(templates);
        }
      } catch (error) {
        console.error('Error loading custom templates:', error);
      }
    };

    loadCustomTemplates();

    // Add event listener to update templates when localStorage changes
    window.addEventListener('storage', loadCustomTemplates);
    return () => {
      window.removeEventListener('storage', loadCustomTemplates);
    };
  }, []);

  return (
    <div className='pb-2 flex flex-col gap-2'>
      <div className='flex justify-between items-center'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild tabIndex={-1} className='w-full'>
            <Button variant={'outline'}>
              <div className='flex items-center gap-2'>
                Templates
                <ChevronDown className='size-4' />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-full max-h-[400px] overflow-y-auto'>
            <DropdownMenuLabel>Basic Templates</DropdownMenuLabel>
            {formTemplates.map(({ label, value }) => (
              <DropdownMenuItem
                key={`builtin-${value}`}
                onSelect={() => setTemplate(value)}
                className='px-3.5 py-2.5'
              >
                {label}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Medical Templates</DropdownMenuLabel>
            {medicalTemplatesList.map(({ label, value, description }) => (
              <DropdownMenuItem
                key={`medical-${value}`}
                onSelect={() => setTemplate(value, 'medical')}
                className='px-3.5 py-2.5'
              >
                <div className='flex flex-col'>
                  <span>{label}</span>
                  {description && (
                    <span className='text-xs text-muted-foreground'>
                      {description}
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}

            {customTemplates.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Custom Templates</DropdownMenuLabel>
                {customTemplates.map(({ label, value, description }) => (
                  <DropdownMenuItem
                    key={`custom-${value}`}
                    onSelect={() => setCustomTemplate(value)}
                    className='px-3.5 py-2.5'
                  >
                    <div className='flex flex-col'>
                      <span>{label}</span>
                      {description && (
                        <span className='text-xs text-muted-foreground'>
                          {description}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
