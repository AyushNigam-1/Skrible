import React from 'react'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Description, Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Select } from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'
const Filters = () => {

    const people = [
        { id: 1, name: 'Tom Cook' },
        { id: 2, name: 'Wade Cooper' },
        { id: 3, name: 'Tanya Fox' },
        { id: 4, name: 'Arlene Mccoy' },
        { id: 5, name: 'Devon Webb' },
    ]

    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState(people[1])

    const filteredPeople =
        query === ''
            ? people
            : people.filter((person) => {
                return person.name.toLowerCase().includes(query.toLowerCase())
            })
    return (
        <div class="">
            <Listbox value={selected} onChange={setSelected}>
                <ListboxButton
                    className={clsx(
                        ' block  rounded-lg w-72 bg-gray-200/50 p-3.5  text-lg text-gray-600',
                        'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25 flex justify-between items-center'
                    )}
                >
                    {selected.name}
                    {/* <ChevronDownIcon
                        className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                        aria-hidden="true"
                    /> */}

                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="group pointer-events-none  size-4 ">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>

                </ListboxButton>
                <ListboxOptions
                    anchor="bottom"
                    transition
                    className={clsx(
                        'w-[var(--button-width)] rounded-lg border bg-gray-200/50 mt-3 flex flex-col p-2 [--anchor-gap:var(--spacing-1)] focus:outline-none text-gray-600',
                        'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
                    )}
                >
                    {people.map((person) => (
                        <ListboxOption
                            key={person.name}
                            value={person}
                            className=" group flex items-center gap-2 rounded-lg text-md select-none data-[focus]:bg-white p-2 cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="invisible size-4  fill-white group-data-[selected]:visible">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>

                            {/* <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" /> */}
                            {person.name}
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </Listbox>
        </div>
    )
}

export default Filters