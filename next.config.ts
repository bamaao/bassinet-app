import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
        new webpack.NormalModuleReplacementPlugin(
          /node:crypto/,
          (resource: {request: string}) => {
            resource.request = resource.request.replace(/^node:/, '');
          }
        )
      );
    }
    return config;
  },
};

export default withFlowbiteReact(nextConfig);