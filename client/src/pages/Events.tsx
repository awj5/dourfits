import { useNavigate } from 'react-router-dom';
import './events.css';

/* Event */

function Event(props: { theme: string; dateType: string; date: string; }) {
  const navigate = useNavigate();

  const ctaClick = (location: String) => {
    navigate('/' + location);
  }

  return (
    <div className="event">
      <div className="eventInfo">
        <span>Theme</span>
        <h3>{ props.theme }</h3>
        <span>{ props.dateType }</span>
        <h4>{ props.date }</h4>
        <span>Prizes</span>
        <button onClick={ () => ctaClick('wardrobe') } className="bigButton" style={{ backgroundColor: props.dateType === 'Starts' ? 'var(--df-green)' : props.dateType === 'Ends' ? 'var(--df-orange)' : 'var(--df-red)' }}>Wardrobe</button>
      </div>

      <div className="eventImage">
        <img src="assets/img/home-darcel-2.svg" alt="" />
      </div>
    </div>
  )
}

/* EventGroup */

function EventGroup(props: { title: string; bgColor: string }) {
  return (
    <div className="eventGroup" style={{ backgroundColor: props.bgColor }}>
      <h2>{ props.title }</h2>

      <div className="groupEvents">
        <Event theme="Slam Jam" dateType="Starts" date="September 22" />
      </div>

      <div className="clear"></div>
    </div>
  )
}

/* Events */

function Events() {
  return (
    <div className="section" id="sectionEvents">
      <EventGroup title="Upcoming" bgColor="var(--df-pink)" />
    </div>
  )
}

export default Events;