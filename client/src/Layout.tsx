import { useState, useEffect, useContext, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Network, Alchemy, OwnedNftsResponse } from 'alchemy-sdk';
import { useAccount } from 'wagmi';
import OverlayWindow from './components/OverlayWindow';
import ConnectButton from './components/ConnectButton';
import { OverlayContext, Overlay } from './context/OverlayContext';
import { XPContext, XPContextType } from './context/XP';
import './layout.css';

const alchemySettings = {
  apiKey: process.env.REACT_APP_ALCHEMY_ID,
  network: Network.ETH_MAINNET
}

const alchemy = new Alchemy(alchemySettings);

const alchemySettingsPolygon = {
  apiKey: process.env.REACT_APP_ALCHEMY_ID,
  network: Network.MATIC_MAINNET
}

const alchemyPolygon = new Alchemy(alchemySettingsPolygon);

/* Header */

function HeaderDashboard() {
  const { setXP, xp } = useContext<XPContextType>(XPContext);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    let addressXP: number = 0;

    const getXP = async (page?: string | undefined) => {
      try {
        const userNFTs: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(address!, { contractAddresses: ['0x8d609bd201beaea7dccbfbd9c22851e23da68691', '0x6d93d3fd7bb8baebf853be56d0198989db655e40', '0x5e014f8c5778138ccc2c2d88e0530bc343831073', '0xac5dc1676595fc2f4d4a746c7a4857e692480e0c', '0x7e10adb7c91b0e6ee6f5c9cebdfad9046122015b'], pageKey: page }); // DD, colette, DF, DF Market and DF collabs contracts

        const collabNFTs: OwnedNftsResponse = await alchemyPolygon.nft.getNftsForOwner(address!, { contractAddresses: ['0xbac7e3182bb6691f180ef91f7ae4530abb3dc08d'] }); // Collab contracts

        // Loop collab NFTs and add XP
        for (let x: number = 0; x < collabNFTs.ownedNfts.length; x++) {
          addressXP += 300;
        }

        // Loop NFTs and add XP
        for (let x: number = 0; x < userNFTs.ownedNfts.length; x++) {
          switch (userNFTs.ownedNfts[x].contract.address) {
            case '0xac5dc1676595fc2f4d4a746c7a4857e692480e0c':
              // Market
              addressXP += 50;
              break;
            case '0x5e014f8c5778138ccc2c2d88e0530bc343831073':
              // DF
              addressXP += 100;
              break;
            default:
              addressXP += 200;
          }
        }

        // Check if more than 100 NFTs returned
        if (userNFTs.pageKey) {
          getXP(userNFTs.pageKey); // Next page
        } else {
          // Add prize XP only if DD token owned
          if (addressXP) {
            try {
              const response: Response = await fetch(`${window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/'}api/xp/${address}`);

              if (response.status === 200) {
                // Success
                const data: number = await response.json();
                addressXP += data;
              } else {
                alert('Error ' + response.status);
              }
            } catch (error) {
              console.log(error);
            }
          }

          setXP(addressXP);
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (isConnected) {
      getXP();
    } else {
      setXP(0);
    }
  }, [isConnected, address, setXP]);

  return (
    <div id="headerDashboard">
      <div id="dashboardXP">
        <div id="xpIcon"><img src="/assets/img/icon-heart.svg" alt="Heart" /></div>
        <p>{xp}<span>XP</span></p>
      </div>

      <ConnectButton />
    </div>
  );
}

const themeSong = new Audio('https://dourfits.s3.amazonaws.com/audio/theme.mp3');
themeSong.loop = true;

function Header() {
  const location = useLocation();
  const { isConnected } = useAccount();
  const [showingNav, setshowingNav] = useState<boolean>(false);
  const [themePlaying, setThemePlaying] = useState<boolean>(false);
  const userInteractedRef: React.MutableRefObject<boolean> = useRef(false);

  const burgerClick = () => {
    setshowingNav(!showingNav); // Toggle nav
  }

  const toggleThemeSong = () => {
    setThemePlaying(!themePlaying); // Toggle music theme on/off
  }

  useEffect(() => {
    // No music theme on localhost
    if (themePlaying && window.location.hostname !== 'localhost') {
      themeSong.play();
    } else {
      themeSong.pause();
    }
  }, [themePlaying]);

  useEffect(() => {
    setshowingNav(false); // Hide nav when page changes
  }, [location]);

  useEffect(() => {
    // Browsers need user interaction before audio can play
    window.addEventListener('click', function() {
      if (!userInteractedRef.current) {
        userInteractedRef.current = true;
        setThemePlaying(true);
      }
    });
  }, []);

  return (
    <header>
      <h1><Link to="/"><img src="/assets/img/logo.svg" alt="Dour Fits" /></Link></h1>
      <HeaderDashboard />

      <nav style={{ right: showingNav ? 0 : "" }}>
        <Link to="/" id="nav-home" style={{ opacity: location.pathname === '/' ? 1 : "" }}>Home</Link>
        <Link to="/wardrobe" id="nav-wardrobe" style={{ opacity: location.pathname === '/wardrobe' ? 1 : "", display: !isConnected ? "none" : "" }}>Wardrobe</Link>
        <Link to="/events" id="nav-events" style={{ opacity: location.pathname === '/events' ? 1 : "" }}>Events</Link>
        <a href="https://opensea.io/collection/dourfits-market" target="_blank" rel="noreferrer">Market</a>
        <Link to="/faq" id="nav-faq" style={{ opacity: location.pathname === '/faq' ? 1 : "" }}>FAQ</Link>
        <button onClick={toggleThemeSong} className="iconButton" style={{ display: userInteractedRef.current ? "inline" : "" }}><img src={`/assets/img/audio-${themePlaying ? 'on' : 'off'}.png`} alt="Music icon" /></button>
        <ConnectButton />
      </nav>

      <button onClick={burgerClick} id="navBurger"><div id="burger" className={showingNav ? 'selected' : undefined}></div></button>
    </header>
  );
}

/* Layout */

function Layout() {
  const [domReady, setDOMReady] = useState<boolean>(false);
  const [overlay, setOverlay] = useState<Overlay>({ visible: false });
  const [xp, setXP] = useState<number>(0);

  useEffect(() => {
    // Hack to avoid FOUC
    setTimeout(() => {
      setDOMReady(true);
    }, 100);
  }, []);

  return (
    <XPContext.Provider value={{ xp, setXP }}>
      <OverlayContext.Provider value={{ overlay, setOverlay }}>
        <div style={{ visibility: domReady ? "visible" : "hidden" }}>
          <Outlet />
          <Header />
          <OverlayWindow />
        </div>
      </OverlayContext.Provider>
    </XPContext.Provider>
  );
}

export default Layout;