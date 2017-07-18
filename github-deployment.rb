require 'octokit'
client = Octokit::Client.new(:access_token => ENV["GITHUB_ACCESS_TOKEN"])
repo = ENV["GITHUB_REPO"]
pr_number = ENV["GITHUB_PULL_REQUEST_NUMBER"]
branch_name = ENV["GIT_BRANCH"]
deployment = client.create_deployment(repo, ref, {environment: "staging", required_contexts:[], payload: { pull_request_number: pr_number}})
