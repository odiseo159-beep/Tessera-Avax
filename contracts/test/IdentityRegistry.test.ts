import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("IdentityRegistry", function () {
  async function deployFixture() {
    const [owner, claimIssuer, alice, bob] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("IdentityRegistry");
    const registry = await Registry.connect(owner).deploy(claimIssuer.address);
    await registry.waitForDeployment();
    return { registry, owner, claimIssuer, alice, bob };
  }

  it("claim issuer adds an identity and isVerified returns true", async function () {
    const { registry, claimIssuer, alice } = await loadFixture(deployFixture);

    await expect(registry.connect(claimIssuer).addIdentity(alice.address, "MX"))
      .to.emit(registry, "IdentityAdded")
      .withArgs(alice.address, "MX");

    expect(await registry.isVerified(alice.address)).to.equal(true);
    expect(await registry.country(alice.address)).to.equal("MX");
  });

  it("rejects addIdentity from any address other than the claim issuer", async function () {
    const { registry, owner, alice } = await loadFixture(deployFixture);

    await expect(
      registry.connect(owner).addIdentity(alice.address, "MX")
    ).to.be.revertedWithCustomError(registry, "NotClaimIssuer");
  });
});
