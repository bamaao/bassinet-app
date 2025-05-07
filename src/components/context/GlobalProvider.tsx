'use client'

import { createContext, FC, useContext, useState, Dispatch} from "react";

interface GlobalValue {
    isLogin: boolean,
    setIsLogin: Dispatch<boolean>,
}

const GlobalContext = createContext<GlobalValue>({} as GlobalValue);

const GlobalProvider: FC<React.PropsWithChildren> = ({ children }) => {
        const[isLogin, setIsLogin] = useState(false);
        return (
            <GlobalContext.Provider value={{isLogin, setIsLogin}}>
                {children}
            </GlobalContext.Provider>
        )
};

export const useGlobal = () => useContext(GlobalContext);

export default GlobalProvider;