Feature: iOS Settings navigation

  Scenario: Verify Model value in About
    Given I launch the Settings app
    When I open General
    And I open About
    Then the Model value should be alphanumeric

  Scenario: Verify Name value in About
    Given I launch the Settings app
    When I open General
    And I open About
    Then the Name value should be "iPhone"
