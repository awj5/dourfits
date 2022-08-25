import { useContext, useEffect } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { OverlayContext, OverlayContextType } from '../context/OverlayContext';
import styles from './overlay-window.module.css';

function OverlayConnect() {
  const { connect, connectors, error } = useConnect();
  const { isConnected } = useAccount();
  const { setOverlay } = useContext<OverlayContextType>(OverlayContext);

  useEffect(() => {
    if (isConnected) {
      setOverlay({ visible: false }); // Hide overlay once connected
    }

    // eslint-disable-next-line
  }, [isConnected]);

  return (
    <div id={ styles.overlayConnect }>
      { connectors.map((connector) => (<button key={ connector.id } className="bigButton" onClick={ () => connect({ connector }) }><img src= { `assets/img/${ connector.name.toLowerCase().replace(/ /g, '-') }.png` } alt={ connector.name } />{ connector.name }</button>)) }
      { error && <p>{ error.message }</p> }
    </div>
  );
}

function OverlayWindow() {
  const { overlay, setOverlay } = useContext<OverlayContextType>(OverlayContext);

  const closeClick = () => {
    setOverlay({ visible: false });
  }

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeClick();
      }
    };

    window.addEventListener('keydown', keyHandler, false);
    // eslint-disable-next-line
  }, []);

  return (
    <div id={ styles.overlay } style={{ display: overlay.visible ? "flex" : "" }}>
      <div id={ styles.overlayBg } onClick={ closeClick }></div>

      <div id={ styles.overlayWrapper }>
        <div id={ styles.overlayWindow }>
          <button className="iconButton" id={ styles.overlayClose } onClick={ closeClick }><img src="assets/img/icon-x.png" alt="Close" /></button>
          <h2>{ overlay.title }</h2>
          { overlay.title === 'Connect a Wallet' && <OverlayConnect /> }
        </div>
      </div>
    </div>
  );
}

export default OverlayWindow;