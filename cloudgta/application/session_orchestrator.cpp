#include "cloudgta/application/session_orchestrator.h"

#include <utility>

namespace cloudgta {

SessionOrchestrator::SessionOrchestrator(RemotePlayAdapter& remote_play) : remote_play_(remote_play) {}

bool SessionOrchestrator::start(std::string correlation_id) {
    if (state_ != SessionState::idle || correlation_id.empty()) return false;
    state_ = SessionState::launching;
    if (!remote_play_.launch(correlation_id) || !remote_play_.has_first_frame()) {
        remote_play_.stop();
        state_ = SessionState::failed;
        return false;
    }
    state_ = SessionState::streaming;
    return true;
}

void SessionOrchestrator::stop() {
    remote_play_.stop();
    state_ = SessionState::stopped;
}

SessionState SessionOrchestrator::state() const noexcept { return state_; }

} // namespace cloudgta

