Git web hook listener
=========================

Helps to manage git repositories listening for push events, with script executions

Install
------------
One must clone this repository to be able to launch listener.

Once repo is cloned go to it's dir and just run app.js

```bash
git clone https://github.com/soulman-is-good/gitpub.git
cd gitpub
npm install
npm start
```

Configure
-------------

One must have configuration **json** file ready to be able to run this listener (in other words, listener must have an instruction for what to do if event occures)

By default *gitpub* looks for `GITPUB_CONFIG` environment variable, containing **full** path to configuration json file including filename, and then tries to look for `config.json` file in _repository_ folder.

You can take `config.template.json` file in repo dir for start.

Configuration looks like this:

```json
{
  "myrepo-name-as-is": {
    "branch-name-for-example-master": {
      "dir": "/home/user/myrepo-to-publish/",
      "beforePull": [],
      "afterPull": [
        ["npm install", "bower install"],
        ["gulp", "pm2 restart all"]
      ]
    }
  },
  "myotherrepo": {
    "master": {},
    "dev": {},
    "RC": {}
  }
}
```
