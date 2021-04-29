describe('Sign Up', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.clearLocalStorage()
    cy.fixture('people.json').as('people')
  })

  it('Displays correct signup form initially', () => {
    // verify signup title
    cy.get('#signup-wrapper h1')
      .invoke('text')
      .should('equal', 'Sign Up')

    const checkPlaceHolder = (i, label, placeholder, name) => {
      cy.get(`#signup-wrapper div:nth-child(${i + 1}) label`)
        .should('contain', label)
      cy.get(`input[name="${name || label.toLowerCase()}"]`)
        .invoke('attr', 'placeholder')
        .should('equal', placeholder)
    }
    checkPlaceHolder(0, 'Name', 'Pat Smith')
    checkPlaceHolder(1, 'Email', 'pat@smith.com')
    checkPlaceHolder(2, 'Age', '33')
    checkPlaceHolder(3, 'Phone Number', '800-555-1212', 'phoneNumber')
    checkPlaceHolder(4, 'Password', 'Str0ngP@ssword~')
    checkPlaceHolder(5, 'Homepage', 'https://smith.com/pat')

    // verify submit button is disabled initially
    cy.get('input[type="submit"]')
      .should('be.disabled')
      .invoke('val')
      .should('equal', 'Submit')
  })

  it('Displays correct empty people list initially', () => {
    cy.get('#people-wrapper h1')
      .invoke('text')
      .should('equal', 'People')

    // verify table headers
    cy.get('#people-wrapper thead tr th:nth-child(1)')
      .invoke('text')
      .should('equal', 'Name')
    cy.get('#people-wrapper thead tr th:nth-child(2)')
      .invoke('text')
      .should('equal', 'Email')
    cy.get('#people-wrapper thead tr th:nth-child(3)')
      .invoke('text')
      .should('equal', 'Age')
    cy.get('#people-wrapper thead tr th:nth-child(4)')
      .invoke('text')
      .should('equal', 'Phone')
    cy.get('#people-wrapper thead tr th:nth-child(5)')
      .invoke('text')
      .should('equal', 'Homepage')

    // verify empty table body
    cy.get('#people-wrapper tbody')
      .invoke('text')
      .should('equal', '')
  })

  const checkSubmitStatus = () => {
    cy.get('input[type="submit"]')
      .should('not.be.disabled')
      .click()
      .invoke('val')
      .should('equal', 'Saving...')
    cy.get('input[type="submit"]', { timeout: 2000 })
      .invoke('val')
      .should('equal', 'Saved!')
  }

  const textAtRowCol = (r, c, text) => {
    cy.get(`#people-wrapper tbody tr:nth-child(${r + 1}) td:nth-child(${c + 1})`)
      .invoke('text')
      .should('equal', text)
  }

  it('Adds a person to the list', () => {
    cy.get('@people')
      .then(people => {
        // enter valid person info
        cy.enterPerson(people[0])
        // submit form and verify status
        checkSubmitStatus()
        // verify result
        textAtRowCol(0, 0, people[0].name)
        textAtRowCol(0, 1, people[0].email)
        textAtRowCol(0, 2, String(people[0].age))
        textAtRowCol(0, 3, people[0].phoneNumber)
        textAtRowCol(0, 4, people[0].homepage)
      })
  })

  it('Adds two people to the list', () => {
    cy.get('@people')
      .then(people => {
        // enter first person
        cy.enterPerson(people[0])
        // check submit status
        checkSubmitStatus()
        // enter second person
        cy.enterPerson(people[1])
        // check submit status
        checkSubmitStatus()
        // verify first person submit result
        textAtRowCol(0, 0, people[0].name)
        textAtRowCol(0, 1, people[0].email)
        textAtRowCol(0, 2, String(people[0].age))
        textAtRowCol(0, 3, people[0].phoneNumber)
        textAtRowCol(0, 4, people[0].homepage)
        // verify second person submit result
        textAtRowCol(1, 0, people[1].name)
        textAtRowCol(1, 1, people[1].email)
        textAtRowCol(1, 2, String(people[1].age))
        textAtRowCol(1, 3, people[1].phoneNumber)
        textAtRowCol(1, 4, people[1].homepage)
      })
  })

  context('Required Validation', () => {
    beforeEach(() => {
      cy.get('@people')
      .then(people => {
        // start with valid fields in all inputs
        cy.enterPerson(people[0])
      })
    })

    const shouldErrorOnEmpty = (i, name, error) => {
      cy.get(`input[name="${name}"]`)
        .clear()
        .blur()
      cy.get(`#signup-wrapper div:nth-child(${i + 1}) div.red`)
        .should('contain', error)
      cy.get('input[type="submit"]')
        .should('be.disabled')
    }

    it('Should error on empty name', () => {
      shouldErrorOnEmpty(0, 'name', 'Name Required')
    })

    it('Should error on empty email', () => {
      shouldErrorOnEmpty(1, 'email', 'Invalid Email')
    })

    it('Should error on empty age', () => {
      shouldErrorOnEmpty(2, 'age', 'Invalid Age')
    })

    it('Should error on empty phone number', () => {
      shouldErrorOnEmpty(3, 'phoneNumber', 'Invalid Phone Number')
    })

    it('Should error on empty password', () => {
      shouldErrorOnEmpty(4, 'password', 'Weak Password')
    })

    it('Should error on empty home page', () => {
      shouldErrorOnEmpty(5, 'homepage', 'Invalid URL')
    })
  })

  const shouldErrorOnInvalidVal = (i, name, val, error) => {
    cy.get(`input[name="${name}"]`)
      .clear()
      .type(val)
      .blur()
    cy.get(`#signup-wrapper div:nth-child(${i + 1}) div.red`)
      .should('contain', error)
    cy.get('input[type="submit"]')
      .should('be.disabled')
  }

  context('Email Validation', () => {
    beforeEach(() => {
      cy.get('@people')
      .then(people => {
        // start with valid fields in all inputs
        cy.enterPerson(people[0])
      })
    })
    const shouldErrorOnInvalidEmail = val => {
      shouldErrorOnInvalidVal(1, 'email', val, 'Invalid Email')
    }
    it('Should have @ character', () => {
      shouldErrorOnInvalidEmail('Abc.example.com')
    })

    it('Should have only one @ outside quotation', () => {
      shouldErrorOnInvalidEmail('A@b@c@example.com')
    })

    it('Should have no special characters in the local part', () => {
      shouldErrorOnInvalidEmail('a"b(c)d,e:f;g<h>i[j\k]l@example.com')
    })

    it('Should have no quoted strings', () => {
      shouldErrorOnInvalidEmail('just"not"right@example.com')
    })

    it('Should have no spaces, quotes and backslashes', () => {
      shouldErrorOnInvalidEmail('this is"not\allowed@example.com')
    })
  })

  context('Age Validation', () => {
    beforeEach(() => {
      cy.get('@people')
      .then(people => {
        // start with valid fields in all inputs
        cy.enterPerson(people[0])
      })
    })
    const shouldErrorOnInvalidAge = val => {
      shouldErrorOnInvalidVal(2, 'age', val, 'Invalid Age')
    }
    it('Should be numeric', () => {
      shouldErrorOnInvalidAge('age')
    })

    it('Should not be zero', () => {
      shouldErrorOnInvalidAge(0)
    })

    it('Should not be negative', () => {
      shouldErrorOnInvalidAge(-12)
    })

    it('Should not be 200', () => {
      shouldErrorOnInvalidAge(200)
    })

    it('Should not be greater than 200', () => {
      shouldErrorOnInvalidAge(201)
    })
  })

  context('Phone Validation', () => {
    beforeEach(() => {
      cy.get('@people')
      .then(people => {
        // start with valid fields in all inputs
        cy.enterPerson(people[0])
      })
    })
    const shouldErrorOnInvalidPhone = val => {
      shouldErrorOnInvalidVal(3, 'phoneNumber', val, 'Invalid Phone Number')
    }
    it('Should be not be of length <6', () => {
      shouldErrorOnInvalidPhone('82323')
    })

    it('Should be not be of length >12', () => {
      shouldErrorOnInvalidPhone('823-237-9843-234')
    })

    it('Should not put hyphen in the wrong place', () => {
      shouldErrorOnInvalidPhone('32-2345-8976')
    })

    it('Should not have letters in it', () => {
      shouldErrorOnInvalidPhone('a34-457-8778')
    })
  })

  context('Password Validation', () => {
    beforeEach(() => {
      cy.get('@people')
      .then(people => {
        // start with valid fields in all inputs
        cy.enterPerson(people[0])
      })
    })
    const shouldErrorOnWeakPassword = val => {
      shouldErrorOnInvalidVal(4, 'password', val, 'Weak Password')
    }
    it('Should be of at least 8 characters', () => {
      shouldErrorOnWeakPassword('S0gP@s~')
    })

    it('Should be a mixture of upper and lower case letters', () => {
      shouldErrorOnWeakPassword('str0ngp@ssword~')
    })

    it('Should be a mixture of letters and numbers', () => {
      shouldErrorOnWeakPassword('StrngP@ssword~')
    })

    it('Should include at least one special character', () => {
      shouldErrorOnWeakPassword('Str0ngPssword')
    })
  })

  context('URL Validation', () => {
    beforeEach(() => {
      cy.get('@people')
      .then(people => {
        // start with valid fields in all inputs
        cy.enterPerson(people[0])
      })
    })
    const shouldErrorOnInvalidURL = val => {
      shouldErrorOnInvalidVal(5, 'homepage', val, 'Invalid URL')
    }

    it('Should not have empty protcol', () => {
      shouldErrorOnInvalidURL('google.com')
    })

    it('Should have double slash', () => {
      shouldErrorOnInvalidURL('http:/hello.com')
    })

    it('Should not have empty host', () => {
      shouldErrorOnInvalidURL('http://')
    })

    it('Should not have invalid host', () => {
      shouldErrorOnInvalidURL('http://?')
    })

    it('Should encode spaces', () => {
      shouldErrorOnInvalidURL('http://foo.bar?q=Spaces should be encoded')
    })
  })
})
