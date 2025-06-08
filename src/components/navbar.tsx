'use client';
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
  ConnectButton,
  ErrorCode,
} from "@suiet/wallet-kit";
import { useGlobal } from "./context/GlobalProvider";
import { getAuthorization, isValidAuthorization } from "@/app/lib/token";
import { BASE_URL } from "@/app/lib/utils/constants";
import { useEffect } from "react";
import { AccountInfo } from "@/types/account";

interface AccountWrapper {
  account: AccountInfo
}

export default function BassinetNavbar() {
  const {isLogin, setIsLogin, account, setAccount} = useGlobal();

  function AccountDropdownItem({account}: AccountWrapper) {
    if (account != null) {
      if (account.wallet_address == null) {
        return <>
        <DropdownItem><a href="/binding_wallet">绑定钱包</a></DropdownItem>
        </>
      }else {
        if (account.package_id == null) {
          return <>
          <DropdownItem><a href="/open_service">发行Token</a></DropdownItem>
          </>
        }
      }
    }
  }

  function sign_out() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("account_info");
    window.location.reload();
  }

  const searchCollections = async () => {
    const searchElement = document.getElementById("default-search") as HTMLInputElement;
    const keyword = searchElement.value;
    window.location.replace(`/?keyword=${keyword}&refreshId=${new Date().getTime()}`);
  }

  useEffect(()=>{
    async function setAccountInfo() {
      const authorization = getAuthorization();
      const account_response = await fetch(BASE_URL + '/account_info', {
          method: 'GET',
          headers: {
              "Content-Type": "application/json;charset=utf-8",
              "Accept": "application/json",
              "Authorization": authorization
          }
      });
      if (!account_response.ok) {
          throw new Error("Invalid Account");
      }
      const account_info = await account_response.json();
      console.log(account_info);
      localStorage.setItem("account_info", JSON.stringify(account_info));
      const account : AccountInfo = {
        account_id: account_info.account_id,
        nick_name: account_info.nick_name,
        avatar: account_info.avatar,
        wallet_address: account_info.wallet_addrress,
        package_id: account_info.package_id
      };
      setAccount(account);
    }

    const isLogon = isValidAuthorization();
    if (isLogon) {
      const local_account_info = localStorage.getItem("account_info");
      if (local_account_info == null) {
        setAccountInfo();
      }else {
        setAccount(JSON.parse(local_account_info));
      }
    }else {
      localStorage.removeItem("account_info");
    }
    if (isLogon != isLogin) {
      setIsLogin(isLogon);
    }
  }, [isLogin, setIsLogin, setAccount]);
  
  return <>
    <Navbar fluid rounded>
      <NavbarBrand href="/">
        <picture>
          <img src="/favicon.svg" className="mr-3 h-6 sm:h-9" alt="Bassinet Logo" />
        </picture>
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Bassinet</span>
      </NavbarBrand>
      {isLogin ? (
        <NavbarCollapse>
          <Dropdown label="创作" inline>
            <DropdownItem><a href="/create_collection">专辑</a></DropdownItem>
            <DropdownDivider />
            <DropdownItem><a href="/create_article">文章</a></DropdownItem>
            <DropdownItem><a href="/create_video">视频</a></DropdownItem>
            {/* <DropdownItem>图集</DropdownItem>
            <DropdownItem>音频</DropdownItem>
            <DropdownItem>文件夹</DropdownItem> */}
          </Dropdown>
          <NavbarLink href="/my_collections">我的</NavbarLink>
        </NavbarCollapse>):(
        <NavbarCollapse>
          <NavbarLink href="/signin">Sign In</NavbarLink>
          <NavbarLink href="/signup">Sign Up</NavbarLink>
        </NavbarCollapse>)
      }
      
      <div className="max-w-2xl min-w-md">
        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input type="search" id="default-search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search ..." required />
            <Button onClick={searchCollections} className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</Button>
        </div>
      </div>
      {isLogin &&
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
      }
      {isLogin ? (
        <div className="flex md:order-3">
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt="User settings" img={account.avatar} rounded />
            }
          >
            <DropdownHeader>
              <span className="block text-sm">{account.nick_name}</span>
              {/* <span className="block truncate text-sm font-medium">name@flowbite.com</span> */}
            </DropdownHeader>
            <AccountDropdownItem account={account} />
            <DropdownDivider />
            <DropdownItem onClick={sign_out}>Sign out</DropdownItem>
          </Dropdown>
          <NavbarToggle />
        </div>):
        (<div className="flex md:order-2"></div>)
      }
    </Navbar>
    </>
}
