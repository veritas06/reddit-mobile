import branch from 'branch-sdk';
import config from 'config';

export const hasMobileApp = async () => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => { 
      return resolve(false);
    }, 3000);

    branch.init(config.branchKey, (err, data) => {
      if (err) {
        // just ignore the error and
        // they don't have the app.
        resolve(false);
      } else if (data) {
        resolve(data.has_app);
      }
      clearInterval(timer);
    });
  });
};
