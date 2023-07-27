#!/usr/bin/env node
import chalk from 'chalk';
import { Octokit } from 'octokit';
import terminalLink from 'terminal-link';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
    .options({
        repo: {
            type: 'string',
            array: true,
            describe: 'Fetch the activity for this GitHub repository. Can be specified multiple times.',
        },
        org: {
            type: 'string',
            array: true,
            describe:
                'Fetch the activity for all repositories in this GitHub organization/all repositories of this user. Can be specified multiple times.',
        },

        token: {
            type: 'string',
            describe: 'The GitHub API token to use. If not specified, stricter rate limits apply.',
        },

        since: {
            type: 'string',
            describe: 'The date starting from which to fetch activity.',
        },
        until: {
            type: 'string',
            describe: 'The date until which to fetch activity.',
        },

        issues: {
            type: 'boolean',
            describe: 'Fetch issues. Use `--no-issues` to disable.',
            default: true,
        },
        pulls: {
            type: 'boolean',
            describe: 'Fetch pull requests. Use `--no-pulls` to disable.',
            default: true,
        },
        releases: {
            type: 'boolean',
            describe: 'Fetch releases. Use `--no-releases` to disable.',
            default: true,
        },
        commits: {
            type: 'boolean',
            describe: 'Fetch commits. Use `--no-commits` to disable.',
            default: false,
        },
    })
    .example(
        '$0 --org tweaselORG --org datenanfragen',
        'Fetch all activity for all repositories of the GitHub organizations `tweaselORG` and `datenanfragen`.'
    )
    .example(
        '$0 --org tweaselORG --repo datenanfragen/ghtivity',
        'Fetch all activity for all repositories of the GitHub organization `tweaselORG` and the repository `datenanfragen/ghtivity`.'
    )
    .example(
        '$0 --org tweaselORG --since 2023-07-01',
        'Fetch the activity for all repositories of the GitHub organization `tweaselORG` since July 1st, 2023.'
    )
    .example(
        '$0 --org tweaselORG --since 2023-04-01 --until 2023-07-01',
        'Fetch the activity for all repositories of the GitHub organization `tweaselORG` between April 1st, 2023 and July 1st, 2023.'
    )
    .example(
        '$0 --repo tweaselORG/ghtivity --no-issues --commits',
        'Fetch all activity for the repository `tweaselORG/ghtivity` except for issues but do include commits (which are not fetched by default).'
    )
    .parseSync();

const octokit = new Octokit({ userAgent: 'tweaselORG/ghtivity', auth: argv.token });

(async () => {
    const orgRepos = (
        await Promise.all(
            argv.org?.map(async (org) => {
                const isUser = (await octokit.rest.users.getByUsername({ username: org })).data.type === 'User';

                if (isUser) {
                    const { data: repos } = await octokit.rest.repos.listForUser({ username: org });
                    return repos.map((r) => r.full_name);
                }

                const { data: repos } = await octokit.rest.repos.listForOrg({ org });
                return repos.map((r) => r.full_name);
            }) || []
        )
    ).flat();

    const repos = [...new Set([...(argv.repo || []), ...orgRepos])];
    if (repos.length === 0) throw new Error('You need to specify repositories (using `--repo` and/or `--org`).');

    for (const r of repos) {
        const [owner, repo] = r.split('/');
        if (!owner || !repo) throw new Error(`Invalid repository name: ${r}`);

        const params = { owner, repo, since: argv.since, until: argv.until };

        const issues = argv.issues && (await octokit.rest.issues.listForRepo(params)).data;
        const pulls = argv.pulls && (await octokit.rest.pulls.list(params)).data;
        // Unfortunately, there is no way to filter releases by date.
        const releases =
            argv.releases &&
            (await octokit.rest.repos.listReleases(params)).data
                .filter((r) => !argv.since || new Date(r.created_at) >= new Date(argv.since))
                .filter((r) => !argv.until || new Date(r.created_at) <= new Date(argv.until));
        const commits = argv.commits && (await octokit.rest.repos.listCommits(params)).data;

        console.log(chalk.inverse(`Activity for ${terminalLink(r, `https://github.com/${r}`)}`));
        if (
            (!issues || issues.length === 0) &&
            (!pulls || pulls.length === 0) &&
            (!releases || releases.length === 0) &&
            (!commits || commits.length === 0)
        ) {
            console.log(chalk.italic('no activity in the specified time period\n\n'));
            continue;
        }

        console.log();

        if (issues && issues.length > 0) {
            console.log(chalk.bold('Issues:'));
            for (const issue of issues) {
                console.log(`- ${terminalLink(`${issue.title} (#${issue.number})`, issue.html_url)}`);
            }
        }

        if (pulls && pulls.length > 0) {
            console.log(chalk.bold('Pull requests:'));
            for (const pull of pulls) {
                console.log(`- ${terminalLink(`${pull.title} (#${pull.number})`, pull.html_url)}`);
            }
        }

        if (releases && releases.length > 0) {
            console.log(chalk.bold('Releases:'));
            for (const release of releases) {
                console.log(`- ${terminalLink(release.name || release.tag_name, release.html_url)}`);
            }
        }

        if (commits && commits.length > 0) {
            console.log(chalk.bold('Commits:'));
            for (const commit of commits) {
                console.log(
                    `- ${terminalLink(commit.commit.message?.split('\n')?.[0] || commit.sha, commit.html_url)}`
                );
            }
        }

        console.log('\n');
    }
})();
