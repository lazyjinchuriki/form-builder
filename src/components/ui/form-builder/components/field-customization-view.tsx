import { Edit } from "lucide-react";
import * as React from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Form } from "@/components/ui/form";
import { FieldRuleEditor } from "@/components/ui/form-builder/components/field-rule-editor";
import { FieldWeightEditor } from "@/components/ui/form-builder/components/field-weight-editor";
import { OptionsEditor } from "@/components/ui/form-builder/components/options-editor";
import { RenderFormElement } from "@/components/ui/form-builder/components/render-form-element";
import { ValidationEditor } from "@/components/ui/form-builder/components/validation-editor";
import type { FormElement } from "@/components/ui/form-builder/form-types";
import useFormBuilderStore from "@/components/ui/form-builder/hooks/use-form-builder-store";
import { isStatic } from "@/components/ui/form-builder/libs/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import Image from "next/image";

const inputTypes = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "number", label: "Number" },
  { value: "password", label: "Password" },
  { value: "tel", label: "Telephone" },
];

// First, let's properly type the RenderFormElement component
type RenderFormElementProps = {
  formElement: FormElement;
  form: UseFormReturn<FormElement>;
};

function FormElementOptions({
  fieldIndex,
  close,
  j,
  stepIndex,
  cellPosition,
  ...formElement
}: FormElement & {
  fieldIndex: number;
  stepIndex?: number;
  j?: number;
  cellPosition?: { rowIndex: number; cellIndex: number };
  close: () => void;
}) {
  const form = useForm<FormElement>({
    defaultValues: formElement as FormElement,
    mode: "onChange", // Validate on change
  });
  const editElement = useFormBuilderStore((s) => s.editElement);
  const { handleSubmit, getValues } = form;

  const onSubmit = () => {
    if (cellPosition) {
      // Get the current layout container
      const state = useFormBuilderStore.getState();
      const formElements = state.isMS
        ? (state.formElements[stepIndex as number] as FormElementOrList[])
        : (state.formElements as FormElementOrList[]);
      const layoutContainer = formElements[fieldIndex];

      if (
        layoutContainer.fieldType === "LayoutContainer" &&
        "rows" in layoutContainer
      ) {
        // Update the cell with the new element
        const rows = [...layoutContainer.rows];
        rows[cellPosition.rowIndex].cells[cellPosition.cellIndex].element =
          getValues();
        editElement({
          fieldIndex: fieldIndex,
          modifiedFormElement: {
            ...layoutContainer,
            rows,
          },
          j,
          stepIndex,
        });
      }
    } else {
      // Regular edit
      editElement({
        fieldIndex: fieldIndex,
        modifiedFormElement: getValues(),
        j,
        stepIndex,
      });
    }
    close();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="pt-3 border-t border-dashed"
      >
        {isStatic(formElement.fieldType) ? (
          <div className="mb-4">
            <RenderFormElement
              formElement={{
                name: "content",
                label: `Customize ${formElement.fieldType}`,
                fieldType: "Input",
                defaultValue: (formElement as { content?: string }).content,
                required: true,
              }}
              form={form}
            />
            <div className="flex justify-end gap-3 w-full mt-4">
              <Button size="sm" variant="ghost" onClick={close} type="button">
                Cancel
              </Button>
              <Button size="sm" type="submit" variant="secondary">
                Save
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="validations">Validations</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="weights">Weights</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4">
              <div className="flex-col-start w-full gap-3 mb-2">
                <div className="flex-row-between gap-2 w-full">
                  <RenderFormElement
                    formElement={{
                      name: "name",
                      label: "Name attribute",
                      fieldType: "Input",
                      defaultValue: formElement.name,
                      required: true,
                    }}
                    form={form}
                  />
                  <RenderFormElement
                    formElement={{
                      name: "placeholder",
                      label: "Placeholder attribute",
                      fieldType: "Input",
                      type: "text",
                      required: true,
                    }}
                    form={form}
                  />
                </div>
                <div className="flex-row-between gap-2 w-full">
                  <RenderFormElement
                    formElement={{
                      name: "label",
                      label: "Label attribute",
                      fieldType: "Input",
                      type: "text",
                      required: true,
                    }}
                    form={form}
                  />
                  {formElement.fieldType === "Input" && (
                    <RenderFormElement
                      formElement={{
                        name: "type",
                        label: "Select input type",
                        fieldType: "Select",
                        options: inputTypes,
                        required: true,
                        placeholder: "Select input type",
                      }}
                      form={form}
                    />
                  )}
                </div>
                <RenderFormElement
                  formElement={{
                    name: "description",
                    label: "Describe the field",
                    fieldType: "Input",
                    placeholder: "Add a description",
                  }}
                  form={form}
                />
                {formElement.fieldType === "Slider" && (
                  <div className="flex-row-between gap-3">
                    <RenderFormElement
                      formElement={{
                        name: "min",
                        label: "Min value",
                        fieldType: "Input",
                        type: "number",
                        defaultValue: formElement.min,
                        required: true,
                      }}
                      form={form}
                    />
                    <RenderFormElement
                      formElement={{
                        name: "max",
                        label: "Max value",
                        fieldType: "Input",
                        type: "number",
                        defaultValue: formElement.max,
                        required: true,
                      }}
                      form={form}
                    />
                    <RenderFormElement
                      formElement={{
                        name: "step",
                        label: "Step value",
                        fieldType: "Input",
                        type: "number",
                        defaultValue: formElement.step,
                        required: true,
                      }}
                      form={form}
                    />
                  </div>
                )}
                {formElement.fieldType === "ToggleGroup" && (
                  <RenderFormElement
                    formElement={{
                      name: "type",
                      label: "Choose single or multiple choices",
                      fieldType: "ToggleGroup",
                      options: [
                        { value: "single", label: "Single" },
                        { value: "multiple", label: "Multiple" },
                      ],
                      defaultValue: formElement.type,
                      required: true,
                      type: "single",
                    }}
                    form={form}
                  />
                )}
                <div className="flex-row-start gap-4 pl-1">
                  <RenderFormElement
                    formElement={{
                      name: "required",
                      label: "Required",
                      fieldType: "Checkbox",
                    }}
                    form={form}
                  />
                  <RenderFormElement
                    formElement={{
                      name: "disabled",
                      label: "Disabled",
                      fieldType: "Checkbox",
                    }}
                    form={form}
                  />
                </div>

                {/* Options editor for Select, MultiSelect, RadioGroup, and ToggleGroup */}
                {(formElement.fieldType === "Select" ||
                  formElement.fieldType === "MultiSelect" ||
                  formElement.fieldType === "RadioGroup" ||
                  formElement.fieldType === "ToggleGroup") && (
                  <div className="mt-4">
                    <OptionsEditor
                      options={form.watch("options") || []}
                      onChange={(options) => form.setValue("options", options)}
                    />
                  </div>
                )}

                {/* Image field customization */}
                {formElement.fieldType === "Image" && (
                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Image</label>
                      <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-md">
                        {form.watch("src") ? (
                          <div className="relative w-full max-w-xs">
                            <Image
                              src={form.watch("src") || ""}
                              alt="Preview"
                              className="w-full h-auto rounded-md"
                              width={form.watch("width") || 400}
                              height={form.watch("height") || 300}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => form.setValue("src", "")}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <input
                              type="file"
                              accept="image/*"
                              id="image-upload"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    form.setValue(
                                      "src",
                                      event.target?.result as string
                                    );
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <label
                              htmlFor="image-upload"
                              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
                            >
                              Choose Image
                            </label>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Select an image to upload
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <RenderFormElement
                      formElement={{
                        name: "alt",
                        label: "Alt Text",
                        fieldType: "Input",
                        placeholder: "Image description",
                      }}
                      form={form}
                    />
                    <div className="flex gap-2">
                      <RenderFormElement
                        formElement={{
                          name: "width",
                          label: "Width",
                          fieldType: "Input",
                          type: "number",
                          placeholder: "400",
                        }}
                        form={form}
                      />
                      <RenderFormElement
                        formElement={{
                          name: "height",
                          label: "Height",
                          fieldType: "Input",
                          type: "number",
                          placeholder: "300",
                        }}
                        form={form}
                      />
                    </div>
                  </div>
                )}

                {/* Divider field customization */}
                {formElement.fieldType === "Divider" && (
                  <div className="mt-4 space-y-3">
                    <RenderFormElement
                      formElement={{
                        name: "title",
                        label: "Title",
                        fieldType: "Input",
                        placeholder: "Section Title",
                      }}
                      form={form}
                    />
                    <RenderFormElement
                      formElement={{
                        name: "description",
                        label: "Description",
                        fieldType: "Textarea",
                        placeholder: "Section description",
                      }}
                      form={form}
                    />
                    <RenderFormElement
                      formElement={{
                        name: "orientation",
                        label: "Orientation",
                        fieldType: "Select",
                        options: [
                          { value: "horizontal", label: "Horizontal" },
                          { value: "vertical", label: "Vertical" },
                        ],
                        placeholder: "Select orientation",
                      }}
                      form={form}
                    />
                  </div>
                )}

                {/* Rating field customization */}
                {formElement.fieldType === "Rating" && (
                  <div className="mt-4 space-y-3">
                    <RenderFormElement
                      formElement={{
                        name: "maxRating",
                        label: "Maximum Rating",
                        fieldType: "Input",
                        type: "number",
                        placeholder: "5",
                      }}
                      form={form}
                    />
                    <RenderFormElement
                      formElement={{
                        name: "precision",
                        label: "Precision",
                        fieldType: "Select",
                        options: [
                          { value: "full", label: "Full Stars Only" },
                          { value: "half", label: "Allow Half Stars" },
                        ],
                        placeholder: "Select precision",
                      }}
                      form={form}
                    />
                    <RenderFormElement
                      formElement={{
                        name: "size",
                        label: "Size",
                        fieldType: "Select",
                        options: [
                          { value: "sm", label: "Small" },
                          { value: "md", label: "Medium" },
                          { value: "lg", label: "Large" },
                        ],
                        placeholder: "Select size",
                      }}
                      form={form}
                    />
                    <RenderFormElement
                      formElement={{
                        name: "color",
                        label: "Star Color",
                        fieldType: "Input",
                        type: "color",
                        placeholder: "#FFD700",
                      }}
                      form={form}
                    />
                  </div>
                )}

                {/* FilePicker field customization */}
                {formElement.fieldType === "FilePicker" && (
                  <div className="mt-4 space-y-3">
                    <RenderFormElement
                      formElement={{
                        name: "accept",
                        label: "Accepted File Types",
                        fieldType: "Input",
                        placeholder: "image/*,.pdf",
                        description:
                          "Comma-separated list of MIME types or file extensions",
                      }}
                      form={form}
                    />
                    <RenderFormElement
                      formElement={{
                        name: "multiple",
                        label: "Allow Multiple Files",
                        fieldType: "Checkbox",
                      }}
                      form={form}
                    />
                    <RenderFormElement
                      formElement={{
                        name: "maxSize",
                        label: "Maximum File Size (bytes)",
                        fieldType: "Input",
                        type: "number",
                        placeholder: "5242880", // 5MB
                        description: "5242880 bytes = 5MB",
                      }}
                      form={form}
                    />
                    <RenderFormElement
                      formElement={{
                        name: "maxFiles",
                        label: "Maximum Number of Files",
                        fieldType: "Input",
                        type: "number",
                        placeholder: "5",
                        description:
                          "Only applies when multiple files are allowed",
                      }}
                      form={form}
                    />
                    <RenderFormElement
                      formElement={{
                        name: "showPreview",
                        label: "Show Image Previews",
                        fieldType: "Checkbox",
                      }}
                      form={form}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="validations" className="mt-4">
              <ValidationEditor
                validations={form.watch("validations") || []}
                onChange={(validations) =>
                  form.setValue("validations", validations)
                }
                fieldType={formElement.fieldType}
              />
            </TabsContent>

            <TabsContent value="rules" className="mt-4">
              <FieldRuleEditor
                form={form}
                currentFieldName={formElement.name}
              />
            </TabsContent>

            <TabsContent value="weights" className="mt-4">
              <FieldWeightEditor
                form={form}
                currentFieldName={formElement.name}
              />
            </TabsContent>

            <div className="flex justify-end gap-3 w-full mt-4">
              <Button size="sm" variant="ghost" onClick={close} type="button">
                Cancel
              </Button>
              <Button size="sm" type="submit" variant="secondary">
                Save
              </Button>
            </div>
          </Tabs>
        )}
      </form>
    </Form>
  );
}

export function FieldCustomizationView({
  fieldIndex,
  formElement,
  j,
  stepIndex,
  cellPosition,
}: {
  fieldIndex: number;
  j?: number;
  formElement: FormElement;
  stepIndex?: number;
  cellPosition?: { rowIndex: number; cellIndex: number };
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const close = () => setOpen(false);
  const title = "Customize form field attributes";

  const SavedFormElementOptions = () => (
    <FormElementOptions
      fieldIndex={fieldIndex}
      stepIndex={stepIndex}
      j={j}
      cellPosition={cellPosition}
      {...formElement}
      close={close}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl h-9"
          >
            <Edit size={16} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <SavedFormElementOptions />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-xl h-9"
        >
          <Edit />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader className="text-start">
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <SavedFormElementOptions />
      </DrawerContent>
    </Drawer>
  );
}

export type { RenderFormElementProps };
