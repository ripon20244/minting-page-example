import { IS_TESTNET } from "@/consts";

export const getInscriptionLink = (hash: string) => {
  return IS_TESTNET
    ? `https://www.blockchain.com/explorer/transactions/btc-testnet/${hash}`
    : `https://www.blockchain.com/explorer/transactions/btc/${hash}`;
};
