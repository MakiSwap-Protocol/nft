import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { BIG_TEN } from "./bigNumber";

/**
 * Take a formatted amount, e.g. 15 HT and convert it to full decimal value, e.g. 15000000000000000
 */
export const getDecimalAmount = (amount: BigNumber, decimals = 18) => {
  return new BigNumber(amount).times(BIG_TEN.pow(decimals));
};

export const getBalanceAmount = (amount: BigNumber, decimals = 18) => {
  return new BigNumber(amount).dividedBy(BIG_TEN.pow(decimals));
};

/**
 * This function is not really necessary but is used throughout the site.
 */
export const getBalanceNumber = (balance: BigNumber, decimals = 18) => {
  return getBalanceAmount(balance, decimals).toNumber();
};

export const getFullDisplayBalance = (
  balance: BigNumber,
  decimals = 18,
  decimalsToAppear?: number
) => {
  return getBalanceAmount(balance, decimals).toFixed(decimalsToAppear);
};

export const formatNumber = (
  number: number,
  minPrecision = 2,
  maxPrecision = 2
) => {
  const options = {
    minimumFractionDigits: minPrecision,
    maximumFractionDigits: maxPrecision,
  };
  return number.toLocaleString(undefined, options);
};

export const formatBigNumber = (
  number: ethers.BigNumber,
  displayDecimals = 18,
  decimals = 18
) => {
  const remainder = number.mod(
    ethers.BigNumber.from(10).pow(decimals - displayDecimals)
  );
  return formatUnits(number.sub(remainder), decimals);
};
