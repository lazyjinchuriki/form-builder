import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormElement } from "@/components/ui/form-builder/form-types";
import useFormBuilderStore from "@/components/ui/form-builder/hooks/use-form-builder-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormElementsDropdown } from "./form-elements-dropdown";

interface GridLayoutEditorProps {
  element: FormElement;
  fieldIndex: number;
  stepIndex?: number;
}

export function GridLayoutEditor({
  element,
  fieldIndex,
  stepIndex,
}: GridLayoutEditorProps) {
  const editElement = useFormBuilderStore((s) => s.editElement);
  const [open, setOpen] = useState(false);

  if (element.fieldType !== "LayoutContainer" || !("children" in element)) {
    return null;
  }

  const layoutContainer = element as FormElement & {
    children: FormElement[];
    gridConfig?: { columns: number; rows?: number; gap?: number };
  };

  const handleUpdateGridConfig = (
    config: Partial<{ columns: number; rows?: number; gap?: number }>
  ) => {
    const updatedConfig = {
      ...layoutContainer.gridConfig,
      ...config,
    };

    editElement({
      fieldIndex,
      stepIndex,
      modifiedFormElement: {
        ...layoutContainer,
        gridConfig: updatedConfig,
        className: `grid grid-cols-${updatedConfig.columns} gap-${updatedConfig.gap || 4}`,
      },
    });
  };

  const handleUpdateChildPosition = (
    childIndex: number,
    position: Partial<{
      colSpan: number;
      rowSpan: number;
      colStart: number;
      rowStart: number;
    }>
  ) => {
    const children = [...layoutContainer.children];
    const child = children[childIndex];
    
    const updatedPosition = {
      ...(child as any).gridPosition || {},
      ...position,
    };
    
    // Update className to reflect grid position
    const className = `col-span-${updatedPosition.colSpan} row-span-${updatedPosition.rowSpan} col-start-${updatedPosition.colStart} row-start-${updatedPosition.rowStart}`;
    
    children[childIndex] = {
      ...child,
      gridPosition: updatedPosition,
      className,
    };

    editElement({
      fieldIndex,
      stepIndex,
      modifiedFormElement: {
        ...layoutContainer,
        children,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Plus className="h-4 w-4 mr-1" />
          Edit Grid
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Grid Layout</DialogTitle>
          <DialogDescription>
            Configure the grid layout and position of elements
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="grid">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Grid Settings</TabsTrigger>
            <TabsTrigger value="elements">Elements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="columns">Columns</Label>
                <Input
                  id="columns"
                  type="number"
                  min={1}
                  max={12}
                  value={layoutContainer.gridConfig?.columns || 12}
                  onChange={(e) =>
                    handleUpdateGridConfig({
                      columns: parseInt(e.target.value) || 12,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rows">Rows</Label>
                <Input
                  id="rows"
                  type="number"
                  min={1}
                  value={layoutContainer.gridConfig?.rows || 4}
                  onChange={(e) =>
                    handleUpdateGridConfig({
                      rows: parseInt(e.target.value) || 4,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gap">Gap (px)</Label>
                <Input
                  id="gap"
                  type="number"
                  min={0}
                  max={12}
                  value={layoutContainer.gridConfig?.gap || 4}
                  onChange={(e) =>
                    handleUpdateGridConfig({
                      gap: parseInt(e.target.value) || 4,
                    })
                  }
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="elements" className="py-4">
            <div className="space-y-4">
              {layoutContainer.children.map((child, index) => {
                const gridPosition = (child as any).gridPosition || {
                  colSpan: 1,
                  rowSpan: 1,
                  colStart: 1,
                  rowStart: 1,
                };
                
                return (
                  <div key={child.name || index} className="border p-4 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {child.label || child.name || `Element ${index + 1}`}
                      </h4>
                      <div className="text-xs text-muted-foreground">
                        {child.fieldType}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor={`col-span-${index}`}>Column Span</Label>
                        <Input
                          id={`col-span-${index}`}
                          type="number"
                          min={1}
                          max={layoutContainer.gridConfig?.columns || 12}
                          value={gridPosition.colSpan || 1}
                          onChange={(e) =>
                            handleUpdateChildPosition(index, {
                              colSpan: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`row-span-${index}`}>Row Span</Label>
                        <Input
                          id={`row-span-${index}`}
                          type="number"
                          min={1}
                          value={gridPosition.rowSpan || 1}
                          onChange={(e) =>
                            handleUpdateChildPosition(index, {
                              rowSpan: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`col-start-${index}`}>Column Start</Label>
                        <Input
                          id={`col-start-${index}`}
                          type="number"
                          min={1}
                          max={layoutContainer.gridConfig?.columns || 12}
                          value={gridPosition.colStart || 1}
                          onChange={(e) =>
                            handleUpdateChildPosition(index, {
                              colStart: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`row-start-${index}`}>Row Start</Label>
                        <Input
                          id={`row-start-${index}`}
                          type="number"
                          min={1}
                          value={gridPosition.rowStart || 1}
                          onChange={(e) =>
                            handleUpdateChildPosition(index, {
                              rowStart: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4">
                <FormElementsDropdown
                  fieldIndex={fieldIndex}
                  stepIndex={stepIndex}
                  isGridChild={true}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
