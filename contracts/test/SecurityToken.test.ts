import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("SecurityToken", function () {
  async function unlockedFixture() {
    const [deployer, claimIssuer, alice, bob] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("IdentityRegistry");
    const registry = await Registry.connect(deployer).deploy(claimIssuer.address);
    await registry.waitForDeployment();

    const Token = await ethers.getContractFactory("SecurityToken");
    const token = await Token.connect(deployer).deploy(
      "Kavak Premium",
      "KVK",
      await registry.getAddress(),
      0, // no lockup
      ethers.parseEther("1000000"),
      "Kavak Premium",
      "Mobility",
      "Serie D"
    );
    await token.waitForDeployment();

    return { registry, token, deployer, claimIssuer, alice, bob };
  }

  async function lockedFixture() {
    const [deployer, claimIssuer, alice] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("IdentityRegistry");
    const registry = await Registry.connect(deployer).deploy(claimIssuer.address);
    await registry.waitForDeployment();

    const now = await time.latest();
    const lockupEnd = now + 3600;

    const Token = await ethers.getContractFactory("SecurityToken");
    const token = await Token.connect(deployer).deploy(
      "Kavak Premium",
      "KVK",
      await registry.getAddress(),
      lockupEnd,
      ethers.parseEther("1000000"),
      "Kavak Premium",
      "Mobility",
      "Serie D"
    );
    await token.waitForDeployment();

    await registry.connect(claimIssuer).addIdentity(alice.address, "MX");

    return { registry, token, deployer, alice, lockupEnd };
  }

  it("transfers to verified investor when lockup is over", async function () {
    const { registry, token, deployer, claimIssuer, alice } = await loadFixture(
      unlockedFixture
    );

    await registry.connect(claimIssuer).addIdentity(alice.address, "MX");
    await expect(
      token.connect(deployer).transfer(alice.address, ethers.parseEther("100"))
    )
      .to.emit(token, "Transfer")
      .withArgs(deployer.address, alice.address, ethers.parseEther("100"));

    expect(await token.balanceOf(alice.address)).to.equal(ethers.parseEther("100"));
  });

  it("rejects transfer to a non-verified recipient", async function () {
    const { token, deployer, bob } = await loadFixture(unlockedFixture);

    await expect(
      token.connect(deployer).transfer(bob.address, ethers.parseEther("1"))
    ).to.be.revertedWithCustomError(token, "RecipientNotVerified");
  });

  it("rejects transfer while lockup is still active", async function () {
    const { token, deployer, alice } = await loadFixture(lockedFixture);

    await expect(
      token.connect(deployer).transfer(alice.address, ethers.parseEther("1"))
    ).to.be.revertedWithCustomError(token, "LockupActive");
  });
});
