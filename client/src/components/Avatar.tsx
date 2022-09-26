import React from 'react';
import { Darcel } from '../context/DarcelContext';
import styles from './avatar.module.css';

const AvatarLayer = React.memo((props: { trait: string; layer: string;}) => {
  return <img src={ props.trait && props.trait.indexOf('#') === -1 ? 'https://dourfits.s3.amazonaws.com/' + props.trait : '/assets/img/placeholder.png' } style={{ backgroundColor: props.trait.indexOf('#') !== -1 ? props.trait : "transparent" }} alt={ props.layer.replace(/[A-Z]/g, ' $&').trim() } />;
});

function Avatar(darcel: Darcel) {
  return (
    <div className={ styles.avatar }>
      { Object.keys(darcel).map((val, i) => <AvatarLayer key={ i } trait={ darcel[val as keyof Darcel] } layer={ val.charAt(0).toUpperCase() + val.slice(1) } />) }
    </div>
  );
}

export default Avatar;