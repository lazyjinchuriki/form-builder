'use client';

import { cn } from '@/lib/utils';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';


interface TabsScrollContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  scrollAmount?: number;
}

const TabsScrollContainer = React.forwardRef<
  HTMLDivElement,
  TabsScrollContainerProps
>(({ children, className, scrollAmount = 200, ...props }, ref) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      // Initial check
      checkScroll();

      // Check after content might have changed/rendered
      setTimeout(checkScroll, 100);

      // Add event listeners
      scrollContainer.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);

      return () => {
        scrollContainer.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Add helper CSS class to hide scrollbar but maintain functionality
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;

    if (!document.querySelector('style[data-scrollbar-hide]')) {
      style.setAttribute('data-scrollbar-hide', '');
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div
      className={cn('relative flex items-center', className)}
      ref={ref}
      {...props}
    >
      {/* <div className='flex-none w-8'>
        {showLeftArrow && (
          <button
            type='button'
            onClick={() => scroll('left')}
            className='flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm hover:bg-muted'
            aria-label='Scroll tabs left'
          >
            <ChevronLeft className='h-4 w-4' />
          </button>
        )}
      </div> */}

      <div
        ref={scrollContainerRef}
        className='flex-1 overflow-x-auto scrollbar-hide rounded-lg'
      >
        {children}
      </div>

      {/* <div className='flex-none w-8'>
        {showRightArrow && (
          <button
            type='button'
            onClick={() => scroll('right')}
            className='flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm hover:bg-muted'
            aria-label='Scroll tabs right'
          >
            <ChevronRight className='h-4 w-4' />
          </button>
        )}
      </div> */}
    </div>
  );
});

TabsScrollContainer.displayName = 'TabsScrollContainer';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
      className,
    )}
    {...props}
  />
));

TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-background data-[state=active]:shadow-sm',
      className,
    )}
    {...props}
  />
));

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));

TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsScrollContainer };
