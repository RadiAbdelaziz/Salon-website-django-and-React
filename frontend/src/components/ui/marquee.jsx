import * as React from "react"
import { cn } from "@/lib/utils"

const Marquee = React.forwardRef(
  (
    {
      className,
      reverse,
      pauseOnHover = false,
      vertical = false,
      repeat = 4,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
          {
            "flex-row": !vertical,
            "flex-col": vertical,
          },
          className
        )}
        {...props}
      >
        {Array.from({ length: repeat }, (_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {props.children}
          </div>
        ))}
      </div>
    )
  }
)
Marquee.displayName = "Marquee"

export { Marquee }
