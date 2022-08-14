import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiConfig, createClient, defaultChains, configureChains } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import Layout from './Layout';
import Home from './pages/Home';
import Wardrobe from './pages/Wardrobe';
import './index.css';

window.Buffer = require('buffer').Buffer; // Polyfill to fix buffer not defined in WAGMI

const { chains, provider, webSocketProvider } = configureChains(defaultChains, [
  alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_ID }),
  publicProvider(),
]);

const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    })
  ],
  provider,
  webSocketProvider
});

export default function App() {
  return (
    <WagmiConfig client={ client }>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <Layout /> }>
            <Route index element={ <Home /> } />
            <Route path="wardrobe" element={ <Wardrobe /> } />
          </Route>
        </Routes>
      </BrowserRouter>
    </WagmiConfig>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);