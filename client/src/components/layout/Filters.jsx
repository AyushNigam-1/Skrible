import React, { useState } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

const Filters = () => {
    const people = [
        { id: 1, name: 'Tom Cook' },
        { id: 2, name: 'Wade Cooper' },
        { id: 3, name: 'Tanya Fox' },
        { id: 4, name: 'Arlene Mccoy' },
        { id: 5, name: 'Devon Webb' },
    ];

    const [selected, setSelected] = useState(people[1]);

    return (
        <div className="w-72">
            <Listbox value={selected} onChange={setSelected}>
                {/* Dropdown Button */}
                <ListboxButton
                    className={clsx(
                        'relative block w-full rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 pl-4 pr-10 text-left text-base text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-200 cursor-pointer',
                        'hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 data-[open]:border-blue-500 data-[open]:ring-2 data-[open]:ring-blue-500/50'
                    )}
                >
                    <span className="block truncate font-medium">{selected.name}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 group-data-[open]:rotate-180" aria-hidden="true" />
                    </span>
                </ListboxButton>

                {/* Dropdown Menu Options */}
                <ListboxOptions
                    anchor="bottom"
                    transition
                    className={clsx(
                        'w-[var(--button-width)] z-50 mt-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-1.5 shadow-xl outline-none',
                        'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 data-[leave]:data-[closed]:scale-95 origin-top'
                    )}
                >
                    {people.map((person) => (
                        <ListboxOption
                            key={person.id}
                            value={person}
                            className={clsx(
                                'group relative flex cursor-pointer select-none items-center rounded-lg py-2.5 pl-3 pr-9 text-sm font-medium transition-colors',
                                'text-gray-700 dark:text-gray-200',
                                'data-[focus]:bg-blue-50 data-[focus]:text-blue-700 dark:data-[focus]:bg-blue-900/40 dark:data-[focus]:text-blue-300',
                                'data-[selected]:bg-blue-50/50 dark:data-[selected]:bg-blue-900/20'
                            )}
                        >
                            <span className="block truncate group-data-[selected]:font-semibold group-data-[selected]:text-blue-700 dark:group-data-[selected]:text-blue-300">
                                {person.name}
                            </span>

                            {/* Checkmark for selected item */}
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600 dark:text-blue-400 opacity-0 transition-opacity group-data-[selected]:opacity-100">
                                <Check className="h-4 w-4" aria-hidden="true" />
                            </span>
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </Listbox>
        </div>
    );
};

export default Filters;