import asyncAuto from 'async/auto.js';
import asyncEach from 'async/each.js';
import { returnResult } from 'asyncjs-util';

const {isArray} = Array;

/** Kill multiple spawned Docker daemons

  {
    dockers: [{
      kill: ({}, cbk) => <Kill Container Promise>
    }]
  }

  @returns via cbk or Promise
*/
export default ({dockers}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isArray(dockers)) {
          return cbk([400, 'ExpectedArrayOfDockersToKill']);
        }

        return cbk();
      },

      // Kill the dockers
      kill: ['validate', ({}, cbk) => {
        return asyncEach(dockers, (docker, cbk) => docker.kill({}, cbk), cbk);
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
