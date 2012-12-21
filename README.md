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

- enable color:

    [color]
        status = auto
        diff = auto
        branch = auto
        interactive = auto
        ui = true

- create aliases
- change push settings to current branch only

    git config --global push.default tracking