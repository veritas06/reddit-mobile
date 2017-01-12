import branch from 'branch-sdk';

import config from 'config';
import { STATIC_BRANCH_FIELDS, generateDynamicFields } from 'lib/branch';

export async function hasMobileApp() {
  return new Promise((resolve) => {
    branch.init(config.branchKey, (err, data) => {
      if (err) {
        // just ignore the error and say they don't have the app.
        resolve(false);
      }
      resolve(data.has_app);
    })
  })
}
