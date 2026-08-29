# Changelog

## [0.16.3](https://github.com/marcelorodrigo/development-crew/compare/v0.16.2...v0.16.3) (2026-08-29)


### Bug Fixes

* **opencode:** replace destructive auto-update with safe reification ([#155](https://github.com/marcelorodrigo/development-crew/issues/155)) ([00c8ec2](https://github.com/marcelorodrigo/development-crew/commit/00c8ec23e1752965b7398501406f81ae640255ae))

## [0.16.2](https://github.com/marcelorodrigo/development-crew/compare/v0.16.1...v0.16.2) (2026-08-29)


### Bug Fixes

* document native skill invocation ([#153](https://github.com/marcelorodrigo/development-crew/issues/153)) ([9881d65](https://github.com/marcelorodrigo/development-crew/commit/9881d651883b29828165e6aba497591554131248))

## [0.16.1](https://github.com/marcelorodrigo/development-crew/compare/v0.16.0...v0.16.1) (2026-08-28)


### Bug Fixes

* **opencode:** move plugin source out of auto-discovery ([#150](https://github.com/marcelorodrigo/development-crew/issues/150)) ([ec730ad](https://github.com/marcelorodrigo/development-crew/commit/ec730ade442a4b2b7a8b906c334bc2d81310172f))

## [0.16.0](https://github.com/marcelorodrigo/development-crew/compare/v0.15.0...v0.16.0) (2026-08-28)


### Features

* **opencode:** publish plugin package and auto-update ([#147](https://github.com/marcelorodrigo/development-crew/issues/147)) ([a10faaf](https://github.com/marcelorodrigo/development-crew/commit/a10faafd8579726540d8189672c2c92c28d0cec8))


### Bug Fixes

* remove fixed package version assertion ([#149](https://github.com/marcelorodrigo/development-crew/issues/149)) ([d6e0648](https://github.com/marcelorodrigo/development-crew/commit/d6e06481b3faa578aec5af0df18d67110bd94936))

## [0.15.0](https://github.com/marcelorodrigo/development-crew/compare/development-crew-v0.14.2...development-crew-v0.15.0) (2026-08-21)


### Features

* **implementer:** require task list before implementation ([#144](https://github.com/marcelorodrigo/development-crew/issues/144)) ([3db5f31](https://github.com/marcelorodrigo/development-crew/commit/3db5f314b16a0126204c1bcec2b1b59e5e6d17b3))

## [0.14.2](https://github.com/marcelorodrigo/development-crew/compare/development-crew-v0.14.1...development-crew-v0.14.2) (2026-07-30)


### Bug Fixes

* **codex:** Repair SessionStart hook execution ([#139](https://github.com/marcelorodrigo/development-crew/issues/139)) ([62dd923](https://github.com/marcelorodrigo/development-crew/commit/62dd923c542aef65ac5a04624e33948506c3b9d7))

## [0.14.1](https://github.com/marcelorodrigo/development-crew/compare/development-crew-v0.14.0...development-crew-v0.14.1) (2026-06-27)


### Bug Fixes

* **omp:** use GitHub repo as source in OMP marketplace manifest ([#131](https://github.com/marcelorodrigo/development-crew/issues/131)) ([ecd8bdb](https://github.com/marcelorodrigo/development-crew/commit/ecd8bdb42fe66e55826988dd9c4cc9aac3ec0d3a))

## [0.14.0](https://github.com/marcelorodrigo/development-crew/compare/development-crew-v0.13.0...development-crew-v0.14.0) (2026-06-24)


### ⚠ BREAKING CHANGES

* Restructure to multi-harness plugin ([#115](https://github.com/marcelorodrigo/development-crew/issues/115))
* migrate to skills-first architecture ([#111](https://github.com/marcelorodrigo/development-crew/issues/111))
* Add dc- prefix to agent identifiers and display names ([#70](https://github.com/marcelorodrigo/development-crew/issues/70))

### Features

* Add dc- prefix to agent identifiers and display names ([#70](https://github.com/marcelorodrigo/development-crew/issues/70)) ([1e7a7d2](https://github.com/marcelorodrigo/development-crew/commit/1e7a7d28f79f6cbc7a755c129cb8f04536523e5c))
* Add OpenSpec integration with skills and commands ([#45](https://github.com/marcelorodrigo/development-crew/issues/45)) ([06bef4e](https://github.com/marcelorodrigo/development-crew/commit/06bef4eec2d484f0eb06be8a148f4b022ba7c86e))
* **agents:** Add permission frontmatter to expose question tool ([#82](https://github.com/marcelorodrigo/development-crew/issues/82)) ([b8c60bd](https://github.com/marcelorodrigo/development-crew/commit/b8c60bd79c4daa698c5269676f2b9cd6bc5159a6))
* **agents:** Migrate to domain-agnostic, skill-aware pipeline prompts ([#10](https://github.com/marcelorodrigo/development-crew/issues/10)) ([18ab419](https://github.com/marcelorodrigo/development-crew/commit/18ab4190da76127f2fd13f4ac1bbe1b4aa570662))
* Centralize question tool format ([#121](https://github.com/marcelorodrigo/development-crew/issues/121)) ([8f8014e](https://github.com/marcelorodrigo/development-crew/commit/8f8014ef1f6827307bb6b9c4609c5c515f1ce625))
* Development crew openspec ([#30](https://github.com/marcelorodrigo/development-crew/issues/30)) ([3051c6e](https://github.com/marcelorodrigo/development-crew/commit/3051c6e3767f248f38b1a202e4ff86e7eafbfcb1))
* extract shared design principles into common preamble ([#88](https://github.com/marcelorodrigo/development-crew/issues/88)) ([e253b27](https://github.com/marcelorodrigo/development-crew/commit/e253b27f7e35c5ccf62b39a89094e6d0703e10af)), closes [#75](https://github.com/marcelorodrigo/development-crew/issues/75)
* migrate to skills-first architecture ([#111](https://github.com/marcelorodrigo/development-crew/issues/111)) ([8d974c2](https://github.com/marcelorodrigo/development-crew/commit/8d974c20a39d3ddda35b7030ce3b1bd073ab3afe))
* **oh-my-pi:** Add oh-my-pi platform support ([#126](https://github.com/marcelorodrigo/development-crew/issues/126)) ([46e6c6b](https://github.com/marcelorodrigo/development-crew/commit/46e6c6b858ceb20c8148f467bbd8e219eeb77111))
* **orchestrator:** preserve Rubber Duck and Architect sessions across re-invocations ([#49](https://github.com/marcelorodrigo/development-crew/issues/49)) ([d4bf9ea](https://github.com/marcelorodrigo/development-crew/commit/d4bf9ea1545bfda54362d824d4d676b5d6af9077))
* Restructure to multi-harness plugin ([#115](https://github.com/marcelorodrigo/development-crew/issues/115)) ([5159de8](https://github.com/marcelorodrigo/development-crew/commit/5159de8470a26a6fb95dc9aec0a2ccba241164e6))
* **skills:** Add pipeline focus directives and compression handoff guidance ([#117](https://github.com/marcelorodrigo/development-crew/issues/117)) ([218c5a8](https://github.com/marcelorodrigo/development-crew/commit/218c5a89aacfede635938a95a702dcb398939ce8))
* update AGENTS to use question tool correctly ([#54](https://github.com/marcelorodrigo/development-crew/issues/54)) ([3734561](https://github.com/marcelorodrigo/development-crew/commit/37345613edfe8ca1945146753f98d747fefbe68f))


### Bug Fixes

* address PR review findings and bump version to 0.0.1 ([e0215ea](https://github.com/marcelorodrigo/development-crew/commit/e0215ead5120271a93c975e4ba0883b3ba62d989))
* **agents:** Add question tool calls for user interaction at decision points ([#17](https://github.com/marcelorodrigo/development-crew/issues/17)) ([6c14856](https://github.com/marcelorodrigo/development-crew/commit/6c14856cd287374d8981dd9162cd56348290a5f3))
* **agents:** Prepend shared principles to prompt body instead of raw markdown ([#95](https://github.com/marcelorodrigo/development-crew/issues/95)) ([e3cf5f8](https://github.com/marcelorodrigo/development-crew/commit/e3cf5f8292e471f64e58e771c1a610208e12f8a3))
* **ci:** Correct YAML indentation in validate-plugin workflow ([#36](https://github.com/marcelorodrigo/development-crew/issues/36)) ([a3f7ac5](https://github.com/marcelorodrigo/development-crew/commit/a3f7ac59524fcf605c6f7311d61dbe6e0de46697))
* **ci:** implement validation scripts for GitHub and Claude plugin ([#38](https://github.com/marcelorodrigo/development-crew/issues/38)) ([e09b744](https://github.com/marcelorodrigo/development-crew/commit/e09b74417785c4ef4d4d097052f5106bc38d5422))
* correct repository URL from development-crew-plugin to development-crew ([1888ed3](https://github.com/marcelorodrigo/development-crew/commit/1888ed3204d579a8faffb566b7212389cc2eecf2))
* correct verify script name in release-please workflow ([#113](https://github.com/marcelorodrigo/development-crew/issues/113)) ([4861913](https://github.com/marcelorodrigo/development-crew/commit/486191395f4803ee54ccd5b360dca3fa1599f82c))
* inline skill reference templates into SKILL.md files ([#124](https://github.com/marcelorodrigo/development-crew/issues/124)) ([96ec41b](https://github.com/marcelorodrigo/development-crew/commit/96ec41b154c38f56989d5cd2eddaa100e200a3c7))
* Migrate agent keys from dc-* to dc:* colon namespace ([#92](https://github.com/marcelorodrigo/development-crew/issues/92)) ([4505d5b](https://github.com/marcelorodrigo/development-crew/commit/4505d5b0d18013d1c8b9ebeb72eb81ea36dceeab))
* **release:** Configure extra-files to sync plugin manifest versions ([#69](https://github.com/marcelorodrigo/development-crew/issues/69)) ([e2a76c4](https://github.com/marcelorodrigo/development-crew/commit/e2a76c4ef1e3e0e2931f6d0b59aa1c43e12b9e16))
* **release:** Rename package to align release tag naming ([#129](https://github.com/marcelorodrigo/development-crew/issues/129)) ([21aefa7](https://github.com/marcelorodrigo/development-crew/commit/21aefa7747d8d02b03f22e907f5e6ad7f9cef856))


### Reverts

* remove OpenSpec integration and restore original agent setup ([#67](https://github.com/marcelorodrigo/development-crew/issues/67)) ([0e60180](https://github.com/marcelorodrigo/development-crew/commit/0e601809f161abd4fd7da8639bc7e487165647b7))

## [0.13.0](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.12.1...opencode-development-crew-v0.13.0) (2026-06-24)


### Features

* **oh-my-pi:** Add oh-my-pi platform support ([#126](https://github.com/marcelorodrigo/development-crew/issues/126)) ([46e6c6b](https://github.com/marcelorodrigo/development-crew/commit/46e6c6b858ceb20c8148f467bbd8e219eeb77111))

## [0.12.1](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.12.0...opencode-development-crew-v0.12.1) (2026-06-18)


### Bug Fixes

* inline skill reference templates into SKILL.md files ([#124](https://github.com/marcelorodrigo/development-crew/issues/124)) ([96ec41b](https://github.com/marcelorodrigo/development-crew/commit/96ec41b154c38f56989d5cd2eddaa100e200a3c7))

## [0.12.0](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.11.0...opencode-development-crew-v0.12.0) (2026-06-17)


### Features

* Centralize question tool format ([#121](https://github.com/marcelorodrigo/development-crew/issues/121)) ([8f8014e](https://github.com/marcelorodrigo/development-crew/commit/8f8014ef1f6827307bb6b9c4609c5c515f1ce625))

## [0.11.0](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.10.0...opencode-development-crew-v0.11.0) (2026-06-16)


### Features

* **skills:** Add pipeline focus directives and compression handoff guidance ([#117](https://github.com/marcelorodrigo/development-crew/issues/117)) ([218c5a8](https://github.com/marcelorodrigo/development-crew/commit/218c5a89aacfede635938a95a702dcb398939ce8))

## [0.10.0](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.9.1...opencode-development-crew-v0.10.0) (2026-06-16)


### ⚠ BREAKING CHANGES

* Restructure to multi-harness plugin ([#115](https://github.com/marcelorodrigo/development-crew/issues/115))

### Features

* Restructure to multi-harness plugin ([#115](https://github.com/marcelorodrigo/development-crew/issues/115)) ([5159de8](https://github.com/marcelorodrigo/development-crew/commit/5159de8470a26a6fb95dc9aec0a2ccba241164e6))

## [0.9.1](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.9.0...opencode-development-crew-v0.9.1) (2026-06-16)


### Bug Fixes

* correct verify script name in release-please workflow ([#113](https://github.com/marcelorodrigo/development-crew/issues/113)) ([4861913](https://github.com/marcelorodrigo/development-crew/commit/486191395f4803ee54ccd5b360dca3fa1599f82c))

## [0.9.0](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.8.2...opencode-development-crew-v0.9.0) (2026-06-16)


### ⚠ BREAKING CHANGES

* migrate to skills-first architecture ([#111](https://github.com/marcelorodrigo/development-crew/issues/111))

### Features

* migrate to skills-first architecture ([#111](https://github.com/marcelorodrigo/development-crew/issues/111)) ([8d974c2](https://github.com/marcelorodrigo/development-crew/commit/8d974c20a39d3ddda35b7030ce3b1bd073ab3afe))

## [0.8.2](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.8.1...opencode-development-crew-v0.8.2) (2026-06-12)


### Bug Fixes

* **agents:** Prepend shared principles to prompt body instead of raw markdown ([#95](https://github.com/marcelorodrigo/development-crew/issues/95)) ([e3cf5f8](https://github.com/marcelorodrigo/development-crew/commit/e3cf5f8292e471f64e58e771c1a610208e12f8a3))

## [0.8.1](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.8.0...opencode-development-crew-v0.8.1) (2026-06-12)


### Bug Fixes

* Migrate agent keys from dc-* to dc:* colon namespace ([#92](https://github.com/marcelorodrigo/development-crew/issues/92)) ([4505d5b](https://github.com/marcelorodrigo/development-crew/commit/4505d5b0d18013d1c8b9ebeb72eb81ea36dceeab))

## [0.8.0](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.7.0...opencode-development-crew-v0.8.0) (2026-06-12)


### Features

* extract shared design principles into common preamble ([#88](https://github.com/marcelorodrigo/development-crew/issues/88)) ([e253b27](https://github.com/marcelorodrigo/development-crew/commit/e253b27f7e35c5ccf62b39a89094e6d0703e10af)), closes [#75](https://github.com/marcelorodrigo/development-crew/issues/75)

## [0.7.0](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.6.0...opencode-development-crew-v0.7.0) (2026-06-08)


### Features

* **agents:** Add permission frontmatter to expose question tool ([#82](https://github.com/marcelorodrigo/development-crew/issues/82)) ([b8c60bd](https://github.com/marcelorodrigo/development-crew/commit/b8c60bd79c4daa698c5269676f2b9cd6bc5159a6))

## [0.6.0](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.5.1...opencode-development-crew-v0.6.0) (2026-06-04)


### ⚠ BREAKING CHANGES

* Add dc- prefix to agent identifiers and display names ([#70](https://github.com/marcelorodrigo/development-crew/issues/70))

### Features

* Add dc- prefix to agent identifiers and display names ([#70](https://github.com/marcelorodrigo/development-crew/issues/70)) ([1e7a7d2](https://github.com/marcelorodrigo/development-crew/commit/1e7a7d28f79f6cbc7a755c129cb8f04536523e5c))

## [0.5.1](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.5.0...opencode-development-crew-v0.5.1) (2026-06-03)


### Bug Fixes

* **release:** Configure extra-files to sync plugin manifest versions ([#69](https://github.com/marcelorodrigo/development-crew/issues/69)) ([e2a76c4](https://github.com/marcelorodrigo/development-crew/commit/e2a76c4ef1e3e0e2931f6d0b59aa1c43e12b9e16))


### Reverts

* remove OpenSpec integration and restore original agent setup ([#67](https://github.com/marcelorodrigo/development-crew/issues/67)) ([0e60180](https://github.com/marcelorodrigo/development-crew/commit/0e601809f161abd4fd7da8639bc7e487165647b7))

## [0.5.0](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.4.0...opencode-development-crew-v0.5.0) (2026-05-21)


### Features

* update AGENTS to use question tool correctly ([#54](https://github.com/marcelorodrigo/development-crew/issues/54)) ([3734561](https://github.com/marcelorodrigo/development-crew/commit/37345613edfe8ca1945146753f98d747fefbe68f))

## [0.4.0](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.3.0...opencode-development-crew-v0.4.0) (2026-05-19)


### Features

* **orchestrator:** preserve Rubber Duck and Architect sessions across re-invocations ([#49](https://github.com/marcelorodrigo/development-crew/issues/49)) ([d4bf9ea](https://github.com/marcelorodrigo/development-crew/commit/d4bf9ea1545bfda54362d824d4d676b5d6af9077))

## [0.3.0](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.2.2...opencode-development-crew-v0.3.0) (2026-05-18)


### Features

* Add OpenSpec integration with skills and commands ([#45](https://github.com/marcelorodrigo/development-crew/issues/45)) ([06bef4e](https://github.com/marcelorodrigo/development-crew/commit/06bef4eec2d484f0eb06be8a148f4b022ba7c86e))

## [0.2.2](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.2.1...opencode-development-crew-v0.2.2) (2026-05-14)


### Bug Fixes

* **ci:** implement validation scripts for GitHub and Claude plugin ([#38](https://github.com/marcelorodrigo/development-crew/issues/38)) ([e09b744](https://github.com/marcelorodrigo/development-crew/commit/e09b74417785c4ef4d4d097052f5106bc38d5422))

## [0.2.1](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.2.0...opencode-development-crew-v0.2.1) (2026-05-14)


### Bug Fixes

* **ci:** Correct YAML indentation in validate-plugin workflow ([#36](https://github.com/marcelorodrigo/development-crew/issues/36)) ([a3f7ac5](https://github.com/marcelorodrigo/development-crew/commit/a3f7ac59524fcf605c6f7311d61dbe6e0de46697))

## [0.2.0](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.1.1...opencode-development-crew-v0.2.0) (2026-05-14)


### Features

* Development crew openspec ([#30](https://github.com/marcelorodrigo/development-crew/issues/30)) ([3051c6e](https://github.com/marcelorodrigo/development-crew/commit/3051c6e3767f248f38b1a202e4ff86e7eafbfcb1))

## [0.1.1](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.1.0...opencode-development-crew-v0.1.1) (2026-05-11)


### Bug Fixes

* **agents:** Add question tool calls for user interaction at decision points ([#17](https://github.com/marcelorodrigo/development-crew/issues/17)) ([6c14856](https://github.com/marcelorodrigo/development-crew/commit/6c14856cd287374d8981dd9162cd56348290a5f3))

## [0.1.0](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.0.2...opencode-development-crew-v0.1.0) (2026-04-29)


### Features

* **agents:** Migrate to domain-agnostic, skill-aware pipeline prompts ([#10](https://github.com/marcelorodrigo/development-crew/issues/10)) ([18ab419](https://github.com/marcelorodrigo/development-crew/commit/18ab4190da76127f2fd13f4ac1bbe1b4aa570662))

## [0.0.2](https://github.com/marcelorodrigo/development-crew/compare/opencode-development-crew-v0.0.1...opencode-development-crew-v0.0.2) (2026-04-28)


### Bug Fixes

* address PR review findings and bump version to 0.0.1 ([e0215ea](https://github.com/marcelorodrigo/development-crew/commit/e0215ead5120271a93c975e4ba0883b3ba62d989))
* correct repository URL from development-crew-plugin to development-crew ([1888ed3](https://github.com/marcelorodrigo/development-crew/commit/1888ed3204d579a8faffb566b7212389cc2eecf2))

## Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
