import { Star, StarHalf } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { FormDescription, FormLabel } from '@/components/ui/form';

interface RatingFieldProps {
  value?: number;
  onChange?: (value: number) => void;
  maxRating?: number;
  precision?: 'half' | 'full';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function RatingField({
  value = 0,
  onChange,
  maxRating = 5,
  precision = 'full',
  size = 'md',
  color = 'gold',
  disabled = false,
  label,
  description,
}: RatingFieldProps) {
  // Convert value to number if it's a string
  const numericValue =
    typeof value === 'string' ? parseFloat(value) || 0 : value;
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  // Determine star size based on the size prop
  const getStarSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-8 w-8';
      case 'md':
      default:
        return 'h-6 w-6';
    }
  };

  // Calculate the display value (either the hover value or the actual value)
  const displayValue = hoverValue !== null ? hoverValue : numericValue;

  // Handle mouse enter on a star
  const handleMouseEnter = (index: number) => {
    if (!disabled) {
      setHoverValue(index);
    }
  };

  // Handle mouse leave from the rating component
  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  // Handle click on a star
  const handleClick = (index: number) => {
    if (!disabled && onChange) {
      onChange(index);
    }
  };

  // Render stars based on the current value and hover state
  const renderStars = () => {
    const stars = [];
    const starSize = getStarSize();

    for (let i = 1; i <= maxRating; i++) {
      // For full precision, we only need to check if the current index is less than or equal to the display value
      if (precision === 'full') {
        const isFilled = i <= displayValue;
        stars.push(
          <Star
            key={i}
            className={cn(
              starSize,
              'cursor-pointer transition-colors',
              isFilled ? 'fill-current text-yellow-400' : 'text-gray-300',
              disabled && 'cursor-not-allowed opacity-50',
            )}
            style={{ color: isFilled ? color : undefined }}
            onMouseEnter={() => handleMouseEnter(i)}
            onClick={() => handleClick(i)}
          />,
        );
      } else {
        // For half precision, we need to check if we should render a half star
        const diff = displayValue - i + 1;
        let starComponent;

        if (diff >= 1) {
          // Full star
          starComponent = (
            <Star
              key={i}
              className={cn(
                starSize,
                'fill-current text-yellow-400 cursor-pointer transition-colors',
                disabled && 'cursor-not-allowed opacity-50',
              )}
              style={{ color }}
              onMouseEnter={() => handleMouseEnter(i)}
              onClick={() => handleClick(i)}
            />
          );
        } else if (diff > 0 && diff < 1) {
          // Half star
          starComponent = (
            <div
              key={i}
              className='relative'
              onMouseEnter={() => handleMouseEnter(i)}
              onClick={() => handleClick(i)}
            >
              <Star
                className={cn(
                  starSize,
                  'text-gray-300 absolute',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
              />
              <div className='overflow-hidden' style={{ width: '50%' }}>
                <Star
                  className={cn(
                    starSize,
                    'fill-current text-yellow-400',
                    disabled && 'opacity-50',
                  )}
                  style={{ color }}
                />
              </div>
            </div>
          );
        } else {
          // Empty star
          starComponent = (
            <Star
              key={i}
              className={cn(
                starSize,
                'text-gray-300 cursor-pointer transition-colors',
                disabled && 'cursor-not-allowed opacity-50',
              )}
              onMouseEnter={() => handleMouseEnter(i)}
              onClick={() => handleClick(i)}
            />
          );
        }

        stars.push(starComponent);
      }
    }

    return stars;
  };

  return (
    <div className='w-full'>
      {label && <FormLabel>{label}</FormLabel>}

      <div
        className='flex items-center gap-1 mt-1'
        onMouseLeave={handleMouseLeave}
      >
        {renderStars()}
        <span className='ml-2 text-sm text-muted-foreground'>
          {displayValue} of {maxRating}
        </span>
      </div>

      {description && <FormDescription>{description}</FormDescription>}
    </div>
  );
}
