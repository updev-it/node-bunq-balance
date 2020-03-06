require('dotenv').config();

const setup = require('../dist/common/setup');

setup()
  .then(async BunqClient => {
    const accountParser = ({ MonetaryAccountBank, MonetaryAccountSavings, MonetaryAccountJoint }) => ({
      ...(MonetaryAccountBank && { ...MonetaryAccountBank }),
      ...(MonetaryAccountSavings && { ...MonetaryAccountSavings }),
      ...(MonetaryAccountJoint && { ...MonetaryAccountJoint })
    });

    const getMonetaryAccounts = async userid => {
      return BunqClient.api.monetaryAccount.list(userid);
    };

    // get user info connected to this account
    const users = await BunqClient.getUsers(true);

    // get the direct user object
    const { id: userId } = users[Object.keys(users)[0]];

    // get active accounts list
    const accounts = await getMonetaryAccounts(userId);
    const activeAccounts = accounts.reduce((acc, account) => {
      const { id, display_name: name, description, status } = accountParser(account);
      if (status === 'ACTIVE') {
        return acc.concat({ id, name, description });
      } else {
        return acc;
      }
    }, []);

    for (let account of activeAccounts) {
      console.log(account);
    }
  })
  .catch(error => {
    console.log(error);
    if (error.response) {
      console.log(error.response.data);
    }
  })
  .finally(() => process.exit());
