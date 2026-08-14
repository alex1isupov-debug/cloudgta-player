#pragma once

#include <string_view>

namespace cloudgta {

class RemotePlayAdapter {
public:
    virtual ~RemotePlayAdapter() = default;
    virtual bool launch(std::string_view correlation_id) = 0;
    virtual bool has_first_frame() const = 0;
    virtual void stop() = 0;
};

} // namespace cloudgta

