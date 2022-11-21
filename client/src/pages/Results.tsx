import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { EventObj } from '../pages/Events';
import { Darcel } from '../context/DarcelContext';
import './results.css';

/* Results */

function Results() {
  const { id } = useParams();
  const [darcels, setDarcels] = useState<Darcel[]>([]);
  const [wallets, setWallets] = useState<string[]>([]);
  const [eventTitle, setEventTitle] = useState<string>('');

  useEffect(() => {
    document.querySelector('html')!.style.backgroundColor = ""; // Reset
    const entryWallets: string[] = [];

    const getEvent = async () => {
      try {
        const response: Response = await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/' }api/event/${ id }/results`);

        if (response.status === 200) {
          // Success
          const data: EventObj = await response.json();
          setEventTitle(data.title);
          getEventResults();
        } else if (response.status === 403) {
          alert('Sorry voting is still in progress.');
        } else {
          alert('Error ' + response.status);
        }
      } catch (error) {
        console.log(error);
      }
    }

    const getEventResults = async () => {
      try {
        const response: Response = await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/' }api/results/${ id }`);

        if (response.status === 200) {
          // Success
          const data: any = await response.json();
          const darcelData: Darcel[] = [];

          // Get entry wallets then remove from Darcel data
          for (let x = 0; x < data.length; x++) {
            entryWallets.push(data[x].wallet);
            delete data[x].wallet;
            darcelData.push(data[x]);
          }

          setWallets(entryWallets);
          setDarcels(darcelData);
        } else {
          alert('Error ' + response.status);
        }
      } catch (error) {
        console.log(error);
      }
    }

    getEvent();
  }, [id]);

  return (
    <div className="section" id="sectionResults">
      <h2>Results</h2>
      <h3>{ eventTitle }</h3>

      <div id="results">
        { darcels.map((darcel, i) => <div key={ i } id={ 'resultsAvatar' + i } className="resultsAvatar"><Avatar { ...darcel } /><p>{ `${ i + 1 }. ${ wallets[i].substring(0, 4) }...${ wallets[i].substring(wallets[i].length - 4) }` }</p></div>) }
      </div>
    </div>
  )
}

export default Results;