import { CONTRACT_ADDRESS } from "../../constants";

const fetchCanClaimRewards = async (Tezos, balance, operationParams) => {
    const { serverName, packed, signed } = operationParams;
    if (!Tezos || !serverName || !packed || !signed ) {
        throw new Error("Tezos and operationParams are not initialized");
    };

    return new Promise(async (resolve, reject) => {
        try {
            const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
            const operation = await contract.methods
                .end_game(serverName, serverName, packed, signed)
                .toTransferParams({ storageLimit: 1000 });
            const { totalCost } = await Tezos.estimate.transfer(operation);
    
            const minimumBalanceToClaim = totalCost / 1e6;
    
            if (balance < minimumBalanceToClaim) {
                reject("Not Enough TEZ to Claim Rewards");
                return;
            };
    
            resolve(true);
        } catch (error) {
            if (error.message === "NOT_PARTICIPATED") {
                reject("Someone has already claimed rewards");
                return;
            };
    
            reject(error.message);
        };
    });
};

export default fetchCanClaimRewards;
