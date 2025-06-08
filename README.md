# The Woods (2022 7-Day Roguelike Challenge Entry)

![itchio-card](https://github.com/user-attachments/assets/bb1c2ce3-6cea-43be-ab5c-e88b1a0fd130)

[Play on Itch.io](https://heroicfisticuffs.itch.io/the-woods)

[How to Play](http://blog.heroicfisticuffs.com/the-woods-2022-7drl-entry/)

My submission for the [2022 7-Day Roguelike Challenge](https://itch.io/jam/7drl-challenge-2022). *The Woods* is an experimental roguelike with traditional mechanics combined with squad-based gameplay. Since moving each squad member one step at a time would be extremely annoying, I came up with a dynamic system of "squadness" that gives players plenty of leeway, but forces squad members to stay within a given "time-adjusted" (turn-adjusted, really) distance. This allows players to run down a particular monster or tricky situation without having to worry about cycling through four or five units between every decision.

Based on my existing ["not an engine" basic bones](https://github.com/twpage/rotjs-basic-bones) codebase. Significantly overhauled to handle the squad-based play.


# See Also

[rotjs-bare-bones](https://github.com/twpage/rotjs-bare-bones) for an actual bare bones repo that simply gets rot.js running on a static HTML page.

# NPM Setup

npm init -y

npm install --save-dev typescript rot-js webpack webpack-cli ts-loader live-server npm-run-all

# Edit Scripts

Edit 'scripts' in package.json:

```
"scripts": {
    "build": "webpack",
    "watch": "webpack --watch",
    "serve": "live-server --port=8085"
  },
```

# Build & Run Server

npx npm-run-all --parallel watch serve
