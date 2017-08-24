import config from 'config';
import isFakeSubreddit from 'lib/isFakeSubreddit';

const FRONTPAGE_NAME = 'frontpage';

const adSlots = {};

export const getSlotId = (listingName, subredditName) => {
  const parts = [config.dfpSlotPrefix];

  if (isFakeSubreddit(subredditName)) {
    parts.push(FRONTPAGE_NAME);
  } else {
    parts.push(`r.${subredditName}`);
  }

  parts.push(listingName);

  return parts.join('/');
};

export const defineSlot = (element, {
  id,
  slot,
  properties,
  shouldCollapse,
  sizes,
  // eslint-disable-next-line no-unused-vars
  a9 = false,
}) => {
  const googletag = (window.googletag = window.googletag || {});
  googletag.cmd = googletag.cmd || [];
  return new Promise(resolve => {
    googletag.cmd.push(function() {
      // make sure we don't try to create the same ad slot twice.
      destroySlot(slot);

      const adSlot = googletag
        .defineSlot(slot, sizes, id)
        .addService(googletag.pubads());

      // save a reference so we can look this up later.
      // outside of this closure we should always be using this
      // reference, not `adSlot`.
      adSlots[slot] = adSlot;

      if (shouldCollapse) {
        adSlot.setCollapseEmptyDiv(true);
      }

      Object.keys(properties).forEach(function(key) {
        adSlot.setTargeting(key, properties[key]);
      });

      const makeAdRequest = () => {
        googletag.cmd.push(function() {
          // slot was destroyed already
          if (!adSlots[slot]) {
            return;
          }

          googletag.display(id);
          googletag.pubads().refresh([adSlots[slot]]);
        });
        resolve();
      };

      makeAdRequest();
    });
  });
};

export const destroySlot = (slotId) => {
  const adSlot = adSlots[slotId];
  if (!adSlot) {
    return;
  }

  const googletag = (window.googletag = window.googletag || {});
  googletag.cmd = googletag.cmd || [];

  googletag.cmd.push(function() {
    googletag.destroySlots([adSlot]);
    delete adSlots[slotId];
  });
};

export const setupGoogleTag = () => {
  const googletag = (window.googletag = window.googletag || {});
  googletag.cmd = googletag.cmd || [];

  if (global.DO_NOT_TRACK) {
    return;
  }

  const gads = document.createElement('script');
  gads.async = true;
  gads.type = 'text/javascript';
  const useSSL = document.location.protocol === 'https:';
  gads.src = `${useSSL ? 'https:' : 'http:'
    }//www.googletagservices.com/tag/js/gpt.js`;
  const node = document.getElementsByTagName('script')[0];
  node.parentNode.insertBefore(gads, node);

  googletag.cmd.push(function() {
    googletag.pubads().disableInitialLoad();
    googletag.enableServices();
  });
};
