import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;

  const deployment = await deploy("SecretChat", {
    from: deployer,
    log: true,
  });

  log(`SecretChat contract: ${deployment.address}`);
};
export default func;
func.id = "deploy_secretChat";
func.tags = ["SecretChat"];
