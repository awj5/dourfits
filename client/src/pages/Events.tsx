import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './events.css';

export interface EventObj {
  id: number;
  title: string;
  submit_start: number;
  submit_end: number;
  voting_end: number;
  sub_title?: string;
  prize_count: number;
}

/* Event */

function Event(props: { event: EventObj; group: string; }) {
  const navigate = useNavigate();
  const dateSubmitStart = new Date(props.event.submit_start).toLocaleString('default', { month: 'long', day: 'numeric' });
  const dateSubmitEnd = new Date(props.event.submit_end).toLocaleString('default', { month: 'long', day: 'numeric' });
  const dateVotingEnd = new Date(props.event.voting_end).toLocaleString('default', { month: 'long', day: 'numeric' });

  const ctaClick = (location: String) => {
    navigate('/' + location);
  }

  return (
    <div className={ `event ${ props.group === 'Upcoming' && 'upcoming'  }` }>
      <div className="eventInfo">
        <span>{ props.event.sub_title ? props.event.sub_title : 'Theme' }</span>
        <h3>{ props.event.title }</h3>
        <span>{ props.group === 'Upcoming' ? 'Starts' : (props.group === 'Archive' ? 'Closed' : 'Ends') }</span>
        <h4>{ props.group === 'Upcoming' ? dateSubmitStart : (props.group === 'Compete' ? dateSubmitEnd : dateVotingEnd) }</h4>
        <span>Prize</span>

        <div className="infoPrizes">
          { Array.from({ length: props.event.prize_count }, (_, i) => <div key={ i } className="infoPrize">{ props.group === 'Upcoming' ? '?' : <img src={ `https://dourfits.s3.amazonaws.com/events/${ props.event.title.toLowerCase().replace(/ /g, '-') }-prize-${ i + 1 }.png` } alt="" /> }</div>) }
          <div className="clear"></div>
        </div>

        <button onClick={ () => ctaClick('wardrobe') } className="bigButton" style={{ backgroundColor: props.group === 'Compete' || props.group === 'Upcoming' ? 'var(--df-green)' : (props.group === 'Vote' ? 'var(--df-orange)' : 'var(--df-red)') }}>{ props.group === 'Compete' || props.group === 'Upcoming' ? 'Enter Wardrobe' : (props.group === 'Vote' ? 'Vote' : 'See Results') }</button>
      </div>

      <img src={ `https://dourfits.s3.amazonaws.com/events/${ props.event.title.toLowerCase().replace(/ /g, '-') }.png` } alt="" />
    </div>
  )
}

/* EventGroup */

const getEvents = async (type: string) => {
  let data: EventObj[] = [];

  const config = {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  }

  try {
    const response: Response = await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/' }api/events/${ type }`, config);

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
          eventType = 'vote';
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

    if (props.title === 'Compete') {
      loadEvents(true); // Upcoming events
    }
  }, [props.title]);

  return (
    <div className="eventGroup" style={{ backgroundColor: props.bgColor }}>
      <h2>{ props.title }</h2>

      <div className="groupEvents">
        { groupEvents.map((event) => <Event key={ event.id } event={ event } group={ props.title } />) }
        { upcomingEvents.map((event) => <Event key={ event.id } event={ event } group="Upcoming" />) }
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