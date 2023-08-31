"use client";
import React from "react";
import {
  CyberAccount,
  CyberBundler,
  CyberPaymaster,
} from "@cyberlab/cyber-account";
import {
  parseUnits,
  createWalletClient,
  custom,
  hexToBytes,
  type Hash,
} from "viem";
import { mainnet, optimismGoerli } from "viem/chains";
import { ethers } from "ethers";

export default function Home() {
  const [cyberAccount, setCyberAccount] = React.useState<CyberAccount>();

  React.useEffect(() => {
    (async () => {
      const walletClient = createWalletClient({
        chain: optimismGoerli,
        transport: custom((window as any).ethereum),
      });

      const sign = async (message: Hash) => {
        console.log("signing message", message);
        return await walletClient.signMessage({
          account: "0x370CA01D7314e3EEa59d57E343323bB7e9De24C6",
          message: { raw: message },
        });
      };

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const signx = async (message: Hash) => {
        const resx = await signer.signMessage(hexToBytes(message));
        console.log("resx", resx);
        return resx;
      };

      console.log("signer", signer.signMessage);

      // jwt: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZW5kZXIiOiIweDBmNDMyOEE2OEE4ZjBhNWExYzdkQmQ5MkExRDAyZjM0NDE5MzdEMjgiLCJhaWQiOiJhYjIzNDU5YS0zMmQ3LTQyMzUtODEyOS03N2JkNWRlMjdmYjEiLCJpc3MiOiJDeWJlckNvbm5lY3QiLCJleHAiOjIwMDg2NTU2MzksImlhdCI6MTY5MzI5NTYzOX0.kRneNtMAR84CCpo-VXnrMwLhQXTphPVEA_4wp-QN-qXKxPscLy3ZNS2JnDMmPVhJgkroOscZWFvTb0YfjZOwXQ",

      const generateJwt = async () => {
        console.log("fetching gwt");
        return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZW5kZXIiOiIweDBmNDMyOEE2OEE4ZjBhNWExYzdkQmQ5MkExRDAyZjM0NDE5MzdEMjgiLCJhaWQiOiJhYjIzNDU5YS0zMmQ3LTQyMzUtODEyOS03N2JkNWRlMjdmYjEiLCJpc3MiOiJDeWJlckNvbm5lY3QiLCJleHAiOjIwMDg2NTU2MzksImlhdCI6MTY5MzI5NTYzOX0.kRneNtMAR84CCpo-VXnrMwLhQXTphPVEA_4wp-QN-qXKxPscLy3ZNS2JnDMmPVhJgkroOscZWFvTb0YfjZOwXQ";
      };
      const cyberPaymaster = new CyberPaymaster({
        rpcUrl:
          "https://api.stg.cyberconnect.dev/cyberaccount/paymaster/v1/rpc",
        appId: "ab23459a-32d7-4235-8129-77bd5de27fb1",
        generateJwt: generateJwt,
      });

      const cyberBundler = new CyberBundler({
        rpcUrl: "https://api.stg.cyberconnect.dev/cyberaccount/bundler/v1/rpc",
        appId: "ab23459a-32d7-4235-8129-77bd5de27fb1",
      });

      const cyberAccount = new CyberAccount({
        owner: {
          address: "0x370CA01D7314e3EEa59d57E343323bB7e9De24C6",
          signMessage: sign,
        },
        chain: {
          id: 420,
          testnet: true,
          rpcUrl:
            "https://opt-goerli.g.alchemy.com/v2/4Zf2nuIda3juEnEvhNy-CSzljtU2FKuy",
        },
        bundler: cyberBundler,
        // paymaster: cyberPaymaster,
      });

      setCyberAccount(cyberAccount);
    })();
  }, []);

  const handleClick = async () => {
    cyberAccount
      ?.sendTransaction(
        {
          to: "0xe06d90913Cb563c2Ca208ea079F5e2D10B6D760D",
          value: parseUnits("0.00000042069", 18),
          data: "0x",
        }
        // {
        //   disablePaymaster: true,
        // }
      )
      .catch((e) => {
        alert(e.message);
      });
  };

  const list = async () => {
    const res = await cyberAccount?.paymaster?.listPendingUserOperations(
      cyberAccount.address
    );
    console.log("res", res);
  };

  const reject = async () => {
    const res = await cyberAccount?.paymaster?.rejectUserOperation(
      "0x22c759082c3dd774bbe1f3cc2ddb3c0bd4389c3eb4fd5bd0d7154aba1af96a31"
    );

    console.log(res);
  };

  const estimate = async () => {
    const res = await cyberAccount?.estimateTransaction({
      to: "0xe06d90913Cb563c2Ca208ea079F5e2D10B6D760D",
      value: parseUnits("0.000000420", 18),
      data: "0x",
    });

    console.log(res);
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div className="mb-8">
        <p>To: 0x370CA01D7314e3EEa59d57E343323bB7e9De24C6 </p>
        <p>Value: 0.000000420</p>
        <p>Data: 0x </p>
      </div>
      <div className="flex flex-col gap-y-8">
        <button className="btn" onClick={handleClick}>
          Send
        </button>
        <button className="btn" onClick={estimate}>
          Estimate
        </button>

        <button className="btn" onClick={list}>
          List pending user operations
        </button>
        <button className="btn" onClick={reject}>
          Reject
        </button>
      </div>
    </div>
  );
}
