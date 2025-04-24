'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import type {
  FormElement,
  FormStep,
} from '@/components/ui/form-builder/form-types';
import useFormBuilderStore from '@/components/ui/form-builder/hooks/use-form-builder-store';
import { flattenFormSteps } from '@/components/ui/form-builder/libs/form-elements-helpers';
import { generateZodSchema } from '@/components/ui/form-builder/libs/generate-zod-schema';

//-------------------------------------------
export const useFormBuilder = () => {
  interface DefaultValues {
    [key: string]: any;
  }
  const isMS = useFormBuilderStore((s) => s.isMS);
  const formElements = useFormBuilderStore((s) => s.formElements);
  const resestFormElements = useFormBuilderStore((s) => s.resestFormElements);

  const flattenFormElements = isMS
    ? flattenFormSteps(formElements as FormStep[]).flat()
    : (formElements.flat() as FormElement[]);

  const filteredFormFields = flattenFormElements.filter((o) => !o.static);

  const defaultValues: DefaultValues = filteredFormFields.reduce(
    (acc: DefaultValues, element) => {
      acc[element.name] = '';

      return acc;
    },
    {},
  );

  const zodSchema = generateZodSchema(filteredFormFields);

  const form = useForm({
    defaultValues,
    resolver: zodResolver(zodSchema),
    mode: 'onChange', // This will validate on change instead of just on submit
  });

  const { watch, reset } = form;
  const [submittedData, setSubmittedData] = React.useState({});

  React.useEffect(() => {
    const { unsubscribe } = watch((data) => {
      setSubmittedData(data);
    });

    return unsubscribe;
  }, [watch]);

  const resetForm = () => {
    // Remove all fields from the form
    resestFormElements();
    // reset to all default values
    reset();
    // reset submitted data
    setSubmittedData({});
  };
  const onSubmit = async (data: any) => {
    // Check if there are any validation errors
    const isValid = await form.trigger();
    if (!isValid) {
      console.log('Form has validation errors');
      return;
    }

    setSubmittedData(data);
    console.log('Form submitted successfully:', data);

    return new Promise((resolve) => setTimeout(resolve, 2000));
  };

  return {
    form,
    submittedData,

    onSubmit,
    resetForm,
  };
};
