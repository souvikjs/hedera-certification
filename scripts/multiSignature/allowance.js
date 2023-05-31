const {
  Client,
  PrivateKey,
  Hbar,
  AccountBalanceQuery,
  TransferTransaction,
} = require('@hashgraph/sdk');
const { multiSignatureEnvPath } = require('../../lib/constants');
const { multiSignatureEnvSchema } = require('../../lib/schemas');
const { validate } = require('../../lib/helper');
require('dotenv').config({ path: multiSignatureEnvPath });

// Global Variables Declaration
try {
  validate(multiSignatureEnvSchema, process.env);
} catch (err) {
  console.log('ENV Validation Error');
  console.error(err.stack);
  process.exit(1);
}

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(process.env.MY_ACCOUNT_ID_PRIVATE_KEY);

const myAccountId2 = process.env.MY_ACCOUNT_ID_2;
const myPrivateKey2 = PrivateKey.fromString(process.env.MY_ACCOUNT_ID_2_PRIVATE_KEY);

const myAccountId3 = process.env.MY_ACCOUNT_ID_3;
const myPrivateKey3 = PrivateKey.fromString(process.env.MY_ACCOUNT_ID_3_PRIVATE_KEY);

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

const client2 = Client.forTestnet();
client2.setOperator(myAccountId2, myPrivateKey2);

async function UserAllowance() {
  const transaction = new TransferTransaction()
    .addApprovedHbarTransfer(myAccountId, new Hbar(-20))
    .addApprovedHbarTransfer(myAccountId3, new Hbar(20));
  console.log(`Doing transfer from ${myAccountId} to ${myAccountId3}`);
  const txId = await transaction.execute(client2);
  const receipt = await txId.getReceipt(client2);
  const transactionStatus = receipt.status;
  console.log('The transaction consensus status is ', transactionStatus);
  // Create the queries
  const queryMine = new AccountBalanceQuery().setAccountId(myAccountId);
  const queryOther = new AccountBalanceQuery().setAccountId(myAccountId3);
  const accountBalanceMine = await queryMine.execute(client2);
  const accountBalanceOther = await queryOther.execute(client2);
  console.log(
    `My account balance ${accountBalanceMine.hbars} HBar, other account balance ${accountBalanceOther.hbars}`,
  );
}

UserAllowance();
