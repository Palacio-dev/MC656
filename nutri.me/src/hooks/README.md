# Hooks (ViewModels)

This folder contains custom React hooks that serve as **ViewModels** in the MVVM architecture.

## Architecture Pattern

Following the **MVVM (Model-View-ViewModel)** pattern:

- **Model**: `src/models/` and `src/services/` - Data structures and business logic
- **ViewModel**: `src/hooks/` - Presentation logic and state management
- **View**: `src/Pages/` - UI components

## Available Hooks

### `useRecipeSearch.ts`

Custom hook for recipe search functionality.

**Purpose**: Manages recipe search state, loading, and error handling.

**Usage**:
```tsx
import { useRecipeSearch } from '../hooks/useRecipeSearch';

function RecipeSearchPage() {
  const {
    searchQuery,
    searchResults,
    isLoading,
    error,
    hasSearched,
    handleSearchChange,
    handleSearchSubmit,
    clearSearch,
  } = useRecipeSearch();

  // Use the state and actions in your component
}
```

**State**:
- `searchQuery: string` - Current search input value
- `searchResults: RecipeSearchResult[]` - Array of search results
- `isLoading: boolean` - Loading state during API calls
- `error: string | null` - Error message if search fails
- `hasSearched: boolean` - Whether a search has been performed

**Actions**:
- `handleSearchChange(query: string)` - Update search query
- `handleSearchSubmit()` - Execute search with current query
- `performSearch(query: string)` - Execute search with specific query
- `clearSearch()` - Reset all state

## Creating New Hooks

When creating a new ViewModel hook:

1. Name it with `use` prefix (e.g., `useRecipeDetails`, `useShoppingList`)
2. Keep business logic in services, not in hooks
3. Handle loading and error states
4. Return both state and actions
5. Use `useCallback` for action functions to prevent unnecessary re-renders
6. Document the hook's purpose, state, and actions

## Best Practices

- ✅ Keep hooks focused on presentation logic
- ✅ Delegate business logic to services
- ✅ Handle loading and error states
- ✅ Use TypeScript for type safety
- ✅ Document complex logic with comments
- ❌ Don't put API calls directly in hooks (use services)
- ❌ Don't mix unrelated concerns in one hook
