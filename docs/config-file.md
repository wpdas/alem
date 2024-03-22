## Config File

Create a `bos.config.json` file at the root of the project with the following content:

```json
{
  // This is the root path of the app.
  // if true: alem-lib.near/widget/Index
  // if false: alem-lib.near/widget/alem-docs (it's going to use the slugified "name")
  "isIndex": true,
  // The mainnet account ID under which the app will be deployed.
  "mainnetAccount": "alem-lib.near",
  // The testnet account ID under which the app will be deployed.
  "testnetAccount": "alem-lib.testnet",
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
  "tags": ["the", "project", "tags", "here"]
}
```
