# Glitch Deploy Tool

![cover](img/cover.png)

> A tool that makes Glitch a bit more convenient

## Introduction

[Glitch](https://glitch.com/) is great.
But for people who use Glitch to deploy their applications, it could be better.

Glitch supports importing projects from Github, but this only allows you to import from the default branch.
There are tools like [Sync Glitch CLI](https://github.com/glitch-tools/sync-glitch-cli) which allows you to import your Github repo to Glitch via a API call.

But what if you want to import your *local files* in a specific folder?
What if you can build on the fly and import the built binary to Glitch for production?

This is the tool for you.

## Prerequisite

Before you start using this tool, first, you need to allow pushes to your Glitch repository.
Details about this process can be found from [here](https://glitch.happyfox.com/kb/article/85-how-do-i-push-code-that-i-created-locally-to-my-project-on-glitch/).

But in short, you just have to type `git config receive.denyCurrentBranch updateInstead` on your Glitch project terminal and copy the repository link.

[todo: add more content]
