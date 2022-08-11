import { useContext, useEffect } from 'react';
import { OverlayContext, OverlayContextType, Overlay } from '../context/OverlayContext';
import styles from './overlay-window.module.css';

function OverlayMessage(props: {overlay: Overlay}) {
  if (props.overlay.message === 'connect') {
    return (
      <div id={ styles.overlayConnect }>
        <button className="bigButton"><img src="assets/img/metamask.png" alt="MetaMask" />MetaMask</button>
        <button className="bigButton"><img src="assets/img/walletconnect.png" alt="MetaMask" />WalletConnect</button>
        <button className="bigButton"><img src="assets/img/coinbase.png" alt="MetaMask" />Coinbase</button>
        <button className="bigButton">Injected</button>
      </div>
    );
  } else {
    return <></>;
  }
}

function OverlayWindow() {
  const { overlay, setOverlay } = useContext<OverlayContextType>(OverlayContext);

  const closeClick = () => {
    setOverlay({ visible: false, title: '', message: '' });
  }

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeClick();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', keyHandler, false);
    return () => window.removeEventListener('keydown', keyHandler, false);
  }, []);

  return (
    <div id={ styles.overlay } style={{ display: overlay.visible ? "flex" : "" }}>
      <div id={ styles.overlayBg } onClick={ closeClick }></div>

      <div id={ styles.overlayWrapper }>
        <div id={ styles.overlayWindow }>
          <button className="iconButton" id={ styles.overlayClose } onClick={ closeClick }><img src="assets/img/icon-x.png" alt="Close" /></button>
          <h2>{ overlay.title }</h2>
          <OverlayMessage overlay={ overlay } />
        </div>
      </div>
    </div>
  );
}

export default OverlayWindow;