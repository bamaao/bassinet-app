'use client'

import { AccountInfo } from "@/types/account";
import { createContext, FC, useContext, useState, Dispatch} from "react";

interface GlobalValue {
    isLogin: boolean,
    setIsLogin: Dispatch<boolean>,
    account: AccountInfo,
    setAccount: Dispatch<AccountInfo>
}

const GlobalContext = createContext<GlobalValue>({} as GlobalValue);

const GlobalProvider: FC<React.PropsWithChildren> = ({ children }) => {
        const[isLogin, setIsLogin] = useState(false);
        const[account, setAccount] = useState({} as AccountInfo);
        return (
            <GlobalContext.Provider value={{isLogin, setIsLogin, account, setAccount}}>
                {children}
            </GlobalContext.Provider>
        )
};

export const useGlobal = () => useContext(GlobalContext);

export default GlobalProvider;