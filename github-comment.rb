require 'octokit'
client = Octokit::Client.new(:access_token => ENV["GITHUB_ACCESS_TOKEN"])
repo = ENV["GITHUB_REPO"]
deployment_url = ENV["DEPLOYMENT_URL"]
branch_name = ENV["GIT_BRANCH"]
pr_number = client.get(deployment_url)[:payload][:pull_request_number]
client.add_comment(repo, pr_number, "### ✅ Branch was successfully deployed! 🎉\n- [Your branch](http://#{branch_name}.mobile.staging.snooguts.net) is available here 👉 http://#{branch_name}.mobile.staging.snooguts.net\n- All deployed branches [here](http://branches.mobile.staging.snooguts.net)")
