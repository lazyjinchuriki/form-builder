import type {
  FormElementOrList,
  FormStep,
} from "@/components/ui/form-builder/form-types";

type TemplateList = Record<
  string,
  {
    template: FormElementOrList[] | FormStep[];
    name: string;
    description: string;
  }
>;

export const medicalTemplates: TemplateList = {};
