"use client"

import { FC } from "react";
import { AllDefaultWallets, defineStashedWallet, WalletProvider } from "@suiet/wallet-kit";

/**
 * Custom provider component for integrating with third-party providers.
 * https://nextjs.org/docs/getting-started/react-essentials#rendering-third-party-context-providers-in-server-components
 * @param props
 * @constructor
 */
// 原代码中使用了 `any` 类型，这不符合代码规范，因为 `any` 会绕过 TypeScript 的类型检查。
// 这里将其替换为 `React.PropsWithChildren` 类型，它是 React 提供的一个工具类型，用于表示包含 `children` 属性的组件 props。
const Providers: FC<React.PropsWithChildren> = ({ children }) => {
    return (
      <WalletProvider
        defaultWallets={[
          ...AllDefaultWallets,
          defineStashedWallet({
            appName: "Suiet Kit Playground",
          }),
        ]}
      >
        {children}
      </WalletProvider>
    );
  };
  
  export default Providers;