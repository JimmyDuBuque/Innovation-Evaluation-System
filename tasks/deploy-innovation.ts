import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploy-innovation", "Deploys the AnonymousInnovationEvaluation contract", async (_taskArgs: {}, hre: HardhatRuntimeEnvironment) => {
  console.log("Deploying AnonymousInnovationEvaluation...");

  const anonymousInnovationEvaluation = await hre.ethers.getContractFactory(
    "AnonymousInnovationEvaluation"
  );
  const contract = await anonymousInnovationEvaluation.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`AnonymousInnovationEvaluation deployed to: ${contractAddress}`);

  return contractAddress;
});
