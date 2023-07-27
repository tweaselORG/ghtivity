# ghtivity

> A command-line tool for displaying the activity in GitHub repositories in a certain time frame.

ghtivity is a CLI tools that allows you to fetch and display various types of activity (issues, pull requests, releases, commits) for one or more GitHub repositories in a given time period. You can specify the repositories by name or by organization/user, and you can filter the activity by type and date. We use ghtivity for writing our regular [devlogs](https://www.datarequests.org/devlog/).

![Screenshot showing the output of ghtivity. There are sections for multiple repositories in the tweaselORG organization. Some show activity in the form of issues, pull requests, and/or releases. One doesn't show any activity.](https://static.dacdn.de/img/screenshot-ghtivity.png)

## Installation

You can install ghtivity globally using yarn or npm:

```sh
yarn global add ghtivity
# or `npm i -g ghtivity`
```

## Usage

You can run ghtivity from the command line using the `ghtivity` command. You need to specify at least one repository (using `--repo`) or one organization/user (using `--org`) to fetch the activity for. You can also specify multiple repositories and/or organizations/users by repeating the options.

By default, ghtivity will fetch issues, pull requests, and releases for the specified repositories without a time filter. You can change this behavior by using the following options:

- `--since`: The date starting from which to fetch activity. The date should be in ISO 8601 format (`<year>-<month>-<day>` or `<year>-<month>-<day>T<hour>:<minutes>:<seconds>`).
- `--until`: The date until which to fetch activity. The date should be in ISO 8601 format (`<year>-<month>-<day>` or `<year>-<month>-<day>T<hour>:<minutes>:<seconds>`).
- `--no-issues`: Don't fetch issues.
- `--no-pulls`: Don't fetch pull requests.
- `--no-releases`: Don't fetch releases.
- `--commits`: Fetch commits. Use `--no-commits` to disable.

You can also provide a [GitHub personal access token](https://github.com/settings/tokens) (using `--token`) to increase the rate limit and access private repositories. For the latter, the token needs to have the `repo` scope, otherwise it doesn't need any scopes.

## Examples

Here are some examples of how to use ghtivity:

* Fetch all activity for all repositories of the GitHub organizations `tweaselORG` and `datenanfragen`:

  ```sh
  ghtivity --org tweaselORG --org datenanfragen
  ```

* Fetch all activity for all repositories of the GitHub organization `tweaselORG` and the repository `datenanfragen/ghtivity`:

  ```sh
  ghtivity --org tweaselORG --repo datenanfragen/ghtivity
  ```

* Fetch the activity for all repositories of the GitHub organization `tweaselORG` since July 1st, 2023:

  ```sh
  ghtivity --org tweaselORG --since 2023-07-01
  ```

* Fetch the activity for all repositories of the GitHub organization `tweaselORG` between April 1st, 2023 and July 1st, 2023:

  ```sh
  ghtivity --org tweaselORG --since 2023-04-01 --until 2023-07-01
  ```

* Fetch all activity for the repository `tweaselORG/ghtivity` except for issues but do include commits (which are not fetched by default):

  ```sh
  ghtivity --repo tweaselORG/ghtivity --no-issues --commits
  ```

## Help

Use `ghtivity --help` to display the help:

```
Options:
  --help      Show help                                                [boolean]
  --version   Show version number                                      [boolean]
  --repo      Fetch the activity for this GitHub repository. Can be specified
              multiple times.                                            [array]
  --org       Fetch the activity for all repositories in this GitHub
              organization/all repositories of this user. Can be specified
              multiple times.                                            [array]
  --token     The GitHub API token to use. If not specified, stricter rate
              limits apply.                                             [string]
  --since     The date starting from which to fetch activity.           [string]
  --until     The date until which to fetch activity.                   [string]
  --issues    Fetch issues. Use `--no-issues` to disable.
                                                       [boolean] [default: true]
  --pulls     Fetch pull requests. Use `--no-pulls` to disable.
                                                       [boolean] [default: true]
  --releases  Fetch releases. Use `--no-releases` to disable.
                                                       [boolean] [default: true]
  --commits   Fetch commits. Use `--no-commits` to disable.
                                                      [boolean] [default: false]

Examples:
  ghtivity --org tweaselORG                 Fetch all activity for all 
  --org datenanfragen                       repositories of the GitHub
                                            organizations `tweaselORG` and
                                            `datenanfragen`.
  ghtivity --org tweaselORG                 Fetch all activity for all 
  --repo datenanfragen/ghtivity             repositories of the GitHub
                                            organization `tweaselORG` and the
                                            repository `datenanfragen/ghtivity`.
  ghtivity --org tweaselORG                 Fetch the activity for all
  --since 2023-07-01                        repositories of the GitHub
                                            organization `tweaselORG` since
                                            July 1st, 2023.
  ghtivity --org tweaselORG                 Fetch the activity for all
  --since 2023-04-01 --until 2023-07-01     repositories of the GitHub
                                            organization `tweaselORG` between
                                            April 1st, 2023 and July 1st, 2023.
  ghtivity --repo tweaselORG/ghtivity       Fetch all activity for the
  --no-issues --commits                     repository `tweaselORG/ghtivity`
                                            except for issues but do include
                                            commits (which are not fetched by
                                            default).

```

## License

This code is licensed under the MIT license, see the [`LICENSE`](LICENSE) file for details.

Issues and pull requests are welcome! Please be aware that by contributing, you agree for your work to be licensed under an MIT license.
