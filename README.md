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
        nbr = !sh -c 'git co master && git checkout -b "$0" && git push -u origin "$0"'
        rbr = !sh -c 'git co master && git br -d "$0" && git push origin :"$0"'
        l = log --oneline --decorate --graph
        timeline = log --graph --branches --pretty=oneline --decorate
        mods = ls-files -m
        untrack = ls-files -o --exclude-standard
        ignored = ls-files --others -i --exclude-standard
[push]
        default = tracking
`