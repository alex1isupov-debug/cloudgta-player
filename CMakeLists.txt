cmake_minimum_required(VERSION 3.31)
project(CloudGTAPlayer VERSION 0.0.1 LANGUAGES CXX)

option(CLOUDGTA_TESTING "Build test-only adapters and unit tests" OFF)

add_library(cloudgta_player_core STATIC
  cloudgta/application/session_orchestrator.cpp
)
target_include_directories(cloudgta_player_core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_compile_features(cloudgta_player_core PUBLIC cxx_std_20)

if(CLOUDGTA_TESTING)
  enable_testing()
  add_executable(cloudgta_player_unit
    tests/unit/session_orchestrator_test.cpp
    tests/fixtures/fake_remote_play_adapter.cpp
  )
  target_link_libraries(cloudgta_player_unit PRIVATE cloudgta_player_core)
  target_compile_definitions(cloudgta_player_unit PRIVATE CLOUDGTA_TEST_BUILD=1)
  add_test(NAME cloudgta_player_unit COMMAND cloudgta_player_unit)
endif()

install(TARGETS cloudgta_player_core ARCHIVE DESTINATION lib)

