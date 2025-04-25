import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormDescription, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ImageFieldProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  label?: string;
  description?: string;
  onChange?: (src: string) => void;
  editable?: boolean;
}

export function ImageField({
  src,
  alt = "Image",
  width = 400,
  height = 300,
  className = "",
  label,
  description,
  onChange,
  editable = false,
}: ImageFieldProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(src);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Convert file to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      setImageSrc(base64);

      if (onChange) {
        onChange(base64);
      }

      setIsUploading(false);
    };
    reader.onerror = (error) => {
      console.error("Error converting image to base64:", error);
      setIsUploading(false);
    };
  };

  const handleRemoveImage = () => {
    setImageSrc(undefined);
    if (onChange) {
      onChange("");
    }
  };

  return (
    <div className="w-full">
      {label && <FormLabel>{label}</FormLabel>}

      <Card className="mt-2 overflow-hidden">
        <CardContent className="p-0">
          {imageSrc ? (
            <div className="relative">
              <div
                className="relative w-full"
                style={{ height: `${height}px` }}
              >
                {/* Use regular img tag instead of Next.js Image for better compatibility */}
                <img
                  src={imageSrc}
                  alt={alt}
                  className={`object-cover w-full h-full ${className}`}
                  style={{ maxWidth: "100%" }}
                />
              </div>

              {editable && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center bg-muted p-6"
              style={{ height: `${height}px` }}
            >
              {editable ? (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload an image
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="max-w-xs"
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No image available
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {description && <FormDescription>{description}</FormDescription>}

      {editable && imageSrc && (
        <div className="mt-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="max-w-xs"
          />
        </div>
      )}
    </div>
  );
}
