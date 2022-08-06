import { useState, useContext } from 'react';
import { CategoryContext } from '../context/CategoryContext';
import { DarcelContext, Darcel } from '../context/DarcelContext';
import styles from './viewer-item.module.css';

function ViewerItem(props: { index: number; title: string; subTitle: string; slug: string; layer: string; hex: string; }) {
  const { category, setCategory } = useContext(CategoryContext);
  const { darcel, setDarcel } = useContext(DarcelContext);
  const [localCategory] = useState(category); // Set state locally to avoid re-rendering on category change

  const itemClick = () => {
    if (localCategory === 'categories') {
      setCategory(props.slug); // Go to category in viewer
    } else {
      // Update Darcel avatar
      const currentVal = darcel[props.layer as keyof Darcel];
      const newVal = props.hex ? props.hex : localCategory + '/' + props.slug;
      const clearedVal = props.layer === 'background' ? '#F60' : ''; // Background resets to default color
      setDarcel({ ...darcel, [props.layer]: currentVal === newVal ? clearedVal : newVal });
    }
  }

  return (
    <div onClick={ itemClick } className={ `${ styles.viewerItem } ${ !props.subTitle ? styles.category : (props.layer === 'background' ? styles.background : '') } ${ (props.index + 1) % 2 === 0 ? styles.right : styles.left } ${ darcel[props.layer as keyof Darcel] === localCategory + '/' + props.slug || (props.layer === 'background' && darcel['background'] === props.hex) ? styles.selected : '' }` } style={{ animationDelay: `${ props.index * 0.1 }s` }}>
      <img src={ props.hex ? 'assets/img/placeholder.png' : `https://dourdarcels.s3.amazonaws.com/df/${ localCategory }/${ props.slug }.png` } style={{ backgroundColor: props.hex ? props.hex : "transparent" }} alt={ props.title } />

      <hgroup>
        <h3>{ props.title }</h3>
        <h4>{ props.subTitle }</h4>
      </hgroup>
    </div>
  );
}

export default ViewerItem;