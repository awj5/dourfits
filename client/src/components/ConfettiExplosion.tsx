import { useEffect } from 'react';
import Confetti from 'react-dom-confetti';

/* ConfettiExplosion */

const sfxConfetti = new Audio('/assets/audio/confetti.wav');

function ConfettiExplosion(props: { explode: boolean; }) {
  const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: '10px',
    height: '10px',
    perspective: '500px',
    colors: ['#3f6296', '#bd352f', '#df723a', '#f7cf48', '#5e3461']
  }

  useEffect(() => {
    if (props.explode) {
      sfxConfetti.play();
    }
  }, [props.explode]);

  return (
    <div style={{ position: "absolute", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "sticky" }}>
        <Confetti active={ props.explode } config={ confettiConfig } />
      </div>
    </div>
  );
}

export default ConfettiExplosion;