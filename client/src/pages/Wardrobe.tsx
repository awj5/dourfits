import { useState, useEffect, useRef, useContext } from 'react';
import { isMobile } from 'react-device-detect';
import { Network, Alchemy, OwnedNftsResponse } from 'alchemy-sdk';
import { useAccount } from 'wagmi';
import ViewerItem from '../components/ViewerItem';
import Avatar from '../components/Avatar';
import { DarcelContext, DarcelContextType, DefaultDarcel, Darcel } from '../context/DarcelContext';
import { CategoryContext, CategoryContextType } from '../context/CategoryContext';
import { OverlayContext, OverlayContextType } from '../context/OverlayContext';
import './wardrobe.css';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_ID,
  network: Network.ETH_MAINNET
}

const alchemy = new Alchemy(settings);

/* Stage */

function WardrobeStage() {
  const { darcel, setDarcel } = useContext<DarcelContextType>(DarcelContext);
  const { setOverlay } = useContext<OverlayContextType>(OverlayContext);
  const [downloadEnabled, setDownloadEnabled] = useState<boolean>(true);

  const resetClick = () => {
    if (window.confirm('Are you sure you want to reset your Darcel?')) {
      // Remove all layer exclusions
      for (let key in darcel) {
        if (localStorage[key + 'DFEx']) {
          localStorage.removeItem(key + 'DFEx');
        }
      }

      localStorage.dfTopType = 'sleeveless'; // !important - default arms top type
      setDarcel(DefaultDarcel);
    }
  }

  const submitClick = () => {
    const d = JSON.parse(localStorage.avatarV2);

    // Check if Darcel has bottom and no top
    if (d.bottoms && d.bottoms !== 'bottoms/underwear.svg' && !d.tops) {
      alert('Oops! Looks like your Darcel needs a top.');
    } else {
      setOverlay({ visible: true, title: 'Yay!', message: 'Which challenge would you like to submit your fit to?' });
    }
  }

  const downloadClick = async () => {
    setDownloadEnabled(false);

    // Create canvas and download
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1200;
    canvas.style.width = '0';
    canvas.style.height = '0';
    const ctx = canvas.getContext('2d');

    const addCanvasLayer = (file: string) => {
      return new Promise((resolve) => {
        const src = `https://dourfits.s3.amazonaws.com/${ file }?d=${ Date.now() }`; // Need date to clear FF cache
        const image: HTMLImageElement = document.createElement('img');
        image.setAttribute('crossOrigin', '*');

        // Hack to allow FF to draw SVGs to canvas
        const request = new XMLHttpRequest();
        request.open('GET', src, true);

        request.onload = () => {
          if (file.indexOf('.png') !== -1) {
            // .png
            image.src = src;
          } else {
            // .svg
            const parser: DOMParser = new DOMParser();
            const result: Document = parser.parseFromString(request.responseText, 'text/xml');
            const inlineSVG: SVGSVGElement = result.getElementsByTagName('svg')[0];
            inlineSVG.setAttribute('width', '1200px');
            inlineSVG.setAttribute('height', '1200px');
            const svg64: string = window.btoa(new XMLSerializer().serializeToString(inlineSVG));
            const image64: string = 'data:image/svg+xml;base64,' + svg64;
            image.src = image64;
          }

          image.onload = () => {
            resolve(ctx!.drawImage(image, 0, 0, 1200, 1200));
          }
        }

        request.send();
      });
    }

    // Loop Darcel layers
    for (let key in darcel) {
      let file: string = darcel[key as keyof Darcel];

      if (file.indexOf('#') !== -1) {
        ctx!.fillStyle = file;
        ctx!.fillRect(0, 0, canvas.width, canvas.height); // Add background hex color
      } else if (file) {
        await addCanvasLayer(file);
      }
    }

    // Add canvas to DOM, download then remove
    document.body.appendChild(canvas);
    const downloadLink = document.createElement('a');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = 'dour-fits.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    document.body.removeChild(canvas);

    setDownloadEnabled(true);
  }

  return (
    <div id="wardrobeStage">
      <Avatar { ...darcel } />
      <button onClick={ submitClick } className="bigButton">Submit<svg viewBox="0 0 15.84 27.18"><path d="M2.25,27.18c-.58,0-1.15-.22-1.59-.66-.88-.88-.88-2.3,0-3.18L10.41,13.59,.66,3.84C-.22,2.96-.22,1.54,.66,.66,1.54-.22,2.96-.22,3.84,.66L15.18,12c.88,.88,.88,2.3,0,3.18L3.84,26.52c-.44,.44-1.02,.66-1.59,.66Z"/></svg></button>
      <button onClick={ resetClick } className="iconButton" id="stageReset"><img src="/assets/img/icon-reset.png" alt="Reset" /></button>
      <button onClick={ downloadClick } className="iconButton"id="stageDownload" style={{ pointerEvents: downloadEnabled ? "auto" : "none" }}><img src="/assets/img/icon-download.png" alt="Download" /></button>
    </div>
  );
}

/* Viewer */

export interface Item {
  title: string;
  shortTitle?: string;
  collection?: string;
  trait?: string;
  layer?: string;
  hex?: string;
  xp?: number;
  format?: string;
  exclusions?: object;
  topType?: string;
  default?: string;
  marketID?: number;
}

const sfxClick = new Audio('/assets/audio/click.wav');
const sfxOver = new Audio('/assets/audio/over.wav');
const sfxChange = new Audio('/assets/audio/change.wav');

function Viewer(props: { ownedOnly: boolean | undefined; viewerMessage: string; setViewerMessage: React.Dispatch<React.SetStateAction<string>>; }) {
  const { address, isConnected } = useAccount();
  const { category } = useContext<CategoryContextType>(CategoryContext);
  const [viewerItems, setViewerItems] = useState<Item[]>([]);
  const [date, setDate] = useState<number>(Date.now());
  const [itemCategory, setItemCategory] = useState<string>('categories');
  const [scrollUp, setScrollUp] = useState<boolean>(false);
  const [scrollDown, setScrollDown] = useState<boolean>(false);
  const [scrollInterval, setScrollInterval] = useState<number>(0);
  const [userTraits, setUserTraits] = useState<Record<"value" | "trait_type", string>[]>([]);
  const viewerRef = useRef<HTMLDivElement>(null);
  const userInteractedRef: React.MutableRefObject<boolean> = useRef(false);

  const itemSFXOver = () => {
    if (userInteractedRef.current && !isMobile) {
      sfxOver.play();
    }
  }

  const itemSFXClick = () => {
    if (userInteractedRef.current) {
      sfxClick.play();
    }
  }

  const cancelScroll = () => {
    clearInterval(scrollInterval);
    setScrollInterval(0);
  }

  const viewerScroll = () => {
    const itemViewer = viewerRef.current!;

    // Up
    if (!isMobile && itemViewer.scrollTop > 0) {
      setScrollUp(true);
    } else if (scrollUp) {
      setScrollUp(false);
      cancelScroll();
    }

    // Down
    if (!isMobile && Math.ceil(itemViewer.scrollTop + itemViewer.offsetHeight) < itemViewer.scrollHeight) {
      setScrollDown(true);
    } else if (scrollDown) {
      setScrollDown(false);
      cancelScroll();
    }
  }

  const scrollMouseDown = (direction: string) => {
    const itemViewer = viewerRef.current!;

    const interval = window.setInterval(() => {
      if (direction === 'up') {
        itemViewer.scrollTop -= 2;
      } else {
        itemViewer.scrollTop += 2;
      }
    }, 0);

    setScrollInterval(interval);
  }

  const checkItemOwned = (title: string, trait: string): boolean => {
    const checkTrait = userTraits.filter(obj => {
      return obj.value.toLowerCase() === title.toLowerCase() && (obj.trait_type.toLowerCase() === trait.toLowerCase() || (trait === 'Background' && obj.trait_type.toLowerCase() === 'backgrounds')); // Hacky code added to make genesis backgrounds available to DF backgrounds with same name
    })

    return checkTrait.length || !isConnected ? true : false;
  }

  useEffect(() => {
    let ownedTraits: Record<"value" | "trait_type", string>[] = [];

    const getNFTs = async (page?: string | undefined) => {
      try {
        const userNFTs: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(address!, { contractAddresses: ['0x8d609bd201beaea7dccbfbd9c22851e23da68691', '0x6d93d3fd7bb8baebf853be56d0198989db655e40', '0x5e014f8c5778138ccc2c2d88e0530bc343831073', '0xac5dc1676595fc2f4d4a746c7a4857e692480e0c', '0x7e10adb7c91b0e6ee6f5c9cebdfad9046122015b'], pageKey: page }); // DD, colette and DF

        // Loop owned NFTs
        for (let x: number = 0; x < userNFTs.ownedNfts.length; x++) {
          let attributes: Record<"value" | "trait_type", string>[] | undefined = userNFTs.ownedNfts[x].rawMetadata?.attributes;

          if (userNFTs.ownedNfts[x].contract.address === '0xac5dc1676595fc2f4d4a746c7a4857e692480e0c') {
            // DF Market
            ownedTraits.push({value: userNFTs.ownedNfts[x].rawMetadata?.name ?? '', trait_type: "Market"});
          } else if (attributes) {
            // Loop traits
            for (let x: number = 0; x < attributes.length; x++) {
              // Check if trait already included
              let checkTrait = ownedTraits.filter(obj => {
                return obj.value === attributes![x].value && obj.trait_type === attributes![x].trait_type;
              });

              if (!checkTrait.length) {
                ownedTraits.push(attributes[x]);
              }
            }
          }
        }

        // Check if more than 100 NFTs held
        if (userNFTs.pageKey) {
          getNFTs(userNFTs.pageKey); // Next page
        } else {
          setUserTraits(ownedTraits);
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (isConnected) {
      getNFTs(); // Set user owned traits
    }
  }, [isConnected, address]);

  useEffect(() => {
    const getViewerItems = async () => {
      setViewerItems([]);
      setScrollDown(false); // Hide

      try {
        const response: Response = await fetch(`data/${ category }.json`);
        const data: Item[] = await response.json();
        setDate(Date.now()); // Use date for item key
        setItemCategory(category);
        setViewerItems(data);

        if (userInteractedRef.current) {
          sfxChange.play();
        }
      } catch (error) {
        console.log(error);
      }
    }

    getViewerItems();
  }, [category]);

  useEffect(() => {
    // Scroll to top when owned only is toggled
    viewerRef.current!.scrollTop = 0;
  }, [props.ownedOnly]);

  useEffect(() => {
    window.addEventListener('click', function() {
      if (!userInteractedRef.current) {
        userInteractedRef.current = true;
      }
    });
  }, []);

  return (
    <>
      <div id="viewer" ref={ viewerRef } onScroll={ viewerScroll } onMouseUp={ cancelScroll }>
        { viewerItems.map((item, i) => <ViewerItem key={ i + date } viewerScroll={ viewerScroll } itemSFXOver={ itemSFXOver } itemSFXClick={ itemSFXClick } category={ itemCategory } item={ item } traitOwned={ !item.layer ? true : checkItemOwned(item.title, item.trait ?? '') } ownedOnly={ props.ownedOnly } viewerMessage={ props.viewerMessage } setViewerMessage={ props.setViewerMessage } />) }
      </div>

      <button onMouseDown={ () => scrollMouseDown('up') } onMouseUp={ cancelScroll } style={{ visibility: scrollUp ? "visible" : "hidden", pointerEvents: scrollUp ? "auto" : "none" }} className="iconButton viewerUpDown" id="viewerUp"><img src="/assets/img/icon-arrow.svg" alt="Up" draggable="false" /></button>
      <button onMouseDown={ () => scrollMouseDown('down') } onMouseUp={ cancelScroll } style={{ visibility: scrollDown ? "visible" : "hidden", pointerEvents: scrollDown ? "auto" : "none" }} className="iconButton viewerUpDown" id="viewerDown"><img src="/assets/img/icon-arrow.svg" alt="Down" draggable="false" /></button>
    </>
  );
}

function ViewerMenu(props: { ownedOnly: boolean | undefined; setOwnedOnly: React.Dispatch<React.SetStateAction<boolean | undefined>>; }) {
  const { category, setCategory } = useContext<CategoryContextType>(CategoryContext);
  const [categories, setCategories] = useState<Item[]>([]);

  const homeClick = () => {
    setCategory('categories');
  }

  const ownedToggleClick = () => {
    props.setOwnedOnly(!props.ownedOnly);
  }

  const categoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.currentTarget.value);
  }

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response: Response = await fetch('data/categories.json');
        const data: Item[] = await response.json();
        setCategories(data);
      } catch (error) {
        console.log(error);
      }
    }

    getCategories();
  }, []);

  return (
    <div id="viewerMenu">
      <button onClick={ homeClick } className="iconButton" id="menuHome"><img src="/assets/img/icon-home.svg" alt="Home" style={{ paddingBottom: "4px" }} /></button>
      <button onClick={ ownedToggleClick } className={ `iconButton ${ props.ownedOnly && 'selected' }` } id="menuOwnedToggle"><svg viewBox="0 0 127.49 121.25" style={{ paddingBottom: "2px" }}><polygon points="63.74 0 83.44 39.91 127.49 46.31 95.61 77.38 103.14 121.25 63.74 100.53 24.35 121.25 31.87 77.38 0 46.31 44.05 39.91 63.74 0" /></svg></button>

      <select id="menuCategories" onChange={ categoryChange } value={ category }>
        <option value="categories">Categories</option>
        { categories.map((category, i) => <option value={ category.title.toLowerCase().replace('&', 'and').replace(/ /g, '-') } key={ i }>{ category.title }</option>) }
      </select>

      <div className="clear"></div>
    </div>
  );
}

function WardrobeViewer() {
  const [category, setCategory] = useState<string>('categories');
  const [ownedOnly, setOwnedOnly] = useState<boolean | undefined>(undefined);
  const [viewerMessage, setViewerMessage] = useState<string>('');
  const viewerMessageInitRef: React.MutableRefObject<boolean> = useRef(false);

  useEffect(() => {
    if (ownedOnly) {
      setViewerMessage('Showing your items only');
    } else if (ownedOnly !== undefined) {
      setViewerMessage('Showing all items');
    }
  }, [ownedOnly]);

  useEffect(() => {
    if (viewerMessageInitRef.current) {
      const timeout = window.setTimeout(() => {
        setViewerMessage(''); // Clear
      }, 2500);

      return () => {
        clearTimeout(timeout);
      }
    }

    viewerMessageInitRef.current = true;
  }, [viewerMessage]);

  return (
    <CategoryContext.Provider value={{ category, setCategory }}>
      <div id="wardrobeViewer">
        <ViewerMenu ownedOnly={ ownedOnly } setOwnedOnly={ setOwnedOnly } />
        <Viewer ownedOnly={ ownedOnly } viewerMessage={ viewerMessage } setViewerMessage={ setViewerMessage } />
        <p id="viewerMessage" style={{ display: viewerMessage ? "inline" : "" }}>{ viewerMessage }</p>
      </div>
    </CategoryContext.Provider>
  );
}

/* Wardrobe */

function Wardrobe() {
  const { isConnected } = useAccount();
  const [darcel, setDarcel] = useState<Darcel>(localStorage.avatarV2 ? JSON.parse(localStorage.avatarV2) : DefaultDarcel);
  const urlParams: URLSearchParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    if (!localStorage.avatarV2) {
      localStorage.dfTopType = 'sleeveless'; // !important - default arms top type
    }

    //localStorage.clear(); // Use for testing
    localStorage.avatarV2 = JSON.stringify(darcel); // Update local storage

    // Change body bg color to match avatar
    if (darcel.background.indexOf('#') !== -1) {
      document.querySelector('html')!.style.backgroundColor = darcel.background;
    } else {
      document.querySelector('html')!.style.backgroundColor = "#999"; // Reset
    }
  }, [darcel]);

  return (
    <DarcelContext.Provider value={{ darcel, setDarcel }}>
      <div className="section" id="sectionWardrobe" style={{ display: !isConnected && !urlParams.get('demo') ? "none" : "" }}>
        <WardrobeStage />
        <WardrobeViewer />
      </div>
    </DarcelContext.Provider>
  );
}

export default Wardrobe;