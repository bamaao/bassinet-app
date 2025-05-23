"use client"; // In Next.js, this is required to prevent the component from being rendered on the server.

export default function Home() {
  return <>
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <a href="#" className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-sm md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
          <img className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" src="/favicon.svg" alt=""></img>
          <div className="flex flex-col justify-between p-4 leading-normal">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">这是一段简短的描述</h5>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                创作者：1. 注册创建账户；2. 绑定钱包；3. 绑定钱包后可以开通服务，发行Token；4. 创作者开发专辑，可以专辑发行NFT进行售卖。
              </p>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">用户：1. 注册创建账户；2. 对感兴趣的专辑付费（Minting专辑发行的NFT）。</p>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">钱包使用的是Suiet，testnet环境。</p>
          </div>
      </a>
      <div></div>
    </main>
    </>
}