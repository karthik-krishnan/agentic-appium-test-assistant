Feature: iOS Settings Dictionary Navigation

  Background:
    Given I launch the Settings app

  Scenario: Verify Bulgarian dictionary is available in Dictionary
    When I open General
    And I open Dictionary
    Then I should see "Bulgarian" dictionary listed

  Scenario: Verify English (US) dictionary is available in Dictionary
    When I open General
    And I open Dictionary
    Then I should see "English (US)" dictionary listed
