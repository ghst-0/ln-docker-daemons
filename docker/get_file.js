import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';
import tar from 'tar-stream';

/** Get a file from inside a docker container

  {
    container: <Docker COntainer Object>
    path: <Path To File String>
  }

  @returns via cbk or Promise
  {
    file: <File Buffer Object>
  }
*/
const getFile = ({container, path}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!container) {
          return cbk([400, 'ExpectedContainerToGetFileFromDockerContainer']);
        }

        if (!path) {
          return cbk([400, 'ExpectedFilePathToGetFileFromDockerContainer']);
        }

        return cbk();
      },

      // Get archive
      getArchive: ['validate', ({}, cbk) => {
        return container.getArchive({path}, (err, stream) => {
          // Exit early when there are no files at the path
          if (err && err.statusCode === 404) {
            return cbk([404, 'FailedToFindFileAtPathInContainer']);
          }

          if (err) {
            return cbk([503, 'UnexpectedErrorGettingFileFromDocker', {err}]);
          }

          const entries = [];
          const extract = tar.extract();

          extract.once('entry', (header, stream, cbk) => {
            const parts = [];

            stream.on('data', part => parts.push(part));

            stream.once('end', () => {
              entries.push(Buffer.concat(parts));

              return cbk();
            });

            return stream.resume();
          });

          extract.once('finish', () => cbk(null, entries));

          stream.pipe(extract);
        });
      }],

      // Final resulting file
      file: ['getArchive', ({getArchive}, cbk) => {
        const [file] = getArchive;

        return cbk(null, {file});
      }],
    },
    returnResult({reject, resolve, of: 'file'}, cbk));
  });
};

export { getFile }
