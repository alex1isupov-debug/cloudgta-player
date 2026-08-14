#include "cloudgta/application/session_orchestrator.h"
#include "tests/fixtures/fake_remote_play_adapter.h"

#include <cassert>

int main() {
    cloudgta::test::FakeRemotePlayAdapter adapter;
    cloudgta::SessionOrchestrator session(adapter);
    assert(session.start("correlation-e0"));
    assert(session.state() == cloudgta::SessionState::streaming);
    session.stop();
    assert(adapter.stopped);
    assert(session.state() == cloudgta::SessionState::stopped);
}

