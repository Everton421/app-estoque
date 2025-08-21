// __mocks__/expo-sqlite.js

let mockQueryResult = { rows: { _array: [] } }; // Resultado padrão
let mockRunResult = { lastInsertRowId: 0, rowsAffected: 0 }; // Resultado padrão para runAsync

const mockDatabase = {
  transaction: (callback: any) => {
    callback({
      executeSql: (sql: string, params: any, success: any, error: any) => {
        console.log("Mocked executeSql:", sql, params);

        if (success) {
          success(null, mockQueryResult);
        } else if (error) {
          error(null, "Simulated Error");
        }
      },
    });
  },
  getAllAsync: async (sql: string, ...params: any[]) => {
    console.log("Mocked getAllAsync:", sql, params);
    return mockQueryResult.rows._array; // Retorna apenas o array de resultados
  },
  runAsync: async (sql: string, ...params: any[]) => {
    console.log("Mocked runAsync:", sql, params);
    return mockRunResult;
  },
  execAsync: async (sql: string) => {
    console.log("Mocked execAsync:", sql);
    return; // Simplesmente retorna undefined
  },
};

const useSQLiteContext = () => {
  return {
    db: mockDatabase,
  };
};

const setMockQueryResult = (result: any) => {
  mockQueryResult = { rows: { _array: result } };
};

const setMockRunResult = (result: any) => {
  mockRunResult = result;
};

export { useSQLiteContext, setMockQueryResult, setMockRunResult };

export default {
  openDatabase: () => mockDatabase,
  DEBUG: false,
  enablePromise: false,
};