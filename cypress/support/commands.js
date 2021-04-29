// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- utility command to submit a person to a signup form --
// -- This doesn't necessarily have to be a command --
Cypress.Commands.add('enterPerson', person => {
  cy.get('input[name="name"]')
    .clear()
    .type(person.name)
    .invoke('val')
    .should('equal', person.name)
  cy.get('input[name="email"]')
    .clear()
    .type(person.email)
    .invoke('val')
    .should('equal', person.email)
  cy.get('input[name="age"]')
    .clear()
    .type(person.age)
    .invoke('val')
    .should('equal', String(person.age))
  cy.get('input[name="phoneNumber"]')
    .clear()
    .type(person.phoneNumber)
    .invoke('val')
    .should('equal', person.phoneNumber)
  cy.get('input[name="password"]')
    .clear()
    .type(person.password)
    .invoke('val')
    .should('equal', person.password)
  cy.get('input[name="homepage"]')
    .clear()
    .type(person.homepage)
    .invoke('val')
    .should('equal', person.homepage)
})
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
