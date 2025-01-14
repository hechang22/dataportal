import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { Transition } from '@headlessui/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isShowing, setShow] = useState(true);
  return (
    <>
      <Transition
        show={isShowing}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
      </Transition>
      <header className="max-w-5xl mx-auto mt-8 w-full">
        <div className="border-b-2 pb-2.5 mx-2 border-zinc-800 flex justify-between">
          <h1 className="flex gap-x-1 items-end">
            <span className="sr-only">LuLab</span>
            <img
              width="100"
              height="25"
              alt="LuLab"
              src="lulablogo.png"
            />{' '}
            {/* <span className="-mb-0.5 text-[#3c3c3c]">replica</span> */}
          </h1>
          <div className="md:flex items-center gap-x-3 text-[#3c3c3c] -mb-1 hidden">
            <a
              className="hover:opacity-75 transition"
              href="https://www.ncrnalab.org/home/"
            >
              Lab homepage
            </a>
          </div>
        </div>
        {/* <div className="mx-2 py-1.5 text-[14px] text-[#3c3c3c] md:hidden">
          <ul className="flex gap-x-4">
            <li>
              <a
                className="hover:opacity-75 transition"
                href="https://portaljs.com"
              >
                PortalJS
              </a>
            </li>
            <li>
              <a
                className="hover:opacity-75 transition"
                href="https://github.com/datopian/portaljs/tree/main/examples/fivethirtyeight"
              >
                View on Github
              </a>
            </li>
          </ul>
        </div> */}
      </header>
      {children}
    </>
  );
}
