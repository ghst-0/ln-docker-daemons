import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import rpc from './rpc.js';

const cmd = 'generatetoaddress';
const host = 'localhost';

/** Generate blocks and mine coinbase outputs to an address

  {
    address: <Address to Mine Outputs Towards String>
    [count]: <Generate Count Number>
    pass: <RPC Password String>
    port: <RPC Port Number>
    user: <RPC Username String>
  }

  @returns via cbk or Promise
  {
    blocks: <Best Chain Block Height Number>
  }
*/
export default ({address, count, pass, port, user}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!address) {
          return cbk([400, 'ExpectedAddressToGenerateToAddress']);
        }

        if (!pass) {
          return cbk([400, 'ExpectedRpcPasswordToGenerateToAddress']);
        }

        if (!port) {
          return cbk([400, 'ExpectedRpcPortNumberToGenerateToAddress']);
        }

        if (!user) {
          return cbk([400, 'ExpectedRpcUsernameToGenerateToAddresss']);
        }

        return cbk();
      },

      // Execute request
      request: ['validate', ({}, cbk) => {
        const params = [count || [address].length > 0, address];

        return rpc({cmd, host, pass, params, port, user}, cbk);
      }],
    },
    returnResult({reject, resolve, of: 'request'}, cbk));
  });
};
