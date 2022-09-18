import { useContext, useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConnect, useAccount } from 'wagmi';
import { OverlayContext, OverlayContextType } from '../context/OverlayContext';
import { DarcelContext, DarcelContextType } from '../context/DarcelContext';
import styles from './overlay-window.module.css';

/* Submit */

function OverlaySubmit() {
  const { address } = useAccount();
  const { darcel } = useContext<DarcelContextType>(DarcelContext);
  const [events, setEvents] = useState<Event[]>([]);

  interface Event {
    id: number;
    title: string;
    start: Date;
    end: Date;
    voting_end: Date;
  }

  const eventClick = async (id: number) => {
    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(darcel)
    }

    try {
      const response: Response = await fetch(`http://${ window.location.hostname === 'localhost' ? 'localhost:3002' : 'dourfits.io' }/api/entries/${ id }/${ address }`, config);
      const data: any = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const getEvents = async () => {
      try {
        const response: Response = await fetch(`http://${ window.location.hostname === 'localhost' ? 'localhost:3002' : 'dourfits.io' }/api/events`);
        const data: Event[] = await response.json();
        setEvents(data);
      } catch (error) {
        console.log(error);
      }
    }

    getEvents();
  }, []);

  return (
    <div id={ styles.overlaySubmit }>
      { events.map((item) => <button key={ item.id } onClick={ () => eventClick(item.id) } className="bigButton">{ item.title }</button>) }
    </div>
  )
}

/* Connect */

function OverlayConnect() {
  const { connect, connectors, error } = useConnect();
  const { isConnected } = useAccount();
  const { setOverlay } = useContext<OverlayContextType>(OverlayContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      setOverlay({ visible: false }); // Hide overlay once connected

      if (location.pathname !== '/wardrobe') {
        navigate('/wardrobe');
      }
    }
  }, [isConnected, setOverlay, location.pathname, navigate]);

  return (
    <div id={ styles.overlayConnect }>
      { connectors.map((connector) => (<button key={ connector.id } className="bigButton" onClick={ () => connect({ connector }) }><img src= { `assets/img/${ connector.name.toLowerCase().replace(/ /g, '-') }.png` } alt={ connector.name } />{ connector.name }</button>)) }
      { error && <p>{ error.message }</p> }
    </div>
  );
}

/* OverlayWindow */

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
          <p id={ styles.overlayMessage } style={{ display: overlay.message ? "block" : "" }}>{ overlay.message }</p>
          { overlay.title === 'Connect a Wallet' && <OverlayConnect /> }
          { overlay.title === 'Yay!' && <OverlaySubmit /> }
        </div>
      </div>
    </div>
  );
}

export default OverlayWindow;