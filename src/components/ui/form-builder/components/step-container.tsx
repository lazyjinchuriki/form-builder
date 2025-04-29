import { motion } from 'framer-motion';
import { PlusIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormElementsStepDropdown } from '@/components/ui/form-builder/components/form-elements-dropdown';
import useFormBuilderStore from '@/components/ui/form-builder/hooks/use-form-builder-store';

//======================================
export function StepContainer({
  children,
  stepIndex,
  fieldIndex,
}: {
  children: React.ReactNode;
  stepIndex: number;
  fieldIndex?: number;
}) {
  const { addFormStep, removeFormStep } = useFormBuilderStore();

  return (
    <motion.div
      key={stepIndex}
      className='rounded-lg px-3 md:px-4 md:py-5 py-4 border-dashed border bg-secondary/40'
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.2, delay: 0.05 } }}
      exit={{ opacity: 0, y: -15, transition: { duration: 0.3 } }}
    >
      <div className='flex-row-start mb-3'>
        <FormElementsStepDropdown stepIndex={stepIndex} />
      </div>
      <div className='space-y-3'>{children}</div>
      <div className='flex justify-between px-2 pt-4'>
        <div className='py-1 text-muted-foreground center font-medium'>
          Step {stepIndex + 1}
        </div>
        <div className='flex justify-end gap-3'>
          <Button
            onClick={() => removeFormStep(stepIndex)}
            variant='ghost'
            size='icon'
            className='rounded-lg'
            type='button'
          >
            <Trash2 size={16} />
          </Button>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='rounded-lg'
            onClick={() => addFormStep(stepIndex)}
          >
            <PlusIcon size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
