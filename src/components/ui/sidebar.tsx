
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile" // Ensure this path is correct
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger as ShadSheetTrigger } from "@/components/ui/sheet" // Renamed to avoid conflict
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem" // Default expanded width
const SIDEBAR_WIDTH_MOBILE = "18rem" // Width for mobile sheet
const SIDEBAR_WIDTH_ICON = "3.5rem" // Width when collapsed to icons (increased slightly for padding)
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  collapsible: "offcanvas" | "icon" | "none"
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
    // Make collapsible a prop of SidebarProvider to be accessible in context
    collapsible?: "offcanvas" | "icon" | "none" 
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      collapsible = "icon", // Default to icon collapsible
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    
    const setOpen = React.useCallback(
      (value: boolean | ((currentOpen: boolean) => boolean)) => {
        const newOpenState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(newOpenState);
        } else {
          _setOpen(newOpenState);
        }
        if (!isMobile) { // Only set cookie for desktop state
            document.cookie = `${SIDEBAR_COOKIE_NAME}=${newOpenState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
        }
      },
      [setOpenProp, open, isMobile]
    );
    
    // Effect to read cookie on initial desktop mount
    React.useEffect(() => {
        if (!isMobile) {
            const cookieValue = document.cookie
                .split('; ')
                .find(row => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
                ?.split('=')[1];
            if (cookieValue) {
                _setOpen(cookieValue === 'true');
            }
        }
    }, [isMobile]);


    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((current) => !current)
      } else {
        setOpen((current) => !current)
      }
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        collapsible, // Pass collapsible to context
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, collapsible]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full",
              // Apply inset styles if variant is inset (though variant is prop of Sidebar, not Provider)
              // This might need adjustment based on how 'variant' is used.
              // For now, assuming SidebarProvider wraps everything.
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"


const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    // collapsible prop is now handled by Provider, but keep for explicitness if direct use
    collapsible?: "offcanvas" | "icon" | "none" 
  }
>(
  (
    {
      side = "left",
      variant = "sidebar", // Default to standard sidebar variant
      collapsible: collapsibleProp, // Use prop if passed, else context
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile, collapsible: contextCollapsible, open } = useSidebar()
    const currentCollapsible = collapsibleProp ?? contextCollapsible;

    if (currentCollapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            variant === "inset" && "m-2 rounded-lg shadow-sm border border-sidebar-border",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <ShadSheetTrigger asChild>
            {/* This trigger is typically placed in the header for mobile */}
            {/* This component itself doesn't render the trigger, it's a consumer responsibility */}
            <span className="sr-only">Open sidebar</span>
          </ShadSheetTrigger>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width-mobile] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden" // Hide default close button if custom one is used in children
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    // Desktop sidebar logic
    return (
      <div
        ref={ref}
        data-sidebar="sidebar"
        data-state={state} // 'expanded' or 'collapsed'
        data-collapsible={currentCollapsible === 'icon' && !open ? 'icon' : currentCollapsible === 'offcanvas' && !open ? 'offcanvas' : 'none'}
        data-variant={variant}
        data-side={side}
        className={cn(
            "hidden md:flex flex-col text-sidebar-foreground transition-[width] duration-300 ease-in-out",
            "h-svh", // Full viewport height
            side === "left" ? "border-r border-sidebar-border" : "border-l border-sidebar-border",
            
            // Width settings based on state and collapsible type
            state === "expanded" ? "w-[--sidebar-width]" : 
            (currentCollapsible === "icon" ? "w-[--sidebar-width-icon]" : "w-0"), // offcanvas collapses to 0 width

            // Variant styles
            variant === "sidebar" && "bg-sidebar",
            variant === "floating" && "bg-sidebar m-2 rounded-lg shadow-lg border border-sidebar-border",
            variant === "inset" && "bg-transparent", // Inset is more about the main content area

            className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"


const SidebarTrigger = React.forwardRef< // This is the mobile trigger primarily
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, children, ...props }, ref) => {
  const { toggleSidebar, isMobile } = useSidebar()

  if (!isMobile) return null; // Only render for mobile, desktop uses SidebarRail

  return (
    <ShadSheetTrigger asChild>
        <Button
        ref={ref}
        data-sidebar="trigger"
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8 md:hidden", className)} // md:hidden to ensure it's mobile only
        onClick={(event) => {
            onClick?.(event)
            toggleSidebar()
        }}
        {...props}
        >
        {children || <PanelLeft />}
        <span className="sr-only">Toggle Sidebar</span>
        </Button>
    </ShadSheetTrigger>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"


const SidebarRail = React.forwardRef< // Desktop collapse/expand trigger
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar, isMobile, state, collapsible } = useSidebar()

  if (isMobile || collapsible !== 'icon') return null; // Only for desktop icon-collapsible mode

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1} // Not focusable, but clickable
      onClick={toggleSidebar}
      title={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 items-center justify-center",
        "cursor-pointer transition-colors hover:bg-sidebar-border/50",
        "group-data-[side=left]/sidebar-wrapper:right-0 group-data-[side=left]/sidebar-wrapper:translate-x-1/2",
        "group-data-[side=right]/sidebar-wrapper:left-0 group-data-[side=right]/sidebar-wrapper:-translate-x-1/2",
        "md:flex", // Show on desktop
        className
      )}
      {...props}
    >
      {/* Visual indicator for the rail, can be styled further */}
      <div className="h-8 w-1 rounded-full bg-sidebar-border/30 group-hover/sidebar-wrapper:bg-sidebar-border/80" />
    </button>
  )
})
SidebarRail.displayName = "SidebarRail"


const SidebarInset = React.forwardRef< // Main content area that adjusts to sidebar
  HTMLDivElement, // Changed from main to div for more general use
  React.ComponentProps<"div"> // Changed from main to div
>(({ className, ...props }, ref) => {
  const { state, isMobile, collapsible } = useSidebar();
  
  // Calculate margin based on sidebar state for desktop
  // No margin change for mobile as sidebar is an overlay
  const desktopMarginClass = () => {
    if (isMobile) return "";
    if (collapsible === 'icon') {
      return state === 'expanded' ? "md:ml-[--sidebar-width]" : "md:ml-[--sidebar-width-icon]";
    }
    if (collapsible === 'offcanvas') {
      return state === 'expanded' ? "md:ml-[--sidebar-width]" : "md:ml-0";
    }
    return "md:ml-[--sidebar-width]"; // Default for 'none' or if expanded
  };


  return (
    <div // Changed from main to div
      ref={ref}
      className={cn(
        "flex-1 flex flex-col min-h-svh bg-background transition-[margin-left] duration-300 ease-in-out",
        desktopMarginClass(),
        // Inset variant styling for the content area itself
        // This assumes 'variant' is a prop on the consuming layout.
        // The 'group/sidebar-wrapper' and 'data-variant' on Sidebar component are key.
        // If Sidebar variant is "inset", this component needs to know to apply specific styles.
        // For simplicity, specific inset content styling (like rounded corners) is done here if needed.
        "group-data-[variant=inset]/sidebar-wrapper:md:m-2 group-data-[variant=inset]/sidebar-wrapper:md:rounded-lg group-data-[variant=inset]/sidebar-wrapper:shadow-sm",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"


const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  const { state, collapsible } = useSidebar();
  return (
    <div className={cn("p-2", state === "collapsed" && collapsible === "icon" && "px-1 py-2")}>
        <Input
        ref={ref}
        data-sidebar="input"
        placeholder={state === "collapsed" && collapsible === "icon" ? "..." : "Search..."}
        className={cn(
            "h-9 w-full bg-sidebar-background text-sidebar-foreground shadow-inner focus-visible:ring-1 focus-visible:ring-sidebar-ring",
            state === "collapsed" && collapsible === "icon" && "h-8 text-center placeholder:text-center",
            className
        )}
        {...props}
        />
    </div>
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { state, collapsible } = useSidebar();
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2 min-h-[4rem] items-center justify-center", // Ensure consistent height
       state === "collapsed" && collapsible === "icon" && "px-1.5 py-2",
       className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { state, collapsible } = useSidebar();
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2 mt-auto border-t border-sidebar-border", // mt-auto pushes to bottom
        state === "collapsed" && collapsible === "icon" && "px-1.5 py-2",
      className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  const { state, collapsible } = useSidebar();
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn(
        "mx-2 w-auto bg-sidebar-border", 
        state === "collapsed" && collapsible === "icon" && "mx-1",
        className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef< // This is the main scrollable area for nav items
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden p-2", // scrollable
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"


// SidebarGroup, GroupLabel, GroupAction, GroupContent are useful for structuring menu sections
const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col", className)} // Removed p-2, handled by SidebarContent or individual items
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  const { state, collapsible } = useSidebar();

  if (state === "collapsed" && collapsible === "icon") {
    return (
        <Tooltip>
            <TooltipTrigger className="w-full my-1">
                <Separator className="bg-sidebar-border/70"/>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" className="whitespace-nowrap">
                {children}
            </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-semibold text-sidebar-foreground/60 tracking-wide",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"


const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { state, collapsible } = useSidebar();
  
  if (state === "collapsed" && collapsible === "icon") return null;

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-2 top-1.5 flex aspect-square w-6 items-center justify-center rounded-md p-0 text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 [&>svg]:size-3.5 [&>svg]:shrink-0",
        "after:absolute after:-inset-1 after:md:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"


const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm flex flex-col gap-0.5", className)} // gap-0.5 for items
    {...props}
  >
    {children}
  </div>
))
SidebarGroupContent.displayName = "SidebarGroupContent"


const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} // Reduced gap
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"


const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative w-full", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"


const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2.5 overflow-hidden rounded-md px-2.5 py-2 text-left text-sm outline-none ring-sidebar-ring transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 active:bg-sidebar-accent/90 active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-medium data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        // outline variant can be added if needed
      },
      size: { // Size variants might be less relevant if padding is consistent
        default: "h-9 text-sm", // Adjusted height
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)


const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement, // Changed to HTMLButtonElement as Slot is not always a button
  React.ComponentProps<typeof Button> & { // Use ButtonProps for consistency if it's a button
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | Omit<React.ComponentProps<typeof TooltipContent>, "children"> & {children: React.ReactNode}
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant, // variant and size from cva
      size,
      tooltip,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state: sidebarState, collapsible } = useSidebar();

    const buttonContent = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-active={isActive}
        className={cn(
          sidebarMenuButtonVariants({ variant, size }), 
          sidebarState === "collapsed" && collapsible === "icon" && "justify-center px-0 w-full h-9 [&>span:last-child]:hidden", // Icon only styles
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );

    if (!tooltip || (sidebarState === "expanded" && !isMobile) ) {
      return buttonContent;
    }

    const tooltipContentProps = typeof tooltip === 'string' ? { children: tooltip } : tooltip;
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent 
            side="right" 
            align="center" 
            className="whitespace-nowrap"
            {...tooltipContentProps} 
        />
      </Tooltip>
    );
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"


const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { state, collapsible } = useSidebar();

  if (state === "collapsed" && collapsible === "icon") return null;

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1.5 top-1/2 -translate-y-1/2 flex aspect-square w-6 items-center justify-center rounded-md p-0 text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-3.5 [&>svg]:shrink-0",
        "after:absolute after:-inset-1.5 after:md:hidden",
        showOnHover && "opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"


const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
    const { state, collapsible } = useSidebar();
    if (state === "collapsed" && collapsible === "icon") return null;

    return (
        <div
            ref={ref}
            data-sidebar="menu-badge"
            className={cn(
            "ml-auto text-xs font-medium h-5 min-w-[1.25rem] px-1.5 flex items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary group-hover/menu-item:bg-sidebar-accent/30 group-hover/menu-item:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:bg-sidebar-background/30 peer-data-[active=true]/menu-button:text-sidebar-foreground",
            className
            )}
            {...props}
        >
            {children}
        </div>
    )
})
SidebarMenuBadge.displayName = "SidebarMenuBadge"


const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = true, ...props }, ref) => {
  const { state, collapsible } = useSidebar();
  const width = React.useMemo(() => `${Math.floor(Math.random() * 30) + 60}%`, []);

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-9 flex gap-2.5 px-2.5 items-center py-2",
        state === "collapsed" && collapsible === "icon" && "justify-center px-0",
       className)}
      {...props}
    >
      {showIcon && (
        <Skeleton className="size-4 rounded-sm bg-sidebar-foreground/20" data-sidebar="menu-skeleton-icon" />
      )}
      { !(state === "collapsed" && collapsible === "icon") && (
        <Skeleton className="h-3 flex-1 max-w-[--skeleton-width] bg-sidebar-foreground/20" data-sidebar="menu-skeleton-text" style={{ "--skeleton-width": width } as React.CSSProperties} />
      )}
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"


const SidebarMenuSub = React.forwardRef< // Container for sub-menu items
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => {
  const { state, collapsible } = useSidebar();
  if (state === "collapsed" && collapsible === "icon") return null;

  return (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "ml-[calc(0.625rem_+_1px)] flex min-w-0 flex-col gap-0.5 border-l border-sidebar-border/70 pl-2.5 py-1 my-0.5",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSub.displayName = "SidebarMenuSub"


const SidebarMenuSubItem = React.forwardRef< // Wrapper for each sub-menu button/link
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} className="w-full" {...props} />)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef< // Actual sub-menu button/link
  HTMLAnchorElement, // Assuming it's an anchor, adjust if it can be a button
  React.ComponentProps<"a"> & { // Use anchor props
    asChild?: boolean
    isActive?: boolean
  }
>(({ asChild = false, isActive, className, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-active={isActive}
      className={cn(
        "flex h-8 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-[0.8rem] text-sidebar-foreground/80 outline-none ring-sidebar-ring hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground focus-visible:ring-1 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-3.5 [&>svg]:shrink-0",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger, // The mobile trigger
  useSidebar,
}
