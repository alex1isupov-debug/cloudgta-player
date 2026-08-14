#pragma once

#ifndef CLOUDGTA_TEST_BUILD
#error "FakeRemotePlayAdapter is test-only"
#endif

#include "cloudgta/remote-play/remote_play_adapter.h"

namespace cloudgta::test {

class FakeRemotePlayAdapter final : public RemotePlayAdapter {
public:
    bool launch_result{true};
    bool first_frame{true};
    bool stopped{false};
    bool launch(std::string_view) override;
    bool has_first_frame() const override;
    void stop() override;
};

} // namespace cloudgta::test

