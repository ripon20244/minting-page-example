// Take this data from your collection manifest
export const collection = {
  paymentAddress:
    "bc1ptg082sqegddsht6wzuxh5akwdd0ydtprqrw6u5nu0ytlruwkmghsf2nlkt",
  signerPublicKey:
    "0399764fc2dd350bc7fb6acedbd06160a79779aaddc1793a526e8d2fb386b5f287",
};

// Inscription Manifest
export const manifest = {
  protocol: { name: "BRC721", version: "0.4.0" },
  type: "inscription",
  content:
    '{"collectionInscriptionId":"8abc170f6ae5d300264e245dedd9faf7f1ba7da9029e05b08344ac5368d8d076i0","price":75000}',
  contentSignature:
    "3044022041f99e96d43d97a9ed9661770d73df229e5fb7a1d36f8d2878c72db36a4f147b022045bdd29db1436418d5ef081f60d89948cf08b7209cebf7e02381697a0bee5a49",
};
