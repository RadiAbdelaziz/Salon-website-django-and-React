import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

const Breadcrumb = React.forwardRef(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    role="navigation"
    aria-label="Breadcrumb"
    className={cn("flex items-center space-x-1 text-sm", className)}
    {...props}
  />
));
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn("flex flex-wrap items-center break-words text-sm text-muted-foreground sm:break-keep", className)}
    {...props}
  />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn("transition-colors hover:text-foreground", className)}
    {...props}
  />
));
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-foreground", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({ children, className, ...props }) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:size-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({ className, ...props }) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
    >
      <path
        d="M3.625 6.5C3.625 7.12132 3.12132 7.625 2.5 7.625C1.87868 7.625 1.375 7.12132 1.375 6.5C1.375 5.87868 1.87868 5.375 2.5 5.375C3.12132 5.375 3.625 5.87868 3.625 6.5ZM8.625 6.5C8.625 7.12132 8.12132 7.625 7.5 7.625C6.87868 7.625 6.375 7.12132 6.375 6.5C6.375 5.87868 6.87868 5.375 7.5 5.375C8.12132 5.375 8.625 5.87868 8.625 6.5ZM11.375 6.5C11.375 7.12132 10.8713 7.625 10.25 7.625C9.62868 7.625 9.125 7.12132 9.125 6.5C9.125 5.87868 9.62868 5.375 10.25 5.375C10.8713 5.375 11.375 5.87868 11.375 6.5Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

// Custom breadcrumbs component with icon support
export function BreadcrumbsWithIcon({ items = [], className, ...props }) {
  return (
    <Breadcrumb className={cn("text-sm", className)} {...props}>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink 
                  href={item.href}
                  className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  {item.icon && <span className="flex items-center">{item.icon}</span>}
                  <span className={cn("opacity-60", index === items.length - 1 && "opacity-100")}>
                    {item.label}
                  </span>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="flex items-center gap-1.5">
                  {item.icon && <span className="flex items-center">{item.icon}</span>}
                  <span>{item.label}</span>
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};