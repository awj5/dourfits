import { useEffect } from 'react';
import './faq.css';

/* FAQ */

function FAQ() {
  useEffect(() => {
      document.querySelector('html')!.style.backgroundColor = ""; // Reset
  }, []);

  return (
    <div className="section" id="sectionFAQ">
      <h2>FAQ</h2>
      <h3>Do I need to own a Dour Darcels NFT to play?</h3>
      <p>Yes you must own at least one NFT from the <a href="https://opensea.io/collection/dourdarcels" target="_blank" rel="noreferrer">Dour Darcels</a>, <a href="https://opensea.io/collection/dourfits" target="_blank" rel="noreferrer">Dour Fits</a> or <a href="https://opensea.io/collection/colettexdourdarcels" target="_blank" rel="noreferrer">colette x Dour Darcels</a> collection.</p>
      <h3>How do I gain more XP?</h3>
      <p>200XP is automatically issued for each Dour Darcels or colette x Dour Darcels NFT you hold and 100XP for Dour Fits NFTs. Extra XP can be gained by participating in and winning events. If you acquire additional Darcel NFTs via marketplaces your XP will automatically update.</p>
      <h3>How do I get more items for my wardrobe?</h3>
      <p>Items in your wardrobe represent the traits of your Darcel NFTs. Additional item NFTs can be won in events or purchased on OpenSea.</p>
      <h3>Can I download a fit to share on social media?</h3>
      <p>Yes! Simply click the download button inside your wardrobe. Unfortunately downloading is not possible in the MetaMask mobile app.</p>
      <h3>Do all Arms and Tops traits work together?</h3>
      <p>Arms and Tops only work together in certain combinations e.g. all singlets and dresses work with arms like 'Dangly', 'Coffee' and 'Regular'. T-Shirts work with different arms altogether like 'Hands on Hips' and 'Peace'. Experiment and discover all of the combinations.</p>
    </div>
  )
}

export default FAQ;