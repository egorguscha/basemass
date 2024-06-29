import PendingTransactions from '@utils/PendingTransactions';

class PendingBotTransactions {
    static #instance;

    constructor() {
        throw new Error("Use PendingBotTransactions.getInstance()");
    };

    static getInstance() {
        if (!PendingBotTransactions.#instance) {
            PendingBotTransactions.#instance = new PendingTransactions();
        };

        return PendingBotTransactions.#instance;
    };
};

export default PendingBotTransactions;
