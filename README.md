testDevEnv
==========

Webstorm Project Settings
- add github Repo to Task Server

Add .git/hooks/pre-commit-hook:

require('../../devEnv/pre-commit-hook.js').run();


Git Settings
------------

- get git cli autocomplete
    https://github.com/git/git/tree/master/contrib/completion

- Config :

`
[color]
        status = auto
        diff = auto
        branch = auto
        interactive = auto
        ui = true
[alias]
        st = status -s -b
        di = diff
        co = checkout
        ci = commit
        br = branch
        nbr = checkout -b
        l = log --oneline --decorate --graph
        timeline = log --graph --branches --pretty=oneline --decorate
        mods = ls-files -m
        untrack = ls-files -o --exclude-standard
        ignored = ls-files --others -i --exclude-standard
[push]
        default = tracking
`