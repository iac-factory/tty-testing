# [`@iac-factory/tty-testing`](https://github.com/iac-factory/ci-shell) #

Demonstrative `npm` package that highlights the different methods, and limitations, 
of spawning child-processes via node.js runtimes.

**Note** - *Anything with a `ⓘ` is a dropdown containing
additional, contextual information.*

## Setup (Local Development) ##

```shell
# --> (1) Clone the repository
# --> (2) Change into the local clone's directory
# --> (3) Install package dependencies

git clone "https://github.com/iac-factory/tty-testing.git" \
    || git clone git@github.com:iac-factory/tty-testing.git

cd tty-testing && npm install
```

## Usage(s) ##

<details>
<summary>Security ⓘ</summary>

## Disclaimer ##

**CLI utilities can be incredibly dangerous.**

- `stdin`, `os.exec`, and shells are easy to interface and therefore exploit.
- Having the ability to issue `os.exec` or interface `stdin` always makes the
  application dangerous.
- Protecting against harmful bugs or malicious actors isn't difficult if
  the application's logic is handled correctly, and so long as precautions are made
  to disable [`REPLs`](https://en.wikipedia.org/wiki/Read–eval–print_loop)
  (but allowing `SIGKILL`, `SIGSTOP`, and other user-controlled signals).

A language's packaging utility (`npx`, `pep`, `cargo`, etc.) extends some amazing capabilities,
but should never have the opportunity to be taken advantage of (***Development Supply-Chain Attacks***).

Ensure due diligence in writing cli applications.

</details>

```shell
npm run start
```
