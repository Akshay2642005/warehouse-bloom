
describe('Smoke', () => {
  it('loads public root page', () => {
    cy.visit('/');
    cy.contains(/warehouse/i).should('be.visible');
  });

  it('loads login page', () => {
    cy.visit('/login');
    cy.contains(/login/i);
  });

  it('loads public analytics page', () => {
    cy.visit('/analytics');
    cy.contains(/analytics/i).should('be.visible');
  });
});
