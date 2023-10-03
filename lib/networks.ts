import type { Chain } from "viem";
import {
  arbitrum,
  arbitrumGoerli,
  base,
  baseGoerli,
  bsc,
  bscTestnet,
  linea,
  lineaTestnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  scrollSepolia,
} from "viem/chains";
import erc20List from "./erc20List";

export const opBnbMainnet = {
  id: 204,
  name: "opBNB",
  network: "opBNB",
  rpcUrls: {
    public: {
      http: [
        "https://opbnb-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3",
      ],
    },
    default: {
      http: [
        `https://opbnb-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3`,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "BlockScout",
      url: "https://opbnbscan.com",
    },
  },
  nativeCurrency: bsc.nativeCurrency,
};

export const opBnbTestnet = {
  id: 5611,
  name: "opBNB Testnet",
  network: "opBNB testnet",
  rpcUrls: {
    public: {
      http: [
        "https://opbnb-testnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3",
      ],
    },
    default: {
      http: [
        `https://opbnb-testnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3`,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "BlockScout",
      url: "https://testnet.opbnbscan.com",
    },
  },
  nativeCurrency: bscTestnet.nativeCurrency,
};

const testnetChains = [
  { ...optimismGoerli, erc20List: erc20List[optimismGoerli.id] },
  polygonMumbai,
  baseGoerli,
  lineaTestnet,
  arbitrumGoerli,
  opBnbTestnet,
  scrollSepolia,
];

const mainnetChains = [optimism, polygon, base, linea, arbitrum, opBnbMainnet];

const supportedChains: Chain[] = [...testnetChains, ...mainnetChains];

export { supportedChains, testnetChains, mainnetChains };
