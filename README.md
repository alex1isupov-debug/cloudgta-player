# CloudGTA Player

Public CloudGTA fork workspace for the pinned chiaki-ng Remote Play core and the
Windows Player application. Repository ownership and dependency direction are
defined by the canonical
[Project Structure](../docs/02-architecture/PROJECT-STRUCTURE.md).

Ticket 01 establishes the reproducible repository and application seam. The exact
upstream tag/commit and physical first-frame baseline are deliberately deferred to
ticket 02 and recorded in `upstream.lock.json` and `CLOUDGTA_PATCHES.md` when
imported. Bootstrap configures the official repository as fetch-only `upstream`;
it never selects a revision implicitly.

## Bootstrap

From a clean Windows checkout, run:

```powershell
./scripts/bootstrap.ps1
```

The command installs the exact Node, CMake, Qt, WiX, .NET SDK, MSVC and Windows SDK versions
declared by `toolchains.lock.json`, validates hashes or publisher signatures, then
runs repository checks plus Debug tests and the Release native build. The first
run requires network access and may request elevation for the Microsoft Build Tools installer;
later runs reuse the verified toolchain.

The production target contains the application core and narrow Remote Play adapter
interface only. Fake adapters are compiled exclusively into the test target and are
rejected by a blocking boundary check.
