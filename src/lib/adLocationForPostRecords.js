import { AD_LOCATION } from 'app/constants';

export default function(postRecords=[]) {
  return Math.min(AD_LOCATION, postRecords.length);
}

const canShowAdNextTo = post => {
  const value = !post.over18 && post.brandSafe;
  return value;
};

export const dfpAdLocationFromPosts = (posts = []) => {
  let location = null;
  for (let i = AD_LOCATION+1; i < posts.length; i++) {
    const currentPost = posts[i];
    const nextPost = posts[i+1];
    if (canShowAdNextTo(currentPost) && (!nextPost || canShowAdNextTo(nextPost))) {
      location = i;
      break;
    }
  }
  return location + 1;
};
