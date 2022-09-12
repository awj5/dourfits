import { useContext } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { OverlayContext, OverlayContextType } from '../context/OverlayContext';

function ConnectButton(props: { label?: string }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { setOverlay } = useContext<OverlayContextType>(OverlayContext);

  const connectClick = () => {
    setOverlay({ visible: true, title: 'Connect a Wallet' });
  }

  const disconnectClick = () => {
    if (window.confirm('Disconnect wallet?')) {
      disconnect();
    }
  }

  return <button onClick={ isConnected ? disconnectClick : connectClick } className="bigButton">{ isConnected ? `${ address!.substring(0, 4) }...${ address!.substring(address!.length - 4) }` : props.label ? props.label : 'Connect' }</button>;
}

export default ConnectButton;