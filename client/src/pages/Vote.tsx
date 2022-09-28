import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import Avatar from '../components/Avatar';
import { Darcel, EmptyDarcel } from '../context/DarcelContext';
import { EventObj } from '../pages/Events';
import './vote.css';

/* Entry */

function Entry(props: {darcel: Darcel, getEntries: Function}) {
  const voteClick = () => {
    props.getEntries();
  }

  return (
    <div className="voteEntry" onClick={ voteClick }>
      <Avatar { ...props.darcel } />
      <button className="bigButton">Vote</button>
    </div>
  )
}

/* Vote */

function Vote() {
  const { address } = useAccount();
  const { id } = useParams();
  const [entry1, setEntry1] = useState<Darcel>(EmptyDarcel);
  const [entry2, setEntry2] = useState<Darcel>(EmptyDarcel);
  const [eventTitle, setEventTitle] = useState<string>('');

  const config = useMemo(() => {
    return {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    }
  }, []);

  const getEntries = useCallback(async () => {
    try {
      const response: Response = await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/' }api/vote/entries/${ id }/${ address }`, config);

      if (response.status === 200) {
        // Success
        const data = await response.json();

        if (data.length === 2) {
          const darcel1: Darcel = { ...EmptyDarcel };
          const darcel2: Darcel = { ...EmptyDarcel };

          for (let key in darcel1) {
            darcel1[key as keyof typeof darcel1] = data[0][key.toLowerCase()];
          }

          setEntry1(darcel1);

          for (let key in darcel2) {
            darcel2[key as keyof typeof darcel2] = data[1][key.toLowerCase()];
          }

          setEntry2(darcel2);
        } else {
          console.log('No entries');
        }
      } else {
        alert('Error ' + response.status);
      }
    } catch (error) {
      console.log(error);
    }
  }, [address, config, id]);

  useEffect(() => {
    document.querySelector('html')!.style.backgroundColor = ""; // Reset

    const getEvent = async () => {
      try {
        const response: Response = await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/' }api/event/${ id }`, config);

        if (response.status === 200) {
          // Success
          const data: EventObj = await response.json();
          setEventTitle(data.title);
        } else {
          alert('Error ' + response.status);
        }
      } catch (error) {
        console.log(error);
      }
    }

    getEvent();
    getEntries();
  }, [id, config, getEntries]);

  return (
    <div className="section" id="sectionVote">
      <h2>{ eventTitle }</h2>
      <h3>Vote for your favorite:</h3>

      <div id="voteEntries">
        <Entry darcel={ entry1 } getEntries={ getEntries } />
        <Entry darcel={ entry2 } getEntries={ getEntries } />
      </div>
    </div>
  )
}

export default Vote;