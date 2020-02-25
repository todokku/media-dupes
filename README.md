<p align="center">
  <a href="#"><img src="https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/logo/128x128.png" width="128"></a>
</p>

<div align="center">
  <h1>media-dupes</h1>

a minimal content duplicator for common media services like youtube

available for:

![linux](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/platform/linux_32x32.png)
![apple](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/platform/apple_32x32.png)
![windows](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/platform/windows_32x32.png)

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0c30508f8add43ee8fbb62c2a669e76b)](https://www.codacy.com/manual/yafp/media-dupes?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=yafp/media-dupes&amp;utm_campaign=Badge_Grade)
[![AppVeyor Build status](https://ci.appveyor.com/api/projects/status/k4c1nve3xejgolbr?svg=true)](https://ci.appveyor.com/project/yafp/media-dupes)
[![Build Status](https://travis-ci.org/yafp/media-dupes.svg?branch=master)](https://travis-ci.org/yafp/media-dupes)
![npm audit](https://github.com/yafp/media-dupes/workflows/npm%20audit/badge.svg)
![GitHub Current Release](https://img.shields.io/github/release/yafp/media-dupes.svg?style=flat)
![GitHub Release Date](https://img.shields.io/github/release-date/yafp/media-dupes.svg?style=flat)
![GitHub Download All releases](https://img.shields.io/github/downloads/yafp/media-dupes/total.svg)
![GitHub Last Commit](https://img.shields.io/github/last-commit/yafp/media-dupes.svg?style=flat)
![GitHub Issues Open](https://img.shields.io/github/issues-raw/yafp/media-dupes.svg?style=flat)
[![GitHub contributors](https://img.shields.io/github/contributors/yafp/media-dupes.svg)](https://github.com/yafp//graphs/contributors/)
[![Merged PRs](https://img.shields.io/github/issues-pr-closed-raw/yafp/media-dupes.svg?label=merged+PRs)](https://github.com/yafp/media-dupes/pulls?q=is:pr+is:merged)
[![GitHub stars](https://img.shields.io/github/stars/yafp/media-dupes)](https://github.com/yafp/media-dupes/stargazers)
![GitHub License](https://img.shields.io/github/license/yafp/media-dupes.svg)
[![Discord](https://img.shields.io/discord/672401845855191040.svg)](https://discord.gg/gHnqdHy)

![ui](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/screenshots/ui_latest.png)

</div>


## about media-dupes
**media-dupes** can:

* download video
* download audio

Assuming the provided url is supported by `youtube-dl`.

**media-dupes** is:

* available for linux, macOS and windows.
* free and open source
* based on `electron`
* using bundled versions of `youtube-dl` and `ffmpeg` to do it's magic

## changelog
Please see the [changelog](docs/CHANGELOG.md) for more details.

## download
You'll find the latest releases [here](https://github.com/yafp/media-dupes/releases).

## install
Please see the [installation instructions](docs/INSTALL.md) for more details.

## updates
**media-dupes** checks on application launch if there is an update available.
Updates must be installed manually as automatic updating of electron applications requires that the builds are code-signed, which i can't provide so far.

## license
Please see the [LICENSE](LICENSE) for more details.

## privacy
* **media-dupes** is using sentry to collect error reports and do some anonymous usage stats. This helps heavily finding bugs which might occur only in some specific use-cases. Please see
* reporting is enabled by default, but can be disabled in the application settings UI.
* media-dupes is not tracking it's users (i.e. using Google Analytics or similar)
* no ip addresses are stored

Please check [here](docs/SENTRY.md) how **media-dupes** is using sentry and why.

## discussion
If you have question regarding **media-dupes** use one of the following options

* Github: click [here](https://github.com/yafp/media-dupes/issues) to create an issue
* Discord: click [here](https://discord.gg/gHnqdHy) to join the discord server
* Riot: click [here](https://riot.im/app/#/room/#media-dupes:matrix.org) to join the public **#media-dupes** riot.im room available on **matrix.org**.


## support / fund
If you want to support the development of **media-dupes** you can fund me on:

* [github](https://github.com/sponsors/yafp)
* [patreon](https://www.patreon.com/yafp)

## disclosure
**media-dupes** is not affiliated with any of the supported apps/services.

## developers
You are always welcome to check and even improve the code.

### jsdoc
The current jsdoc documentation can be found on [https://yafp.github.io/media-dupes/](https://yafp.github.io/media-dupes/).

### contributing
Please see the [contributing informations](docs/CONTRIBUTING.md) for more details.
A list of all contributors can be found [here](docs/CONTRIBUTORS.md).

### build
Building **media-dupes** yourself is pretty easy. Please see the [building instructions](docs/BUILD.md) for more details.
