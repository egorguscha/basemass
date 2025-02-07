const getHashes = (planetFxHash, collectionId) => {
    //---- do not edit the following code (you can indent as you wish)
    const alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
    // "oo" + Array(49).fill(0).map(_ => alphabet[(Math.random() * alphabet.length) | 0]).join('')
    const b58dec = (str) => {
        if (collectionId === 3808) {
            return str.split('').reduce((p, c, i) => p + alphabet.indexOf(c) * (Math.pow(alphabet.length, str.length - i - 1)), 0);
        };

        return [...str].reduce((p, c) => (p * alphabet.length + alphabet.indexOf(c)) | 0, 0)
    };

    const getRegEx = () => {
        if (collectionId === 3808) {
            return new RegExp(".{" + ((planetFxHash.length / 4) | 0) + "}", 'g');
        };

        return new RegExp(".{" + ((fxhashTrunc.length / 4) | 0) + "}", 'g');
    };

    const fxhashTrunc = planetFxHash.slice(2);
    const regex = getRegEx();
    const hashes = fxhashTrunc.match(regex).map(h => b58dec(h));
    //---- /do not edit the following code

    return hashes;
};

const sfc32 = (a, b, c, d) => {
    return () => {
        a |= 0; b |= 0; c |= 0; d |= 0
        var t = (a + b | 0) + d | 0
        d = d + 1 | 0
        a = b ^ b >>> 9
        b = c + (c << 3) | 0
        c = c << 21 | c >>> 11
        c = c + t | 0
        return (t >>> 0) / 4294967296
    }
};

export const getFxRandGenForHash = (planetFxHash, collectionId) => {
    const hashes = getHashes(planetFxHash, collectionId);
    return sfc32(...hashes);
};
