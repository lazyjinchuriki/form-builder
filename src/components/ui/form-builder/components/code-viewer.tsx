"use client";

// import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import * as React from "react";
import type {
  FormElement,
  FormElementOrList,
  FormStep,
} from "@/components/ui/form-builder/form-types";
import useFormBuilderStore from "@/components/ui/form-builder/hooks/use-form-builder-store";
import { codeHighlighter } from "@/components/ui/form-builder/libs/code-highlighter";
import { flattenFormSteps } from "@/components/ui/form-builder/libs/form-elements-helpers";
import { generateFormCode } from "@/components/ui/form-builder/libs/generate-form-code";
import { generateServerActionCode } from "@/components/ui/form-builder/libs/generate-server-action-code";
import { getZodSchemaString } from "@/components/ui/form-builder/libs/generate-zod-schema";
import { formatCode } from "@/components/ui/form-builder/libs/utils";
import { Tabs, TabsContent, TabsTrigger } from "../../tabs";

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  // <CodeBlock className='my-0 w-full'>
  //   <div
  //     style={{ height: '100%', maxHeight: '60vh' }}
  //     className='[&>*]:mt-0 [&_pre]:p-3 w-full'
  //   >
  //     {children}
  //   </div>
  // </CodeBlock>
  <div className="my-0 w-full">
    <div
      style={{ height: "100%", maxHeight: "60vh" }}
      className="[&>*]:mt-0 [&_pre]:p-3 w-full"
    >
      {children}
    </div>
  </div>
);
const useShiki = ({ code, lang }: { code: string; lang?: string }) => {
  const [renderedCode, setRenderedCode] = React.useState<React.JSX.Element>();
  React.useLayoutEffect(() => {
    if (typeof code === "string") {
      void codeHighlighter({ code, lang }).then(setRenderedCode);
    }
  }, [code, lang]);

  return renderedCode;
};

export const JsonViewer = ({
  json,
  isMS,
}: {
  json: FormElementOrList[] | FormStep[] | Record<string, unknown>;
  isMS: boolean;
}) => {
  if (Array.isArray(json)) {
    json = (
      isMS
        ? flattenFormSteps(json as FormStep[])
        : (json as FormElementOrList[])
    ).filter((element) => !("static" in element && element.static));
  }

  const highlightedCode = useShiki({
    code: JSON.stringify(json, null, 2),
    lang: "json",
  });

  return highlightedCode ? (
    <Wrapper>{highlightedCode}</Wrapper>
  ) : (
    <div className="text-center py-5 w-full">Generating code...</div>
  );
};

const installableShadcnComponents: Partial<
  Record<FormElement["fieldType"], string>
> = {
  Input: "input",
  Password: "input",
  Textarea: "textarea",
  Checkbox: "checkbox",
  Select: "select",
  Slider: "slider",
  Switch: "switch",
  OTP: "otp",
  RadioGroup: "radio-group",
  ToggleGroup: "toggle-group",
  DatePicker: "popover calendar",
  Separator: "separator",
  // none-shadcn components
  MultiSelect: "",
};
//======================================
export function InstallPackagesCode() {
  const formElements = useFormBuilderStore((s) => s.formElements);
  const isMS = useFormBuilderStore((s) => s.isMS);
  const processedFormElements = isMS
    ? flattenFormSteps(formElements as FormStep[])
    : formElements;
  const formElementTypes = (processedFormElements.flat() as FormElement[])
    .filter((el) => !el.static)
    .map((el) => el.fieldType)
    .map((str) => installableShadcnComponents[str])
    .filter((str) => str && str.length > 0);

  const packagesSet = new Set(formElementTypes);
  const packages = Array.from(packagesSet).join(" ");
  const otherPackages = "react-hook-form zod @hookform/resolvers framer-motion";
  const tabsData = [
    {
      value: "pnpm",
      shadcn: `pnpm add shadcn-ui add ${packages}`,
      base: `pnpm add ${otherPackages}`,
    },
    {
      value: "npm",
      shadcn: `npx shadcn-ui add ${packages}`,
      base: `npm install ${otherPackages}`,
    },
    {
      value: "yarn",
      shadcn: `yarn add shadcn-ui add ${packages}`,
      base: `yarn add ${otherPackages}`,
    },
    {
      value: "bun",
      shadcn: `bun add shadcn-ui add ${packages}`,
      base: `bun add ${otherPackages}`,
    },
  ];

  return (
    <div className="w-full py-5 max-w-full">
      <h2 className="font-semibold text-start">Install base packages</h2>
      <Tabs defaultValue={tabsData[0].value} className="w-full mt-2 rounded-md">
        {tabsData.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.value}
          </TabsTrigger>
        ))}

        {tabsData.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            {/* <CodeBlock> */}
            {/* <Pre>{item.base}</Pre> */}
            {/* </CodeBlock> */}
          </TabsContent>
        ))}
      </Tabs>
      <h2 className="font-semibold text-start mt-4">
        Install required shadcn components
      </h2>
      <Tabs defaultValue={tabsData[0].value} className="w-full mt-2 rounded-md">
        {tabsData.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.value}
          </TabsTrigger>
        ))}

        {tabsData.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            {/* <CodeBlock> */}
            {/* <Pre>{item.shadcn}</Pre> */}
            {/* </CodeBlock> */}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
const JSXCode = () => {
  const formElements = useFormBuilderStore((s) => s.formElements);
  const isMS = useFormBuilderStore((s) => s.isMS);
  // generate -> format -> highlight code
  const generatedCode = generateFormCode({
    formElements: formElements as FormElementOrList[],
    isMS,
  });
  const formattedCode = formatCode(generatedCode);
  const highlightedCode = useShiki({ code: formattedCode });
  if (!highlightedCode)
    return <div className="text-center py-5 w-full">Generating code...</div>;

  return (
    <div className="relative max-w-full">
      <Wrapper>{highlightedCode}</Wrapper>
    </div>
  );
};
const ZodSchemaCode = () => {
  const formElements = useFormBuilderStore((s) => s.formElements);
  const isMS = useFormBuilderStore((s) => s.isMS);
  const parsedFormElements = isMS
    ? flattenFormSteps(formElements as FormStep[])
    : formElements.flat();
  const generatedCode = getZodSchemaString(parsedFormElements as FormElement[]);
  const formattedCode = formatCode(generatedCode);
  const highlightedCode = useShiki({ code: formattedCode, lang: "typescript" });
  if (!highlightedCode)
    return <div className="text-center py-5 w-full">Generating code...</div>;

  return (
    <div className="relative max-w-full">
      <Wrapper>{highlightedCode}</Wrapper>
    </div>
  );
};

const ServerActionCode = () => {
  const generatedCode = generateServerActionCode();
  const formattedCode = formatCode(generatedCode);
  const highlightedCode = useShiki({ code: formattedCode, lang: "typescript" });
  if (!highlightedCode)
    return <div className="text-center py-5 w-full">Generating code...</div>;

  return (
    <div className="relative max-w-full">
      <Wrapper>{highlightedCode}</Wrapper>
    </div>
  );
};
//======================================
export function GeneratedFormCodeViewer() {
  return (
    <Tabs
      defaultValue="JSX"
      // items={['JSX', 'Schema', 'Server action']}
      className="w-full min-w-full mt-0"
    >
      <TabsTrigger value="JSX">JSX</TabsTrigger>
      <TabsTrigger value="Schema">Schema</TabsTrigger>
      <TabsTrigger value="Server action">Server action</TabsTrigger>

      <TabsContent value="JSX" className="p-4">
        <JSXCode />
        <div className="border-t border-dashed w-full mt-6" />
        <InstallPackagesCode />
      </TabsContent>
      <TabsContent value="Schema" className="p-4">
        <ZodSchemaCode />
      </TabsContent>
      <TabsContent value="Server action" className="p-4">
        <ServerActionCode />
      </TabsContent>
    </Tabs>
  );
}
