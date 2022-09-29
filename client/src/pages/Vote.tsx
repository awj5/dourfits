import { useEffect, useState, useCallback, useMemo, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import Avatar from '../components/Avatar';
import { Darcel, EmptyDarcel } from '../context/DarcelContext';
import { EventObj } from '../pages/Events';
import { XPContext, XPContextType } from '../context/XP';
import './vote.css';

/* Entry */

const sfxVote = new Audio('/assets/audio/vote.wav');

function Entry(props: { id: number; darcel: Darcel; vote: Function; voting: boolean; }) {
  const voteClick = () => {
    props.vote(props.id);
    sfxVote.play();
  }

  return (
    <div className="voteEntry" onClick={ voteClick } style={{ pointerEvents: props.voting ? "none" : "auto"}}>
      <Avatar { ...props.darcel } />
      <button className="bigButton">Vote</button>
    </div>
  )
}

/* Vote */

function Vote() {
  const { address } = useAccount();
  const { id } = useParams();
  const { xp } = useContext<XPContextType>(XPContext);
  const [entry1, setEntry1] = useState<Darcel>(EmptyDarcel);
  const [entry2, setEntry2] = useState<Darcel>(EmptyDarcel);
  const [entry1ID, setEntry1ID] = useState<number>(0);
  const [entry2ID, setEntry2ID] = useState<number>(0);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [voting, setVoting] = useState<boolean>(false);
  const [votingFinished, setVotingFinished] = useState<boolean>(false);

  const configGet = useMemo(() => {
    return {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    }
  }, []);

  const vote = async (winner: number) => {
    const configPost = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({winner: winner})
    }

    setEntry1(EmptyDarcel);
    setEntry2(EmptyDarcel);
    setVoting(true); // Disable voting

    try {
      // Record votes
      await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/' }api/vote/${ entry1ID }/${ address }`, configPost);
      await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/' }api/vote/${ entry2ID }/${ address }`, configPost);
    } catch (error) {
      console.log(error);
    }

    getEntries();
  }

  const getEntries = useCallback(async () => {
    try {
      const response: Response = await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/' }api/vote/entries/${ id }/${ address }`, configGet);

      if (response.status === 200) {
        // Success
        const data = await response.json();

        if (data.length === 2) {
          setEntry1ID(data[0].id);
          setEntry2ID(data[1].id);

          // Set Darcels
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
          setVotingFinished(true);

          // Hide entries
          setEntry1ID(0);
          setEntry2ID(0);
        }
      } else {
        alert('Error ' + response.status);
      }
    } catch (error) {
      console.log(error);
    }

    setVoting(false); // Enable voting
  }, [address, configGet, id]);

  useEffect(() => {
    document.querySelector('html')!.style.backgroundColor = ""; // Reset

    const getEvent = async () => {
      try {
        const response: Response = await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/' }api/event/${ id }`, configGet);

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
  }, [id, configGet, getEntries]);

  return (
    <div className="section" id="sectionVote" style={{ display: xp < 100 ? "none" : "" }}>
      <h2>{ eventTitle }</h2>
      <h3>Vote for your favorite:</h3>

      <div id="voteEntries" style={{ display: !entry1ID ? "none" : "" }}>
        <Entry id={ entry1ID } darcel={ entry1 } vote={ vote } voting={ voting } />
        <Entry id={ entry2ID } darcel={ entry2 } vote={ vote } voting={ voting } />
        <span id="entriesVersus">V</span>
      </div>

      <div id="voteFinished" style={{ display: !votingFinished ? "none" : "" }}>Thank you for voting!</div>
    </div>
  )
}

export default Vote;