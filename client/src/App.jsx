import { useEffect, useState } from 'react';
import './App.css';
import { ethers } from "ethers";
import { contractAbi, contractAddress } from './utils/constants';
import FileUpload from './components/FileUpload'; 
import Files from './components/Files';
import UploadHistory from './components/UploadHistory';

function App() {
  const [account , setAccount] = useState('');
  const [contract , setContract] = useState(null);
  const [provider , setProvider] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);

  

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
  
    const autoConnect = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
  
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );
        setContract(contract);
        setProvider(provider);
      }
    };
  
    autoConnect();
  
    // Optional: Reload on network or account change
    window.ethereum?.on('chainChanged', () => window.location.reload());
    window.ethereum?.on('accountsChanged', () => window.location.reload());
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("signedFiles");
    if (stored) {
      setUploadHistory(JSON.parse(stored));
    }
  }, []);
  

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);

      setAccount(address);
      setProvider(provider);
      setContract(contract);

      console.log("Connected account:", address);
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT: App content (3/4) */}
      <div className="w-full md:w-3/4 px-4 py-6">
        <p className="text-5xl text-center text-black font-black mt-2 md:mt-[50px]">
          Blockchain Storage (Ethereum, IPFS)
        </p>
  
        <div className="mt-4 mb-6 flex center">
          <button
            onClick={connectWallet}
            className="px-6 py-2 bg-btn align-center text-white rounded hover:bg-green-700 transition"
          >
            {account ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>
  
        <p className="text-center" style={{ color: "black" }}>
          Account: {account ? account : "Not connected"}
        </p>
  
        {account && contract && provider && (
          <FileUpload
            account={account}
            provider={provider}
            contract={contract}
            setUploadHistory={setUploadHistory}
          />
        )}
  
        {account && contract && (
          <div className="sm:px-6 lg:px-8 py-5 md:py-10">
            <Files contract={contract} account={account} title="My Files" />
          </div>
        )}
        {account && contract && (
          <div className="sm:px-6 lg:px-8 py-5 md:py-10">
            <Files contract={contract} account={account} title="Shared With Me" shared="1" />
          </div>
        )}
      </div>
  
      {/* RIGHT: Upload History (1/4) */}
      <div className="hidden md:block w-1/4 border-l bg-gray-200 px-4 py-6 overflow-y-auto">
        <UploadHistory uploadHistory={uploadHistory} />
      </div>
    </div>
  );
}

export default App;
