import { useState, useContext } from 'react';
import { Category } from '../pages/Wardrobe';
import { CategoryContext, CategoryContextType } from '../context/CategoryContext';
import { DarcelContext, Darcel, DarcelContextType } from '../context/DarcelContext';
import { XPContext, XPContextType } from '../context/XP';
import styles from './viewer-item.module.css';

function ViewerItem(props: { viewerScroll: Function; item: Category; traitOwned: boolean; }) {
  const { category, setCategory } = useContext<CategoryContextType>(CategoryContext);
  const { darcel, setDarcel } = useContext<DarcelContextType>(DarcelContext);
  const { xp } = useContext<XPContextType>(XPContext);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const localCategory: string = category; // Static var to avoid re-rendering on category state change
  const title: string = props.item.shortTitle ? props.item.shortTitle : props.item.title;
  const slug: string = props.item.title.toLowerCase().replace(/&/g, 'and').replace(/ /g, '-');
  const format: string = props.item.format ? props.item.format : '.svg';
  const xpItem: string | undefined = props.item.xp !== undefined ? (props.item.xp <= xp || props.traitOwned ? 'UNLOCKED' : props.item.xp + ' XP') : undefined;
  const available: boolean = props.traitOwned || xpItem === 'UNLOCKED' ? true : false;

  const itemClick = () => {
      // Update Darcel avatar
      const currentVal: string = darcel[props.item.layer as keyof Darcel];
      const newVal: string = props.item.hex ? props.item.hex : `${ localCategory }/${ slug }${ format }`;
      const clearedVal: string = props.item.layer === 'background' ? '#999' : ""; // Background resets to default color
      setDarcel({ ...darcel, [props.item.layer!]: currentVal === newVal ? clearedVal : newVal });
  }

  const buyClick = () => {
    window.open(`https://opensea.io/collection/${ props.item.collection }?search[stringTraits][0][name]=${ props.item.trait }&search[stringTraits][0][values][0]=${ props.item.title }&search[toggles][0]=BUY_NOW&search[toggles][1]=ON_AUCTION`);
  }

  const loaded = () => {
    setImageLoaded(true);
    props.viewerScroll(); // Call to set scroll buttons in viewer
  }

  return (
    <div onClick={ localCategory === 'categories' ? () => setCategory(slug) : (available ? itemClick : (!xpItem ? buyClick : () => null)) } className={ `${ styles.viewerItem } ${ !available && styles.unavailable } ${ imageLoaded && styles.loaded } ${ localCategory === 'categories' ? styles.category : (props.item.layer === 'background' && styles.background) } ${ (darcel[props.item.layer as keyof Darcel] === `${ localCategory }/${ slug }${ format }` || (props.item.layer === 'background' && darcel['background'] === props.item.hex)) && styles.selected }` }>
      <img src={ props.item.hex ? 'assets/img/placeholder.png' : `https://dourdarcels.s3.amazonaws.com/df/${ localCategory }/${ slug }.png` } style={{ backgroundColor: props.item.hex ? props.item.hex : "transparent" }} alt={ title } onLoad={ loaded } />

      <hgroup>
        <h3>{ title }</h3>
        <h4 className={ xpItem ? styles.xp : (!available ? styles.buy : undefined) }>{ xpItem ? xpItem : (localCategory === 'categories' ? '' : (available ? 'YOU OWN' : 'BUY')) }</h4>
      </hgroup>
    </div>
  );
}

export default ViewerItem;