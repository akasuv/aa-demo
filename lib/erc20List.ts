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

const erc20List = {
  [optimismGoerli.id]: [
    {
      address: "0x32307adfFE088e383AFAa721b06436aDaBA47DBE",
      symbol: "OUT-1",
      decimals: 18,
    },
    {
      address: "0xb378ed8647d67b5db6fd41817fd7a0949627d87a",
      symbol: "OUT-2",
      decimals: 18,
    },
    {
      address: "0x4e6597062c7dc988fbcfe77293d833bad770c19b",
      symbol: "OUT-3",
      decimals: 18,
    },
  ],
};

export default erc20List;
