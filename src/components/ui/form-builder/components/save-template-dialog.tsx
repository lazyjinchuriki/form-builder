import { Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import useFormBuilderStore from '@/components/ui/form-builder/hooks/use-form-builder-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function SaveTemplateDialog() {
  const [open, setOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const formElements = useFormBuilderStore((s) => s.formElements);
  const isMS = useFormBuilderStore((s) => s.isMS);

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      // toast({
      //   variant: 'destructive',
      //   title: 'Template name is required',
      //   description: 'Please enter a name for your template',
      // });
      toast.error('Template name is required');
      return;
    }

    try {
      // Get existing templates from localStorage
      const existingTemplatesStr = localStorage.getItem('customTemplates');
      const existingTemplates = existingTemplatesStr
        ? JSON.parse(existingTemplatesStr)
        : {};

      // Add new template
      const newTemplate = {
        name: templateName,
        description: templateDescription,
        template: formElements,
        isMS,
      };

      // Create a unique key based on the template name
      const templateKey = templateName.toLowerCase().replace(/[^a-z0-9]/g, '_');

      // Save to localStorage
      localStorage.setItem(
        'customTemplates',
        JSON.stringify({
          ...existingTemplates,
          [templateKey]: newTemplate,
        }),
      );

      // toast({
      //   title: 'Template saved',
      //   description: `"${templateName}" has been saved to your templates`,
      // });
      toast.success('Template saved');

      // Reset form and close dialog
      setTemplateName('');
      setTemplateDescription('');
      setOpen(false);
    } catch (error) {
      console.error('Error saving template:', error);
      // toast({
      //   variant: 'destructive',
      //   title: 'Error saving template',
      //   description:
      //     'There was an error saving your template. Please try again.',
      // });
      toast.error('Error saving template');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Save className='h-4 w-4 mr-2' />
          Save Template
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save your current form as a template for future use.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Name
            </Label>
            <Input
              id='name'
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className='col-span-3'
              placeholder='Enter template name'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='description' className='text-right'>
              Description
            </Label>
            <Textarea
              id='description'
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              className='col-span-3'
              placeholder='Enter template description'
            />
          </div>
        </div>
        <DialogFooter>
          <Button type='submit' onClick={handleSaveTemplate}>
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
