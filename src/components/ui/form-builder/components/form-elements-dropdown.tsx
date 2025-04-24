import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formElementsList } from "@/components/ui/form-builder/constant/form-elements-list";
import { FormElement } from "@/components/ui/form-builder/form-types";
import useFormBuilderStore from "@/components/ui/form-builder/hooks/use-form-builder-store";

/**
 * Use for adding a nested form element
 */
//======================================
export function FormElementsDropdown({
  fieldIndex,
  stepIndex,
  cellPosition,
}: {
  /**
   * Field Index where a nested element should be appended to the main array
   */
  fieldIndex: number;
  stepIndex?: number;
  cellPosition?: { rowIndex: number; cellIndex: number };
}) {
  const appendElement = useFormBuilderStore((s) => s.appendElement);
  const editElement = useFormBuilderStore((s) => s.editElement);
  const defaultFormElements = useFormBuilderStore(
    (s) => (s as any).defaultFormElements
  );

  const handleAddElement = (fieldType: FormElement["fieldType"]) => {
    if (cellPosition) {
      // Get the current layout container
      const state = useFormBuilderStore.getState();
      const formElements = state.isMS
        ? (state.formElements as any)[stepIndex as number].stepFields
        : state.formElements;

      const layoutContainer = formElements[fieldIndex];

      if (
        layoutContainer.fieldType === "LayoutContainer" &&
        "rows" in layoutContainer
      ) {
        // Create a new element
        const newElement: FormElement = {
          ...(defaultFormElements[fieldType] || {}),
          name: `${fieldType}-${Date.now()}`,
          fieldType,
        };

        // Update the cell with the new element
        const rows = [...layoutContainer.rows];
        rows[cellPosition.rowIndex].cells[cellPosition.cellIndex].element =
          newElement;

        // Update the layout container
        editElement({
          fieldIndex,
          stepIndex,
          modifiedFormElement: {
            ...layoutContainer,
            rows,
          },
        });
      }
    } else {
      // Regular append
      appendElement({
        fieldIndex,
        fieldType,
        stepIndex,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={cellPosition ? "outline" : "ghost"}
          size={cellPosition ? "sm" : "icon"}
          className={cellPosition ? "w-full" : "rounded-xl h-9"}
        >
          <PlusIcon size={16} className={cellPosition ? "mr-2" : ""} />
          {cellPosition && "Add Element"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-align="end" // not working
        className="space-y-3 max-h-64 overflow-y-scroll"
      >
        {formElementsList.map((o) => (
          <DropdownMenuItem
            onSelect={() => {
              handleAddElement(o.fieldType as FormElement["fieldType"]);
            }}
            key={o.name}
            disabled={!!o.static}
            className="px-4"
          >
            {o.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Use for adding a form element to the form when MSF is enabled
 */
//======================================
export function FormElementsStepDropdown({
  stepIndex,
}: {
  stepIndex?: number;
}) {
  const appendElement = useFormBuilderStore((s) => s.appendElement);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={"rounded-xl h-9"}>
          <div className="flex justify-start items-center gap-2">
            <PlusIcon size={16} />
            Add Element
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-align="end" // not working
        className="space-y-3 max-h-64 overflow-y-scroll"
      >
        {formElementsList.map((o) => (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault(); // Prevent the menu from closing
              appendElement({
                fieldIndex: null,
                fieldType: o.fieldType as FormElement["fieldType"],
                stepIndex,
              });
            }}
            key={o.name}
            className="px-4"
          >
            {o.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
