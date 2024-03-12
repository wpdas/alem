## Além CLI

Além has its own command system.

### Commands

```bash
Usage: alem [options] [command]

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  dev [options]              Run the development server
  build                      Build the project
  deploy [options]           Deploy the project
  upload-metadata [options]  Upload metadata to SocialDB (app name, description, icon, tags, etc)
```

#### Command: `dev`

Run the development server with various options:

```bash
Usage: alem dev [options]

Options:
  -n, --network <network>  Network where the app will be running (default: "mainnet")
  -p, --port <port>        Port to run the server on (default: 8080)
  -no-open                 Disable opening the browser (default: false)
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
Usage: alem deploy [options]

Options:
  -n, --network <network>  Network where the app should be deployed (default: "mainnet")
  -h, --help               display help for command
```

#### Command: `upload-metadata`

Upload metadata to SocialDB. This is going to use the data provided by `bos.config.json` file. The content represents the app's details like `name, description, icon, tags, etc`. You can update this information manually by going to the widget metadata tab using the [Near Sandbox](https://near.org/sandbox).

```bash
Usage: alem upload-metadata [options]

Options:
  -n, --network <network>  Network where the metadata should be deployed (default: "mainnet")
  -h, --help               display help for command
```
