import React from 'react';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
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
import { isMobile } from 'react-device-detect';

const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_KEY;
const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_SECRET;
const pinata = pinataSDK(pinataApiKey,pinataApiSecret);
const pinataUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const contractConfig = {
  addressOrName: '0xC948BB07B8cf62E5D2e97993a9e539E3189Af42F',
  contractInterface: contractInterface,
};

const Home: NextPage = () => {
  const [totalMinted, setTotalMinted] = React.useState(0);
  const [batchSize, setBatchSize] = React.useState(0);
  const [hashCount, setHashCount] = React.useState(0);
  const [hash, setHash] = React.useState('');
  const [count, setCount] = React.useState(0);
  const [isPinning, setPinning] = React.useState(false);
  const { isConnected, connectors } = useConnect();
  const { data, isError, isLoading } = useFeeData();

  let widthScreen = 0;
  if (isMobile) {
    widthScreen = 360;
  } else {
    widthScreen = 700;
  }

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

  const gasEstimate = 100000;
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
      const jsonFiles: string[] = [];
      const htmlFiles: string[] = [];
      setPinning(true);
      for (let i = 0; i < batchSize; i++) {
        setCount(i + 1);
        const base64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAA2ElEQVR4nADIADf/BEEz6y4msm5D3EL3YgRPBAy2QkOlpLc0iwHIyiDK5HwOhFYSB4+oBC4tzt0O+0wl6KMA9ErkLA4BM+EcSIWVtd77E4q1hiUdCmL+AcXnELn4ntJ20DQsMBb6QABLdDti5Mi2rwObAyRIL6OdejJhIqntFuv6l2/d0yGq9FUC58zXZfTSGLv32fQ31/SMe0yrtRoRbnkzAtH3UCG6x5QgFvSZxcEMVHrfTN3kAO0Z5wT5CvGlGebGKbVcMB2Wsb1uzi62AfRKpFMBAAD///G+YGI1aSAbAAAAAElFTkSuQmCC`;
        const body = {
          "name": `${totalMinted + i}.BoredENSYachtClub.eth`,
          "order": `${totalMinted + i + 1}`,
          "description": `Bored ENS Yacht Club member ${totalMinted + i + 1}`,
          "external_url": `https://${totalMinted + i}.boredensyachtclub.eth.limo`,
          "image": `${base64}`,
          "background_color" : '000000',
          "image_data": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><parent><svg width="1cm" height="1cm"><image href="${base64}"/></svg></parent>`,
          "attributes": [
            {
              "trait_type": "Prime",
              "value": ""
            },
            {
              "trait_type": "Palindrome",
              "value": ""
            },
          ]
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
          console.log(`JSON ${i + 1}: ` + result.IpfsHash);
          jsonFiles.push(result.IpfsHash);
          setHash(result.IpfsHash);
        })
        .catch(error => {
          console.log(error);
        });
      }

      if (batchSize === 1 && jsonFiles.length === 1) {
        setHashCount(jsonFiles.length);
        setCount(0);
      } else if (batchSize > 1 && batchSize < 13 && jsonFiles.length === batchSize) {
        setHashCount(jsonFiles.length);
        setCount(0);
      } else {
        setHashCount(0);
        setCount(0);
        setHash('');
        window.alert('❌ Failed to pin metadata to IPFS');
      }
    }

  return (
    <div className="page" style = {{ maxWidth: `${widthScreen}px` }}>
      <Head>
        <title>Bored ENS Yacht Club</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width, user-scalable=no" />
        <link rel="shortcut icon" href="logo.png" />
      </Head>

      <div className="container">
        <div style={{ marginLeft: '20px', marginBottom: '15px' }}>
          <ConnectButton />
        </div>
        <br></br><br></br>
        <div className="route" style={{ float: 'left', marginLeft: '20px' }}>
          <Link href="/">
              <a>home</a>
          </Link>
        </div>
        <div className="route" style={{ float: 'left', marginLeft: '20px' }}>
          <Link href="/info">
              <a>info</a>
          </Link>
        </div>
        <br></br><br></br>
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
                  net: <span style={{ color: 'blue', fontFamily: 'SFMono' }}>{(value + data.gasPrice!.toNumber() * 0.000000001 * gasEstimate * batchSize * 0.000000001).toFixed(5)}</span> eth
                </p>
                <p
                  style={{ marginLeft: 110, fontSize: 12 }}
                >
                  to mint: <span style={{ color: 'blue', fontFamily: 'SFMono' }}>{value}</span> eth
                </p>
                <p
                  style={{ marginLeft: 110, fontSize: 12 }}
                >
                  gas fee: <span style={{ color: 'blue', fontFamily: 'SFMono' }}>{(data.gasPrice!.toNumber() * 0.000000001 * gasEstimate * batchSize * 0.000000001).toFixed(5)}</span> eth
                </p>
                <p
                  style={{ marginLeft: 110, fontSize: 12 }}
                >
                  current gas: <span style={{ color: 'blue', fontFamily: 'SFMono' }}>{(data.gasPrice!.toNumber() * 0.000000001).toFixed(0)}</span> gwei
                </p>
              </div>
            )}
            <br></br>

            {isConnected && hashCount === 0 && !isMinted && batchSize == 1 && (
              <div style={{ marginLeft: 109 }}>
                <button
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
              </div>
            )}

            {isConnected && hashCount === 1 && !isMinted && batchSize == 1 && (
              <div style={{ marginLeft: 109 }}>
                <button
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
                {isPinning && (
                  <button
                    className="button"
                    style={{ marginLeft: 10 }}
                    onClick={() => window.location.reload()}
                    >
                    {'Refresh'}
                  </button>
                )}
                <p
                  style={{ fontSize: 14, marginTop: 10 }}
                >
                  {hash && ('✅ metadata: ')}<a rel="noreferrer" target='_blank' href={`https://ipfs.io/ipfs/${hash}`} style={{ fontFamily: 'SFMono' }}>{hash}</a>
                </p>
              </div>
            )}

            {isConnected && hashCount === 0 && !isBatchMinted && 12 >= batchSize && batchSize >= 2 && (
              <div style={{ marginLeft: 109 }}>
                <button
                  disabled={isPinning}
                  className="button"
                  data-mint-loading={isPinning}
                  onClick={() => {
                    pinToMint();
                  }}
                >
                {!isPinning && `Request ${batchSize} 🎁`}
                {isPinning && `Preparing ${count} ⌛`}
                </button>
                <p
                  style={{ fontSize: 14, marginTop: 10 }}
                >
                  {hash && (`metadata ${count - 1}: `)}<a rel="noreferrer" target='_blank' href={`https://ipfs.io/ipfs/${hash}`} style={{ fontFamily: 'SFMono' }}>{hash}</a>
                </p>
              </div>
            )}

            {isConnected && hashCount === batchSize && !isBatchMinted && 12 >= batchSize && batchSize >= 2 && (
              <div style={{ marginLeft: 109 }}>
                <button
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
                {isPinning && (
                  <button
                    className="button"
                    style={{ marginLeft: 10 }}
                    onClick={() => window.location.reload()}
                    >
                    {'Refresh'}
                  </button>
                )}
                <p
                  style={{ fontSize: 14, marginTop: 10 }}
                >
                  {hash && (`metadata ${batchSize}: `)}<a rel="noreferrer" target='_blank' href={`https://ipfs.io/ipfs/${hash}`} style={{ fontFamily: 'SFMono' }}>{hash}</a>
                </p>
                <p
                  style={{ fontSize: 14, marginTop: 10 }}
                >
                  ✅ pinned <span style={{ color: 'blue', fontFamily: 'SFMono' }}>{hashCount}</span> metadata hashes to ipfs
                </p>
              </div>
            )}
          </div>
          {isMinted && batchSize == 1 && (
            <div style={{ marginRight: 0, marginTop: 10 }}>
              <p
                style={{ marginLeft: 110, fontSize: 14 }}
              >✅ minted subdomain <span style={{ color: 'blue', fontFamily: 'SFMono' }}><a rel="noreferrer" target='_blank' href={`https://boredensyachtclub.eth.limo`} style={{ textDecoration: 'none' }}>{totalMinted - 1}.bensyc.eth</a></span></p>
              <p
                style={{ marginLeft: 110, fontSize: 14 }}
              >
                OpenSea: <a rel="noreferrer" target='_blank' href={`https://testnets.opensea.io/assets/rinkeby/${mintData?.to}/${totalMinted - 1}`} style={{ fontFamily: 'SFMono' }}>Link</a>
              </p>
              <p
                style={{ marginLeft: 110, fontSize: 14 }}
              >
                EtherScan: <a rel="noreferrer" target='_blank' href={`https://rinkeby.etherscan.io/tx/${mintData?.hash}`} style={{ fontFamily: 'SFMono' }}>Link</a>
              </p>
              <button
                className="button"
                style={{ marginLeft: 110, marginTop: 10 }}
                onClick={() => window.location.reload()}
                >
                {'Refresh'}
              </button>
            </div>
          )}

          {isBatchMinted && 12 >= batchSize && batchSize >= 2 && (
            <div style={{ marginRight: 0, marginTop: 10 }}>
              <p
                style={{ marginLeft: 110, fontSize: 14 }}
              >✅ minted subdomains <a rel="noreferrer" target='_blank' href={`https://boredensyachtclub.eth.limo`}><span style={{ fontFamily: 'SFMono' }}>{totalMinted - batchSize}.bensyc.eth</span> - <span style={{ fontFamily: 'SFMono' }}>{totalMinted - 1}.bensyc.eth</span></a></p>
              <p
                style={{ marginLeft: 115, fontSize: 14 }}
              >
                OpenSea: <a rel="noreferrer" target='_blank' href={`https://testnets.opensea.io/assets/rinkeby/${batchMintData?.to}/${totalMinted - 1}`} style={{ fontFamily: 'SFMono' }}>Link</a>
              </p>
              <p
                style={{ marginLeft: 115, fontSize: 14 }}
              >
                EtherScan: <a rel="noreferrer" target='_blank' href={`https://rinkeby.etherscan.io/tx/${batchMintData?.hash}`} style={{ fontFamily: 'SFMono' }}>Link</a>
              </p>
              <button
                className="button"
                style={{ marginLeft: 110, marginTop: 10 }}
                onClick={() => window.location.reload()}
                >
                {'Refresh'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
