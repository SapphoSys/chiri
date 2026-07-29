# Building from source
There are two supported workflows when it comes to building Chiri from source:

- **Workflow 1**: using the repository's Nix flake on macOS or Linux (preferred)
- **Workflow 2**: using the native Tauri toolchain (platform-agnostic)

## Table of contents
- [Prerequisites](#prerequisites)
  - [Nix workflow](#nix-workflow-macos-or-linux)
  - [Native workflow](#native-workflow-platform-agnostic)
    - [macOS](#macos)
    - [Linux](#linux)
      - [Ubuntu or Debian](#ubuntu-or-debian)
      - [Fedora](#fedora)
    - [Windows](#windows)
      - [Quick setup with WinGet](#quick-setup-with-winget)
- [Workflows](#workflows)
  - [Workflow 1: Nix on macOS or Linux (preferred)](#workflow-1-nix-on-macos-or-linux-preferred)
    - [Workflow 1: Starting the app in development mode](#workflow-1-starting-the-app-in-development-mode)
    - [Workflow 1: Building the app for production](#workflow-1-building-the-app-for-production)
  - [Workflow 2: Native setup without Nix (platform-agnostic)](#workflow-2-native-setup-without-nix-platform-agnostic)
    - [Workflow 2: Starting the app in development mode](#workflow-2-starting-the-app-in-development-mode)
    - [Workflow 2: Building the app for production](#workflow-2-building-the-app-for-production)

## Prerequisites
Choose one of the following workflows.

For the complete list of requirements, see Tauri's [prerequisites guide](https://v2.tauri.app/start/prerequisites/).

### Nix workflow (macOS or Linux)
Install:

- Git
- [Nix](https://nixos.org/download/) with flakes enabled

The Nix flake provides the rest of the toolchain, including Rust, Node.js, pnpm, the Tauri CLI.

You can skip ahead to the [Workflow 1 section](#workflow-1-nix-on-macos-or-linux-preferred) if you have Nix installed.

### Native workflow (platform-agnostic)
Install:

- Git
- Rust using [rustup](https://rustup.rs/)
- Node.js
- pnpm 11.1.2, matching the repository's `packageManager` field

### macOS
For desktop development, install the Xcode Command Line Tools:

```bash
xcode-select --install
```

### Linux
Install the system dependencies for your distribution from Tauri's [Linux prerequisites](https://v2.tauri.app/start/prerequisites/#linux).

#### Ubuntu or Debian
For Debian or Ubuntu, the current Tauri requirements are:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### Fedora
For Fedora, the current Tauri requirements are:

```bash
sudo dnf install cargo gcc pkg-config desktop-file-utils \
  webkit2gtk4.1-devel libsoup3-devel gtk3-devel openssl-devel \
  libayatana-appindicator-gtk3-devel
```

### Windows
Tauri requires the following native dependencies on Windows:

- Rust using the MSVC toolchain. If Rust is already installed, select it with `rustup default stable-msvc`.
- [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the **Desktop development with C++** workload.
- [Microsoft Edge WebView2](https://developer.microsoft.com/microsoft-edge/webview2/). It is included with Windows 10 version 1803 and later and Windows 11; otherwise install the Evergreen Bootstrapper.

#### Quick setup with WinGet
On Windows 10 or 11, [WinGet](https://learn.microsoft.com/windows/package-manager/winget/) can install the main prerequisites from an PowerShell with Administrator privileges.

```powershell
foreach ($package in @('Git.Git', 'Rustlang.Rustup', 'OpenJS.NodeJS.LTS')) {
  winget install --exact --id $package --accept-package-agreements --accept-source-agreements
}

winget install --exact --id Microsoft.VisualStudio.BuildTools `
  --accept-package-agreements --accept-source-agreements `
  --override "--passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

Restart PowerShell after the installers finish, then select the MSVC toolchain:

```powershell
rustup default stable-msvc
```

Then go to the [Workflow 2 section](#workflow-2-native-setup-without-nix-platform-agnostic) to continue with the native setup.

## Workflows
### Workflow 1: Nix on macOS or Linux (preferred)
Install [Nix](https://nixos.org/download/) with flakes enabled. Then run:

```bash
git clone https://github.com/chiriapp/chiri.git
cd chiri
nix develop
pnpm install --frozen-lockfile
```

#### Workflow 1: Starting the app in development mode
Start the development app with:

```bash
just dev
```

#### Workflow 1: Building the app for production
To build the Nix package directly:

```bash
nix build .#source --print-build-logs
```

The build result will be available through the `result` symlink in the current folder.

### Workflow 2: Native setup without Nix (platform-agnostic)
After installing the prerequisites, clone the repository and install the dependencies with:

```bash
git clone https://github.com/chiriapp/chiri.git
cd chiri
corepack enable pnpm
pnpm install --frozen-lockfile
```

#### Workflow 2: Starting the app in development mode
Run the following command to start the app in development mode:

```bash
pnpm tauri dev
```

The first Rust build can take several minutes; later builds use Cargo's cache.

#### Workflow 2: Building the app for production
Run the following command to build the app for production:

```bash
pnpm run build:app
```

The bundles are written under `src-tauri/target/release/bundle/`. Chiri's platform-specific Tauri configs target:

- Windows: `msi/` and `nsis/`
- macOS: `dmg/`
- Linux: `deb/`, `rpm/`, and `appimage/`

For more options, see Tauri's [build and distribution guide](https://v2.tauri.app/distribute/).
