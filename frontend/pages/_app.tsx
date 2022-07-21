import './global.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  configureChains,
  apiProvider,
  wallet,
} from '@rainbow-me/rainbowkit';
import { chain, createClient, Provider as WagmiProvider } from 'wagmi';

const { chains, provider, webSocketProvider } = configureChains(
  [
    chain.rinkeby,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
      ? [chain.rinkeby]
      : []),
  ],
  [
    apiProvider.alchemy('_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC'),
    apiProvider.fallback(),
  ]
);

const { wallets } = getDefaultWallets({
  appName: 'bensyc.eth',
  chains,
});

const appInfo = {
  appName: 'bensyc.eth',
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [wallet.argent({ chains }), wallet.trust({ chains })],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider client={wagmiClient}>
      <RainbowKitProvider appInfo={appInfo} chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiProvider>
  );
}

export default MyApp;
