import { useNavigate } from 'react-router-dom';
import './events.css';

/* Event */

function Event(props: { theme: string; dateType: string; date: string; image: string; bgColor: string; parent: string }) {
  const navigate = useNavigate();

  const ctaClick = (location: String) => {
    navigate('/' + location);
  }

  return (
    <div className="event" style={{ opacity: props.date === 'Soon' || props.parent === 'Vote' ? 0.5 : 1 }}>
      <div className="eventInfo">
        <span>Theme</span>
        <h3>{ props.theme }</h3>
        <span>{ props.dateType }</span>
        <h4>{ props.date }</h4>
        <span>Prizes</span>
        <div className="infoPrize" style={{ backgroundColor: props.bgColor }}>?</div>
        <div className="infoPrize" style={{ backgroundColor: props.bgColor }}>?</div>
        <div className="infoPrize" style={{ backgroundColor: props.bgColor }}>?</div>
        <div className="clear"></div>
        <button onClick={ () => ctaClick('wardrobe') } className="bigButton" style={{ backgroundColor: props.dateType === 'Starts' && props.parent !== 'Vote' ? 'var(--df-green)' : props.dateType === 'Ends' || props.parent === 'Vote' ? 'var(--df-orange)' : 'var(--df-red)', pointerEvents: props.date === 'Soon' || props.parent === 'Vote' ? "none" : "auto" }}>{ props.parent === 'Vote' ? 'Vote' : 'Wardrobe' }</button>
      </div>

      <div className="eventImage" style={{ backgroundColor: props.bgColor }}>
        <img src={ 'assets/img/events/' + props.image } alt="" />
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
        <Event theme="Slam Jam" dateType="Starts" date="September 22" image="slam-jam.png" bgColor="var(--df-deep-red)" parent={ props.title } />

        { props.title === 'Upcoming' &&
        <Event theme="TBA" dateType="Starts" date="Soon" image="tba.png" bgColor="var(--df-deep-yellow)" parent={ props.title } />
        }
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
      <EventGroup title="Vote" bgColor="var(--df-blue)" />
    </div>
  )
}

export default Events;