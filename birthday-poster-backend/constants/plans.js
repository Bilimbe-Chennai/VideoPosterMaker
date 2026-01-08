const PLANS = {
    BASIC: {
        name: 'Basic',
        price: 999,
        limits: {
            photos: 3000,
            shares: 2000,
            campaigns: 0
        }
    },
    PRO: {
        name: 'Pro',
        price: 2499,
        limits: {
            photos: 10000,
            shares: 8000,
            campaigns: 5
        }
    },
    PRO_PLUS: {
        name: 'Pro+',
        price: 4999,
        limits: {
            photos: Infinity,
            shares: Infinity,
            campaigns: Infinity
        }
    }
};

module.exports = PLANS;
