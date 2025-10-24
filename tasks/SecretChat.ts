import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

const getDeployment = async (hre: any, addressOverride?: string) => {
  if (addressOverride) {
    return { address: addressOverride };
  }
  return hre.deployments.get("SecretChat");
};

task("task:secretchat:address", "Prints the SecretChat deployment address").setAction(async (_args, hre) => {
  const deployment = await getDeployment(hre);
  console.log(`SecretChat address: ${deployment.address}`);
});

task("task:secretchat:register", "Registers or updates current wallet username")
  .addParam("username", "Username to register")
  .addOptionalParam("address", "SecretChat contract address")
  .setAction(async (taskArguments: TaskArguments, hre) => {
    const deployment = await getDeployment(hre, taskArguments.address);
    const { ethers } = hre;

    const signer = (await ethers.getSigners())[0];
    const contract = await ethers.getContractAt("SecretChat", deployment.address);

    const tx = await contract.connect(signer).registerUsername(taskArguments.username);
    console.log(`Waiting for tx: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Username registered. status=${receipt?.status}`);
  });

task("task:secretchat:send", "Sends an encrypted message")
  .addParam("ciphertext", "Encrypted message payload")
  .addParam("key", "Symmetric key as integer (will be encrypted)")
  .addOptionalParam("recipient", "Recipient wallet address")
  .addOptionalParam("username", "Recipient username")
  .addOptionalParam("address", "SecretChat contract address")
  .setAction(async (taskArguments: TaskArguments, hre) => {
    const deployment = await getDeployment(hre, taskArguments.address);
    const { ethers, fhevm } = hre;

    const keyValue = BigInt(taskArguments.key);
    if (keyValue < 0n || keyValue > 0xffffffffn) {
      throw new Error("Key must be between 0 and 2^32-1");
    }

    await fhevm.initializeCLIApi();

    const signer = (await ethers.getSigners())[0];
    const contract = await ethers.getContractAt("SecretChat", deployment.address, signer);

    const encryptedKey = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .add32(Number(keyValue))
      .encrypt();

    const tx = await contract.sendMessage(
      taskArguments.username ?? "",
      taskArguments.recipient ?? ethers.ZeroAddress,
      taskArguments.ciphertext,
      encryptedKey.handles[0],
      encryptedKey.inputProof,
    );

    console.log(`Waiting for tx: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Message sent. status=${receipt?.status}`);
  });

task("task:secretchat:decrypt-key", "Decrypts an encrypted key for a message")
  .addParam("messageid", "Message identifier")
  .addOptionalParam("address", "SecretChat contract address")
  .setAction(async (taskArguments: TaskArguments, hre) => {
    const deployment = await getDeployment(hre, taskArguments.address);
    const { ethers, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const contract = await ethers.getContractAt("SecretChat", deployment.address);
    const encryptedKey = await contract.getEncryptedKey(taskArguments.messageid);

    const signer = (await ethers.getSigners())[0];
    const clearKey = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedKey,
      deployment.address,
      signer,
    );

    console.log(`Encrypted key: ${encryptedKey}`);
    console.log(`Clear key    : ${clearKey}`);
  });

task("task:secretchat:inbox", "Lists inbox message identifiers for signer")
  .addOptionalParam("address", "SecretChat contract address")
  .setAction(async (taskArguments: TaskArguments, hre) => {
    const deployment = await getDeployment(hre, taskArguments.address);
    const { ethers } = hre;

    const signer = (await ethers.getSigners())[0];
    const contract = await ethers.getContractAt("SecretChat", deployment.address);

    const ids = await contract.getInboxIds(signer.address);
    console.log(`Inbox for ${signer.address}: ${ids}`);
  });
