import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './layout.css';

/* Header */

function HeaderDashboard() {
  const connectClick = () => {

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

      <button onClick={ connectClick } className="bigButton">Connect</button>
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

  useEffect(() => {
    // Hack to avoid FOUC
    setTimeout(() => {
      setDOMReady(true);
    }, 100);
  }, []);

  return (
    <div style={{ visibility: domReady ? "visible" : "hidden" }}>
      <Outlet />
      <Header />
    </div>
  );
}

export default Layout;