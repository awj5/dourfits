import { useState, useContext, useEffect } from 'react';
import { Category } from '../pages/Wardrobe';
import { CategoryContext, CategoryContextType } from '../context/CategoryContext';
import { DarcelContext, Darcel, DarcelContextType } from '../context/DarcelContext';
import { XPContext, XPContextType } from '../context/XP';
import styles from './viewer-item.module.css';

function ViewerItem(props: { viewerScroll: Function; item: Category; traitOwned: boolean; ownedOnly: boolean | undefined; viewerMessage: string; setViewerMessage: React.Dispatch<React.SetStateAction<string>>; }) {
  const { category, setCategory } = useContext<CategoryContextType>(CategoryContext);
  const { darcel, setDarcel } = useContext<DarcelContextType>(DarcelContext);
  const { xp } = useContext<XPContextType>(XPContext);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [localCategory, setLocalCategory] = useState<string | undefined>(undefined);
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
    const exclusions: string[] = [];

    // Get currently excluded layers
    for (let layer in darcel) {
      if (localStorage[layer + 'DFEx']) {
        let keys: string[] = Object.keys(JSON.parse(localStorage[layer + 'DFEx']));

        for (let x = 0; x < keys.length; x++) {
          let key: string = keys[x];

          if (!exclusions.includes(key)) {
            exclusions.push(key);
          }
        }
      }
    }

    if (props.item.exclusions && currentVal !== newVal && !exclusions.includes(props.item.layer!)) {
      localStorage[props.item.layer + 'DFEx'] = JSON.stringify(props.item.exclusions); // Store layer exclusions
    } else if (localStorage[props.item.layer + 'DFEx']) {
      localStorage.removeItem(props.item.layer + 'DFEx'); // No exclusions for layer
    }

    // Set exclusions
    for (let layer in darcel) {
      if (localStorage[layer + 'DFEx']) {
        let layerExclusions: object = JSON.parse(localStorage[layer + 'DFEx']);
        let keys: string[] = Object.keys(layerExclusions);

        // Loop exclusions and set layers
        for (let x = 0; x < keys.length; x++) {
          let key = keys[x] as keyof typeof layerExclusions;
          layers[key] = layerExclusions[key];

          // Remove key/layer exclusion if exists
          if (localStorage[key + 'DFEx']) {
            localStorage.removeItem(key + 'DFEx');
          }

          if (props.item.layer === key && !props.viewerMessage) {
            props.setViewerMessage('Not compatible with ' + layer.replace('And', ' & ').replace('dA', 'd a').toLowerCase()); // Show message
          }
        }
      }
    }

    // Top type
    if (props.item.topType && layers[props.item.layer!]) {
      if (props.item.topType !== localStorage.dfTopType || (props.item.layer === 'arms' && !darcel.tops)) {
        if (props.item.layer === 'arms') {
          let top: string = '';

          if (props.item.default) {
            top = `tops/${ props.item.default }.svg`;
          } else if (props.item.topType === 'short') {
            top = 'tops/dour-fits-t-shirt.svg';
          }

          layers.tops = top;
        } else {
          let arms: string = '';

          if (props.item.default) {
            arms = `arms/${ props.item.default }.svg`;
          } else if (props.item.topType === 'short') {
            arms = 'arms/hands-on-hips.svg';
          } else if (props.item.topType === 'sleeveless') {
            arms = 'arms/regular.svg';
          } else {
            arms = `arms/${ props.item.topType }.svg`;
          }

          layers.arms = arms;
        }
      }

      localStorage.dfTopType = props.item.topType;
    }

    // Revert back to regular arms if no top and arms not already sleeveless
    if ((!darcel.tops || props.item.layer === 'tops') && !layers.tops && !layers.arms && localStorage.dfTopType !== 'sleeveless') {
      layers.arms = 'arms/regular.svg';
      localStorage.dfTopType = 'sleeveless';
    }

    setDarcel({ ...darcel, ...layers }); // Update avatar context
  }

  const buyClick = () => {
    window.open(`https://opensea.io/collection/${ props.item.collection }?search[stringTraits][0][name]=${ props.item.trait?.replace('&', '%26') }&search[stringTraits][0][values][0]=${ props.item.title }`);
  }

  const loaded = () => {
    setImageLoaded(true);
  }

  useEffect(() => {
    setLocalCategory(category) // Stop re-rendering invalid image on category state change
  }, [category]);

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