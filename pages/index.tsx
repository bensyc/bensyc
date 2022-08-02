import React from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import {
  useConnect,
  useFeeData,
  useContractRead,
  useContractWrite,
  useWaitForTransaction
} from 'wagmi';
import contractInterface from '../contract-abi.json';
import { ethers } from 'ethers';
const pinataSDK = require('@pinata/sdk');

const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_KEY;
const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_SECRET;
const pinata = pinataSDK(pinataApiKey,pinataApiSecret);

const contractConfig = {
  addressOrName: '0x1c16d646474acf0b3f7d28708bd30bfd29b5c9ac',
  contractInterface: contractInterface,
};

const Home: NextPage = () => {
  const [totalMinted, setTotalMinted] = React.useState(0);
  const [batchSize, setBatchSize] = React.useState(0);
  const [ipfsHash, setIpfsHash] = React.useState(0);
  const [ipfsBatchHash, setIpfsBatchHash] = React.useState(0);
  const [isPinning, setPinning] = React.useState(false);
  const { isConnected, connectors } = useConnect();
  const { data, isError, isLoading } = useFeeData();

  const { data: totalSupplyData } = useContractRead(
    contractConfig,
    'totalSupply',
    { watch: true }
  );

  React.useEffect(() => {
    if (totalSupplyData) {
      setTotalMinted(totalSupplyData.toNumber());
    }
  }, [totalSupplyData]);

  var value = 0;
  if (batchSize == 1) {
    value = 0.01;
  } else if (batchSize > 1) {
    value = batchSize * 0.01;
  } else {
    value = 0;
  }
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
        value: ethers.utils.parseEther(value.toString())
      }
    }
  );
  const {
    data: batchMintData,
    write: batchMint,
    isLoading: isBatchMintLoading,
    isSuccess: isBatchMintStarted,
  } = useContractWrite(
    contractConfig,
    'batchMint',
    {
      args: [batchSize],
      overrides: {
        value: ethers.utils.parseEther(value.toString())
      }
    }
  );
  const { isSuccess: txSuccess } = useWaitForTransaction({
    hash: mintData?.hash,
  });
  const { isSuccess: txBatchSuccess } = useWaitForTransaction({
    hash: batchMintData?.hash,
  });

  const isMinted = txSuccess;
  const isBatchMinted = txBatchSuccess;

  const pinToMint = async () => {
      const results: string[] = [];
      setPinning(true);
      for (let i = 0; i < batchSize; i++) {
        const body = {
          "name": `${totalMinted + i}.bensyc.eth`,
          "order": `${totalMinted + i + 1}`,
          "description": `Bored ENS Yacht Club member ${totalMinted + i + 1}`,
          "external_url": `https://${totalMinted + i}.bensyc.eth.limo`,
          "image": "base64://base64goeshereblablabla",
          "background_color" : '000000',
          "svg": "svg://svgdatagoeshereblablabla",
        };
        const options = {
            pinataMetadata: {
                name: `${totalMinted + i}.bensyc.eth`
            },
            pinataOptions: {
                cidVersion: 0
            }
        };
        await pinata.pinJSONToIPFS(body, options)
        .then(result => {
          console.log(`Pin ${i + 1}: ` + result.IpfsHash);
          results.push(result.IpfsHash);
        })
        .catch(error => {
          console.log(error);
        });
      }

      if (batchSize === 1 && results.length === 1) {
        setIpfsHash(results.length);
      } else if (batchSize > 1 && batchSize < 13 && results.length === batchSize) {
        setIpfsBatchHash(results.length);
      } else {
        setIpfsHash(0);
        window.alert('❌ Failed to pin metadata to IPFS');
      }
    }

  return (
    <div className="page">
      <Head>
        <title>Bored ENS Yacht Club</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="shortcut icon" href="logo.png" />
      </Head>
      <div className="container">
      <div style={{ float: 'left' }}>
        <button
          className="refreshButton"
          onClick={() => window.location.reload()}
          >
          {'Refresh'}
        </button>
      </div>
      <div style={{ float: 'right', marginTop: '-3px' }}>
        <ConnectButton />
      </div>
      <div style={{ flex: '1 1 auto' }}>
        <img style={{ float: 'left', marginTop: '0px' }} alt="sample" src="chimp.png" width="104" height="200"/>
        <div style={{ marginTop: '50px' }}>
          <h1>Bored ENS Yacht Club</h1>
          <p style={{ marginTop: '10px', marginLeft: '109px', marginBottom: '20px' }}>
            <span style= {{ fontFamily: 'SFMono' }}>{totalMinted}</span> minted so far!
          </p>
          <div style={{ marginLeft: '109px' }}>
            <p style={{ marginTop: '5px' }}>
              ↓ enter number of subdomains to mint
            </p>
            <form style={{ marginBottom: '10px', marginTop: '15px', width: '400px' }}>
              <input
                style={{fontFamily:'SFMono', paddingLeft: '5px', width: '150px'}}
                placeholder={isConnected ? "between 1 & 12" : "Connect Wallet"}
                onChange={(event) => {
                  setBatchSize(parseInt(event.target.value))
                }}
                disabled={!isConnected || isPinning}
                type="number"
                min="1"
                max="12"
              />
            </form>
          </div>

          {value > 0 && data && (batchSize > 0 && batchSize < 13) && !isError && !isLoading && (
            <div>

              <p
                style={{ marginLeft: 110, fontSize: 14 }}
              >
                net: <span style={{ color: 'blue', fontFamily: 'SFMono' }}>{(value + data.gasPrice!.toNumber() * 0.000000001 * 125000 * batchSize * 0.000000001).toFixed(5)}</span> eth
              </p>
              <p
                style={{ marginLeft: 110, fontSize: 12 }}
              >
                to mint: <span style={{ color: 'blue', fontFamily: 'SFMono' }}>{value}</span> eth
              </p>
              <p
                style={{ marginLeft: 110, fontSize: 12 }}
              >
                gas fee: <span style={{ color: 'blue', fontFamily: 'SFMono' }}>{(data.gasPrice!.toNumber() * 0.000000001 * 125000 * batchSize * 0.000000001).toFixed(5)}</span> eth
              </p>
              <p
                style={{ marginLeft: 110, fontSize: 12 }}
              >
                current gas: <span style={{ color: 'blue', fontFamily: 'SFMono' }}>{(data.gasPrice!.toNumber() * 0.000000001).toFixed(0)}</span> gwei
              </p>
            </div>
          )}
          <br></br>

          {isConnected && !ipfsHash && !isMinted && batchSize == 1 && (
            <button
              style={{ marginLeft: 109 }}
              disabled={isPinning}
              className="button"
              data-mint-loading={isPinning}
              onClick={() => {
                pinToMint();
              }}
            >
              {!isPinning && 'Request 1 🎁'}
              {isPinning && 'Preparing 1 ⌛'}
            </button>
          )}

          {isConnected && ipfsHash === 1 && !isMinted && batchSize == 1 && (
            <button
              style={{ marginLeft: 109 }}
              disabled={isMintLoading || isMintStarted}
              className="button"
              data-mint-loading={isMintLoading}
              data-mint-started={isMintStarted}
              onClick={() => {
                mint();
              }}
            >
              {isMintLoading && 'Waiting for approval ⌛'}
              {isMintStarted && 'Minting ⌛'}
              {!isMintLoading && !isMintStarted && 'Mint 1 🎁'}
            </button>
          )}

          {isConnected && ipfsBatchHash === batchSize && !isBatchMinted && 12 >= batchSize && batchSize >= 2 && (
            <button
              style={{ marginLeft: 109 }}
              disabled={isPinning}
              className="button"
              data-mint-loading={isPinning}
              onClick={() => {
                pinToMint();
              }}
            >
            {!isPinning && `Request ${batchSize} 🎁`}
            {isPinning && `Preparing ${batchSize} ⌛`}
            </button>
          )}

          {isConnected && ipfsBatchHash && !isBatchMinted && 12 >= batchSize && batchSize >= 2 && (
            <button
              style={{ marginLeft: 109 }}
              disabled={isBatchMintLoading || isBatchMintStarted}
              className="button"
              data-mint-loading={isBatchMintLoading}
              data-mint-started={isBatchMintStarted}
              onClick={() => {
                batchMint();
              }}
            >
              {isBatchMintLoading && 'Waiting for approval ⌛'}
              {isBatchMintStarted && 'Batch minting ⌛'}
              {!isBatchMintLoading && !isBatchMintStarted && `Mint ${batchSize} 🎁`}
            </button>
          )}
        </div>
        {isMinted && batchSize == 1 && (
          <div style={{ marginRight: 0, marginTop: 10 }}>
            <p
              style={{ marginLeft: 110, fontSize: 14 }}
            >✅ minted subdomain <span style={{ color: 'blue', fontFamily: 'SFMono' }}>{totalMinted - 1}.bensyc.eth</span></p>
            <p
              style={{ marginLeft: 110, fontSize: 14 }}
            >
              OpenSea: <a rel="noreferrer" target='_blank' href={`https://testnets.opensea.io/assets/rinkeby/${mintData?.to}/${totalMinted - 1}`} style={{ color: 'blue', fontFamily: 'SFMono', textDecoration: 'none' }}>Link</a>
            </p>
            <p
              style={{ marginLeft: 110, fontSize: 14 }}
            >
              EtherScan: <a rel="noreferrer" target='_blank' href={`https://rinkeby.etherscan.io/tx/${mintData?.hash}`} style={{ color: 'blue', fontFamily: 'SFMono', textDecoration: 'none' }}>Link</a>
            </p>
          </div>
        )}
        {isBatchMinted && 12 >= batchSize && batchSize >= 2 && (
          <div style={{ marginRight: 0, marginTop: 10 }}>
            <p
              style={{ marginLeft: 110, fontSize: 14 }}
            >✅ minted subdomains <span style={{ color: 'blue', fontFamily: 'SFMono' }}>{totalMinted - batchSize}.bensyc.eth</span> - <span style={{ color: 'blue', fontFamily: 'SFMono' }}>{totalMinted - 1}.bensyc.eth</span></p>
            <p
              style={{ marginLeft: 110, fontSize: 14 }}
            >
              OpenSea: <a rel="noreferrer" target='_blank' href={`https://testnets.opensea.io/assets/rinkeby/${batchMintData?.to}/${totalMinted - 1}`} style={{ color: 'blue', fontFamily: 'SFMono', textDecoration: 'none' }}>Link</a>
            </p>
            <p
              style={{ marginLeft: 110, fontSize: 14 }}
            >
              EtherScan: <a rel="noreferrer" target='_blank' href={`https://rinkeby.etherscan.io/tx/${batchMintData?.hash}`} style={{ color: 'blue', fontFamily: 'SFMono', textDecoration: 'none' }}>Link</a>
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Home;
