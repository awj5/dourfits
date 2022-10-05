import { useEffect, useState } from 'react';
import ConnectButton from '../components/ConnectButton';
import './home.css';

/* HomeConnect */

function ConnectDarcel(props: { file: string; }) {
  const [darcelLoaded, setDarcelLoaded] = useState<boolean>(false);

  const imageLoaded = () => {
    setDarcelLoaded(true);
  }

  return <img src={ props.file } alt="Darcel" className={ `connectDarcel ${ darcelLoaded && 'loaded' }` } onLoad={ imageLoaded } />;
}

function HomeConnect() {
  return (
    <div id="homeConnect">
      <ConnectDarcel file="/assets/img/home-darcel-1.svg" />

      <div id="connectLogo">
        <img src="/assets/img/home-logo.svg" alt="" />
        <h2>A blockchain fashion game</h2>
        <ConnectButton label="Connect Wallet" />
      </div>

      <ConnectDarcel file="/assets/img/home-darcel-2.svg" />
    </div>
  );
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
  );
}

export default Home;