"use client";

import { Bug, ExternalLink, Lightbulb } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  GeneratedFormCodeViewer,
  JsonViewer,
} from "@/components/ui/form-builder/components/code-viewer";
import { FormEdit } from "@/components/ui/form-builder/components/form-edit";
import { FormElementSelector } from "@/components/ui/form-builder/components/form-elements-selector";
import { FormPreview } from "@/components/ui/form-builder/components/form-preview";
import { CommandProvider } from "@/components/ui/form-builder/hooks/use-command-ctx";
import { useFormBuilder } from "@/components/ui/form-builder/hooks/use-form-builder";
import useFormBuilderStore from "@/components/ui/form-builder/hooks/use-form-builder-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SaveTemplateDialog } from "./save-template-dialog";

const tabsList = [
  {
    name: "Edit",
  },
  // {
  //   name: 'Code',
  // },
  {
    name: "JSON",
  },
  {
    name: "Submission",
  },
];

//======================================
export function FormBuilderMain() {
  const { submittedData, resetForm, form } = useFormBuilder();
  const formElements = useFormBuilderStore((s) => s.formElements);
  const isMS = useFormBuilderStore((s) => s.isMS);
  const setIsMS = useFormBuilderStore((s) => s.setIsMS);

  return (
    <>
      <div className="w-full grid md:grid-cols-12 gap-3 lg:gap-5 p-2">
        <CommandProvider>
          <FormElementSelector />
        </CommandProvider>
        <div className="px-4 sm:px-0 w-full md:col-span-6 min-w-full grow ">
          <Tabs defaultValue={tabsList[0].name} className="">
            <TabsList className="w-full">
              {tabsList.map((tab) => (
                <TabsTrigger key={tab.name} value={tab.name} className="w-full">
                  {tab.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={tabsList[0].name} tabIndex={-1}>
              <div className="pb-4 flex justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setIsMS(!isMS)}
                >
                  {isMS ? "Single-step" : "Multi-step"} Form
                </Button>
                <SaveTemplateDialog />
                {formElements.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={resetForm}
                    className="rounded-lg"
                  >
                    Reset
                  </Button>
                )}
              </div>
              <FormEdit />
            </TabsContent>
            {/* <TabsContent value={tabsList[1].name} tabIndex={-1}>
              <GeneratedFormCodeViewer />
            </TabsContent> */}
            <TabsContent value={tabsList[1].name} tabIndex={-1}>
              <JsonViewer json={formElements} isMS={isMS} />
            </TabsContent>
            <TabsContent value={tabsList[2].name} tabIndex={-1}>
              <JsonViewer json={submittedData} isMS={isMS} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="md:col-span-4 w-full">
          <FormPreview form={form as any} />
        </div>
      </div>
    </>
  );
}
