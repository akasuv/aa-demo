"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supportedChains } from "@/lib/networks";
import {
  CyberAccount,
  CyberPaymaster,
  CyberBundler,
} from "@cyberlab/cyber-account";
import {
  createWalletClient,
  custom,
  type Hex,
  hexToBigInt,
  encodeFunctionData,
  parseUnits,
} from "viem";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
import { JsonViewer } from "@textea/json-viewer";
import { erc20ABI } from "@wagmi/core";
import Link from "next/link";

export default function Page() {
  const [cyberAccount, setCyberAccount] = React.useState<CyberAccount | null>(
    null,
  );

  const [gasCredit, setGasCredit] = React.useState(0);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control,
    reset,
  } = useForm<any>();
  const [selectedChain, setSelectedChain] = React.useState<any>();
  const [cyberBundler, setCyberBundler] = React.useState<CyberBundler>();
  const [cyberPaymaster, setCyberPaymaster] = React.useState<CyberPaymaster>();
  const [txHash, setTxHash] = React.useState<string>();
  const [isWaiting, setIsWaiting] = React.useState(false);
  const [transaction, setTransaction] = React.useState<any>();
  const [jwt, setJwt] = React.useState<string>("");
  const [appId, setAppId] = React.useState<string>("");

  const chainId = watch("chainId");
  const to = watch("to");
  const amount = watch("amount");
  const tokenAddress = watch("token");
  const enablePaymaster = watch("enablePaymaster");
  const enableBatch = watch("enableBatch");

  React.useEffect(() => {
    setSelectedChain(
      supportedChains.find((chain) => chain.id === Number(chainId)),
    );
  }, [chainId]);

  React.useEffect(() => {
    (async () => {
      if (!jwt || !appId) {
        return;
      }

      const cyberBundler = new CyberBundler({
        rpcUrl: "https://api.stg.cyberconnect.dev/cyberaccount/bundler/v1/rpc",
        appId: "ab23459a-32d7-4235-8129-77bd5de27fb1",
      });

      // Optional: Paymaster
      const cyberPaymaster = new CyberPaymaster({
        rpcUrl:
          "https://api.stg.cyberconnect.dev/cyberaccount/paymaster/v1/rpc",
        appId,
        generateJwt: () => Promise.resolve(jwt),
      });

      setCyberBundler(cyberBundler);
      setCyberPaymaster(cyberPaymaster);
    })();
  }, [jwt, appId]);

  React.useEffect(() => {
    (async () => {
      if (!cyberBundler || !chainId) {
        return;
      }

      const walletClient = createWalletClient({
        chain: supportedChains[0],
        // @ts-ignore
        transport: custom(window.ethereum),
      });

      const accounts = await walletClient.requestAddresses();
      const ownerAddress = accounts[0];

      const sign = async (message: Hex) => {
        return await walletClient.signMessage({
          account: ownerAddress,
          message: { raw: message },
        });
      };

      const cyberAccount = new CyberAccount({
        chain: {
          id: chainId,
          testnet: true,
          rpcUrl:
            "https://polygon-mumbai.g.alchemy.com/v2/4Zf2nuIda3juEnEvhNy-CSzljtU2FKuy",
        },
        owner: {
          address: ownerAddress,
          signMessage: sign,
        },
        bundler: cyberBundler,
        paymaster: cyberPaymaster,
      });

      setCyberAccount(cyberAccount);
    })();
  }, [cyberBundler, cyberPaymaster, chainId]);

  React.useEffect(() => {
    if (cyberAccount) {
      cyberAccount.paymaster
        ?.getUserCredit(cyberAccount.address, selectedChain?.id as number)
        .then(
          (res) =>
            res &&
            setGasCredit(
              // @ts-ignore
              hexToBigInt(res.balance as Hex).toString() / Math.pow(10, 6),
            ),
        );
    }
  }, [cyberAccount]);

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      setIsWaiting(true);
      if (!cyberAccount || !to) {
        return;
      }
      let uoHash: Hex | undefined;
      let transaction: any;

      if (tokenAddress === "0x0000000000000000000000000000000000000000") {
        transaction = {
          to,
          value: parseUnits(amount, 18),
          data: "0x",
        };
      } else {
        const encoded = encodeFunctionData({
          abi: erc20ABI,
          functionName: "transfer",
          args: [to, parseUnits(amount, 18)],
        });

        transaction = {
          to: tokenAddress,
          value: BigInt(0),
          data: encoded,
        };
      }
      setTransaction(transaction);

      uoHash = await cyberAccount.sendTransaction(
        enableBatch ? [transaction, transaction, transaction] : transaction,
        {
          disablePaymaster: !enablePaymaster,
        },
      );

      let txHash: any | undefined;

      while (uoHash && !txHash) {
        const result = await cyberAccount.bundler.getUserOperationReceipt(
          uoHash,
          cyberAccount.chain.id,
        );

        txHash = result?.receipt?.transactionHash;

        setTxHash(txHash);
      }
    } catch (error) {
      alert("An error occurred: " + JSON.stringify(error, null, 2));
    } finally {
      setIsWaiting(false);
    }
  };

  const handleReset = () => {
    reset({
      values: {
        to: "",
        amount: "",
        token: "",
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-y-4 pt-12">
      <h1 className="text-4xl font-black">CyberAccount Playground</h1>
      <div className="w-1/4 flex flex-col gap-y-4">
        <div className="flex items-center gap-x-4">
          <Label htmlFor="appId" className="text-right w-[80px]">
            App ID
          </Label>
          <Input
            placeholder="App ID"
            onChange={(e) => setAppId(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-x-4">
          <Label htmlFor="jwt" className="text-right w-[80px]">
            JWT
          </Label>
          <Input placeholder="jwt" onChange={(e) => setJwt(e.target.value)} />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} onReset={handleReset}>
        <main className="mt-8 flex gap-x-8 justify-center">
          <Card className="w-[500px] h-fit">
            <CardHeader>
              <div className="mb-4">
                <CardTitle>CyberAccount</CardTitle>
                <div>
                  <Button variant="link" className="p-0 h-fit">
                    <Link
                      href={
                        selectedChain?.blockExplorers.default.url +
                        "/address/" +
                        cyberAccount?.address
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {cyberAccount?.address}
                    </Link>
                  </Button>
                </div>
                <div className="flex flex-row items-center gap-2 mt-2">
                  <Badge className="text-xs font-normal">Owner</Badge>
                  <Button variant="link" className="p-0 text-xs h-fit">
                    <Link
                      href={
                        selectedChain?.blockExplorers.default.url +
                        "/address/" +
                        cyberAccount?.owner.address
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {cyberAccount?.owner.address}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="grid w-1/2 items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="network">Network</Label>
                    <Controller
                      name="chainId"
                      control={control}
                      defaultValue="420"
                      render={({ field }) => (
                        <Select {...field} onValueChange={field.onChange}>
                          <SelectTrigger id="chainId">
                            <SelectValue placeholder="Select a chain" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {supportedChains.map((chain) => (
                              <SelectItem key={chain.id} value={chain.id + ""}>
                                {chain.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-md font-semibold">Gas Credit</p>
                  <p className="text-right">$ {gasCredit}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />
              <div className="flex flex-col gap-y-4">
                <div className="flex gap-x-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="enableBatch"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="pm-mode">Batch</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="enablePaymaster"
                      control={control}
                      defaultValue={true}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="pm-mode">Enable Paymaster</Label>
                  </div>
                </div>
                {enableBatch && (
                  <p className="text-sm text-gray-500">
                    Batch transactions enabled, will send 3 of the same
                    transactions.
                  </p>
                )}
                <div>
                  <Label htmlFor="to">Send to</Label>
                  <Input placeholder="Address" {...register("to")} />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="token">Token</Label>
                  <Controller
                    name="token"
                    control={control}
                    // defaultValue=
                    render={({ field }) => (
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger id="token">
                          <SelectValue placeholder="Select a token" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem
                            value={"0x0000000000000000000000000000000000000000"}
                          >
                            {selectedChain?.nativeCurrency.symbol}
                          </SelectItem>
                          {selectedChain?.erc20List?.map((chain: any) => (
                            <SelectItem
                              key={chain.address}
                              value={chain.address + ""}
                            >
                              {chain.symbol}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="to">Amount</Label>
                  <Input placeholder="Amount" {...register("amount")} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="reset">
                Reset
              </Button>
              <Button type="submit">
                {isWaiting ? "Waiting..." : "Confirm"}
              </Button>
            </CardFooter>
          </Card>
          <div className="flex flex-col gap-y-4">
            <Card className="w-full h-fit">
              <CardHeader>
                <CardTitle>Transaction Detail</CardTitle>
              </CardHeader>
              <CardContent>
                <JsonViewer
                  value={{
                    cyberAccount: {
                      chianId: cyberAccount?.chain.id,
                      address: cyberAccount?.address,
                      owner: cyberAccount?.owner.address,
                      enablePaymaster: enablePaymaster,
                      enableBatch: enableBatch,
                    },
                    transaction: enableBatch
                      ? [transaction, transaction, transaction]
                      : transaction,
                  }}
                />
              </CardContent>
            </Card>
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Transaction Result</CardTitle>
              </CardHeader>
              <CardContent>
                {txHash ? (
                  <div className="flex gap-x-2 items-center">
                    <Badge className="text-xs font-normal">Hash</Badge>
                    <Button variant="link" className="p-0 h-fit">
                      <Link
                        href={
                          selectedChain?.blockExplorers.default.url +
                          "/tx/" +
                          txHash
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {txHash}
                      </Link>
                    </Button>
                  </div>
                ) : isWaiting ? (
                  <p>Waiting for transaction...</p>
                ) : (
                  <p>None</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </form>
    </div>
  );
}
