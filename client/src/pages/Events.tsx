import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import Moment from 'moment';
import ConnectButton from '../components/ConnectButton';
import './events.css';

export interface EventObj {
  id: number;
  title: string;
  submit_start: number;
  submit_end: number;
  voting_end: number;
  sub_title?: string;
  prize_count: number;
  description: string;
}

/* Event */

function Event(props: { event: EventObj; group: string; upcoming?: boolean; }) {
  const { isConnected } = useAccount();
  const [darcelLoaded, setDarcelLoaded] = useState<boolean>(false);
  const navigate = useNavigate();
  const dateSubmitStart = Moment(props.event.submit_start).format('MMMM D');
  const dateSubmitEnd = Moment(props.event.submit_end).format('MMMM D');
  const dateVotingEnd = Moment(props.event.voting_end).format('MMMM D');

  const ctaClick = (location: string) => {
    navigate('/' + location);
  }

  const imageLoaded = () => {
    setDarcelLoaded(true);
  }

  return (
    <div className={ `event ${ props.upcoming && 'upcoming' }` }>
      <div className="eventInfo">
        <span>{ props.event.sub_title ? props.event.sub_title : (props.upcoming ? 'Upcoming' : 'Theme') }</span>
        <h3>{ props.event.title }</h3>
        <p>{ props.event.description }</p>
        <span>{ props.upcoming ? 'Starts' : (props.group === 'Archive' ? 'Closed' : 'Ends') }</span>
        <h4>{ props.upcoming && props.group === 'Compete' ? dateSubmitStart : (props.group === 'Compete' || props.upcoming ? dateSubmitEnd : dateVotingEnd) }</h4>
        <span>Prize</span>

        <div className="infoPrizes">
          { Array.from({ length: props.event.prize_count }, (_, i) => <div key={ i } className="infoPrize">{ props.upcoming && props.group === 'Compete' ? '?' : <img src={ `https://dourfits.s3.amazonaws.com/events/${ props.event.title.toLowerCase().replace(/ /g, '-') }-prize-${ i + 1 }.png` } alt="Prize" /> }</div>) }
          <div className="clear"></div>
        </div>

        <div className="eventCTA">
          { (!isConnected && props.group !== 'Archive' && !props.upcoming) && <ConnectButton label="Connect" /> }
          { isConnected && <button onClick={ () => ctaClick(props.group === 'Vote' ? 'vote/' + props.event.id : (props.group === 'Archive' ? 'results/' + props.event.id : 'wardrobe')) } className="bigButton eventButton" style={{ backgroundColor: props.group === 'Compete' ? 'var(--df-green)' : (props.group === 'Vote' ? 'var(--df-orange)' : 'var(--df-red)') }}>{ props.group === 'Compete' ? 'Enter Wardrobe' : (props.group === 'Vote' ? 'Vote' : 'See Results') }</button> }
        </div>
      </div>

      <img src={ `https://dourfits.s3.amazonaws.com/events/${ props.event.title.toLowerCase().replace(/ /g, '-') }.png` } alt="Darcel" onLoad={ imageLoaded } className={ `eventImage ${ darcelLoaded && 'loaded' }` } />
    </div>
  )
}

/* EventGroup */

const getEvents = async (type: string) => {
  let data: EventObj[] = [];

  try {
    const response: Response = await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/' }api/events/${ type }`);

    if (response.status === 200) {
      // Success
      data = await response.json();
    } else {
      alert('Error ' + response.status);
    }
  } catch (error) {
    console.log(error);
  }

  return data;
}

function EventGroup(props: { title: string; bgColor: string }) {
  const [groupEvents, setGroupEvents] = useState<EventObj[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventObj[]>([]);

  useEffect(() => {
    const loadEvents = async (upcoming?: boolean) => {
      let eventType: string;

      switch (props.title) {
        case 'Compete':
          eventType = upcoming ? 'upcoming' : 'open';
          break;
        case 'Vote':
          eventType = upcoming ? 'open' : 'vote';
          break;
        default:
          eventType = 'archive';
      }

      const events: EventObj[] = await getEvents(eventType);

      if (upcoming) {
        setUpcomingEvents(events);
      } else {
        setGroupEvents(events);
      }
    }

    loadEvents();

    // Upcoming events
    if (props.title !== 'Archive') {
      loadEvents(true);
    }
  }, [props.title]);

  return (
    <div className="eventGroup" style={{ backgroundColor: props.bgColor }}>
      <h2>{ props.title }</h2>

      <div className="groupEvents">
        { groupEvents.map((event) => <Event key={ event.id } event={ event } group={ props.title } />) }
        { upcomingEvents.map((event) => <Event key={ event.id } event={ event } group={ props.title } upcoming={ true } />) }
        <div className="clear"></div>
      </div>
    </div>
  )
}

/* Events */

function Events() {
  useEffect(() => {
    document.querySelector('html')!.style.backgroundColor = ""; // Reset
  }, []);

  return (
    <div className="section" id="sectionEvents">
      <EventGroup title="Compete" bgColor="var(--df-pink)" />
      <EventGroup title="Vote" bgColor="var(--df-blue)" />
      <EventGroup title="Archive" bgColor="var(--df-dark-green)" />
    </div>
  )
}

export default Events;