import React, { useMemo } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronDown, Check, LucideIcon } from "lucide-react";
import clsx from "clsx";

export interface DropdownOption {
  id: string | number;
  name: string;
  [key: string]: any;
}

interface DropdownProps {
  options: DropdownOption[];
  value: DropdownOption;
  onChange: (value: DropdownOption) => void;
  className?: string;
  icon?: LucideIcon;
  collapseOnMobile?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  className = "w-max", // Changed default to w-max so it doesn't force full width
  icon: Icon,
  collapseOnMobile = false,
}) => {
  // Find the longest option string to set our fixed ghost width
  const longestOptionName = useMemo(() => {
    return [...options].sort((a, b) => b.name.length - a.name.length)[0]?.name || "Select...";
  }, [options]);

  return (
    <div className={className}>
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <>
            <ListboxButton
              className={clsx(
                "relative rounded-xl bg-white/5 border border-white/10 shadow-sm outline-none transition-all duration-300 font-sans",
                "hover:bg-white/10 hover:border-white/20",
                "focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50",
                open && "bg-white/10 border-white/20 ring-2 ring-white/10"
              )}
            >
              {/* 🚨 GHOST ELEMENT: Invisible, but dictates the exact width of the button based on the longest option! */}
              <div
                className={clsx(
                  "invisible flex items-center justify-between gap-2",
                  collapseOnMobile ? "p-2 sm:py-2.5 sm:pl-3.5 sm:pr-3.5" : "py-2 pl-3.5 pr-3.5"
                )}
                aria-hidden="true"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {Icon && <Icon className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />}
                  <span className={clsx(collapseOnMobile && "hidden sm:block")}>
                    {longestOptionName}
                  </span>
                </div>
                <ChevronDown className={clsx("h-4 w-4 shrink-0", collapseOnMobile && "hidden sm:block")} />
              </div>

              {/* VISIBLE ELEMENT: Absolutely positioned over the ghost element */}
              <div
                className={clsx(
                  "absolute inset-0 flex items-center justify-between gap-2",
                  collapseOnMobile ? "p-2 sm:py-2.5 sm:pl-3.5 sm:pr-3.5" : "py-2 pl-3.5 pr-3.5"
                )}
              >
                <div className="flex items-center gap-2 truncate text-sm font-semibold text-white">
                  {Icon && <Icon className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />}
                  <span className={clsx("truncate", collapseOnMobile && "hidden sm:block")}>
                    {value?.name || "Select..."}
                  </span>
                </div>
                <ChevronDown
                  className={clsx(
                    "h-4 w-4 text-gray-400 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    collapseOnMobile && "hidden sm:block",
                    open && "rotate-180 text-white"
                  )}
                  aria-hidden="true"
                />
              </div>
            </ListboxButton>

            <ListboxOptions
              anchor="bottom end"
              transition
              className={clsx(
                // 🚨 FIX: Removed min-w-full. Added min-w-[var(--button-width)] so it perfectly matches the button size but never over-stretches!
                "w-max min-w-[var(--button-width)] z-50 mt-2 rounded-xl border border-white/10 bg-[#161620] p-1.5 shadow-2xl outline-none font-sans",
                "transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top",
                "data-[closed]:opacity-0 data-[closed]:scale-95 data-[closed]:-translate-y-2"
              )}
            >
              {options.map((option) => (
                <ListboxOption
                  key={option.id}
                  value={option}
                  className={clsx(
                    "group relative flex cursor-pointer select-none items-center rounded-lg py-2.5 pl-3 pr-9 text-sm font-medium transition-colors duration-200",
                    "text-gray-400",
                    "data-[focus]:bg-white/5 data-[focus]:text-white",
                    "data-[selected]:bg-white/10 data-[selected]:text-white data-[selected]:font-bold"
                  )}
                >
                  <span className="block truncate">{option.name}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-white opacity-0 transition-opacity duration-300 group-data-[selected]:opacity-100">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </>
        )}
      </Listbox>
    </div>
  );
};

export default Dropdown;