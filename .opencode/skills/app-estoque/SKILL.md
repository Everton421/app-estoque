# app-estoque Skill

This project is an **Expo (SDK 54) React Native (0.81.5)** managed workflow app with SQLite local storage and REST API sync. Below are the project-specific conventions.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native 0.81.5 + Expo SDK 54 |
| Language | TypeScript (strict mode) |
| Navigation | React Navigation 7 (Stack + Bottom Tabs + Drawer) |
| Local DB | expo-sqlite |
| HTTP | Axios |
| State | React Context (AuthContext, ConnectedContext) |
| Storage | AsyncStorage |
| Testing | Jest + @testing-library/react-native |
| Icons | @expo/vector-icons (FontAwesome, MaterialIcons, Ionicons, etc.) |
| Date | date-fns + moment/moment-timezone |
| Validation | cpf-cnpj-validator |

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── custom-alert/
│   ├── custom-header/
│   ├── dotIndicator/
│   ├── empty-state/
│   ├── fab/
│   ├── initialloadingData/
│   ├── loading/
│   ├── oflline-banner/
│   └── teste/
├── contexts/       # React Context providers (auth, connectedContext)
├── database/       # SQLite schema + per-entity query files (queryProdutos, queryClientes, etc.)
├── hooks/          # Custom hooks (useSync*, useApi, configMoment, formatItem)
├── imgs/           # Static images
├── routes/         # Navigation config
│   ├── bottomTabsProduto/
│   └── stack/      # Main stack + Auth stack
├── screens/        # 30+ screens, one directory each
├── services/       # api.tsx, formatStrings, generatorSecret, moment, restartDatabase
├── styles/         # global.tsx (defaultColors + globalStyles)
├── types/          # Shared TypeScript types
└── utils/          # delay, id-generator
```

## Naming Conventions

- **Screens**: PascalCase or kebab-case directory with `index.tsx` (e.g., `screens/Produtos/index.tsx`, `screens/cadastro_produto/index.tsx`)
- **Components**: PascalCase directory with `index.tsx` or `component-name.tsx`
- **Hooks**: camelCase with `use` prefix (e.g., `useSyncProdutos.ts`)
- **Services/Utils**: camelCase (e.g., `formatStrings.ts`, `id-generator.ts`)
- **Database queries**: camelCase (e.g., `queryProdutos.ts`)
- **Exports**: Prefer named exports (`export const Home`), avoid `React.FC` type annotation

## Component Patterns

- **Functional components with hooks** (no class components)
- **Navigation/route props** typed with `:any` (inconsistent typing across files)
- **State**: `useState` for local state, `useContext` for global state; one `useReducer` in cadastro_produto
- **Side effects**: `useEffect` for data fetching, `navigation.addListener('focus', ...)` for refresh-on-focus
- **Custom headers** (`headerShown: false`), wrapped in `SafeAreaView`
- **Lists**: `FlatList` + `RefreshControl` for pull-to-refresh
- **Forms**: `ScrollView` + `KeyboardAvoidingView`
- **Error handling**: try/catch → `CustomAlert` modal for user-facing errors, `console.log` for debugging
- **Loading states**: `DotIndicatorLoadingData` / `InitialLoadingData` overlay components
- **Modal pattern**: Full-screen transparent overlay (`rgba(0,0,0,0.5)`) with centered white card, blue header, close button
- **List items**: Separate `renderItem` components as internal functions or in `renderItem/` subdirectories

## Navigation Structure

```
NavigationContainer
  └── AuthContext.logado?
        ├── false → AuthStack
        │     ├── inicio
        │     ├── registrar_empresa
        │     ├── login
        │     ├── enviar_codigo
        │     └── alterar_senha
        └── true → Main Stack (wrapped in OrcamentoProvider)
              ├── Home, produtos, setores, usuarios, ajustes
              ├── cadastro_produto, cadastro_setores, cadastro_cliente, etc.
              ├── clientes, fornecedores, vendas, compras, separacao
              └── ViewTabProdutos (BottomTab navigator)
                    ├── Produtos tab
                    ├── categorias tab
                    └── marcas tab
```

- Tab bar: blue background (`#185FED`), active background (`#00129A`), white labels
- All screens have `headerShown: false` (custom headers used)
- Param passing via `route.params`

## Styling

- **Method**: `StyleSheet.create()` at the bottom of each file (NO Tailwind, NO styled-components)
- **Occasional**: Plain JS style objects for dynamic styles
- **Spacing**: Multiples of 4–16 (padding 15-16, borderRadius 8-12)
- **Flexbox**: `flex: 1`, `flexDirection: 'row'/'column'`, `justifyContent`, `alignItems`
- **Shadows**: `elevation` (Android) + `shadowColor/Offset/Opacity/Radius` (iOS)
- **Positioning**: `position: 'absolute'` for FABs and bottom bars

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| Primary / Dark Blue | `#185FED` | Headers, buttons, tab bar, icons, active states |
| Light Blue (bg) | `#EAF4FE` | Screen backgrounds, icon containers |
| White | `#FFF` | Cards, modals, text on dark backgrounds |
| Gray (text) | `#5F666D` / `#555` / `#666` / `#757575` | Body text, labels |
| Light Gray | `#CCC` / `#E0E0E0` / `#F0F0F0` | Borders, dividers, placeholders |
| Green | `#4CAF50` / `#2D9F2D` | Success, connected status |
| Red | `#F44336` / `#D32F2F` | Error, danger actions |
| Orange | `#FF9800` | Warning alerts |
| Ice White | `#F2F2F2` | Subtle backgrounds |
| Dark Blue accent | `#00129A` | Tab bar active background |
| Light Blue bg soft | `#E3F2FD` / `#F5F7FA` | Secondary card backgrounds, inputs |

Color constants are defined in `src/styles/global.tsx` (`defaultColors`) but not consistently imported across the project.

## Layout Constants

| Element | Value |
|---|---|
| Card borderRadius | 10-12 |
| Card padding | 15-16 |
| Card elevation | 2-5 |
| Header bottom radius | 20 |
| FAB size | 56 |
| FAB borderRadius | 28 |
| Modal borderRadius | 16 |
| Modal overlay | rgba(0,0,0,0.5) |
| Avatar borderRadius | 50 |
| Button borderRadius | 8-10 |

## Database

- **Library**: expo-sqlite
- **Schema initialization**: `src/database/conexao.tsx`
- **Query files**: Per-entity in `src/database/query*` directories (queryProdutos, queryClientes, queryCategorias, queryMarcas, querySetores, etc.)
- **Sync pattern**: Hooks in `src/hooks/sync-*` pull data from REST API → SQLite with progress tracking callbacks

## API

- **Client**: Axios instance in `services/api.tsx`
- **Base URL**: `https://dev.intersig.com.br:3000`
- **Local fallback**: `http://10.1.1.222:3030` (for users with codigo `syma`)
- **Auth**: Token interceptor attached to Axios instance
- **Sync**: Pull data on login and via sync buttons in settings

## Contexts

- **`AuthContext`**: Stores `usuario` (codigo, email, nome, senha, token, lembrar) + `logado` boolean. Provides `setLogado` and `setUsuario`.
- **`ConnectedContext`**: Stores `connected` (API reachability) + `internetConnected` (device network status). Provides setters for both.

## Tools & Utilities

- **`useApi`**: Returns pre-configured Axios instance
- **`configMoment`**: Date formatting utilities (moment.js based)
- **`formatItem`**: String normalization + date formatting
- **`formatStrings.ts`**: String manipulation helpers (capitalize, format CNPJ/CPF, etc.)
- **`delay.ts`**: Promise-based delay utility
- **`id-generator.ts`**: ID generation for pedidos
- **`restartDatabase.ts`**: Database reset utility

## Testing

- **Framework**: Jest 29 + @testing-library/react-native
- **Manual mocks** in `__mocks__/`: expo-sqlite, react-navigation, expo-font
- **Test files**: Co-located in screen directories (`__test__/` or `__tests__/`)
- **Test count**: Currently 2 test files exist

## Conventions to Follow

1. Always use `StyleSheet.create()` for static styles at the bottom of the file
2. Use the blue (`#185FED`) + white color scheme consistently
3. Wrap the app content in `SafeAreaView`
4. Use custom headers with `headerShown: false`
5. Use `FlatList` + `RefreshControl` for list screens
6. Use `CustomAlert` for user-facing error/success messages
7. Use sync hooks for API-to-local database data flow
8. Co-locate test files next to screens
9. Use `navigation.addListener('focus', ...)` for data refresh on screen focus
10. Prefer named exports over default exports
11. Do NOT add third-party UI kits (keep using custom components)
12. Use `useContext` with AuthContext and ConnectedContext for global state
