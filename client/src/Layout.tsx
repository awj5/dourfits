import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useContext, useRef } from 'react';
import { Network, Alchemy, OwnedNftsResponse } from 'alchemy-sdk';
import { useAccount } from 'wagmi';
import OverlayWindow from './components/OverlayWindow';
import ConnectButton from './components/ConnectButton';
import { OverlayContext, Overlay } from './context/OverlayContext';
import { XPContext, XPContextType } from './context/XP';
import './layout.css';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_ID,
  network: Network.ETH_MAINNET
}

const alchemy = new Alchemy(settings);

/* Header */

function HeaderDashboard() {
  const { setXP, xp } = useContext<XPContextType>(XPContext);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    let addressXP: number = 0;

    const getXP = async (page?: string | undefined) => {
      try {
        const userNFTs: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(address!, { contractAddresses: ['0x8d609bd201beaea7dccbfbd9c22851e23da68691', '0x6d93d3fd7bb8baebf853be56d0198989db655e40', '0x5e014f8c5778138ccc2c2d88e0530bc343831073'], pageKey: page }); // DD, colette and DF

        // Loop NFTs
        for (let x: number = 0; x < userNFTs.ownedNfts.length; x++) {
          addressXP += userNFTs.ownedNfts[x].contract.address === ('0x8d609bd201beaea7dccbfbd9c22851e23da68691' || '0x6d93d3fd7bb8baebf853be56d0198989db655e40') ? 200 : 100;
        }

        // Check if more than 100 NFTs held
        if (userNFTs.pageKey) {
          getXP(userNFTs.pageKey); // Next page
        } else {
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
        <div id="xpIcon"><img src="/assets/img/icon-heart.svg" alt="XP" /></div>
        <p>{ xp }<span>XP</span></p>
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
    setshowingNav(!showingNav);
  }

  const hideNav = () => {
    setshowingNav(false);
  }

  const toggleThemeSong = () => {
    setThemePlaying(!themePlaying);
  }

  useEffect(() => {
    if (themePlaying && window.location.hostname !== 'localhost') {
      themeSong.play();
    } else {
      themeSong.pause();
    }
  }, [themePlaying]);

  useEffect(() => {
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
        <Link to="/" id="nav-home" onClick={ hideNav } style={{ opacity: location.pathname === '/' ? 1 : "" }}>Home</Link>
        <Link to="/wardrobe" onClick={ hideNav } id="nav-wardrobe" style={{ opacity: location.pathname === '/wardrobe' ? 1 : "", display: !isConnected ? "none" : "" }}>Wardrobe</Link>
        <Link to="/events" onClick={ hideNav } id="nav-events" style={{ opacity: location.pathname === '/events' ? 1 : "" }}>Events</Link>
        <Link to="/faq" onClick={ hideNav } id="nav-faq" style={{ opacity: location.pathname === '/faq' ? 1 : "" }}>FAQ</Link>
        <button onClick={ toggleThemeSong } className="iconButton" style={{ display: userInteractedRef.current ? "inline" : "" }}><img src={ `/assets/img/audio-${ themePlaying ? 'on' : 'off' }.png` } alt="" /></button>
        <ConnectButton />
      </nav>

      <button onClick={ burgerClick } id="navBurger"><div id="burger" className={ showingNav ? 'selected' : undefined }></div></button>
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