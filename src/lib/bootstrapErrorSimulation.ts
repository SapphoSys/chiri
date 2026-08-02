export const BOOTSTRAP_ERROR_SIMULATION_EVENT = 'chiri:simulate-bootstrap-error';

export const requestBootstrapErrorSimulation = () => {
  window.dispatchEvent(new Event(BOOTSTRAP_ERROR_SIMULATION_EVENT));
};
