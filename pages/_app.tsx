import './global.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import Script from "next/script";
import {
  RainbowKitProvider,
  Theme,
  getDefaultWallets,
  connectorsForWallets,
  configureChains,
  apiProvider,
  wallet,
} from '@rainbow-me/rainbowkit';
import { chain, createClient, Provider as WagmiProvider } from 'wagmi';
import { isMobile } from 'react-device-detect';

let sysFont = '';
if (isMobile) {
  sysFont = 'EarthOrbiter';
} else {
  sysFont = 'EarthOrbiter';
}

const customTheme: Theme = {
  colors: {
    accentColor: 'linear-gradient(to right, #3898FF, #7A70FF);',
    accentColorForeground: 'white',
    actionButtonBorder: 'none',
    actionButtonBorderMobile: 'none',
    actionButtonSecondaryBackground: 'white',
    closeButton: 'black',
    closeButtonBackground: 'white',
    connectButtonBackground: 'linear-gradient(to right, #3898FF, #7A70FF);',
    connectButtonBackgroundError: 'red',
    connectButtonInnerBackground: 'linear-gradient(to right, #3898FF, #7A70FF);',
    connectButtonText: 'white',
    connectButtonTextError: 'white',
    connectionIndicator: 'red',
    error: 'white',
    generalBorder: 'rgb(255, 255, 255, 0.75);',
    generalBorderDim: 'rgb(255, 255, 255, 0.75);',
    menuItemBackground: 'black',
    modalBackdrop: 'none',
    modalBackground: 'linear-gradient(90deg, rgba(36,28,57,0.95) 0%, rgba(114,137,149,0.95) 100%);',
    modalBorder: 'white',
    modalText: 'white',
    modalTextDim: 'rgb(255, 255, 255, 0.75);',
    modalTextSecondary: 'rgb(255, 255, 255, 0.75);',
    profileAction: 'rgb(0, 0, 0, 0.5);',
    profileActionHover: 'linear-gradient(90deg, rgba(146,151,255,0.60) 0%, rgba(96,62,255,0.60) 100%);',
    profileForeground: 'rgb(0, 0, 0, 0.5);',
    selectedOptionBorder: 'white',
    standby: 'white',
  },
  fonts: {
    body: `${sysFont}`,
  },
  radii: {
    actionButton: '6px',
    connectButton: '6px',
    menuButton: '6px',
    modal: '6px',
    modalMobile: '6px',
  },
  shadows: {
    connectButton: '',
    dialog: '',
    profileDetailsAction: '',
    selectedOption: '',
    selectedWallet: '',
    walletLogo: '',
  },
};

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
      <RainbowKitProvider
        appInfo={appInfo}
        chains={chains}
        theme={customTheme}
      >
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiProvider>
  );
}

export default MyApp;
