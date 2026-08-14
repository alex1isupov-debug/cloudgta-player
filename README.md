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

Install the exact versions declared by `.tool-versions` and
`toolchains.lock.json` (CI provisions them on a clean Windows runner), then:

```powershell
./scripts/bootstrap.ps1
```

The production target contains the application core and narrow Remote Play adapter
interface only. Fake adapters are compiled exclusively into the test target and are
rejected by a blocking boundary check.
