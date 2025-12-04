import { useState } from 'react';
import { openConnect, StacksMainnet } from '@stacks/connect';
import {
  callReadOnlyFunction,
  standardPrincipalCV,
  stringAsciiCV,
  principalCV,
  ClarityType
} from '@stacks/transactions';

const contractAddress = "ST1PQHQKV0RJQDZKYR4T6YVRQND4K41GC7S1B1KBT"; // Deployer address (for testnet/local)
const contractName = "cns-registrar";
const network = new StacksMainnet();

function App() {
  const [nameInput, setNameInput] = useState('');
  const [resolution, setResolution] = useState(null);

  const authenticate = () => {
    openConnect({
      appDetails: {
        name: 'Clarity Name Service',
        icon: window.location.origin + '/logo.svg',
      },
      onFinish: ({ authResponse }) => {
        // User is authenticated
        console.log("Authenticated:", authResponse);
      },
      userSession: null, // Use a proper user session in a real app
    });
  };

  const handleResolve = async () => {
    if (!nameInput) return;

    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'resolve-name',
        functionArgs: [stringAsciiCV(nameInput)],
        senderAddress: contractAddress, // Sender can be any principal for read-only
        network,
      });

      // The result is a Clarity Value, we need to decode it
      if (result.type === ClarityType.ResponseOk) {
        const resolutionData = result.value.value;
        setResolution({
          stacks: resolutionData.stacks_addr.value,
          btc: resolutionData.btc_addr.value ? resolutionData.btc_addr.value.value : 'N/A',
        });
      } else {
        setResolution({ error: 'Name not found or contract error.' });
      }

    } catch (error) {
      console.error(error);
      setResolution({ error: 'Failed to resolve name.' });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Clarity Name Service (CNS) Resolver</h1>
      <p>A Stacks L2 Identity Project for Code for STX</p>
      
      <button onClick={authenticate}>Connect Stacks Wallet</button>
      
      <hr />
      
      <h2>Resolve Name</h2>
      <input
        type="text"
        placeholder="e.g., satoshi"
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
      />
      <button onClick={handleResolve} style={{ marginLeft: '10px' }}>
        Resolve
      </button>

      {resolution && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
          {resolution.error ? (
            <p>Error: {resolution.error}</p>
          ) : (
            <>
              <h3>Resolution Result:</h3>
              <p>Stacks Address: <strong>{resolution.stacks}</strong></p>
              <p>BTC Address: <strong>{resolution.btc}</strong></p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
