import React from "react";
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
  collapseOnMobile?: boolean; // NEW: Triggers the mobile Action Bar UI
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  className = "w-full sm:w-72",
  icon: Icon,
  collapseOnMobile = false,
}) => {
  return (
    <div className={className}>
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <>
            <ListboxButton
              className={clsx(
                "relative flex items-center justify-between gap-2 rounded-xl bg-white/5 border border-white/10 shadow-sm outline-none transition-all duration-300 font-sans",
                // Adjust padding dynamically if it's collapsed into a square button on mobile
                collapseOnMobile
                  ? "p-3 sm:py-3 sm:pl-4 sm:pr-4"
                  : "py-3 pl-4 pr-4 w-full",
                "hover:bg-white/10 hover:border-white/20",
                "focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50",
                open && "bg-white/10 border-white/20 ring-2 ring-white/10",
              )}
            >
              <div className="flex items-center gap-2 truncate text-sm font-semibold text-white">
                {Icon && (
                  <Icon className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                )}
                <span
                  className={clsx(
                    "truncate",
                    collapseOnMobile && "hidden sm:block",
                  )}
                >
                  {value?.name || "Select..."}
                </span>
              </div>
              <ChevronDown
                className={clsx(
                  "h-4 w-4 text-gray-400 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  collapseOnMobile && "hidden sm:block",
                  open && "rotate-180 text-white",
                )}
                aria-hidden="true"
              />
            </ListboxButton>

            <ListboxOptions
              anchor="bottom end" // Aligns the dropdown to the right edge so it doesn't flow off-screen on mobile
              transition
              className={clsx(
                // Use a min-width so the menu doesn't shrink to the size of the icon button on mobile
                "w-48 sm:w-[var(--button-width)] z-50 mt-2 rounded-xl border border-white/10 bg-[#161620] p-1.5 shadow-2xl outline-none font-sans",
                "transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top",
                "data-[closed]:opacity-0 data-[closed]:scale-95 data-[closed]:-translate-y-2",
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
                    "data-[selected]:bg-white/10 data-[selected]:text-white data-[selected]:font-bold",
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
