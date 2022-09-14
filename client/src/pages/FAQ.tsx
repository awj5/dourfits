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
      <p>Yes you must own at least one NFT from the <a href="https://opensea.io/collection/dourdarcels" target="_blank">Dour Darcels</a>, <a href="https://opensea.io/collection/dourfits" target="_blank">Dour Fits</a> or <a href="https://opensea.io/collection/colettexdourdarcels" target="_blank">colette x Dour Darcels</a>.</p>
      <h3>How do I gain more XP?</h3>
      <p>200XP is automatically issued for each Dour Darcels or colette x Dour Darcels NFT you hold and 100XP for Dour Fits NFTs. Extra XP can be gained via participating in and winning events.</p>
      <h3>How do I get more items for my wardrobe?</h3>
      <p>Item NFTs can be won in events or purchased on OpenSea.</p>
      <h3>Can I download a fit to share on social media?</h3>
      <p>Yes! Simply click the download button inside the wardrobe. Unfortunatley downloading is not possible in the MetaMask mobile app.</p>
    </div>
  )
}

export default FAQ;