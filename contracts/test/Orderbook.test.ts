import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const USDC_UNIT = 10n ** 6n;
const TOKEN_UNIT = 10n ** 18n;

describe("Orderbook", function () {
  async function deployFixture() {
    const [deployer, claimIssuer, maker, taker, outsider] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    const Registry = await ethers.getContractFactory("IdentityRegistry");
    const registry = await Registry.connect(deployer).deploy(claimIssuer.address);
    await registry.waitForDeployment();

    const Token = await ethers.getContractFactory("SecurityToken");
    const token = await Token.connect(deployer).deploy(
      "Kavak Premium",
      "KVK",
      await registry.getAddress(),
      0,
      ethers.parseEther("1000000"),
      "Kavak Premium",
      "Mobility",
      "Serie D"
    );
    await token.waitForDeployment();

    const Orderbook = await ethers.getContractFactory("Orderbook");
    const orderbook = await Orderbook.connect(deployer).deploy(
      await usdc.getAddress(),
      deployer.address
    );
    await orderbook.waitForDeployment();

    // Compliance setup: orderbook must be verified to escrow SecurityTokens.
    await registry
      .connect(claimIssuer)
      .addIdentity(await orderbook.getAddress(), "");
    await registry.connect(claimIssuer).addIdentity(maker.address, "MX");
    await registry.connect(claimIssuer).addIdentity(taker.address, "MX");

    // Starting balances.
    await token.connect(deployer).transfer(maker.address, ethers.parseEther("1000"));
    await token.connect(deployer).transfer(taker.address, ethers.parseEther("1000"));
    await usdc.mint(maker.address, 10_000n * USDC_UNIT);
    await usdc.mint(taker.address, 10_000n * USDC_UNIT);

    return { usdc, registry, token, orderbook, deployer, claimIssuer, maker, taker, outsider };
  }

  it("places a sell order and lets a taker fill it; fee accrues to the orderbook", async function () {
    const { usdc, token, orderbook, maker, taker } = await loadFixture(deployFixture);

    const amount = ethers.parseEther("100");
    const price = 15n * USDC_UNIT;
    const totalUsdc = (amount * price) / TOKEN_UNIT;
    const fee = (totalUsdc * 30n) / 10_000n;

    await token.connect(maker).approve(await orderbook.getAddress(), amount);
    await expect(
      orderbook.connect(maker).placeOrder(await token.getAddress(), false, amount, price)
    )
      .to.emit(orderbook, "OrderPlaced")
      .withArgs(0n, maker.address, await token.getAddress(), false, amount, price);

    expect(await token.balanceOf(await orderbook.getAddress())).to.equal(amount);
    expect(await token.balanceOf(maker.address)).to.equal(ethers.parseEther("900"));

    await usdc.connect(taker).approve(await orderbook.getAddress(), totalUsdc + fee);

    await expect(orderbook.connect(taker).fillOrder(0))
      .to.emit(orderbook, "OrderFilled")
      .withArgs(0n, taker.address, amount, totalUsdc, fee);

    expect(await token.balanceOf(taker.address)).to.equal(ethers.parseEther("1100"));
    expect(await usdc.balanceOf(maker.address)).to.equal(10_000n * USDC_UNIT + totalUsdc);
    expect(await usdc.balanceOf(taker.address)).to.equal(10_000n * USDC_UNIT - totalUsdc - fee);
    expect(await orderbook.feesAccrued()).to.equal(fee);
    expect(await usdc.balanceOf(await orderbook.getAddress())).to.equal(fee);

    const stored = await orderbook.getOrder(0);
    expect(stored.active).to.equal(false);
  });

  it("cancelOrder refunds the escrowed USDC to a buy-side maker", async function () {
    const { usdc, token, orderbook, maker } = await loadFixture(deployFixture);

    const amount = ethers.parseEther("50");
    const price = 20n * USDC_UNIT;
    const totalUsdc = (amount * price) / TOKEN_UNIT;

    await usdc.connect(maker).approve(await orderbook.getAddress(), totalUsdc);
    const usdcBefore = await usdc.balanceOf(maker.address);

    await orderbook
      .connect(maker)
      .placeOrder(await token.getAddress(), true, amount, price);
    expect(await usdc.balanceOf(maker.address)).to.equal(usdcBefore - totalUsdc);

    await expect(orderbook.connect(maker).cancelOrder(0))
      .to.emit(orderbook, "OrderCancelled")
      .withArgs(0n);

    expect(await usdc.balanceOf(maker.address)).to.equal(usdcBefore);
    expect(await usdc.balanceOf(await orderbook.getAddress())).to.equal(0n);
  });

  it("rejects cancelOrder from any address other than the maker", async function () {
    const { usdc, token, orderbook, maker, outsider } = await loadFixture(deployFixture);

    const amount = ethers.parseEther("10");
    const price = 12n * USDC_UNIT;
    const totalUsdc = (amount * price) / TOKEN_UNIT;

    await usdc.connect(maker).approve(await orderbook.getAddress(), totalUsdc);
    await orderbook
      .connect(maker)
      .placeOrder(await token.getAddress(), true, amount, price);

    await expect(
      orderbook.connect(outsider).cancelOrder(0)
    ).to.be.revertedWithCustomError(orderbook, "NotOrderMaker");
  });
});
