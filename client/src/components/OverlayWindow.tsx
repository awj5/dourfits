import { useContext, useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConnect, useAccount } from 'wagmi';
import { OverlayContext, OverlayContextType } from '../context/OverlayContext';
import styles from './overlay-window.module.css';

/* Submitted */

function OverlaySubmitted() {
  return (
    <div id={ styles.overlaySubmitted }>
      <img src="assets/img/celebrate.gif" alt="" />
    </div>
  )
}

/* Submit */

function OverlaySubmit() {
  const { address } = useAccount();
  const { setOverlay } = useContext<OverlayContextType>(OverlayContext);
  const [openEvents, setOpenEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  interface Event {
    id: number;
    title: string;
    start: number;
    end: number;
    voting_end: number;
  }

  const eventClick = async (id: number) => {
    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(JSON.parse(localStorage.avatarV2))
    }

    try {
      setSubmitting(true);
      const response: Response = await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002' : 'https://dourfits.io' }/api/entries/${ id }/${ address }`, config);

      if (response.status !== 201) {
        // Error
        switch (response.status) {
          case 403:
            alert('Sorry event has closed.');
            break;
          case 409:
            alert('Fit already submitted for this event.');
            break;
          default:
            alert('Error ' + response.status);
        }
      } else {
        // Success
        setOverlay({ visible: true, title: 'Congrats!', message: 'Your fit has been submitted. Voting opens soon.' });
      }
    } catch (error) {
      console.log(error);
    }

    setSubmitting(false);
  }

  useEffect(() => {
    const getEvents = async (type: string) => {
      const config = {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }

      try {
        const response: Response = await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002' : 'https://dourfits.io' }/api/events/${ type }`, config);

        if (response.status === 200) {
          // Success
          const data: Event[] = await response.json();

          if (type === 'open') {
            setOpenEvents(data);
          } else {
            setUpcomingEvents(data);
          }
        } else {
          alert('Error ' + response.status);
        }
      } catch (error) {
        console.log(error);
      }
    }

    getEvents('open');
    getEvents('upcoming');
  }, []);

  return (
    <div id={ styles.overlaySubmit }>
      { openEvents.map((item) => <button key={ item.id } onClick={ () => eventClick(item.id) } className={ `bigButton ${ submitting && styles.disabled }` }>{ item.title }</button>) }
      { upcomingEvents.map((item) => <button key={ item.id } onClick={ () => eventClick(item.id) } className={ `bigButton ${ styles.disabled }` }>{ item.title }</button>) }
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
        <div id={ styles.overlayWindow } className={ overlay.title === 'Congrats!' ? styles.submitted : undefined }>
          <button className="iconButton" id={ styles.overlayClose } onClick={ closeClick }><img src="assets/img/icon-x.png" alt="Close" /></button>
          <h2>{ overlay.title }</h2>
          <p id={ styles.overlayMessage } style={{ display: overlay.message ? "block" : "" }}>{ overlay.message }</p>
          { overlay.title === 'Connect a Wallet' && <OverlayConnect /> }
          { overlay.title === 'Yay!' && <OverlaySubmit /> }
          { overlay.title === 'Congrats!' && <OverlaySubmitted /> }
        </div>
      </div>
    </div>
  );
}

export default OverlayWindow;