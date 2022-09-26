import { useEffect } from 'react';
import ConnectButton from '../components/ConnectButton';
import './home.css';

/* HomeConnect */

function HomeConnect() {
  return (
    <div id="homeConnect">
      <img src="/assets/img/home-darcel-1.svg" alt="" className="connectDarcel" />

      <div id="connectLogo">
        <img src="/assets/img/home-logo.svg" alt="" />
        <h2>A blockchain fashion game</h2>
        <ConnectButton label="Connect Wallet" />
      </div>

      <img src="/assets/img/home-darcel-2.svg" alt="" className="connectDarcel" />
    </div>
  )
}

/* Home */

function Home() {
  useEffect(() => {
      document.querySelector('html')!.style.backgroundColor = ""; // Reset
  }, []);

  return (
    <div className="section" id="sectionHome">
      <HomeConnect />
    </div>
  )
}

export default Home;