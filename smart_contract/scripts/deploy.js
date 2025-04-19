// scripts/deploy-upload.js
const hre = require("hardhat");

async function main() {
  // 1. Lấy factory của contract Upload
  const upload = await hre.ethers.deployContract("Upload");
  // const Upload = await hre.ethers.getContractFactory("Upload");
  // const upload = await Upload.deploy();
  
  // 2. Chờ cho contract được deploy xong
  await upload.waitForDeployment();
  // Nếu dùng .deployed() (ethers v5): await upload.deployed();

  // 3. In ra địa chỉ contract
  console.log(`Upload contract deployed to: ${upload.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
