import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { SecretChat, SecretChat__factory } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Fixture = {
  contract: SecretChat;
  address: string;
};

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture(): Promise<Fixture> {
  const factory = (await ethers.getContractFactory("SecretChat")) as SecretChat__factory;
  const contract = (await factory.deploy()) as SecretChat;
  const address = await contract.getAddress();
  return { contract, address };
}

describe("SecretChat", function () {
  let signers: Signers;
  let fixture: Fixture;

  before(async function () {
    const availableSigners = await ethers.getSigners();
    signers = {
      deployer: availableSigners[0],
      alice: availableSigners[1],
      bob: availableSigners[2],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("SecretChat tests require the FHEVM mock environment");
      this.skip();
    }

    fixture = await deployFixture();
  });

  it("registers and resolves usernames", async function () {
    const { contract } = fixture;

    await expect(contract.connect(signers.alice).registerUsername("alice"))
      .to.emit(contract, "UserRegistered")
      .withArgs(signers.alice.address, "alice");

    const stored = await contract.getUsername(signers.alice.address);
    expect(stored).to.equal("alice");

    const resolved = await contract.resolveUsername("alice");
    expect(resolved).to.equal(signers.alice.address);

    await expect(contract.connect(signers.bob).registerUsername("alice"))
      .to.be.revertedWith("Username unavailable");
  });

  it("sends messages with encrypted keys", async function () {
    const { contract, address } = fixture;

    await contract.connect(signers.alice).registerUsername("alice");
    await contract.connect(signers.bob).registerUsername("bob");

    await fhevm.initializeCLIApi();

    const clearKey = 12345678;
    const encryptedKey = await fhevm
      .createEncryptedInput(address, signers.alice.address)
      .add32(clearKey)
      .encrypt();

    await expect(
      contract
        .connect(signers.alice)
        .sendMessage(
          "bob",
          ethers.ZeroAddress,
          "ciphertext-data",
          encryptedKey.handles[0],
          encryptedKey.inputProof,
        ),
    )
      .to.emit(contract, "MessageSent")
      .withArgs(0, signers.alice.address, signers.bob.address, "bob");

    const metadata = await contract.getMessageMetadata(0);
    expect(metadata.sender).to.equal(signers.alice.address);
    expect(metadata.senderUsername).to.equal("alice");
    expect(metadata.recipient).to.equal(signers.bob.address);
    expect(metadata.recipientUsername).to.equal("bob");
    expect(metadata.ciphertext).to.equal("ciphertext-data");
    expect(metadata.timestamp).to.be.gt(0);

    const inbox = await contract.getInboxIds(signers.bob.address);
    expect(inbox).to.deep.equal([0n]);

    const outbox = await contract.getOutboxIds(signers.alice.address);
    expect(outbox).to.deep.equal([0n]);

    const storedKey = await contract.getEncryptedKey(0);

    const decryptedByRecipient = await fhevm.userDecryptEuint(FhevmType.euint32, storedKey, address, signers.bob);
    expect(decryptedByRecipient).to.equal(clearKey);

    const decryptedBySender = await fhevm.userDecryptEuint(FhevmType.euint32, storedKey, address, signers.alice);
    expect(decryptedBySender).to.equal(clearKey);
  });
});
