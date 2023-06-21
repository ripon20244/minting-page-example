"use client";

import toast, { Toaster } from "react-hot-toast";

import { prepareInscription } from "./utils/prepareInscription";
import { useOrdinalSafe } from "./hooks/useOrdinalSafe";

export default function Home() {
  const wallet = useOrdinalSafe();

  const inscribe = async () => {
    if (!wallet.wallet) {
      toast.error("No wallet connected");
      return;
    }

    const [userAddress] = await wallet.wallet.requestAccounts();
    const inscription = prepareInscription({
      address: userAddress,
    });

    if (inscription) {
      wallet.inscribe(inscription.data, [
        {
          fee: inscription.price,
          receiver: inscription.paymentAddress,
        },
      ]);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      {(() => {
        if (wallet.injection.isError) {
          return (
            <div>
              {wallet.injection.error}.{" "}
              <a
                target="_blank"
                href="https://ordinalsafe.xyz"
                className="text-white underline hover:no-underline"
              >
                Download from the official page.
              </a>
            </div>
          );
        }

        if (wallet.initialization.isError) {
          return <div>{wallet.initialization.error}</div>;
        }

        if (wallet.injection.isSuccess && wallet.initialization.isIdle) {
          return <button onClick={wallet.initialize}>Connect wallet</button>;
        }

        if (wallet.initialization.isSuccess) {
          return <button onClick={inscribe}>Inscribe</button>;
        }
      })()}

      {wallet.inscriptionManifest.data?.reveal ? (
        <div className="mt-4">
          <a
            target="_blank"
            className="text-white underline hover:no-underline"
            href={`https://www.blockchain.com/explorer/transactions/btc/${wallet.inscriptionManifest.data.reveal}`}
          >
            {wallet.inscriptionManifest.data.reveal}
          </a>
        </div>
      ) : null}
      <Toaster />
    </main>
  );
}
