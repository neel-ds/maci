import { ContractStorage } from "../../helpers/ContractStorage";
import { Deployment } from "../../helpers/Deployment";
import { EContracts, IDeployParams } from "../../helpers/types";

const deployment = Deployment.getInstance();
const storage = ContractStorage.getInstance();

/**
 * Deploy step registration and task itself
 */
deployment
  .deployTask("full:deploy-maci", "Deploy MACI contract")
  .setAction(async ({ incremental, stateTreeDepth }: IDeployParams, hre) => {
    deployment.setHre(hre);
    const deployer = await deployment.getDeployer();

    const maciContractAddress = storage.getAddress(EContracts.MACI, hre.network.name);

    if (incremental && maciContractAddress) {
      return;
    }

    const poseidonT3ContractAddress = storage.mustGetAddress(EContracts.PoseidonT3, hre.network.name);
    const poseidonT4ContractAddress = storage.mustGetAddress(EContracts.PoseidonT4, hre.network.name);
    const poseidonT5ContractAddress = storage.mustGetAddress(EContracts.PoseidonT5, hre.network.name);
    const poseidonT6ContractAddress = storage.mustGetAddress(EContracts.PoseidonT6, hre.network.name);

    const maciContractFactory = await deployment.linkPoseidonLibraries(
      EContracts.MACI,
      poseidonT3ContractAddress,
      poseidonT4ContractAddress,
      poseidonT5ContractAddress,
      poseidonT6ContractAddress,
      deployer,
    );

    const constantInitialVoiceCreditProxyContractAddress = storage.mustGetAddress(
      EContracts.ConstantInitialVoiceCreditProxy,
      hre.network.name,
    );
    const freeForAllGatekeeperContractAddress = storage.mustGetAddress(
      EContracts.FreeForAllGatekeeper,
      hre.network.name,
    );
    const topupCreditContractAddress = storage.mustGetAddress(EContracts.TopupCredit, hre.network.name);
    const pollFactoryContractAddress = storage.mustGetAddress(EContracts.PollFactory, hre.network.name);
    const messageProcessorFactoryContractAddress = storage.mustGetAddress(
      EContracts.MessageProcessorFactory,
      hre.network.name,
    );
    const tallyFactoryContractAddress = storage.mustGetAddress(EContracts.TallyFactory, hre.network.name);
    const subsidyFactoryContractAddress = storage.mustGetAddress(EContracts.SubsidyFactory, hre.network.name);

    const maciContract = await deployment.deployContractWithLinkedLibraries(
      maciContractFactory,
      pollFactoryContractAddress,
      messageProcessorFactoryContractAddress,
      tallyFactoryContractAddress,
      subsidyFactoryContractAddress,
      freeForAllGatekeeperContractAddress,
      constantInitialVoiceCreditProxyContractAddress,
      topupCreditContractAddress,
      stateTreeDepth,
    );

    await storage.register({
      id: EContracts.MACI,
      contract: maciContract,
      args: [
        pollFactoryContractAddress,
        messageProcessorFactoryContractAddress,
        tallyFactoryContractAddress,
        subsidyFactoryContractAddress,
        freeForAllGatekeeperContractAddress,
        constantInitialVoiceCreditProxyContractAddress,
        topupCreditContractAddress,
        stateTreeDepth,
      ],
      network: hre.network.name,
    });
  });
