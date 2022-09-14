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
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sed libero tempor, posuere sem vel, efficitur libero. Fusce id justo non risus porta tristique et quis risus. Suspendisse sed massa metus. Donec vestibulum ex quis eros vulputate, a mattis turpis aliquet. Proin congue iaculis eros, id hendrerit arcu. Maecenas erat diam, volutpat ac viverra eu, pellentesque id nisi. In hac habitasse platea dictumst. Duis volutpat imperdiet lectus, vitae dignissim odio fringilla id.</p>
      <h3>How do I gain more XP?</h3>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sed libero tempor, posuere sem vel, efficitur libero. Fusce id justo non risus porta tristique et quis risus. Suspendisse sed massa metus. Donec vestibulum ex quis eros vulputate, a mattis turpis aliquet. Proin congue iaculis eros, id hendrerit arcu. Maecenas erat diam, volutpat ac viverra eu, pellentesque id nisi. In hac habitasse platea dictumst. Duis volutpat imperdiet lectus, vitae dignissim odio fringilla id.</p>
      <h3>How do I get more items for my wardrobe?</h3>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sed libero tempor, posuere sem vel, efficitur libero. Fusce id justo non risus porta tristique et quis risus. Suspendisse sed massa metus. Donec vestibulum ex quis eros vulputate, a mattis turpis aliquet. Proin congue iaculis eros, id hendrerit arcu. Maecenas erat diam, volutpat ac viverra eu, pellentesque id nisi. In hac habitasse platea dictumst. Duis volutpat imperdiet lectus, vitae dignissim odio fringilla id.</p>
      <h3>Can I download a fit to share on social media?</h3>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sed libero tempor, posuere sem vel, efficitur libero. Fusce id justo non risus porta tristique et quis risus. Suspendisse sed massa metus. Donec vestibulum ex quis eros vulputate, a mattis turpis aliquet. Proin congue iaculis eros, id hendrerit arcu. Maecenas erat diam, volutpat ac viverra eu, pellentesque id nisi. In hac habitasse platea dictumst. Duis volutpat imperdiet lectus, vitae dignissim odio fringilla id.</p>
    </div>
  )
}

export default FAQ;