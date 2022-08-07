import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import type { NextPage } from 'next';

const Info: NextPage = () => {

  return (
    <div className="info">
      <Head>
        <title>Bored ENS Yacht Club</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="shortcut icon" href="logo.png" />
      </Head>
      <div className="container">
        <div className="route" style={{ float: 'left', marginLeft: '0px', marginTop: '50px' }}>
          <Link href="/">
              <a>← go back</a>
          </Link>
        </div>
        <div>
          <div style={{ marginTop: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h1>Bored ENS Yacht Club</h1>
            <div style={{ marginRight: 0, marginTop: 10 }}>
              <p
                style={{ marginLeft: 110, fontSize: 14 }}
              >
              </p>
              <p
                style={{ marginLeft: 115, fontSize: 14 }}
              >

              </p>
              <p
                style={{ marginLeft: 115, fontSize: 14 }}
              >

              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
