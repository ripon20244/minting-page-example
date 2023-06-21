import * as params from "../params";

import { ec } from "elliptic";
import schema from "./InscriptionManifest.schema.json";
import schemaContent from "./InscriptionManifest.content.schema.json";
import { sha256 } from "js-sha256";
import toast from "react-hot-toast";
import { validate } from "jsonschema";

export const prepareInscription = ({ address }: { address: string }) => {
  let manifest;
  let manifestContent;

  try {
    manifest = params.manifest;
  } catch {
    toast.error("Invalid inscription manifest JSON");
    return;
  }

  try {
    manifestContent = JSON.parse(manifest.content);
  } catch {
    toast.error("Invalid inscription manifest content JSON");
    return;
  }

  if (!validate(manifest, schema).valid) {
    toast.error("Invalid inscription manifest");
    return;
  }

  if (!validate(manifestContent, schemaContent).valid) {
    toast.error("Invalid inscription manifest content");
    return;
  }

  if (manifestContent.initialOwnerAddress) {
    if (manifestContent.initialOwnerAddress !== address) {
      toast.error("Not allowed to inscribe for another user");
      return;
    }
  }

  // Verify signature
  const secp256k1 = new ec("secp256k1");
  const uncompressed = params.collection.signerPublicKey.length === 128;
  const signature = manifest.contentSignature;
  const verifyingKey = secp256k1.keyFromPublic(
    uncompressed
      ? `04${params.collection.signerPublicKey}`
      : params.collection.signerPublicKey,
    "hex"
  );

  const messageHash = sha256(Buffer.from(manifest.content, "utf8"));

  try {
    if (!verifyingKey.verify(messageHash, signature)) {
      toast.error("Bad signature");
      return;
    }
  } catch {
    toast.error("Bad signature");
    return;
  }

  return {
    price: manifestContent.price,
    paymentAddress: params.collection.paymentAddress,

    data: JSON.stringify(manifest, null, 0),
  };
};
