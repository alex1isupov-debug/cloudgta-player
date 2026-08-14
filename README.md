# CloudGTA Player

Public CloudGTA fork workspace for the pinned chiaki-ng Remote Play core and the
Windows Player application. Repository ownership and dependency direction are
defined by the canonical
[Project Structure](../docs/02-architecture/PROJECT-STRUCTURE.md).

Ticket 01 establishes the reproducible repository and application seam. The exact
upstream tag/commit and physical first-frame baseline are deliberately deferred to
ticket 02 and recorded in `CLOUDGTA_PATCHES.md` when imported.

## Bootstrap

Install the versions declared by `.tool-versions` and `toolchains.lock.json`, then:

```powershell
./scripts/bootstrap.ps1
```

The production target contains the application core and narrow Remote Play adapter
interface only. Fake adapters are compiled exclusively into the test target and are
rejected by a blocking boundary check.

