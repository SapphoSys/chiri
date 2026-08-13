<div align="center">
  <div style="display:flex;flex-direction:column;gap:15px;align-items:center;">
    <img src="./public/icon.png" width="100" />
    <h1>Chiri</h1>
  </div>

  <p>🍃 Cross-platform CalDAV task management app.</p>

  <h4>
    <a href="#overview">Overview</a>
    |
    <a href="#donate">Donate</a>
    |
    <a href="#installation">Installation</a>
  </h4>

  <!-- header badges start -->
  [![GitHub Repo stars][header-repo-stars-badge]][repo-stars]
  &nbsp;[![Total downloads][header-repo-total-downloads-badge]][repo-releases]
  &nbsp;[![Liberapay donation link][header-donate-liberapay-badge]][donate-liberapay]
  <!-- header badges end -->

  ![A screenshot of Chiri, a cross-platform CalDAV compatible task management app. The sidebar shows the "RustiCal (chloe)" account with the "Albums to listen to" calendar selected. The tasks are music albums that I plan on listening to, ranging from "Revengeseekerz by Jane Remover" and "Hearth Room by Frost Children" to "girl EDM by Ninajirachi" and "10,000 gecs by 100 gecs".][header-screenshot]
</div>

# Overview
Chiri is a cross-platform CalDAV task management app for organizing tasks across devices.

It syncs with CalDAV servers like Fastmail, Nextcloud, Radicale, Baikal, and so on, so your tasks stay up to date anywhere.

To date, it features:
- Compatibility with a good majority of CalDAV servers (see [<span aria-hidden="true" style="user-select:none;">&nearr;</span> Compatibility][compatibility])
- Subtasks
- Dragging & reordering tasks
- OAuth login support for supported CalDAV servers
- Repeating tasks (reoccurence)
- [WebDAV Push](https://github.com/bitfireAT/nc_ext_dav_push) support for supported CalDAV servers for near-instant task sync
- ... and so on and much more.

# Donate
If you found Chiri useful, please consider donating!

I work on Chiri during my free time as a student, so every amount, however small, helps with rent and food costs. Thank you :)

[<img src="./.github/assets/donate/liberapay.png" width="200">][donate-liberapay]

# Installation
Skip to each platform section: **[Windows](#windows)** | **[macOS](#macos)** | **[Linux](#linux)**

## Windows
### Method 1: Direct installer

#### Standard installers
[<img src="./.github/assets/download/windows_msi_x64.png" width="200">][release-windows-msi-x64]
[<img src="./.github/assets/download/windows_msi_arm.png" width="200">][release-windows-msi-arm]

#### Portable installers
[<img src="./.github/assets/download/windows_exe_x64.png" width="200">][release-windows-exe-x64]
[<img src="./.github/assets/download/windows_exe_arm.png" width="200">][release-windows-exe-arm]

---

### Method 2: CLI
#### Via winget
```powershell
winget install SapphicAngels.Chiri
```

#### Via scoop
```powershell
scoop bucket add extras
scoop install extras/chiri
```

---

### Code signing
Free code signing on Windows is graciously provided by [<span aria-hidden="true" style="user-select:none;">&nearr;</span> SignPath.io][signpath-io], certificate by the [<span aria-hidden="true" style="user-select:none;">&nearr;</span> SignPath Foundation][signpath-foundation].

## macOS
### Method 1: Direct installer
[<img src="./.github/assets/download/macos_dmg_applesilicon.png" width="200">][release-macos-dmg-applesilicon]
[<img src="./.github/assets/download/macos_dmg_intel.png" width="200">][release-macos-dmg-intel]

---

### Method 2: via Homebrew

```bash
brew install --cask chiri
```

---

### Method 3: via Nix (nix-darwin)
Chiri is available via nixpkgs.

#### Example
```nix
{ pkgs, ... }:
{
  environment.systemPackages = [
    pkgs.chiri
  ];
}
```

## Linux
### AppImage
Chiri is available as an AppImage via GitHub releases.

[<img src="./.github/assets/download/linux_appimage_x86_64.png" width="200">][release-linux-appimage-x86_64]
[<img src="./.github/assets/download/linux_appimage_arm.png" width="200">][release-linux-appimage-arm]

---

### Arch Linux
Chiri is available on the AUR (Arch User Repository).

```bash
yay -S chiri      # (building from source)
yay -S chiri-bin  # (pre-built binary)
```

---

### Debian (.deb)
Chiri is available for Debian-based systems as a direct package via GitHub releases.

[<img src="./.github/assets/download/linux_deb_x86_64.png" width="200">][release-linux-deb-x86_64]
[<img src="./.github/assets/download/linux_deb_arm.png" width="200">][release-linux-deb-arm]

---

### Fedora (.rpm)
Chiri is available in Fedora Copr.

```bash
sudo dnf copr enable chloe/chiri
sudo dnf install chiri
```

Or as a direct package via GitHub releases:

[<img src="./.github/assets/download/linux_rpm_x86_64.png" width="200">][release-linux-rpm-x86_64]
[<img src="./.github/assets/download/linux_rpm_arm.png" width="200">][release-linux-rpm-arm]

---

### NixOS
Chiri is available via nixpkgs.

#### Example
```nix
{ pkgs, ... }:
{
  environment.systemPackages = [
    pkgs.chiri
  ];
}
```

## Building from source
For development instructions and source builds, see [<span aria-hidden="true" style="user-select:none;">&nearr;</span> Building from source](./docs/BUILDING_FROM_SOURCE.md).

## License
Chiri is licensed under the [<span aria-hidden="true" style="user-select:none;">&nearr;</span> zlib/libpng][repo-license] license.

## Addendum
See [<span aria-hidden="true" style="user-select:none;">&nearr;</span> Privacy][repo-privacy] for details on what data Chiri processes and how.

Found a security issue? Please report it privately. See [<span aria-hidden="true" style="user-select:none;">&nearr;</span> Security][repo-security] for details.

[compatibility]: https://github.com/chiriapp/chiri/blob/master/docs/COMPATIBILITY.md

[donate-liberapay]: https://liberapay.com/chloe

[header-donate-liberapay-badge]: https://img.shields.io/badge/donate-liberapay-f5c2e7?style=plastic&logo=liberapay&logoColor=f5c2e7&labelColor=18181b&cacheSeconds=10000

[header-repo-license-badge]: https://img.shields.io/github/license/chiriapp/chiri?style=plastic&labelColor=18181b&color=f5c2e7&cacheSeconds=10000
[header-repo-stars-badge]: https://img.shields.io/github/stars/chiriapp/chiri?style=plastic&logo=github&logoColor=f5c2e7&labelColor=18181b&color=f5c2e7&cacheSeconds=10000
[header-repo-total-downloads-badge]: https://img.shields.io/github/downloads/chiriapp/chiri/total?style=plastic&logo=hack-the-box&logoColor=f5c2e7&label=downloads&labelColor=18181b&color=f5c2e7&cacheSeconds=10000

[header-screenshot]: https://raw.githubusercontent.com/chiriapp/chiri/refs/heads/master/.github/assets/screenshot.png

[nix]: https://nixos.org

[release-windows-msi-x64]: https://github.com/chiriapp/chiri/releases/download/app-v1.0.0/Chiri_1.0.0_x64_en-US.msi
[release-windows-msi-arm]: https://github.com/chiriapp/chiri/releases/download/app-v1.0.0/Chiri_1.0.0_arm64_en-US.msi
[release-windows-exe-x64]: https://github.com/chiriapp/chiri/releases/download/app-v1.0.0/Chiri_1.0.0_x64-setup.exe
[release-windows-exe-arm]: https://github.com/chiriapp/chiri/releases/download/app-v1.0.0/Chiri_1.0.0_arm64-setup.exe

[release-macos-dmg-applesilicon]: https://github.com/chiriapp/chiri/releases/download/app-v1.0.0/Chiri_1.0.0_aarch64.dmg
[release-macos-dmg-intel]: https://github.com/chiriapp/chiri/releases/download/app-v1.0.0/Chiri_1.0.0_x64.dmg

[release-linux-appimage-x86_64]: https://github.com/chiriapp/chiri/releases/download/app-v1.0.0/Chiri_1.0.0_aarch64.AppImage
[release-linux-appimage-arm]: https://github.com/chiriapp/chiri/releases/download/app-v1.0.0/Chiri_1.0.0_amd64.AppImage
[release-linux-deb-x86_64]: https://github.com/chiriapp/chiri/releases/download/app-v1.0.0/Chiri_1.0.0_amd64.deb
[release-linux-deb-arm]: https://github.com/chiriapp/chiri/releases/download/app-v1.0.0/Chiri_1.0.0_arm64.deb
[release-linux-rpm-x86_64]: https://github.com/chiriapp/chiri/releases/download/app-v1.0.0/Chiri-0.9.2-1.x86_64.rpm
[release-linux-rpm-arm]: https://github.com/chiriapp/chiri/releases/download/app-v1.0.0/Chiri-0.9.2-1.aarch64.rpm

[repo-license]: https://github.com/chiriapp/chiri/blob/master/LICENSE
[repo-privacy]: https://github.com/chiriapp/chiri/blob/master/PRIVACY.md
[repo-releases]: https://github.com/chiriapp/chiri/releases
[repo-security]: https://github.com/chiriapp/chiri/blob/master/SECURITY.md
[repo-stars]: https://github.com/chiriapp/chiri/stargazers

[signpath-io]: https://signpath.io
[signpath-foundation]: https://signpath.org
