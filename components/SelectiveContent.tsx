// components/SelectiveContent.tsx
import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface SelectiveContentProps<T> {
  options: {
    value: T;
    label: React.ReactNode;
    content: React.ReactNode;
  }[];
  className?: string;
  buttonClassName?: string;
  contentClassName?: string;
  onSelect?: (value: T) => void;
}

export default function SelectiveContent<T>({
  options,
  className = '',
  buttonClassName = '',
  contentClassName = '',
  onSelect
}: SelectiveContentProps<T>) {
  const [selectedValue, setSelectedValue] = useState<T>(options[0].value);

  const handleChange = (value: T) => {
    setSelectedValue(value);
    onSelect?.(value);
  };

  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <div className={`w-full ${className}`}>
      <Listbox value={selectedValue} onChange={handleChange}>
        <div className="relative">
          <Listbox.Button
            className={`w-full cursor-default rounded-lg bg-gray-100 py-2 pl-3 pr-10 text-left transition-colors hover:bg-gray-200 focus:outline-none ${buttonClassName}`}
          >
            <span className="block truncate text-gray-700">
              {selectedOption?.label || '请选择...'}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-500"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
              {options.map((option, idx) => (
                <Listbox.Option
                  key={idx}
                  value={option.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-4 pr-4 ${
                      active ? 'bg-blue-50' : 'text-gray-700'
                    }`
                  }
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium text-blue-600' : 'font-normal'
                      }`}
                    >
                      {option.label}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      <div className={`mt-4 ${contentClassName}`}>
        {selectedOption?.content}
      </div>
    </div>
  );
}