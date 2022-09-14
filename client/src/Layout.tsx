import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useContext, useRef } from 'react';
import { useAccount } from 'wagmi';
import OverlayWindow from './components/OverlayWindow';
import ConnectButton from './components/ConnectButton';
import { OverlayContext, Overlay } from './context/OverlayContext';
import { XPContext, XPContextType } from './context/XP';
import './layout.css';

/* Header */

function HeaderDashboard() {
  const { xp } = useContext<XPContextType>(XPContext);

  return (
    <div id="headerDashboard">
      <div id="dashboardXP">
        <div id="xpIcon"><img src="assets/img/icon-heart.svg" alt="XP" /></div>
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
    if (themePlaying) {
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
      <h1><Link to="/"><img src="assets/img/logo.svg" alt="Dour Fits" /></Link></h1>
      <HeaderDashboard />

      <nav style={{ right: showingNav ? 0 : "" }}>
        <Link to="/" id="nav-home" onClick={ hideNav } style={{ opacity: location.pathname === '/' ? 1 : "" }}>Home</Link>
        <Link to="/wardrobe" onClick={ hideNav } id="nav-wardrobe" style={{ opacity: location.pathname === '/wardrobe' ? 1 : "", display: !isConnected ? "none" : "" }}>Wardrobe</Link>
        <Link to="/events" onClick={ hideNav } id="nav-events" style={{ opacity: location.pathname === '/events' ? 1 : "" }}>Events</Link>
        <Link to="/faq" onClick={ hideNav } id="nav-faq" style={{ opacity: location.pathname === '/faq' ? 1 : "" }}>FAQ</Link>
        <button onClick={ toggleThemeSong } className="iconButton" style={{ display: userInteractedRef.current ? "inline" : "" }}><img src={ `assets/img/audio-${ themePlaying ? 'on' : 'off' }.png` } alt="" /></button>
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