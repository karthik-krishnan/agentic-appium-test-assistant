Feature: iOS Settings Fonts Navigation

  Background:
    Given I launch the Settings app

  Scenario: Verify Arial and Apple Symbols fonts are available in System Fonts
    When I open General
    And I open Fonts
    And I open System Fonts
    Then I should see "Arial" font listed
    And I should see "Apple Symbols" font listed
