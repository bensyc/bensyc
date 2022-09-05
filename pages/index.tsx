import React from 'react';
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
import { isMobile } from 'react-device-detect';
import Modal from '../components/Modal';
import { Statistic } from 'antd';
const { Countdown } = Statistic;

const contractConfig = {
  addressOrName: '0xd3E58Bf93A1ad3946bfD2D298b964d4eCe1A9E7E',
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
  const [termsModal, setTermsModal] = React.useState(false);
  const [faqModal, setFaqModal] = React.useState(false);
  const [roadmapModal, setRoadmapModal] = React.useState(false);
  const [startMint, setStartMint] = React.useState(true);

  // gas estimates
  const gasEstimate = 122020;

  // device-type settings
  let widthPage = '100%';
  let widthContainer = '100%';
  let edgeMargin = 20;
  let screen = 'desktop';
  let fontSizeFAQ = '12px';
  if (isMobile) {
    widthPage = '400px';
    widthContainer = '90%';
    screen = 'mobile';
    edgeMargin = 0;
    fontSizeFAQ = '11px';
  }

  const { data: totalSupply } = useContractRead(
    contractConfig,
    'totalSupply',
    { watch: true }
  );

  React.useEffect(() => {
    if (totalSupply) {
      setTotalMinted(totalSupply.toNumber());
    }
  }, [totalSupply]);

  const startOn = 'September 9, 2022 12:00:00 UTC'
  const deadline = new Date(startOn).getTime();

  React.useEffect(() => {
    setStartMint(Date.now() > deadline);
  }, [deadline]);

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
        jsonFiles.push(`${totalMinted + i}.boredensyachtclub.eth`);
        setHash(`${totalMinted + i}.boredensyachtclub.eth`);
        console.log(`${totalMinted + i}.boredensyachtclub.eth`);
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
        window.alert('❌❌❌');
      }
    }

  return (
    <div className="page" style = {{ maxWidth: `${widthPage}` }}>
      <div style={{ display: 'none' }}>
        {screen}
      </div>
      <Head>
        <title>Bored ENS Yacht Club</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width, user-scalable=no" />
        <link rel="shortcut icon" href="logo.png" />
      </Head>

      <div className="container" style = {{ maxWidth: `${widthContainer}` }} >
        {!isMobile && startMint && (
          <div style={{ marginLeft: `${edgeMargin}px`, marginBottom: '15px', marginTop: '15px' }}>
            <ConnectButton />
          </div>
        )}
        {isMobile && startMint && (
          <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', marginBottom: '15px', marginTop: '15px' }}>
            <ConnectButton />
          </div>
        )}
        <br></br>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <img className="avatar" alt="sample" src="bensyc.png" width="200" height="200"/>
        </div>
        <br></br>
        <div style={{ flex: '1 1 auto' }}>
          <div style={{ marginTop: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
              {!isMobile && (
                  <h1 style={{ fontSize: 40 }}>Bored ENS Yacht Club</h1>
              )}
              { isMobile && (
                  <h1 style={{ fontSize: 20 }}>Bored ENS Yacht Club</h1>
              )}
            </div>
            {startMint && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                  <p style={{ marginTop: '10px', marginBottom: '20px' }}>
                    <span style= {{ fontFamily: 'SFMono', color: 'yellow' }}>{totalMinted}</span> minted so far!
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                  <p style={{ marginTop: '5px' }}>
                    ↓ enter number of subdomains to mint ↓
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <form style={{ marginBottom: '0px', marginTop: '35px', width: '400px', display: 'flex', justifyContent: 'center' }}>
                    <input
                      style={{ fontFamily:'MajorMono', paddingLeft: '10px', width: '200px', fontWeight: 800, paddingTop: '5px', paddingBottom: '5px', textAlign: 'center' }}
                      placeholder={isConnected ? "between 1 & 12" : "connect wallet"}
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
              </div>
            )}
            {!startMint && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                  <p style={{ marginTop: '20px', marginBottom: '10px' }}>
                    mint starts
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                  <span style= {{ fontFamily: 'SFMono', color: 'yellow' }}>{startOn}</span>
                </div>
                <br></br>
                <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                  <Countdown title="" value={deadline} format="D:H:mm:ss" style={{ marginTop: 20, marginBottom: -100, color:'orange', fontSize:30, fontFamily: 'RobotoMono' }}/>
                </div>
              </div>
            )}
            {/* Gas */}
            {value > 0 && data && (batchSize > 0 && batchSize < 13) && !isError && !isLoading && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                  <p
                    style={{ fontSize: 14 }}
                  >
                    net: <span style={{ color: 'yellow', fontFamily: 'SFMono' }}>{(value + data.gasPrice!.toNumber() * 0.000000001 * gasEstimate * batchSize * 0.000000001).toFixed(5)}</span> eth
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                  <p
                    style={{ fontSize: 12 }}
                  >
                    to mint: <span style={{ color: 'yellow', fontFamily: 'SFMono' }}>{value}</span> eth
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                  <p
                    style={{ fontSize: 12 }}
                  >
                    gas fee: <span style={{ color: 'yellow', fontFamily: 'SFMono' }}>{(data.gasPrice!.toNumber() * 0.000000001 * gasEstimate * batchSize * 0.000000001).toFixed(5)}</span> eth
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                  <p
                    style={{ fontSize: 12 }}
                  >
                    current gas: <span style={{ color: 'yellow', fontFamily: 'SFMono' }}>{(data.gasPrice!.toNumber() * 0.000000001).toFixed(0)}</span> gwei
                  </p>
                </div>
              </div>
            )}
            <br></br>

            {/* Single Mint */}
            {isConnected && hashCount === 0 && !isMinted && batchSize == 1 && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  disabled={isPinning}
                  className="button"
                  data-mint-loading={isPinning}
                  onClick={() => {
                    pinToMint();
                  }}
                >
                  {!isPinning && 'request 🎁'}
                  {isPinning && 'preparing ⌛'}
                </button>
              </div>
            )}

            {isConnected && hashCount === 1 && !isMinted && batchSize == 1 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    disabled={isMintLoading || isMintStarted}
                    className="button"
                    data-mint-loading={isMintLoading}
                    data-mint-started={isMintStarted}
                    onClick={() => {
                      mint();
                    }}
                  >
                    {isMintLoading && 'waiting for approval ⌛'}
                    {isMintStarted && 'minting ⌛'}
                    {!isMintLoading && !isMintStarted && 'mint 🎁'}
                  </button>
                </div>
                {isPinning && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <button
                      className="button"
                      onClick={() => window.location.reload()}
                      >
                      {'refresh'}
                    </button>
                  </div>
                )}
                {isPinning && !isMintLoading && !isMintStarted && (
                  <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                    <p
                      style={{ fontSize: 14, marginTop: 10 }}
                    >
                      ✅ ready to mint <span style={{ color: 'yellow', fontFamily: 'SFMono' }}>{hashCount}</span> subdomain
                    </p>
                  </div>
                )}
                {isPinning && isMintLoading && (
                  <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                    <p
                      style={{ fontSize: 14, marginTop: 10 }}
                    >
                      ⌛ waiting for approval in wallet
                    </p>
                  </div>
                )}
                {isPinning && isMintStarted && (
                  <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                    <p
                      style={{ fontSize: 14, marginTop: 10 }}
                    >
                      ⌛ minting subdomain
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Batch Mint */}
            {isConnected && hashCount === 0 && !isBatchMinted && 12 >= batchSize && batchSize >= 2 && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  disabled={isPinning}
                  className="button"
                  data-mint-loading={isPinning}
                  onClick={() => {
                    pinToMint();
                  }}
                >
                {!isPinning && `request 🎁`}
                {isPinning && `preparing ⌛`}
                </button>
              </div>
            )}

            {isConnected && hashCount === batchSize && !isBatchMinted && 12 >= batchSize && batchSize >= 2 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    disabled={isBatchMintLoading || isBatchMintStarted}
                    className="button"
                    data-mint-loading={isBatchMintLoading}
                    data-mint-started={isBatchMintStarted}
                    onClick={() => {
                      batchMint();
                    }}
                  >
                    {isBatchMintLoading && 'waiting for approval ⌛'}
                    {isBatchMintStarted && 'batch minting ⌛'}
                    {!isBatchMintLoading && !isBatchMintStarted && `mint 🎁`}
                  </button>
                </div>
                {isPinning && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <button
                      className="button"
                      onClick={() => window.location.reload()}
                      >
                      {'refresh'}
                    </button>
                  </div>
                )}
                {isPinning && !isBatchMintLoading && !isBatchMintStarted && (
                  <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                    <p
                      style={{ fontSize: 14, marginTop: 10 }}
                    >
                      ✅ ready to mint <span style={{ color: 'yellow', fontFamily: 'SFMono' }}>{hashCount}</span> subdomains
                    </p>
                  </div>
                )}
                {isPinning && isBatchMintLoading && (
                  <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                    <p
                      style={{ fontSize: 14, marginTop: 10 }}
                    >
                      ⌛ waiting for approval in wallet
                    </p>
                  </div>
                )}
                {isPinning && isBatchMintStarted && (
                  <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                    <p
                      style={{ fontSize: 14, marginTop: 10 }}
                    >
                      ⌛ batch minting <span style={{ color: 'yellow', fontFamily: 'SFMono' }}>{hashCount}</span> subdomains
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          {isMinted && batchSize == 1 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                <p
                  style={{ fontSize: 14, marginTop: 10 }}
                >
                  ✅ minted subdomain: <span style={{ color: 'yellow', fontFamily: 'SFMono' }}><a rel="noreferrer" target='_blank' href={`https://boredensyachtclub.eth.limo`} style={{ textDecoration: 'none' }}>{totalMinted - 1}</a></span> .bensyc.eth
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                <p
                  style={{ fontSize: 14, marginTop: 10 }}
                >
                  OpenSea: <a rel="noreferrer" target='_blank' href={`https://testnets.opensea.io/assets/rinkeby/${mintData?.to}/${totalMinted - 1}`} style={{ fontFamily: 'SFMono' }}>Link</a>
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                <p
                  style={{ fontSize: 14, marginTop: 10 }}
                >
                  EtherScan: <a rel="noreferrer" target='_blank' href={`https://rinkeby.etherscan.io/tx/${mintData?.hash}`} style={{ fontFamily: 'SFMono' }}>Link</a>
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                <button
                  className="button"
                  style={{ marginTop: 20 }}
                  onClick={() => window.location.reload()}
                  >
                  {'mint again'}
                </button>
              </div>
            </div>
          )}

          {isBatchMinted && 12 >= batchSize && batchSize >= 2 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                <p
                  style={{ fontSize: 14, marginTop: 10 }}
                >
                  ✅ minted subdomains: <a rel="noreferrer" target='_blank' href={`https://boredensyachtclub.eth.limo`}><span style={{ fontFamily: 'SFMono' }}>{totalMinted - batchSize}</span> - <span style={{ fontFamily: 'SFMono' }}>{totalMinted - 1}</span></a> .bensyc.eth
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                <p
                  style={{ fontSize: 14, marginTop: 10 }}
                >
                  OpenSea: <a rel="noreferrer" target='_blank' href={`https://testnets.opensea.io/assets/rinkeby/${batchMintData?.to}/${totalMinted - 1}`} style={{ fontFamily: 'SFMono' }}>Link</a>
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                <p
                  style={{ fontSize: 14, marginTop: 10 }}
                >
                  EtherScan: <a rel="noreferrer" target='_blank' href={`https://rinkeby.etherscan.io/tx/${batchMintData?.hash}`} style={{ fontFamily: 'SFMono' }}>Link</a>
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                <button
                  className="button"
                  style={{ marginTop: 20 }}
                  onClick={() => window.location.reload()}
                  >
                  {'mint again'}
                </button>
              </div>
            </div>
          )}
          <div style={{ marginTop: 100, marginBottom: 20, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <button
              className={screen}
              onClick={() => setTermsModal(true)}
              style={{ marginRight: 10 }}
              >
              {'terms'}
            </button>
            <button
              className={screen}
              onClick={() => setFaqModal(true)}
              style={{ marginRight: 10 }}
              >
              {'faq'}
            </button>
            <button
              className={screen}
              onClick={() => window.open('https://twitter.com/BoredENSYC')}
              style={{ marginRight: 10 }}
              >
              {'twitter'}
            </button>
          </div>
          <Modal
            onClose={() => setTermsModal(false)}
            show={termsModal}
            title='terms of use'
          >
            <div style={{ marginTop: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <img style={{ borderRadius: '6px' }} alt="sample" src="bensyc.gif" width="50" height="50"/>
              </div>
              <div style={{ marginBottom: 30, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: 11, fontWeight: 800, textAlign: 'center' }}>boredensyachtclub.eth is a collection of ens subdomains and digital artworks (collectively hereinafter &apos;subdomain/nft&apos;) running on the ethereum network. this website is only an interface allowing participants to purchase boredensyachtclub.eth subdomains/nfts. users are entirely responsible for the safety and management of their own private ethereum wallets and validating all transactions and contracts generated by this website before approval. furthermore, as the boredensyachtclub.eth smart contract runs on the ethereum network, there is no ability to undo, reverse, or restore any transactions. this website and its connected services are provided &apos;as is&apos; and &apos;as available&apos; without warranty of any kind. by using this website you are accepting sole responsibility for any and all transactions involving boredensyachtclub.eth and any associated subdomain/nft.</p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>ownership</h4>
              </div>
              <div style={{ marginBottom: 30, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: 11, fontWeight: 800, textAlign: 'center' }}>a. you own the subdomain and nft: each subdomain and nft is on the ethereum blockchain. when you purchase a subdomain/nft, ownership of the subdomain/nft is mediated entirely by the smart contract(s) and the ethereum network: at no point may we seize, freeze, or otherwise modify the ownership of any subdomain/nft.
                <br></br>
                <br></br>
                b. personal use: subject to your continued compliance with these terms, boredensyachtclub.eth grants you a worldwide, royalty-free license to use, copy, and display the purchased subdomain & nft(s), along with any extensions that you choose to create or use, solely for the following purposes: (i) for your own personal, non-commercial use; (ii) as part of a marketplace that permits the purchase and sale of your subdomain/nft, provided that the marketplace cryptographically verifies each owner’s rights to display the subdomain/nft to ensure that only the actual owner can display the subdomain/nft; or (iii) as part of a third party website or application that permits the inclusion, involvement, or participation of your subdomain/nft, provided that the website/application cryptographically verifies each subdomain/nft  owner’s rights to display the subdomain/nft to ensure that only the actual owner can display the subdomain/nft, and provided that the subdomain/nft is no longer visible once the owner of the subdomain/nft leaves the website/application.
                <br></br>
                <br></br>
                c. ethereum name service:  you understand and agree for the underlying boredensyachtclub.eth ens name must remain registered for the owner to maintain ownership of the underlying subdomain(s), and if the boredensyachtclub.eth or any other subdomain name bound to the owner’s boredensyachtclub.eth subdomain/nft, then ownership of said subdomain shall mediated entirely by the applicable ens smart contract(s) and potentially lost to the owner.
                <br></br>
                <br></br>
                d. boredensyachtclub.eth/bensyc.eth ip:  other than the rights to the art, nothing herein gives you any rights to any other trademarks or other intellectual property rights belonging to boredensyachtclub.eth including, without limitation, to bored ens yacht club, bensyc, been sick, and the associated logos. all of these rights are expressly reserved.
                <br></br>
                <br></br>
                e. feedback: you may choose to submit comments, bug reports, ideas or other feedback about the site, including without limitation about how to improve the site (collectively, &apos;feedback&apos;). by submitting any feedback, you agree that we are free to use such feedback in any way we choose without additional compensation to you and you hereby grant us a perpetual, irrevocable, nonexclusive, worldwide license to incorporate and use the feedback for any purpose.
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>your obligations</h4>
              </div>
              <div style={{ marginBottom: 30, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: 11, fontWeight: 800, textAlign: 'center' }}>you are solely responsible for your own conduct while accessing or using the site, and for any consequences thereof. you agree to use the site only for purposes that are legal, proper and in accordance with these terms and any applicable laws or regulations. by way of example, and not as a limitation, you may not, and may not allow any third party to:
                <br></br>
                <br></br>
                (i) send, upload, distribute or disseminate any unlawful, defamatory, harassing, abusive, fraudulent, hateful, violent, obscene, or otherwise objectionable content;
                <br></br>
                <br></br>
                (ii) distribute viruses, worms, defects, trojan horses, corrupted files, hoaxes, or any other items of a destructive or deceptive nature;
                <br></br>
                <br></br>
                (iii) impersonate another person;
                <br></br>
                <br></br>
                (iv) upload, post, transmit or otherwise make available through the site any content that infringes the intellectual property or proprietary rights of any party or otherwise violates the legal rights of others;
                <br></br>
                <br></br>
                (v) engage in, promote, or encourage illegal activity (including, without limitation, money laundering);
                <br></br>
                <br></br>
                (vi) interfere with other users&apos; use of the site;
                <br></br>
                <br></br>
                (vii) use the site for any unauthorized commercial purpose;
                <br></br>
                <br></br>
                (viii) modify, adapt, translate, or reverse engineer any portion of the site;
                <br></br>
                <br></br>
                (ix) remove any copyright, trademark or other proprietary rights notices contained in or on the site or any part of it;
                <br></br>
                <br></br>
                (x) use any technology to collect information about the site’s for any unauthorized purpose;
                <br></br>
                <br></br>
                (xi) access or use the site for the purpose of creating a product or service that is competitive with any of our products or services. if you engage in any of the activities prohibited by this section, we may, at our sole and absolute discretion, without notice to you, and without limiting any of our other rights or remedies at law or in equity, immediately suspend or terminate your user account.
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>fees & payment</h4>
              </div>
              <div style={{ marginBottom: 30, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: 11, fontWeight: 800, textAlign: 'center' }}>a. if you elect to purchase a subdomain/nft through the site, any financial transactions that you engage in will be conducted solely through the ethereum network. we will have no control over these payments or transactions, nor do we have the ability to reverse any transactions. we will have no liability to you or to any third party for any claims or damages that may arise as a result of any transactions that you engage or any other transactions that you conduct via the ethereum network.
                <br></br>
                <br></br>
                b. ethereum requires the payment of a transaction fee (a &apos;gas fee&apos;) for every transaction that occurs on the ethereum network. the gas fee funds the network of computers that run the decentralized ethereum network. this means that you will need to pay a gas fee for each transaction.
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>disclaimers</h4>
              </div>
              <div style={{ marginBottom: 30, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: 11, fontWeight: 800, textAlign: 'center' }}>a. you expressly understand and agree that your access to and use of the site is at your sole risk, and that the site is provided &apos;as is&apos; and &apos;as available&apos; without warranties of any kind, whether express or implied. to the fullest extent permissible pursuant to applicable law, we make no express warranties and hereby disclaim all implied warranties regarding the site and any part of it (including, without limitation, the site, any smart contract, or any external websites), including the implied warranties of merchantability, fitness for a particular purpose, non-infringement, correctness, accuracy, or reliability. without limiting the generality of the foregoing, we, our subsidiaries, affiliates, and licensors do not represent or warrant to you that: (i) your access to or use of the site will meet your requirements, (ii) your access to or use of the site will be uninterrupted, timely, secure or free from error, (iii) usage data provided through the site will be accurate, (iii) the site or any content, services, or features made available on or through the site are free of viruses or other harmful components, or (iv) that any data that you disclose when you use the site will be secure. some jurisdictions do not allow the exclusion of implied warranties in contracts with consumers, so some or all of the above exclusions may not apply to you.
                <br></br>
                <br></br>
                b. you accept the inherent security risks of providing information and dealing online over the internet, and agree that we have no liability or responsibility for any breach of security unless it is due to our willfull misconduct.
                <br></br>
                <br></br>
                c. we will not be responsible or liable to you for any losses you incur as the result of your use of the ethereum network nor do we have no control over and make no guarantees regarding any smart contracts.
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>limitation of liability</h4>
              </div>
              <div style={{ marginBottom: 30, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: 11, fontWeight: 800, textAlign: 'center' }}>a. you understand and agree that we will not be liable to you or to any third party for any indirect, incidental, special, consequential, or exemplary damages which you may incur, howsoever caused and under any theory of liability, including, without limitation, any loss of profits (whether incurred directly or indirectly), loss of goodwill or business reputation, loss of data, cost of procurement of substitute goods or services, or any other intangible loss, even if we have been advised of the possibility of such damages.
                <br></br>
                <br></br>
                b. you agree that our total, aggregate liability to you for any and all claims arising out of or relating to these terms or your access to or use of (or your inability to access or use) any portion of the site, whether in contract, tort, strict liability, or any other legal theory, is limited to the greater of (a) the amounts you actually paid us under these terms in the 12 month period preceding the date the claim arose, or (b) $500.
                <br></br>
                <br></br>
                c. you acknowledge and agree that we have made the site available to you and entered into these terms in reliance upon the warranty disclaimers and limitations of liability set forth herein. we would not be able to provide the site to you without these limitations.
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>risk assumption</h4>
              </div>
              <div style={{ marginBottom: 30, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: 11, fontWeight: 800, textAlign: 'center' }}>you accept and acknowledge each of the following:
                <br></br>
                <br></br>
                a. to the extent that you sell your subdomain/nft, please be aware that the prices of nfts are extremely volatile and fluctuations may impact the price of your subdomain/nft both positively and negatively. given the volatility, boredensyachtclub.eth subdomains/nfts should not be considered an investment. you assume all risks in that connection.
                <br></br>
                <br></br>
                b. ownership of a boredensyachtclub.eth subdomain/nft ownership of digital collectibles only. accordingly, no information on this site (or any other documents mentioned therein) is or may be considered to be advice or an invitation to enter into an agreement for any investment purpose. further, nothing on this site qualifies or is intended to be an offering of securities in any jurisdiction nor does it constitute an offer or an invitation to purchase shares, securities or other financial products.  due to the artistic nature of subdomains and the project, boredensyachtclub.eth has not been registered with or approved by any regulator in any jurisdiction. it remains your sole responsibility to assure that the purchase of the subdomain/nft is in compliance with laws and regulations in your jurisdiction.
                <br></br>
                <br></br>
                c. you assume all risks associated with using an internet-based currency, including, but not limited to, the risk of hardware, software and internet connections, the risk of malicious software introduction, and the risk that third parties may obtain unauthorized access to information stored within your wallet.
                <br></br>
                <br></br>
                d. ens domains, nfts, cryptocurrencies and blockchain technology are relatively new and the regulatory landscape is unsettled.  new regulations could negatively impact such technologies impacting the value for your boredensyachtclub.eth subdomain/nft. you understand and accept all risk in that regard.
                <br></br>
                <br></br>
                e. you assume all responsibility for any adverse effects of disruptions or other issues impacting ethereum or the ethereum platform.
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>indemnification</h4>
              </div>
              <div style={{ marginBottom: 30, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: 11, fontWeight: 800, textAlign: 'center' }}>you agree to hold harmless and indemnify boredensyachtclub.eth and its developers, artists, multi-sigs, wallets, subsidiaries, affiliates, officers, agents, employees, advertisers, licensors, suppliers or partners from and against any claim, liability, loss, damage (actual and consequential) of any kind or nature, suit, judgment, litigation cost, and reasonable attorneys&apos; fees arising out of or in any way related to (i) your breach of these terms, (ii) your misuse of the site, or (iii) your violation of applicable laws, rules or regulations in connection with your access to or use of the site.
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>changes to the terms and conditions</h4>
              </div>
              <div style={{ marginBottom: 30, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: 11, fontWeight: 800, textAlign: 'center' }}>we may make changes to the terms at our discretion. please check these terms periodically for changes. any changes to the terms will apply on the date that they are made, and your continued access to or use after the terms have been updated will constitute your binding acceptance of the updates. if you do not agree to any revised terms, you may not access or use the site.
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>children</h4>
              </div>
              <div style={{ marginBottom: 30, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: 11, fontWeight: 800, textAlign: 'center' }}>our site is not intended for children.  you must be at least 18 years old to access this site or purchase a boredensyachtclub.eth subdomain/ngy. if you are under 18 years old you are not permitted to use this site for any reason. by accessing the site, you represent and warrant that you are at least 18 years of age.
                </p>
              </div>
              <br></br>
            </div>
          </Modal>

          <Modal
            onClose={() => setFaqModal(false)}
            show={faqModal}
            title='frequently asked questions'
          >
            <div style={{ marginTop: '0px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <img style={{ borderRadius: '6px' }} alt="sample" src="bensyc.gif" width="100" height="100"/>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>what is bored ens yacht club (bensyc)?</h4>
              </div>
              <div style={{ marginBottom: 20, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: `${fontSizeFAQ}`, fontWeight: 800, textAlign: 'center' }}>bensyc is the first ens 10k subdomain collection where the subdomain nft is your membership to the club.</p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>contract</h4>
              </div>
              <div style={{ marginBottom: 20, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: `${fontSizeFAQ}`, fontWeight: 800, textAlign: 'center' }}>0<span style={{ fontFamily: 'SFMono', fontSize: 12, fontWeight: 400 }}>x</span>000000...000000</p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>what is the purpose & vision of bensyc?</h4>
              </div>
              <div style={{ marginBottom: 20, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: `${fontSizeFAQ}`, fontWeight: 800, textAlign: 'center' }}>bensyc&apos;s primary purpose is to provide the ens community with a light-weight, experimental ens subdomain project that has sufficient features for the holders to form a sub-dao within ens. upon reaching full functionality, bensyc sub-dao will enable the holders to vote as a single delegate within ens dao. in addition to ens dao education & voting, bensyc aims to explore experimental ens use cases - especially of ens subdomains, and potentially support the ens builders through bensyc grants.
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>how will minting work?</h4>
              </div>
              <div style={{ marginBottom: 20, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: `${fontSizeFAQ}`, fontWeight: 800, textAlign: 'center' }}>a collection of 10,000 bored ens yacht club subdomain nfts (0-9999) with an array of name-bound features will be available to mint at a price of 0.01 eth each on sept 9, 2022 12:00 utc.
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>what are name-bound tokens?</h4>
              </div>
              <div style={{ marginBottom: 20, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: `${fontSizeFAQ}`, fontWeight: 800, textAlign: 'center' }}>bensyc drop will consist of an nft (including an avatar) + boredensyachtclub.eth subdomain + bensyc.eth subdomain that are all mutually name-bound. name-bound tokens are similar to soul-bound tokens in the sense that tokens are bound to ens names instead of wallets. the owner can freely sell/transfer the nft and the two subdomains will automatically be transferred with the nft to the new owner along with all the metadata (e.g. avatar, decentralised website).
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>what is bensyc community treasury?</h4>
              </div>
              <div style={{ marginBottom: 20, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: `${fontSizeFAQ}`, fontWeight: 800, textAlign: 'center' }}>bensyc community treasury is the 3/4 multi-sig managed by the founders at the start of the project. in due time as project matures, the treasury will be migrated to the sub-dao governor contract. 50% of all proceeds from the mint will be transferred to the community treasury and converted to $ens tokens to be delegated to bensyc. the remaining 50% of all proceeds from the mint will be held as eth in the community treasury for long term sustainability of bensyc and ongoing development.
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>do the subdomains have their own websites?</h4>
              </div>
              <div style={{ marginBottom: 20, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: `${fontSizeFAQ}`, fontWeight: 800, textAlign: 'center' }}>yes, each bensyc subdomain will have its own automatically generated decentralized website.
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}>what is $<img className="largeicon" alt="icon" src="ape.png"/>?</h4>
              </div>
              <div style={{ marginBottom: 20, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: `${fontSizeFAQ}`, fontWeight: 800, textAlign: 'center' }}>bensyc is experimenting with the use cases of fractionalizing ens domain ownership to create community tokens. <img className="icon" alt="icon" src="ape.png"/>coin.eth has been fractionalized into 1 billion $<img className="icon" alt="icon" src="ape.png"/> tokens and $<img className="icon" alt="icon" src="ape.png"/> tokens collectively own <img className="icon" alt="icon" src="ape.png"/>coin.eth. <img className="icon" alt="icon" src="ape.png"/>coin.eth can be purchased by anyone & will start with a purchase price of 10,000 eth. holders of $<img className="icon" alt="icon" src="ape.png"/> tokens will have a right to vote on the purchase price of <img className="icon" alt="icon" src="ape.png"/>coin.eth. upon conclusion of bensyc 10k subdomain mints, 50% of $<img className="icon" alt="icon" src="ape.png"/> will be airdropped to the bensyc subdomain owners through a &apos;claim process&apos; (similar to the $ens token airdrop) and 50% of $<img className="icon" alt="icon" src="ape.png"/> will go to the bensyc community treasury.  bensyc subdomain holders may vote to use the community treasury as a source of grants for builders from the ens community. if <img className="icon" alt="icon" src="ape.png"/>coin.eth is bought out, then $<img className="icon" alt="icon" src="ape.png"/> will become pegged to the purchase price and $<img className="icon" alt="icon" src="ape.png"/> holders will be able to swap $<img className="icon" alt="icon" src="ape.png"/> for the proportional share of eth from the <img className="icon" alt="icon" src="ape.png"/>coin.eth buyout.
                </p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <h4 style={{textAlign: 'center'}}><img className="largeicon" alt="icon" src="ape.png"/>🧪<img className="largeicon" alt="icon" src="322.svg"/></h4>
              </div>
              <div style={{ marginBottom: 20, marginLeft: 5, lineHeight: '15px' }}>
                <p style={{ fontFamily: 'MajorMono', fontSize: `${fontSizeFAQ}`, fontWeight: 800, textAlign: 'center' }}>pssss... upon bensyc 10k subdomain mints, the founding team might have an additional surprise 👼. you didn&apos;t hear it from us.
                </p>
              </div>
              <br></br>
            </div>
          </Modal>
          <div id="modal"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
