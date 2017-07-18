require 'octokit'
client = Octokit::Client.new(:access_token => ENV["GITHUB_ACCESS_TOKEN"])
repo = ENV["GITHUB_REPO"]
ref = ENV["GIT_REF"]
pr_number = ENV["GITHUB_PULL_REQUEST_NUMBER"]
branch_name = ENV["GIT_BRANCH_NAME"]
deployment = client.create_deployment(repo, ref, {environment: "staging", required_contexts:[]})
