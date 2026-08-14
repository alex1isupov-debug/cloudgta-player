#pragma once

#include "cloudgta/remote-play/remote_play_adapter.h"

#include <string>

namespace cloudgta {

enum class SessionState { idle, launching, streaming, stopped, failed };

class SessionOrchestrator {
public:
    explicit SessionOrchestrator(RemotePlayAdapter& remote_play);
    bool start(std::string correlation_id);
    void stop();
    [[nodiscard]] SessionState state() const noexcept;

private:
    RemotePlayAdapter& remote_play_;
    SessionState state_{SessionState::idle};
};

} // namespace cloudgta

