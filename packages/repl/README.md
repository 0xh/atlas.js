# @strv/repl

This package contains an action which allows you to drop into an interactive shell (REPL) with the application exposed as `app` on the console.

## Usage

```js
import { Application } from '@strv/framework'
import { Action as Repl } from '@strv/repl'

app.action('repl', Repl)
await app.prepare() // or app.start(), up to you
// Drop into REPL! 🚀
// Just hit ctrl+c to quit escape from the prompt
await app.actions.repl.enter()
```

## License

See the [LICENSE](LICENSE) file for information.
