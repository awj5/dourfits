import { Outlet } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import OverlayWindow from './components/OverlayWindow';
import { OverlayContext, OverlayContextType, Overlay } from './context/OverlayContext';
import './layout.css';

/* Header */

function HeaderDashboard() {
  const { setOverlay } = useContext<OverlayContextType>(OverlayContext);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const connectClick = () => {
    setOverlay({ visible: true, title: 'Connect a Wallet' });
  }

  const disconnectClick = () => {
    if (window.confirm('Disconnect wallet?')) {
      disconnect();
    }
  }

  return (
    <div id="headerDashboard">
      <div id="dashboardXP">
        <div id="xpIcon"><img src="assets/img/icon-heart.png" alt="XP" /></div>
        <p>
          9999
          <span>XP</span>
        </p>
      </div>

      <button onClick={ isConnected ? disconnectClick : connectClick } className="bigButton">{ isConnected ? `${ address!.substring(0, 4) }...${ address!.substring(address!.length - 4) }` : 'Connect' }</button>
    </div>
  );
}

function Header() {
  const burgerClick = () => {
    alert("WIP!");
  }

  return (
    <header>
      <h1><img src="assets/img/logo.png" alt="Dour Fits" /></h1>
      <HeaderDashboard />

      <nav>
        <button onClick={ burgerClick } id="navBurger"><div id="burger"></div></button>
      </nav>
    </header>
  );
}

/* Layout */

function Layout() {
  const [domReady, setDOMReady] = useState<boolean>(false);
  const [overlay, setOverlay] = useState<Overlay>({ visible: false });

  useEffect(() => {
    // Hack to avoid FOUC
    setTimeout(() => {
      setDOMReady(true);
    }, 100);
  }, []);

  return (
    <OverlayContext.Provider value={{ overlay, setOverlay }}>
      <div style={{ visibility: domReady ? "visible" : "hidden" }}>
        <Outlet />
        <Header />
        <OverlayWindow />
      </div>
    </OverlayContext.Provider>
  );
}

export default Layout;