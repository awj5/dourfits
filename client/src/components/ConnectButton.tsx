import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { OverlayContext, OverlayContextType } from '../context/OverlayContext';

function ConnectButton(props: { label?: string }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { setOverlay } = useContext<OverlayContextType>(OverlayContext);
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams: URLSearchParams = new URLSearchParams(window.location.search);

  const connectClick = () => {
    setOverlay({ visible: true, title: 'Connect a Wallet' });
  }

  const disconnectClick = () => {
    if (window.confirm('Disconnect wallet?')) {
      disconnect();

      // Redirect to home if disconnecting from wardrobe
      if (location.pathname === '/wardrobe' && !urlParams.get('demo')) {
        navigate('/');
      }
    }
  }

  return <button onClick={ isConnected ? disconnectClick : connectClick } className="bigButton" style={{ paddingLeft: isConnected ? "16px" : "", paddingRight: isConnected ? "16px" : "" }}>{ isConnected ? `${ address!.substring(0, 4) }...${ address!.substring(address!.length - 4) }` : props.label ? props.label : 'Connect' }</button>;
}

export default ConnectButton;