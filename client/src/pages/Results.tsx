import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { Darcel } from '../context/DarcelContext';
import './results.css';

/* Results */

function Results() {
  const { id } = useParams();
  const [darcels, setDarcels] = useState<Darcel[]>([]);

  useEffect(() => {
    document.querySelector('html')!.style.backgroundColor = ""; // Reset

    const getEventResults = async () => {
      try {
        const response: Response = await fetch(`${ window.location.hostname === 'localhost' ? 'http://localhost:3002/' : '/' }api/results/${ id }`);

        if (response.status === 200) {
          // Success
          const data: Darcel[] = await response.json();
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
      <h2> </h2>
      { darcels.map((darcel, i) => <div key={ i } className="resultsAvatar"><Avatar { ...darcel } /></div>) }
    </div>
  )
}

export default Results;