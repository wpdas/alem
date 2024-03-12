## Deploying App With GitHub Actions

To deploy widgets on push to branch, create a GitHub Actions workflow file in your repository.

**Mainnet:**

For mainnet you can do like so: `.github/workflows/deploy-mainnet.yml`, and configure it as follows:

```yaml
name: Deploy DApp to Mainnet

on:
  push:
    branches: [main] # branch for trigger

jobs:
  deploy-mainnet:
    uses: wpdas/alem/.github/workflows/deploy.yml@main
    with:
      signer-account-address: <SIGNER_ACCOUNT_ID> # account to sign with (should match bos.config.json > account)
      signer-public-key: <SIGNER_PUBLIC_KEY>
    secrets:
      SIGNER_PRIVATE_KEY: ${{ secrets.SIGNER_PRIVATE_KEY }} # must be inside the github repo secrets
```

**Testnet:**

For testnet you can do like so: `.github/workflows/deploy-testnet.yml`, and configure it as follows:

```yaml
name: Deploy DApp to Testnet

on:
  push:
    branches: [staging] # branch for trigger

jobs:
  deploy-mainnet:
    uses: wpdas/alem/.github/workflows/deploy-testnet.yml@main
    with:
      signer-account-address: <SIGNER_ACCOUNT_ID> # account to sign with (should match bos.config.json > account)
      signer-public-key: <SIGNER_PUBLIC_KEY>
    secrets:
      SIGNER_PRIVATE_KEY: ${{ secrets.TESTNET_SIGNER_PRIVATE_KEY }} # must be inside the github repo secrets
```

Adjust the workflow as needed, then configure your variables + secrets on GitHub Settings -> Actions -> secrets & variables. Use [near-cli-rs](https://github.com/near/near-cli-rs) for generating keypairs. You can also login using Near CLI and check the keypairs locally.

### Workflow Inputs

The workflow accepts the following inputs:

- `cli-version` (optional): Version of BOS CLI to use for deployment (e.g., 0.3.0). Default: "0.3.6"

- `deploy-env` (optional): Environment to deploy component code to (e.g., mainnet, testnet). Default: "mainnet"

- `signer-account-address` (required): Account under which component code should be deployed and used for signing the deploy transaction.

- `signer-public-key` (required): Public key for signing transactions in the format: `ed25519:<public_key>`.

- `signer-private-key` (required): Private key for signing transactions in the format: `ed25519:<private_key>`.
