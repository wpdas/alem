## Além CLI

Além has its own command system.

### Commands

```bash
Usage: alem [options] [command]

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  dev             Run the development server
  build           Build the project
  deploy          Deploy the project
  upload-metadata     Upload metadata to SocialDB (app name, description, icon, tags, etc)
```

#### Command: `dev`

Run the development server with various options:

```bash
Usage: alem dev [options]

Options:
  -p, --port <port>       Port to run the server on (default: 8080)
  -no-open                Disable opening the browser (default: false)
```

#### Command: `build`

Build the project:

```bash
Usage: alem build
```

This will output valid widget code to the `/build` directory.

#### Command: `deploy`

Deploy the project to Near BOS:

```bash
Usage: alem deploy
```

#### Command: `upload-metadata`

Upload metadata to SocialDB. This is going to use the data provided by `bos.config.json` file. The content represents the app's details like `name, description, icon, tags, etc`. You can update this information manually by going to the widget metadata tab using the [Near Sandbox](https://near.org/sandbox).

```bash
Usage: alem upload-metadata
```
