"use client";

import toast, { Toaster } from "react-hot-toast";

import { ec } from "elliptic";
import schema from "./InscriptionManifest.schema.json";
import schemaContent from "./InscriptionManifest.content.schema.json";
import { sha256 } from "js-sha256";
import { useOrdinalSafe } from "./useOrdinalSafe";
import { validate } from "jsonschema";

// Take from the collection manifest
const collection = {
  paymentAddress:
    "bc1ptg082sqegddsht6wzuxh5akwdd0ydtprqrw6u5nu0ytlruwkmghsf2nlkt",
  signerPublicKey:
    "0399764fc2dd350bc7fb6acedbd06160a79779aaddc1793a526e8d2fb386b5f287",
};

const token = {
  protocol: { name: "BRC721", version: "0.4.0" },
  type: "inscription",
  content:
    '{"collectionInscriptionId":"8abc170f6ae5d300264e245dedd9faf7f1ba7da9029e05b08344ac5368d8d076i0","price":75000}',
  contentSignature:
    "3044022041f99e96d43d97a9ed9661770d73df229e5fb7a1d36f8d2878c72db36a4f147b022045bdd29db1436418d5ef081f60d89948cf08b7209cebf7e02381697a0bee5a49",
};

const inscriptionJSON = JSON.stringify(token, null, 0);

export default function Home() {
  const wallet = useOrdinalSafe();

  const inscribe = async () => {
    let inscription;
    let inscriptionContent;

    try {
      inscription = JSON.parse(inscriptionJSON);
    } catch {
      toast.error("Invalid inscription JSON");
      return;
    }

    try {
      inscriptionContent = JSON.parse(inscription.content);
    } catch {
      toast.error("Invalid inscription content JSON");
      return;
    }

    if (!wallet.wallet) {
      toast.error("No wallet connected");
      return;
    }

    const [userAddress] = await wallet.wallet.requestAccounts();

    if (!validate(inscription, schema).valid) {
      toast.error("Invalid inscription manifest");
      return;
    }

    if (!validate(inscriptionContent, schemaContent).valid) {
      toast.error("Invalid inscription manifest content");
      return;
    }

    if (inscriptionContent.initialOwnerAddress) {
      if (inscriptionContent.initialOwnerAddress !== userAddress) {
        toast.error("Not allowed to inscribe for another user");
        return;
      }
    }

    // Verify signature
    const secp256k1 = new ec("secp256k1");
    const uncompressed = collection.signerPublicKey.length === 128;
    const signature = inscription.contentSignature;
    const verifyingKey = secp256k1.keyFromPublic(
      uncompressed
        ? `04${collection.signerPublicKey}`
        : collection.signerPublicKey,
      "hex"
    );
    const messageHash = sha256(Buffer.from(inscription.content, "utf8"));

    try {
      if (!verifyingKey.verify(messageHash, signature)) {
        toast.error("Bad signature");
        return;
      }
    } catch {
      toast.error("Bad signature");
      return;
    }

    wallet.inscribe(inscriptionJSON, [
      { fee: inscriptionContent.price, receiver: collection.paymentAddress },
    ]);
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
                className="link"
                href="https://ordinalsafe.xyz"
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
