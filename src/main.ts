// Entry point. Wiring of model/, editor/, view/ and controller/ comes in later phases (docs/plan.md).
const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.textContent = 'Mini editor schémat';
}
