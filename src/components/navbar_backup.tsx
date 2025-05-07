// https://flowbite-react.com/docs/components/navbar
// import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
// import Link from "next/link";

// export default function BassinetNavbar() {
//   return (
//     <Navbar fluid rounded>
//       <NavbarBrand as={Link} href="https://flowbite-react.com">
//         <img src="/favicon.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />
//         <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite React</span>
//       </NavbarBrand>
//       <NavbarToggle />
//       <NavbarCollapse>
//         <NavbarLink href="#" active>
//           Home
//         </NavbarLink>
//         <NavbarLink as={Link} href="#">
//           About
//         </NavbarLink>
//         <NavbarLink href="#">Services</NavbarLink>
//         <NavbarLink href="#">Pricing</NavbarLink>
//         <NavbarLink href="#">Contact</NavbarLink>
//       </NavbarCollapse>
//     </Navbar>
//   );
// }

'use client'
import {
  Avatar,
  Button,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";

import {
  // addressEllipsis,
  ConnectButton,
  ErrorCode,
  // formatSUI,
  // SuiChainId,
  // useAccountBalance,
//   useChain,
  // useSuiClient,
  // useWallet,
} from "@suiet/wallet-kit";
import { useState } from "react";

export default function BassinetNavbar() {
  const [isLogin, setIsLogin] = useState(false);

  const login = async () => {
    setIsLogin(true);
  }
  
  return (
    <Navbar fluid rounded>
      <NavbarBrand href="#">
        <picture>
          <img src="/favicon.svg" className="mr-3 h-6 sm:h-9" alt="Bassinet Logo" />
        </picture>
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Bassinet</span>
      </NavbarBrand>
      <NavbarCollapse>
        <NavbarLink href="http://192.168.0.103:3000/" active>
          Home
        </NavbarLink>
        <NavbarLink href="#">About</NavbarLink>
        <NavbarLink href="#">Sign In</NavbarLink>
        <NavbarLink href="#">Sign Up</NavbarLink>
        <NavbarLink href="#">Contact</NavbarLink>
      </NavbarCollapse>
      <div className="max-w-2xl min-w-md">
        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input type="search" id="default-search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search ..." required />
            <Button onClick={()=>login()} className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</Button>
        </div>
      </div>
      <div className="flex md:order-2">
        <ConnectButton className=""
          onConnectError={(error) => {
            if (error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
              console.warn(
                "user rejected the connection to " + error.details?.wallet
              );
            } else {
              console.warn("unknown connect error: ", error);
            }
          }}
        />
      </div>
      {isLogin ? (
        <div className="flex md:order-3">
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt="User settings" img="https://flowbite.com/docs/images/people/profile-picture-5.jpg" rounded />
            }
          >
            <DropdownHeader>
              <span className="block text-sm">Bonnie Green</span>
              <span className="block truncate text-sm font-medium">name@flowbite.com</span>
            </DropdownHeader>
            <DropdownItem>Dashboard</DropdownItem>
            <DropdownItem>Settings</DropdownItem>
            <DropdownItem>Earnings</DropdownItem>
            <DropdownDivider />
            <DropdownItem>Sign out</DropdownItem>
          </Dropdown>
          <NavbarToggle />
        </div>):
        (<div className="flex md:order-2"></div>)
      }
    </Navbar>
  );
}
