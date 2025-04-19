require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",

  networks: {
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/mQGdcgPVd4dT_16DXVr4OqnbHqEmtw9t',
      accounts: ['bdc96c89b44a9dcfecd339fad565f3b50e37b7a6bf16f48ab406ce1ab2f35c89'],
    },}
};
