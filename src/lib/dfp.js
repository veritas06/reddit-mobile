import config from 'config';
import isFakeSubreddit from 'lib/isFakeSubreddit';

const FRONTPAGE_NAME = 'frontpage';

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
}) => {
  const googletag = (window.googletag = window.googletag || {});
  googletag.cmd = googletag.cmd || [];
  return new Promise(resolve => {
    googletag.cmd.push(function() {
      const adSlot = googletag
        .defineSlot(slot, sizes, id)
        .addService(googletag.pubads());

      if (shouldCollapse) {
        adSlot.setCollapseEmptyDiv(true);
      }

      Object.keys(properties).forEach(function(key) {
        adSlot.setTargeting(key, properties[key]);
      });

      googletag.display(id);
      googletag.pubads().refresh([adSlot]);

      resolve(adSlot);
    });
  });
};

export const destroySlot = (slot) => {
  const googletag = (window.googletag = window.googletag || {});
  googletag.cmd = googletag.cmd || [];

  googletag.cmd.push(function() {
    googletag.destroySlots([slot]);
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
