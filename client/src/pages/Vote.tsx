import { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import Avatar from '../components/Avatar';
import { Darcel, EmptyDarcel } from '../context/DarcelContext';
import './vote.css';

/* Entry */

function Entry(props: {darcel: Darcel}) {
  return (
    <div className="voteEntry">
      <Avatar { ...props.darcel } />
    </div>
  )
}

/* Vote */

function Vote() {
  const { address } = useAccount();
  const { id } = useParams();
  const [entry1, setEntry1] = useState<Darcel>(EmptyDarcel);
  const [entry2, setEntry2] = useState<Darcel>(EmptyDarcel);

  const getEntries = useCallback(async () => {
    const config = {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    }

    try {
      const response: Response = await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/' }api/vote/entries/${ id }/${ address }`, config);

      if (response.status === 200) {
        // Success
        const data = await response.json();

        if (data.length === 2) {
          setEntry1({background: data[0].background, head: data[0].head, eye: data[0].eye, hairAndHats: data[0].hairandhats, shoesAndLegs: data[0].shoesandlegs, bottoms: data[0].bottoms, tops: data[0].tops, bodyAccessories: data[0].bodyaccessories, arms: data[0].arms, facialHair: data[0].facialhair, mouth: data[0].mouth, headAccessories: data[0].headaccessories, glasses: data[0].glasses});
          setEntry2({background: data[1].background, head: data[1].head, eye: data[1].eye, hairAndHats: data[1].hairandhats, shoesAndLegs: data[1].shoesandlegs, bottoms: data[1].bottoms, tops: data[1].tops, bodyAccessories: data[1].bodyaccessories, arms: data[1].arms, facialHair: data[1].facialhair, mouth: data[1].mouth, headAccessories: data[1].headaccessories, glasses: data[1].glasses});
        } else {
          console.log('No entries');
        }
      } else {
        alert('Error ' + response.status);
      }
    } catch (error) {
      console.log(error);
    }
  }, [id, address]);

  useEffect(() => {
    document.querySelector('html')!.style.backgroundColor = ""; // Reset
    getEntries();
  }, [getEntries]);

  return (
    <div className="section" id="sectionVote">
      <h2>Milan Streetwear</h2>
      <h3>Vote for your favorite:</h3>

      <div id="voteEntries">
        <Entry darcel={ entry1 } />
        <Entry darcel={ entry2 } />
      </div>
    </div>
  )
}

export default Vote;