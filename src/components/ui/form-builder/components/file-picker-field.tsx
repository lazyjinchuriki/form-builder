import { FileIcon, ImageIcon, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormDescription, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface FileObject {
  name: string;
  type: string;
  size: number;
  data: string; // Base64 data
  preview?: string; // URL for preview
}

interface FilePickerFieldProps {
  value?: FileObject | FileObject[];
  onChange?: (value: FileObject | FileObject[] | undefined) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  showPreview?: boolean;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function FilePickerField({
  value,
  onChange,
  accept = '*',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 5,
  showPreview = true,
  disabled = false,
  label,
  description,
}: FilePickerFieldProps) {
  const [error, setError] = useState<string | null>(null);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    // Check if too many files are selected
    if (multiple && files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files`);

      return;
    }

    try {
      const fileObjects: FileObject[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file size
        if (file.size > maxSize) {
          setError(
            `File "${file.name}" exceeds the maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`,
          );

          return;
        }

        // Convert to base64
        const base64 = await fileToBase64(file);

        // Create preview URL for images
        let preview = undefined;
        if (file.type.startsWith('image/') && showPreview) {
          preview = URL.createObjectURL(file);
        }

        fileObjects.push({
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64,
          preview,
        });
      }

      if (onChange) {
        if (multiple) {
          onChange(fileObjects);
        } else {
          onChange(fileObjects[0]);
        }
      }
    } catch (err) {
      console.error('Error processing files:', err);
      setError('Error processing files');
    }

    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    if (!onChange) return;

    if (multiple && Array.isArray(value)) {
      const newFiles = [...value];
      newFiles.splice(index, 1);
      onChange(newFiles.length > 0 ? newFiles : undefined);
    } else {
      onChange(undefined);
    }
  };

  // Handle opening a file in a new tab
  const handleOpenFile = (file: FileObject) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      window.open(file.data, '_blank');
    } else {
      // For other file types, create a download link
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Render file preview
  const renderFilePreview = (file: FileObject, index: number) => {
    if (file.type.startsWith('image/') && file.preview && showPreview) {
      return (
        <div className='relative group'>
          <div className='relative w-full h-32 overflow-hidden rounded-md'>
            <img
              src={
                file.data
              } /* Use data instead of preview for better compatibility */
              alt={file.name}
              className='object-cover w-full h-full'
            />
          </div>
          {!disabled && (
            <Button
              variant='destructive'
              size='icon'
              className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity'
              onClick={() => handleRemoveFile(index)}
            >
              <X className='h-4 w-4' />
            </Button>
          )}
          <div className='mt-1 text-xs text-center truncate w-full'>
            {file.name}
          </div>
        </div>
      );
    } else {
      return (
        <div
          className='flex items-center p-2 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors'
          onClick={() => handleOpenFile(file)}
        >
          <div className='mr-2 text-primary'>
            <FileIcon className='h-8 w-8' />
          </div>
          <div className='flex-1 min-w-0'>
            <div className='text-sm font-medium truncate'>{file.name}</div>
            <div className='text-xs text-muted-foreground'>
              {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>
          {!disabled && (
            <Button
              variant='ghost'
              size='icon'
              className='ml-2'
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile(index);
              }}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          )}
        </div>
      );
    }
  };

  // Render file list
  const renderFiles = () => {
    if (!value) return null;

    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return null;

      return (
        <div
          className={cn(
            'mt-2 gap-2',
            showPreview && value.some((f) => f.type.startsWith('image/'))
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              : 'space-y-2',
          )}
        >
          {value.map((file, index) => (
            <div key={index}>{renderFilePreview(file, index)}</div>
          ))}
        </div>
      );
    } else if (!Array.isArray(value)) {
      return <div className='mt-2'>{renderFilePreview(value, 0)}</div>;
    }

    return null;
  };

  return (
    <div className='w-full'>
      {label && <FormLabel>{label}</FormLabel>}

      <div className='mt-1'>
        <div className='flex items-center justify-center w-full'>
          <label
            htmlFor={`file-upload-${label}`}
            className={cn(
              'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/30 transition-colors',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <div className='flex flex-col items-center justify-center pt-5 pb-6'>
              <Upload className='w-8 h-8 mb-2 text-muted-foreground' />
              <p className='mb-2 text-sm text-muted-foreground'>
                <span className='font-semibold'>Click to upload</span> or drag
                and drop
              </p>
              <p className='text-xs text-muted-foreground'>
                {multiple
                  ? `Up to ${maxFiles} files (max ${Math.round(maxSize / 1024 / 1024)}MB each)`
                  : `Max file size: ${Math.round(maxSize / 1024 / 1024)}MB`}
              </p>
              {accept !== '*' && (
                <p className='text-xs text-muted-foreground mt-1'>
                  Accepted formats: {accept.split(',').join(', ')}
                </p>
              )}
            </div>
            <Input
              id={`file-upload-${label}`}
              type='file'
              accept={accept}
              multiple={multiple}
              className='hidden'
              onChange={handleFileChange}
              disabled={disabled}
            />
          </label>
        </div>

        {error && <p className='mt-2 text-sm text-destructive'>{error}</p>}

        {renderFiles()}
      </div>

      {description && <FormDescription>{description}</FormDescription>}
    </div>
  );
}
