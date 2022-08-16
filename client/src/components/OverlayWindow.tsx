import { useContext, useEffect, useCallback } from 'react';
import { OverlayContext, OverlayContextType } from '../context/OverlayContext';
import { useConnect, useAccount } from 'wagmi';
import styles from './overlay-window.module.css';

function OverlayConnect() {
  const { setOverlay } = useContext<OverlayContextType>(OverlayContext);
  const { connect, connectors, error } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      setOverlay({ visible: false }); // Hide overlay once connected
    }
  }, [isConnected, setOverlay]);

  return (
    <div id={ styles.overlayConnect }>
      { connectors.map((connector) => (<button key={ connector.id } className="bigButton" onClick={ () => connect({ connector }) }><img src= { `assets/img/${ connector.name.toLowerCase().replace(/ /g, '-') }.png` } alt={ connector.name } />{ connector.name }</button>)) }
      { error && <p>{ error.message }</p> }
    </div>
  );
}

function OverlayWindow() {
  const { overlay, setOverlay } = useContext<OverlayContextType>(OverlayContext);

  const closeClick = useCallback(() => {
    setOverlay({ visible: false });
  }, [setOverlay]);

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeClick();
      }
    };

    window.addEventListener('keydown', keyHandler, false);
  }, [closeClick]);

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