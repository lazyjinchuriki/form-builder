import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type * as React from "react";
import { useEffect, useState } from "react";
import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DividerField } from "@/components/ui/form-builder/components/divider-field";
import { FilePickerField } from "@/components/ui/form-builder/components/file-picker-field";
import { ImageField } from "@/components/ui/form-builder/components/image-field";
import { RatingField } from "@/components/ui/form-builder/components/rating-field";
import type { FormElement } from "@/components/ui/form-builder/form-types";
import { evaluateRules } from "@/components/ui/form-builder/libs/rule-evaluator";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectList,
  MultiSelectTrigger,
  MultiSelectValue,
} from "../../multi-select";
import { cn } from "@/lib/utils";

// Helper function to create validation rules for react-hook-form
const createValidationRules = (validations: any[] | undefined) => {
  if (!validations || validations.length === 0) {
    return {};
  }

  const rules: any = {};

  validations.forEach((validation) => {
    switch (validation.type) {
      case "required":
        rules.required = validation.message || "This field is required";
        break;
      case "minLength":
        rules.minLength = {
          value: validation.value,
          message:
            validation.message ||
            `Must be at least ${validation.value} characters`,
        };
        break;
      case "maxLength":
        rules.maxLength = {
          value: validation.value,
          message:
            validation.message ||
            `Must be at most ${validation.value} characters`,
        };
        break;
      case "min":
        rules.min = {
          value: validation.value,
          message: validation.message || `Must be at least ${validation.value}`,
        };
        break;
      case "max":
        rules.max = {
          value: validation.value,
          message: validation.message || `Must be at most ${validation.value}`,
        };
        break;
      case "pattern":
        rules.pattern = {
          value: new RegExp(validation.value),
          message: validation.message || "Invalid format",
        };
        break;
      case "email":
        rules.pattern = {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: validation.message || "Invalid email address",
        };
        break;
      case "url":
        rules.pattern = {
          value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
          message: validation.message || "Invalid URL",
        };
        break;
      case "minDate":
        rules.validate = {
          ...rules.validate,
          minDate: (value: any) => {
            if (!value) return true;
            const minDate = new Date(validation.value);
            const date = new Date(value);

            return (
              date >= minDate ||
              validation.message ||
              `Date must be after ${validation.value}`
            );
          },
        };
        break;
      case "maxDate":
        rules.validate = {
          ...rules.validate,
          maxDate: (value: any) => {
            if (!value) return true;
            const maxDate = new Date(validation.value);
            const date = new Date(value);

            return (
              date <= maxDate ||
              validation.message ||
              `Date must be before ${validation.value}`
            );
          },
        };
        break;
      case "afterToday":
        rules.validate = {
          ...rules.validate,
          afterToday: (value: any) => {
            if (!value) return true;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const date = new Date(value);

            return (
              date > today || validation.message || "Date must be after today"
            );
          },
        };
        break;
      case "beforeToday":
        rules.validate = {
          ...rules.validate,
          beforeToday: (value: any) => {
            if (!value) return true;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const date = new Date(value);

            return (
              date < today || validation.message || "Date must be before today"
            );
          },
        };
        break;
      case "maxSize":
        rules.validate = {
          ...rules.validate,
          maxSize: (value: any) => {
            if (!value) return true;
            if (Array.isArray(value)) {
              return (
                value.every((file) => file.size <= validation.value) ||
                validation.message ||
                `File must be smaller than ${validation.value} bytes`
              );
            }

            return (
              value.size <= validation.value ||
              validation.message ||
              `File must be smaller than ${validation.value} bytes`
            );
          },
        };
        break;
    }
  });

  return rules;
};

export function RenderFormElement({
  formElement,
  form,
}: {
  formElement: FormElement;
  form: UseFormReturn<any>;
}) {
  // All hooks must be called at the top level of the component
  const formValues = useWatch({ control: form.control });
  const [fieldState, setFieldState] = useState({
    visible: true,
    enabled: !(formElement as any).disabled,
  });

  // useEffect hook
  useEffect(() => {
    if ((formElement as any).rules && (formElement as any).rules.length > 0) {
      const { visible, enabled } = evaluateRules(
        (formElement as any).rules,
        formValues
      );
      setFieldState({ visible, enabled });
    }
  }, [formValues, (formElement as any).rules]);

  // Handle LayoutContainer type
  if (
    formElement.fieldType === "LayoutContainer" &&
    "children" in formElement
  ) {
    return (
      <div className={formElement.className || ""}>
        {formElement.children.map((child, index) => (
          <div
            key={child.name || index}
            className={(child as any).className || ""}
          >
            <RenderFormElement formElement={child} form={form} />
          </div>
        ))}
      </div>
    );
  }

  // If field should be hidden, return null
  if (!fieldState.visible && !formElement.static) {
    return <></>;
  }
  switch (formElement.fieldType) {
    case "Input":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          rules={createValidationRules(formElement.validations)}
          render={({ field }: { field: ControllerRenderProps }) => (
            <FormItem className="w-full">
              <FormLabel>
                {formElement.label} {formElement.required ? " *" : ""}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={formElement.placeholder}
                  disabled={!fieldState.enabled}
                  type={formElement.type ?? "text"}
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const value =
                      formElement.type === "number"
                        ? e.target.value === ""
                          ? ""
                          : Number(e.target.value)
                        : e.target.value;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>{formElement.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Password":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          rules={createValidationRules(formElement.validations)}
          render={({ field }: { field: ControllerRenderProps }) => (
            <FormItem className="w-full">
              <FormLabel>{formElement.label}</FormLabel>
              {formElement.required && " *"}
              <FormControl>
                <Input
                  placeholder={formElement.placeholder}
                  disabled={!fieldState.enabled}
                  type={"password"}
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>{formElement.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "OTP":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          rules={createValidationRules(formElement.validations)}
          render={({ field }: { field: ControllerRenderProps }) => (
            <FormItem className="w-full">
              <FormLabel>{formElement.label}</FormLabel>{" "}
              {formElement.required && "*"}
              <FormControl>
                <InputOTP
                  {...field}
                  maxLength={formElement.maxLength ?? 6}
                  name={formElement.name as string}
                  value={formElement.value as string}
                  disabled={!fieldState.enabled}
                  onChange={field.onChange}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>{formElement.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Textarea":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          rules={createValidationRules(formElement.validations)}
          render={({ field }: { field: ControllerRenderProps }) => (
            <FormItem className="w-full">
              <FormLabel>
                {formElement.label} {formElement.required && "*"}
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={formElement.placeholder}
                  required={formElement.required}
                  disabled={!fieldState.enabled}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>{formElement.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Checkbox":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          rules={createValidationRules(formElement.validations)}
          render={({ field }: { field: ControllerRenderProps }) => (
            <FormItem className="flex items-center gap-2 w-full py-1 space-y-0">
              <FormControl>
                <Checkbox
                  {...field}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!fieldState.enabled}
                />
              </FormControl>
              <FormLabel className="leading-none">
                {formElement.label} {formElement.required && " *"}
              </FormLabel>
              {formElement.description ? (
                <FormDescription>{formElement.description}</FormDescription>
              ) : (
                ""
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "RadioGroup":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          rules={createValidationRules(formElement.validations)}
          render={({ field }: { field: ControllerRenderProps }) => (
            <FormItem className="flex flex-col gap-2 w-full py-1">
              <FormLabel className="mt-0">
                {formElement?.label} {formElement.required && " *"}
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!fieldState.enabled}
                >
                  {formElement.options.map(({ label, value }) => (
                    <div key={value} className="flex items-center gap-x-2">
                      <RadioGroupItem value={value} id={value} />
                      <Label htmlFor={value}>{label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              {formElement.description && (
                <FormDescription>{formElement.description}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "ToggleGroup": {
      const options = formElement.options.map(({ label, value }) => (
        <ToggleGroupItem
          value={value}
          key={value}
          className="flex items-center gap-x-2"
        >
          {label}
        </ToggleGroupItem>
      ));

      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          rules={createValidationRules(formElement.validations)}
          render={({ field }: { field: ControllerRenderProps }) => (
            <FormItem className="flex flex-col gap-2 w-full py-1">
              <FormLabel className="mt-0">
                {formElement?.label} {formElement.required && "*"}
              </FormLabel>
              <FormControl>
                {formElement.type === "single" ? (
                  <ToggleGroup
                    {...field}
                    type="single"
                    variant="outline"
                    onValueChange={field.onChange}
                    defaultValue={formElement.defaultValue}
                    disabled={!fieldState.enabled}
                    className="flex justify-start items-center gap-2"
                  >
                    {options}
                  </ToggleGroup>
                ) : (
                  <ToggleGroup
                    {...field}
                    type="multiple"
                    variant="outline"
                    disabled={!fieldState.enabled}
                    onValueChange={field.onChange}
                    defaultValue={
                      Array.isArray(formElement.defaultValue)
                        ? formElement.defaultValue.filter(
                            (val) => val !== undefined
                          )
                        : [formElement.defaultValue].filter(
                            (val) => val !== undefined
                          )
                    }
                    className="flex justify-start items-center gap-2"
                  >
                    {options}
                  </ToggleGroup>
                )}
              </FormControl>
              {formElement.description && (
                <FormDescription>{formElement.description}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    case "Switch":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          rules={createValidationRules(formElement.validations)}
          render={({ field }: { field: ControllerRenderProps }) => (
            <FormItem className="flex flex-col p-3 justify-center w-full border rounded">
              <div className="flex items-center justify-between h-full">
                <FormLabel className="w-full grow">
                  {formElement.label}
                </FormLabel>
                <FormControl>
                  <Switch
                    {...field}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!fieldState.enabled}
                  />
                </FormControl>
              </div>
              {formElement.description && (
                <FormDescription>{formElement.description}</FormDescription>
              )}
            </FormItem>
          )}
        />
      );
    case "Slider":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          rules={createValidationRules(formElement.validations)}
          render={({ field }: { field: ControllerRenderProps }) => {
            const min = formElement.min || 0;
            const max = formElement.max || 100;
            const step = formElement.step || 5;
            const defaultValue = 25;
            const value = Array.isArray(field.value)
              ? field.value
              : [field.value || defaultValue];

            return (
              <FormItem className="w-full">
                <FormLabel className="flex justify-between items-center">
                  {formElement.label}
                  <span>
                    {value}/{max}
                  </span>
                </FormLabel>
                <FormControl>
                  <Slider
                    {...field}
                    min={min}
                    max={max}
                    step={step}
                    defaultValue={[defaultValue]}
                    value={value}
                    disabled={!fieldState.enabled}
                    onValueChange={(newValue: any[]) =>
                      field.onChange(newValue[0])
                    }
                  />
                </FormControl>
                <FormDescription className="py-1">
                  {formElement.description}
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      );
    case "Select":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          rules={createValidationRules(formElement.validations)}
          render={({ field }: { field: ControllerRenderProps }) => (
            <FormItem className="w-full">
              <FormLabel>
                {formElement.label}
                {formElement.required && " *"}
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                defaultValue={String(field?.value ?? "")}
                disabled={!fieldState.enabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={formElement.placeholder || "Select item"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {formElement.options.map(({ label, value }) => (
                    <SelectItem key={label} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{formElement.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "MultiSelect":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          rules={createValidationRules(formElement.validations)}
          render={({ field }: { field: ControllerRenderProps }) => (
            <FormItem className="w-full">
              <FormLabel>
                {formElement.label} {formElement.required ? " *" : ""}{" "}
              </FormLabel>
              <MultiSelect
                value={field.value}
                onValueChange={field.onChange}
                disabled={!fieldState.enabled}
              >
                <FormControl>
                  <MultiSelectTrigger>
                    <MultiSelectValue
                      placeholder={formElement.placeholder || "Select item"}
                    />
                  </MultiSelectTrigger>
                </FormControl>
                <MultiSelectContent>
                  <MultiSelectList>
                    {formElement.options.map(({ label, value }) => (
                      <MultiSelectItem key={label} value={value}>
                        {label}
                      </MultiSelectItem>
                    ))}
                  </MultiSelectList>
                </MultiSelectContent>
              </MultiSelect>
              <FormDescription>{formElement.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "DatePicker":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          rules={createValidationRules(formElement.validations)}
          render={({ field }: { field: ControllerRenderProps }) => {
            const date = field.value;

            return (
              <FormItem className="flex flex-col w-full">
                <div>
                  <FormLabel>
                    {formElement.label} {formElement.required ? " *" : ""}
                  </FormLabel>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-start font-normal",
                          !date && "text-muted-foreground"
                        )}
                        disabled={!fieldState.enabled}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(newDate) => {
                        // setDate(newDate);
                        form.setValue(field.name, newDate, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>{formElement.description}</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      );
    case "H1":
      return (
        <h1
          key={formElement.content}
          className={cn("mt-6 font-bold text-3xl", formElement.className)}
        >
          {formElement.content}
        </h1>
      );
    case "H2":
      return <h2 className="mt-4 font-bold text-xl">{formElement.content}</h2>;
    case "H3":
      return (
        <h3 className="mt-3 font-semiboldbold text-lg">
          {formElement.content} content
        </h3>
      );
    case "P":
      return (
        <p className="tracking-wider text-foreground/60 pt-0 dark:text-foreground/60 mb-4 mt-0 text-wrap">
          {formElement.content}
        </p>
      );
    case "Separator":
      return (
        <div className="py-3 w-full">
          <Separator {...formElement} />
        </div>
      );
    case "Image":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          render={({ field }) => (
            <FormItem className="w-full">
              <ImageField
                src={field.value}
                alt={formElement.alt || formElement.label || "Form image"}
                width={formElement.width || 400}
                height={formElement.height || 300}
                className={formElement.className || ""}
                label={formElement.label}
                description={formElement.description}
                onChange={field.onChange}
                editable={!fieldState.enabled}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "Rating":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          render={({ field }) => (
            <FormItem className="w-full">
              <RatingField
                value={field.value}
                onChange={field.onChange}
                maxRating={formElement.maxRating || 5}
                precision={formElement.precision || "full"}
                size={formElement.size || "md"}
                color={formElement.color || "gold"}
                disabled={!fieldState.enabled}
                label={formElement.label}
                description={formElement.description}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "FilePicker":
      return (
        <FormField
          control={form.control}
          name={formElement.name as string}
          render={({ field }) => (
            <FormItem className="w-full">
              <FilePickerField
                value={field.value}
                onChange={field.onChange}
                accept={formElement.accept}
                multiple={formElement.multiple}
                maxSize={formElement.maxSize}
                maxFiles={formElement.maxFiles}
                showPreview={formElement.showPreview !== false}
                disabled={!fieldState.enabled}
                label={formElement.label}
                description={formElement.description}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Divider":
      return (
        <DividerField
          title={(formElement as any).title}
          description={(formElement as any).description}
          orientation={(formElement as any).orientation || "horizontal"}
          decorative={(formElement as any).decorative !== false}
          className={(formElement as any).className}
        />
      );
    default:
      return <div>Invalid Form Element</div>;
  }
}
