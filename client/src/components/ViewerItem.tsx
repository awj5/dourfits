import { useState, useContext, useEffect } from 'react';
import { Category } from '../pages/Wardrobe';
import { CategoryContext, CategoryContextType } from '../context/CategoryContext';
import { DarcelContext, Darcel, DarcelContextType } from '../context/DarcelContext';
import { XPContext, XPContextType } from '../context/XP';
import styles from './viewer-item.module.css';

function ViewerItem(props: { viewerScroll: Function; item: Category; traitOwned: boolean; ownedOnly: boolean; }) {
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
    const layers: { [x: string]: string; } = { [props.item.layer!]: currentVal === newVal ? clearedVal : newVal };

    // Exclusions
    if (props.item.exclusions) {
      localStorage[props.item.layer! + 'DFEx'] = JSON.stringify(props.item.exclusions); // Store layer exclusions
    } else if (localStorage[props.item.layer! + 'DFEx']) {
      localStorage.removeItem(props.item.layer! + 'DFEx'); // No exclusions for layer
    }

    // Loop Darcel layers
    for (var key in darcel) {
      if (localStorage[key + 'DFEx']) {
        // Exclusion exists for layer
        let exclusions: object = JSON.parse(localStorage[key + 'DFEx']);
        let keys: string[] = Object.keys(exclusions);

        // Loop exclusions and set layer
        for (let x = 0; x < keys.length; x++) {
          let key = keys[x] as keyof typeof exclusions;
          layers[key] = exclusions[key];
        }
      }
    }

    // Top type
    if (props.item.topType) {
      if (props.item.topType !== localStorage.dfTopType) {
        if (props.item.layer === 'tops') {
          let arms: string;

          switch (props.item.topType) {
            case 'short':
              arms = 'arms/hands-on-hips.svg';
              break;
            case 'outwear':
              arms = 'arms/outwear.svg';
              break;
            case 'hoodie':
              arms = 'arms/hoodie.svg';
              break;
            case 'sweater':
              arms = 'arms/sweater.svg';
              break;
            case 'sleeveless':
              arms = 'arms/crossed.svg';
              break;
            default:
              arms = '';
          }

          layers.arms = arms;
        } else {
          layers.tops = '';
        }
      }

      localStorage.dfTopType = props.item.topType;
    }

    setDarcel({ ...darcel, ...layers }); // Update avatar context
  }

  const buyClick = () => {
    window.open(`https://opensea.io/collection/${ props.item.collection }?search[stringTraits][0][name]=${ props.item.trait }&search[stringTraits][0][values][0]=${ props.item.title }&search[toggles][0]=BUY_NOW&search[toggles][1]=ON_AUCTION`);
  }

  const loaded = () => {
    setImageLoaded(true);
  }

  useEffect(() => {
    props.viewerScroll(); // Call to set scroll buttons in viewer
  }, [props]);

  return (
    <div onClick={ localCategory === 'categories' ? () => setCategory(slug) : (available ? itemClick : (!xpItem ? buyClick : () => null)) } className={ `${ styles.viewerItem } ${ !available && styles.unavailable } ${ imageLoaded && styles.loaded } ${ localCategory === 'categories' ? styles.category : (props.item.layer === 'background' && styles.background) } ${ (darcel[props.item.layer as keyof Darcel] === `${ localCategory }/${ slug }${ format }` || (props.item.layer === 'background' && darcel['background'] === props.item.hex)) && styles.selected }` } style={{ display: props.ownedOnly && !available ? "none" : "" }}>
      <img src={ props.item.hex ? 'assets/img/placeholder.png' : `https://dourfits.s3.amazonaws.com/${ localCategory }/${ slug }.png` } style={{ backgroundColor: props.item.hex ? props.item.hex : "transparent" }} alt={ title } onLoad={ loaded } />

      <hgroup>
        <h3>{ title }</h3>
        <h4 className={ xpItem ? (xpItem === 'UNLOCKED' ? styles.unlocked : styles.locked) : (!available ? styles.buy : undefined) }>{ xpItem ? xpItem : (localCategory === 'categories' ? '' : (available ? 'YOU OWN' : 'BUY')) }</h4>
      </hgroup>
    </div>
  );
}

export default ViewerItem;