[mongoose-connect]: http://mongoosejs.com/docs/api.html#index_Mongoose-connect


# @atlas.js/mongoose

Mongoose service for @atlas.js.

## Installation

`npm i @atlas.js/mongoose`

## Usage

### Service

The service configuration only accepts two properties: `uri` and `options` which are passed directly to the [`mongoose.connect(uri, options)`][mongoose-connect] method.

```js
import * as mongoose from '@atlas.js/mongoose'
import { Application } from '@atlas.js/core'

const app = new Application({
  config: {
    services: {
      database: {
        uri: 'mongodb://127.0.0.1:27017/my-db',
        options: {},
      }
    }
  }
})

app.service('database', mongoose.Service)
await app.start()

// You have your mongoose client available here:
app.services.database
```

### ModelsHook

#### Dependencies

- `service:mongoose`: A mongoose service to load the models into

You can use this hook to load your mongoose model definitions from a particular module location.

```js
// models/user.js

// You can import the necessary classes and definitions directly from the
// @atlas.js/mongoose module instead of loading the mongoose lib
import { Schema, SchemaTypes } from '@atlas.js/mongoose'

const User = new Schema({
  name: SchemaTypes.String,
  email: SchemaTypes.String,
})

export default User


// models/index.js
import User from './user'
export {
  User
}

// index.js
import * as mongoose from '@atlas.js/mongoose'
import { Application } from '@atlas.js/core'

const app = new Application({
  root: __dirname,
  config: {
    hooks: {
      models: {
        // The path to the module from which all the database models should be
        // loaded, relative to app.root
        module: 'models'
      }
    }
  }
})

app.service('database', mongoose.Service)
app.hook('models', mongoose.ModelsHook, {
  aliases: {
    'service:mongoose': 'database',
  }
})
await app.start()

// Now your models from the models/index.js module are loaded up!
const User = app.services.database.model('User')
```

## License

See the [LICENSE](LICENSE) file for information.
