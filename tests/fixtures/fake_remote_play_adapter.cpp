#include "tests/fixtures/fake_remote_play_adapter.h"

namespace cloudgta::test {

bool FakeRemotePlayAdapter::launch(std::string_view) { return launch_result; }
bool FakeRemotePlayAdapter::has_first_frame() const { return first_frame; }
void FakeRemotePlayAdapter::stop() { stopped = true; }

} // namespace cloudgta::test

