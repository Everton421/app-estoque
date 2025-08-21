// __mocks__/react-navigation/native.js

import React from 'react';

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(), // Simular setOptions
};

const mockUseNavigation = () => mockNavigation;

const mockUseRoute = () => ({
  params: {}, // Pode ser um objeto com parâmetros padrão, se necessário
  name: 'MockRoute',
});

const mockUseFocusEffect = (callback:any) => {
  React.useEffect(() => {
    callback(); // Execute o callback imediatamente para simular o foco.
    return () => {}; // Simule a função de limpeza (cleanup) do efeito.
  }, [callback]);
};

const mockNavigationContext = React.createContext(mockNavigation);
const MockNavigationProvider = mockNavigationContext.Provider;

const useNavigation = mockUseNavigation;
const useRoute = mockUseRoute;
const useFocusEffect = mockUseFocusEffect;
const NavigationContext = mockNavigationContext;
const NavigationProvider = MockNavigationProvider;

export {
  useNavigation,
  useRoute,
  useFocusEffect,
  NavigationContext,
  NavigationProvider,
};

export default {
  useNavigation,
  useRoute,
  useFocusEffect,
  NavigationContext,
  NavigationProvider,
};