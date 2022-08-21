import { useState, useEffect, useRef, useContext } from 'react';
import { isMobile } from 'react-device-detect';
import { Network, Alchemy, OwnedNftsResponse } from 'alchemy-sdk';
import { useAccount } from 'wagmi';
import ViewerItem from '../components/ViewerItem';
import Avatar from '../components/Avatar';
import { DarcelContext, DarcelContextType, DefaultDarcel, Darcel } from '../context/DarcelContext';
import { CategoryContext, CategoryContextType } from '../context/CategoryContext';
import { XPContext, XPContextType } from '../context/XP';
import './wardrobe.css';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_ID,
  network: Network.ETH_MAINNET
}

const alchemy = new Alchemy(settings);

/* Stage */

function WardrobeStage() {
  const { darcel, setDarcel } = useContext<DarcelContextType>(DarcelContext);

  const resetClick = () => {
    if (window.confirm('Are you sure you want to reset your Darcel?')) {
      setDarcel(DefaultDarcel);
    }
  }

  return (
    <div id="wardrobeStage">
      <Avatar { ...darcel } />

      <select>
        <option value="">Submit</option>
      </select>

      <button onClick={ resetClick } className="iconButton"><img src="assets/img/icon-reset.png" alt="Reset" /></button>
    </div>
  );
}

/* Viewer */

export interface Category {
  title: string;
  shortTitle?: string;
  collection?: string;
  trait?: string;
  layer?: string;
  hex?: string;
  xp?: number;
  format?: string;
}

function ViewerMenu() {
  const { category, setCategory } = useContext<CategoryContextType>(CategoryContext);
  const [categories, setCategories] = useState<Category[]>([]);

  const homeClick = () => {
    setCategory('categories');
  }

  const menuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.currentTarget.value);
  }

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response: Response = await fetch('data/categories.json');
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (error) {
        console.log(error);
      }
    }

    getCategories();
  }, []);

  return (
    <>
      <button onClick={ homeClick } className="iconButton" id="viewerHome"><img src="assets/img/icon-home.png" alt="Home" style={{ paddingBottom: "4px" }} /></button>

      <select id="viewerMenu" onChange={ menuChange } value={ category }>
        <option value="categories">Categories</option>
        { categories.map((category, i) => <option value={ category.title.toLowerCase().replace('&', 'and').replace(/ /g, '-') } key={ i }>{ category.title }</option>) }
      </select>
    </>
  );
}

function Viewer() {
  const { address, isConnected } = useAccount();
  const { category } = useContext<CategoryContextType>(CategoryContext);
  const { setXP } = useContext<XPContextType>(XPContext);
  const [date, setDate] = useState<number>(Date.now());
  const [viewerItems, setViewerItems] = useState<Category[]>([]);
  const [scrollUp, setScrollUp] = useState<boolean>(false);
  const [scrollDown, setScrollDown] = useState<boolean>(false);
  const [scrollInterval, setScrollInterval] = useState<number>(0);
  const [userTraits, setUserTraits] = useState<Record<"value" | "trait_type", string>[]>([]);
  const viewer = useRef<HTMLDivElement>(null);

  const viewerScroll = () => {
    const itemViewer = viewer.current!;

    // Up
    if (!isMobile && itemViewer.scrollTop > 0 && !scrollUp) {
      setScrollUp(true);
    } else if (itemViewer.scrollTop === 0 && scrollUp) {
      setScrollUp(false);
      cancelScroll();
    }

    // Down
    if (!isMobile && itemViewer.scrollTop + itemViewer.offsetHeight !== itemViewer.scrollHeight && !scrollDown) {
      setScrollDown(true);
    } else if (Math.ceil(itemViewer.scrollTop + itemViewer.offsetHeight) >= itemViewer.scrollHeight && scrollDown) {
      setScrollDown(false);
      cancelScroll();
    }
  }

  const scrollMouseDown = (direction: string) => {
    cancelScroll();

    const interval = window.setInterval(() => {
      if (window.innerWidth > window.innerHeight && direction === 'up') {
        viewer.current!.scrollTop -= 2;
      } else if (window.innerWidth > window.innerHeight && direction === 'down') {
        viewer.current!.scrollTop += 2;
      } else if (direction === 'up') {
        viewer.current!.scrollLeft -= 2;
      } else {
        viewer.current!.scrollLeft += 2;
      }
    }, 0);

    setScrollInterval(interval);
  }

  const cancelScroll = () => {
    clearInterval(scrollInterval);
    setScrollInterval(0);
  }

  const getItemAvailability = (title: string, trait: string) => {
    const checkTrait = userTraits.filter(obj => {
      return obj.value === title && obj.trait_type === trait;
    })

    return checkTrait.length || !isConnected ? 'YOU OWN' : 'BUY';
  }

  useEffect(() => {
    let ownedTraits: Record<"value" | "trait_type", string>[] = [];
    let addressXP: number = 0;

    const getNFTs = async (page?: string | undefined) => {
      try {
        const userNFTs: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(address!, { contractAddresses: ['0x8d609bd201beaea7dccbfbd9c22851e23da68691', '0x6d93d3fd7bb8baebf853be56d0198989db655e40', '0x5e014f8c5778138ccc2c2d88e0530bc343831073'], pageKey: page }); // DD, colette and DF

        // Loop NFTs
        for (let x: number = 0; x < userNFTs.ownedNfts.length; x++) {
          addressXP += 10;
          let attributes: Record<"value" | "trait_type", string>[] | undefined = userNFTs.ownedNfts[x].rawMetadata?.attributes;

          if (attributes) {
            // Loop traits
            for (let x: number = 0; x < attributes.length; x++) {
              // Check if trait already included
              let checkTrait = ownedTraits.filter(obj => {
                return obj.value === attributes![x].value && obj.trait_type === attributes![x].trait_type;
              })

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
          setXP(addressXP);
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (isConnected) {
      getNFTs(); // Set user owned traits
    }
  }, [isConnected, address, setXP]);

  useEffect(() => {
    const getViewerItems = async () => {
      try {
        setViewerItems([]); // Clear
        setScrollDown(false); // Hide
        const response: Response = await fetch(`data/${ category }.json`);
        const data: Category[] = await response.json();
        setDate(Date.now()); // Use date for item key
        setViewerItems(data);
      } catch (error) {
        console.log(error);
      }
    }

    getViewerItems();
  }, [category]);

  return (
    <>
      <div id="viewer" ref={ viewer } onScroll={ viewerScroll } onMouseUp={ cancelScroll } onTouchEnd={ cancelScroll }>
        { viewerItems.map((item, i) => <ViewerItem key={ i + date } viewerScroll={ viewerScroll } item={ item } availability={ item.layer && getItemAvailability(item.title, item.trait!) } />) }
      </div>

      <button onMouseDown={ () => scrollMouseDown('up') } onMouseUp={ cancelScroll } onTouchEnd={ cancelScroll } style={{ visibility: scrollUp ? "visible" : "hidden", pointerEvents: scrollUp ? "auto" : "none" }} className="iconButton viewerUpDown" id="viewerUp"><img src="assets/img/icon-arrow.png" alt="Up" draggable="false" /></button>
      <button onMouseDown={ () => scrollMouseDown('down') } onMouseUp={ cancelScroll } onTouchEnd={ cancelScroll } style={{ visibility: scrollDown ? "visible" : "hidden", pointerEvents: scrollDown ? "auto" : "none" }} className="iconButton viewerUpDown" id="viewerDown"><img src="assets/img/icon-arrow.png" alt="Down" draggable="false" /></button>
    </>
  );
}

function WardrobeViewer() {
  const [category, setCategory] = useState<string>('categories');

  return (
    <CategoryContext.Provider value={{ category, setCategory }}>
      <div id="wardrobeViewer">
        <ViewerMenu />
        <Viewer />
      </div>
    </CategoryContext.Provider>
  );
}

/* Wardrobe */

function Wardrobe() {
  const { isConnected } = useAccount();
  const [darcel, setDarcel] = useState<Darcel>(localStorage.avatarV1 ? JSON.parse(localStorage.avatarV1) : DefaultDarcel);
  const [sectionVisibility, setSectionVisibility] = useState<boolean>(false);

  useEffect(() => {
    // Show section if wallet connected or demo param in URL
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    setSectionVisibility(isConnected || urlParams.get('demo') ? true : false);
  }, [isConnected]);

  useEffect(() => {
    //localStorage.clear(); // Use for testing
    localStorage.avatarV1 = JSON.stringify(darcel); // Update local storage

    // Change body bg color to match avatar
    if (darcel.background.indexOf('#') !== -1) {
      document.querySelector('html')!.style.backgroundColor = darcel.background;
    } else {
      document.querySelector('html')!.style.backgroundColor = ""; // Reset
    }
  }, [darcel]);

  return (
    <DarcelContext.Provider value={{ darcel, setDarcel }}>
      <div className="section" id="sectionWardrobe" style={{ display: !sectionVisibility ? "none" : "" }}>
        <WardrobeStage />
        <WardrobeViewer />
      </div>
    </DarcelContext.Provider>
  );
}

export default Wardrobe;