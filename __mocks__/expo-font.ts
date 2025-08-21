module.exports = {
    loadAsync: jest.fn(() => Promise.resolve()),
    isLoaded: jest.fn(() => true), // Simula que as fontes já estão carregadas
  };