# Changelog

All notable changes to this project will be documented in this file.

Format: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)


## [0.2.0](2026-08-14)

### Components

#### Features

- adds SocialShare import
- updates CompatView, ProfileView
- adds GitHubLink import and adds GitHubLink
- adds useEffect, Check, CardShare import and adds CardShare, root and adds useState, useEffect
- adds ThemeToggle, useSyncExternalStore, Moon import and adds t, d and adds through, still class
- adds useMemo, type, sparkScore import
- adds useEffect import and adds useEffect

#### Bug Fixes

- updates ScoutForm
- updates styles in ScoutForm

#### Performance

- updates DatingCard, SwipeDeck


### README

#### Documentation

- updates docs (README)
- updates docs (README)
- updates docs (README)
- updates docs (README)


### Auth

#### Bug Fixes

- keep redirect() outside try/catch so successful login isn't swallowed by NEXT_REDIRECT

#### Chores

- hides login button when client_id looks like a secret (copy-paste swap guard)
- surfaces HTTP status when OAuth user fetch fails
- reports oauth failure reason (state


### Cards

#### Features

- dark-mode palette for the dating card — live card follows .dark tokens, PNG honors ?theme=dark (download + embed append it)
- updates docs (README) and akitaonrails, pewdiepie-archdaemon, torvalds


### Identity

#### Chores

- updates username references to benogoulart


### App

#### Features

- adds fallback function and adds checkScoutRateLimit, cache, headers import


### General

#### Features

- adds NotFound function and adds dicts, getLocale, sampleProfiles import
- adds mascotDataUri, X, readFileSync import
- adds SITE_URL, useRef, UserSearchInput import and adds useState, useRef, useId
- adds GET function and adds cookies, redirect, exchangeOauthCode import
- adds Image import
- share buttons, embed snippet, top profiles and card cache headers
- baked 30 real profiles into KEEP SWIPING deck
- adds useState import and adds useState
- adds Loading function and adds type, Link, Background import
- updates scripts (constants, theme) and route, error, global-error
- adds renderCardImage import
- updates docs (LICENSE, README)
- adds --original, gandalf flag and adds NotFound, Image, Home function

#### Bug Fixes

- move embed section to full-width row below the report grid
- adds CARD_CORNER_RADIUS, roundedCardMaskDataUri import

#### Refactoring

- updates docs (README) and logo, mascot, wordmark

#### CI/CD

- updates CI pipeline


### Contributors

Thank you to 3 community contributors:

@Beno-Goulart
- fix: move embed section to full-width row below the report grid
- feat: share buttons, embed snippet, top profiles and card cache headers
- feat: baked 30 real profiles into KEEP SWIPING deck
- fix(components): updates styles in ScoutForm
- refactor: updates docs (README) and logo, mascot, wordmark
- ci: updates CI pipeline
- fix: adds CARD_CORNER_RADIUS, roundedCardMaskDataUri import
- feat(app): adds fallback function and adds checkScoutRateLimit, cache, headers import
- feat: adds GET function and adds cookies, redirect, exchangeOauthCode import
- feat: adds Image import
- feat(components): updates CompatView, ProfileView
- docs(README): updates docs (README)
- docs(README): updates docs (README)
- feat(components): adds GitHubLink import and adds GitHubLink
- feat(components): adds useEffect, Check, CardShare import and adds CardShare, root and adds useState, useEffect
- feat(components): adds ThemeToggle, useSyncExternalStore, Moon import and adds t, d and adds through, still class
- fix(components): updates ScoutForm
- feat(components): adds useMemo, type, sparkScore import
- perf(components): updates DatingCard, SwipeDeck

@benogoulart
- chore(auth): hides login button when client_id looks like a secret (copy-paste swap guard)
- fix(auth): keep redirect() outside try/catch so successful login isn't swallowed by NEXT_REDIRECT
- chore(auth): surfaces HTTP status when OAuth user fetch fails
- docs(README): updates docs (README)
- chore(identity): updates username references to benogoulart
- feat: adds SITE_URL, useRef, UserSearchInput import and adds useState, useRef, useId
- feat(components): adds SocialShare import
- docs(README): updates docs (README)
- feat(cards): dark-mode palette for the dating card — live card follows .dark tokens, PNG honors ?theme=dark (download + embed append it)
- feat: adds mascotDataUri, X, readFileSync import
- feat: adds NotFound function and adds dicts, getLocale, sampleProfiles import

@Windows
- feat(cards): updates docs (README) and akitaonrails, pewdiepie-archdaemon, torvalds
- feat: adds useState import and adds useState
- feat: adds Loading function and adds type, Link, Background import
- feat: updates scripts (constants, theme) and route, error, global-error
- feat(components): adds useEffect import and adds useEffect
- feat: adds renderCardImage import
- feat: updates docs (LICENSE, README)
- feat: adds --original, gandalf flag and adds NotFound, Image, Home function

**Contributors:** @Beno-Goulart, @benogoulart, @Windows
