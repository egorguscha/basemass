import { promises as fs } from "fs";

export const getBots = () => {
  return [
    {
      address: "0x99f8769c5da334479ac7dddbdf62249807b2d668",
      privateKey:
        "0x69db47482972318c17df774074821eddfd53ff2f0250e7a82c9670d352c8cf45",
      Mnemonic:
        "curve witness dignity roof furnace gorilla evidence upon address miss siege royal",
    },
    {
      address: "0xf0d9aa462b14915208fa2ca4e4cd57400ddb2b96",
      privateKey:
        "0x9abada83f4b90cc3730e4eb0e8976edd6667600485808e5a1794c5eba158cfbe",
      Mnemonic:
        "oyster quarter potato soap barely hedgehog february quick small tone rug badge",
    },
    {
      address: "0x654e798099ff4960031d817a21f13e55da9fa089",
      privateKey:
        "0x5a682cd0bafb59f80b462372ecc7fad9d5843e7a869f8cb8022e1c4f7808c758",
      Mnemonic:
        "mushroom ghost together lamp diesel opinion kiwi another oppose eyebrow episode planet",
    },
    {
      address: "0x8e3cfcdf7992301b1219b213631956863e08bf2a",
      privateKey:
        "0xd76619211cac30f78281b746ca06a10e7da7e0f54ab67c830600bbb818194aaa",
      Mnemonic:
        "baby obtain balcony betray coast flight name major cruel top expose blush",
    },
    {
      address: "0xeefa6ed822d5b1f344b99f756da600f0074dfae7",
      privateKey:
        "0xa9bbc29b8791b916d4765e04c29afe88ea17800aed94dcd268862211422adf46",
      Mnemonic:
        "addict orchard eyebrow word squirrel nest ticket round patrol return food alert",
    },
    {
      address: "0x4703521a4246078ec9519cd4e725ff6318f51aad",
      privateKey:
        "0x76549973f414a9e10f570324b643ca65358e2128bc2d50fb2fd570cf56cfebec",
      Mnemonic:
        "romance oven slush equip vocal ozone junk armor dry morning seat law",
    },
    {
      address: "0x8313a10fbc9c0d9303d49ad98956ecfdb1d7dafe",
      privateKey:
        "0xb797bcc455800bc24ea4693020a11f5b5be7d7e4eb0b16111929ed150fc2ea8a",
      Mnemonic:
        "minimum acid train double worth suggest stamp ankle world decline shrimp immense",
    },
    {
      address: "0xeb9a816e0c9ae9c410ea543d4d3a5413510e7360",
      privateKey:
        "0xc0602a943c5468c77280a9fcf576bc60e6e0b11853af765cfd219fbb7df6d729",
      Mnemonic:
        "surge maximum crouch basket capital loop cause pitch write erupt awful until",
    },
    {
      address: "0xa8385522b4fe42b5aeb810c6061374e40e610f41",
      privateKey:
        "0xb4ea4d4e3c3472a9722b2759fd4897ddfccdb65394d1059f79025215826977a0",
      Mnemonic:
        "foam desert traffic episode charge tissue box toss grab exercise jaguar wrestle",
    },
    {
      address: "0x3e3048dd1f9877c977e99e44fa4e66ce80dea9b6",
      privateKey:
        "0xa73f30e24a1b6bdfdb1bbb69469b5d996a6fe1698d2f521c98848b9eff9a4a04",
      Mnemonic:
        "dish allow nephew zebra fitness sunset fish cook mushroom giggle truth ranch",
    },
    {
      address: "0xef52e9b1e48fee631e987b9cb92a0340d418507e",
      privateKey:
        "0x1d4194bb45c6f18f5b941d8796069ccc5abefe6935d406ae47695c72a34a49c6",
      Mnemonic:
        "denial biology health coyote thing myself thunder warfare clutch nothing expire shed",
    },
  ];
};

export const getIntermediateAccounts = async () => {
  const fileContents = await fs.readFile(
    process.cwd() + "/intermediate_accounts.json",
    "utf8"
  );
  const parsedFile = JSON.parse(fileContents);

  return parsedFile;
};
