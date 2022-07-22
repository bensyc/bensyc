import React from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import {
  useConnect,
  useContractRead,
  useContractWrite,
  useWaitForTransaction
} from 'wagmi';
import contractInterface from '../contract-abi.json';
import FlipCard, { BackCard, FrontCard } from '../components/FlipCard';
import { ethers } from 'ethers';

const contractConfig = {
  addressOrName: '0x1c16d646474acf0b3f7d28708bd30bfd29b5c9ac',
  contractInterface: contractInterface,
};

const Home: NextPage = () => {
  const [totalMinted, setTotalMinted] = React.useState(0);
  const { isConnected, connectors } = useConnect();

  const {
    data: mintData,
    write: mint,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
  } = useContractWrite(
    contractConfig,
    'mint',
    {
      overrides: {
        value: ethers.utils.parseEther("0.01")
      }
    }
  );

  const { data: totalSupplyData } = useContractRead(
    contractConfig,
    'totalSupply',
    { watch: true }
  );

  const { isSuccess: txSuccess } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  React.useEffect(() => {
    if (totalSupplyData) {
      setTotalMinted(totalSupplyData.toNumber());
    }
  }, [totalSupplyData]);

  const isMinted = txSuccess;

  return (
    <div className="page">
      <Head>
        <title>bensyc.eth</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="shortcut icon" href="/logo.png" />
      </Head>
      <div className="container">
      <ConnectButton />
      <div style={{ flex: '1 1 auto' }}>
        <div style={{ padding: '24px 24px 24px 0' }}>
          <h1>Bored ENS Yacht Club</h1>
          <p style={{ margin: '12px 0 24px' }}>
            {totalMinted} minted so far!
          </p>
          {isConnected && !isMinted && (
            <button
              style={{ marginTop: 24 }}
              disabled={isMintLoading || isMintStarted}
              className="button"
              data-mint-loading={isMintLoading}
              data-mint-started={isMintStarted}
              onClick={() => mint()}
            >
              {isMintLoading && 'Waiting for approval'}
              {isMintStarted && 'Minting...'}
              {!isMintLoading && !isMintStarted && 'Mint'}
            </button>
          )}
        </div>
      </div>
      </div>
      <div style={{ flex: '0 0 auto', marginRight: 10, marginTop: 0 }}>
            <Image
              src="/logo.png"
              width="300"
              height="300"
              alt='logo'
            />
      </div>
      {/*<div style={{ flex: '0 0 auto', marginTop: 50, marginLeft: 10 }}>
        <FlipCard>
          <FrontCard isCardFlipped={isMinted}>
            <Image
              src="/samples.gif"
              width="421"
              height="500"
            />
          </FrontCard>
          <BackCard isCardFlipped={isMinted}>
            <div style={{ padding: 24 }}>
              <Image
                src="/nft.png"
                width="140"
                height="80"
                style={{ borderRadius: 0 }}
              />
              <h2 style={{ marginTop: 24, marginBottom: 6 }}>NFT Minted!</h2>
              <p style={{ marginBottom: 24 }}>
                Your NFT will show up in your wallet in the next few minutes.
              </p>
              <p style={{ marginBottom: 6 }}>
                View on{' '}
                <a href={`https://rinkeby.etherscan.io/tx/${mintData?.hash}`}>
                  Etherscan
                </a>
              </p>
              <p>
                View on{' '}
                <a
                  href={`https://testnets.opensea.io/assets/rinkeby/${mintData?.to}/1`}
                >
                  OpenSea
                </a>
              </p>
            </div>
          </BackCard>
        </FlipCard>
      </div>*/}
    </div>
  );
};

export default Home;
