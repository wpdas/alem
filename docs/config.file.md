## Config File

Create an `bos.config.json` file at the root of the project with the following content:

```json
{
  // If "true", the app is going to be saved as Index app, the main app of the account. If "false", this is going to use "name" as the widget name. The spaces will be trimmed.
  "isIndex": true,
  // Account that owns the app.
  "account": "alem-lib.near",
  // App name
  "name": "Alem Docs",
  // App Description
  "description": "Create web3 applications for NEAR BOS with a focus on performance while using concepts that are based on ReactJS.",
  // Social links. Check out NEAR Social Bos docs to get to know the options
  // https://docs.near.org/social/contract
  "linktree": {
    "website": "github.com/wpdas/alem"
  },
  "image": {
    "ipfs_cid": "bafkreicjdgat5xsw7vxbosoyygermawhkfi2by3ovg7c6tumrayn4rimty"
  },
  // Tags of this project
  "tags": ["the", "project", "tags", "here"],
  // Alem options
  "options": {
    // The storage need to be loaded before rendering any content. If this is "true", a Spinner is going to be shown till the storage is ready
    "showFallbackSpinner": false
  }
}
```
