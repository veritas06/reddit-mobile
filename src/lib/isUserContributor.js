export default function isUserContributor(user, subreddits) {
  return !!subreddits[`u_${user.uuid}`];
}
