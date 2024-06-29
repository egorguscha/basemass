import axios from 'axios';
import { BASE_TZKT_API_URL } from '../constants';

class PendingTransactions {
    constructor() {
        this.transactionsMap = new Map();
    }

    setTransaction(key, transactionHash) {
        console.log(`Saving pending transaction ${key}: ${transactionHash}`);
        this.transactionsMap.set(key, transactionHash);
    };

    removeTransaction(key) {
        console.log(`Removing pending transaction ${key}`);
        this.transactionsMap.delete(key);
    };

    isThereAPendingTransaction(key) {
        console.log(`Checking if pending transaction exists for ${key}`);
        return this.transactionsMap.has(key);
    };

    async isPendingTransactionConfirmed(key) {
        console.log(`Checking if pending transaction ${key} is confirmed...`);
        if(!this.transactionsMap.has(key)) {
            throw new Error("No pending transaction for this key");
        };

        const transactionHash = this.transactionsMap.get(key);

        const { data: isConfirmed } = await axios({
            method: "GET",
            url: `/v1/operations/transactions/${transactionHash}/status`,
            baseURL: BASE_TZKT_API_URL,
        });

        if (isConfirmed) {
            console.log(`Pending transaction ${key} confirmed!`);
            this.removeTransaction(key);
            return true;
        } else {
            console.log(`Pending transaction ${key} has not yet been confirmed`);
            return false;
        };
    };
};

export default PendingTransactions;
