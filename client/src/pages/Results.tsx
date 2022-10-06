import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { Darcel } from '../context/DarcelContext';
import './results.css';

/* Results */

function Results() {
  const { id } = useParams();
  const [darcels, setDarcels] = useState<Darcel[]>([]);
  const [wallets, setWallets] = useState<string[]>([]);

  useEffect(() => {
    document.querySelector('html')!.style.backgroundColor = ""; // Reset
    const entryWallets: string[] = [];

    const getEventResults = async () => {
      try {
        const response: Response = await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/' }api/results/${ id }`);

        if (response.status === 200) {
          // Success
          const data: any = await response.json();

          // Get entry wallets
          for (let x = 0; x < data.length; x++) {
            entryWallets.push(data[x].wallet);
          }

          setWallets(entryWallets);
          setDarcels(data);
        } else {
          alert('Error ' + response.status);
        }
      } catch (error) {
        console.log(error);
      }
    }

    getEventResults();
  }, [id]);

  return (
    <div className="section" id="sectionResults">
      <h2>Milan Streetwear</h2>

      <div id="results">
        { darcels.map((darcel, i) => <div key={ i } id={ 'resultsAvatar' + i } className="resultsAvatar"><Avatar { ...darcel } /><p>{ `${ i + 1 }. ${ wallets[i].substring(0, 4) }...${ wallets[i].substring(wallets[i].length - 4) }` }</p></div>) }
      </div>
    </div>
  )
}

export default Results;