---
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Task, TodoWrite, AskUserQuestion
argument-hint: <feature-name>
description: Migrate a feature to config-driven pattern (98% boilerplate reduction)
---

# Codebase Setup: Config-Driven Migration

You are a **refactoring specialist** helping developers migrate features to a config-driven architecture. This pattern reduces boilerplate by 98% (370+ lines → ~8 lines) while improving maintainability.

## WHAT IS CONFIG-DRIVEN?

Config-driven architecture means:
1. **Single source of truth** - All feature behavior defined in one config file
2. **Auto-generated UI** - Filters, sorting, pagination rendered from config
3. **Consistent patterns** - Same structure across all features
4. **Easy modifications** - Change config, not code

### Before (Traditional)

```typescript
// 370+ lines of boilerplate per feature

// SortSelect component - 45 lines
const sortOptions = [
  { value: 'created_at_desc', label: 'Newest first' },
  { value: 'created_at_asc', label: 'Oldest first' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'total_desc', label: 'Highest total' },
  { value: 'total_asc', label: 'Lowest total' },
];
// ... render logic

// FilterPanel component - 120 lines
const statusOptions = [...];
const datePresets = [...];
// ... filter state, handlers, render

// Pagination component - 60 lines
// ... page state, handlers, render

// Controller parsing - 88 lines
const { page, limit, sortBy, sortOrder, status, search, ... } = req.query;
// ... validation, defaults, query building

// Frontend data fetching - 57 lines
// ... useQuery with all parameters
```

### After (Config-Driven)

```typescript
// ~8 lines config + auto-generated everything else

// config.ts
export const ordersConfig = {
  name: 'orders',
  displayName: 'Orders',
  tableName: 'orders',

  sortFields: ['created_at', 'name', 'total', 'status'],
  defaultSort: { field: 'created_at', order: 'desc' },

  pagination: { default: 20, max: 100 },

  filters: {
    status: { type: 'select', options: ['pending', 'completed', 'cancelled'] },
    search: { type: 'search', fields: ['order_number', 'customer_name'] },
    dateRange: { type: 'dateRange', presets: ['today', '7d', '30d', '90d', 'all'] }
  }
};

// Page component - 8 lines!
<ConfigDrivenPage
  config={ordersConfig}
  renderItem={(item) => <OrderCard order={item} />}
/>
```

## STAP 1: Analyseer Bestaande Feature

Zoek naar de huidige implementatie:

```bash
# Find feature files
find src/features/[FEATURE] -type f -name "*.ts" -o -name "*.tsx" 2>/dev/null

# Check current patterns
grep -rn "sortOptions\|sortFields\|SortSelect" src/features/[FEATURE] 2>/dev/null
grep -rn "pagination\|page\|limit\|offset" src/features/[FEATURE] 2>/dev/null
grep -rn "filter\|Filter\|search\|Search" src/features/[FEATURE] 2>/dev/null
```

Lees de relevante bestanden om te begrijpen:
- Welke sort opties zijn er?
- Welke filters worden gebruikt?
- Hoe werkt de pagination?
- Welke velden worden weergegeven?

## STAP 2: Extraheer Configuratie

Analyseer de code en extraheer:

### Sort Fields
```typescript
// Zoek in bestaande code naar sort opties
// Converteer naar config format:
sortFields: [
  { field: 'created_at', label: 'Date Created', default: true },
  { field: 'name', label: 'Name' },
  { field: 'total', label: 'Total' },
  { field: 'status', label: 'Status' }
]
```

### Filter Configuration
```typescript
// Analyseer bestaande filters en converteer:
filters: {
  status: {
    type: 'select',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ],
    defaultValue: 'all'
  },

  search: {
    type: 'search',
    label: 'Search',
    placeholder: 'Search orders...',
    searchFields: ['order_number', 'customer.name', 'customer.email']
  },

  dateRange: {
    type: 'dateRange',
    label: 'Date Range',
    field: 'created_at',
    presets: [
      { value: 'today', label: 'Today' },
      { value: 'yesterday', label: 'Yesterday' },
      { value: '7d', label: 'Last 7 days' },
      { value: '30d', label: 'Last 30 days' },
      { value: '90d', label: 'Last 90 days' },
      { value: 'all', label: 'All time' }
    ],
    defaultValue: 'all'
  },

  // Relationship filters
  customerId: {
    type: 'relation',
    label: 'Customer',
    relation: 'customers',
    displayField: 'name',
    searchable: true
  }
}
```

### Pagination Configuration
```typescript
pagination: {
  defaultLimit: 20,
  maxLimit: 100,
  limitOptions: [10, 20, 50, 100],
  showPageSize: true,
  showTotalCount: true
}
```

## STAP 3: Genereer Config File

Maak `src/features/[name]/config.ts`:

```typescript
import { FeatureConfig } from '@/shared/types/config';

/**
 * Configuration for the [Name] feature
 *
 * This config drives:
 * - Sorting options in the UI
 * - Filter components and their behavior
 * - Pagination settings
 * - Data fetching and display
 *
 * @see /docs/config-driven-architecture.md
 */
export const [name]Config: FeatureConfig = {
  // ═══════════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════════
  name: '[name]',
  displayName: '[Name]s',
  displayNameSingular: '[Name]',
  tableName: '[table_name]',

  // API endpoint (relative to base URL)
  endpoint: '/api/[name]s',

  // ═══════════════════════════════════════════════════════════════
  // SORTING
  // ═══════════════════════════════════════════════════════════════
  sortFields: [
    {
      field: 'created_at',
      label: 'Date Created',
      dbField: 'created_at' // If different from field
    },
    { field: 'name', label: 'Name' },
    { field: 'status', label: 'Status' },
    { field: 'total', label: 'Total', type: 'number' }
  ],

  defaultSort: {
    field: 'created_at',
    order: 'desc'
  },

  // ═══════════════════════════════════════════════════════════════
  // PAGINATION
  // ═══════════════════════════════════════════════════════════════
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
    limitOptions: [10, 20, 50, 100]
  },

  // ═══════════════════════════════════════════════════════════════
  // FILTERS
  // ═══════════════════════════════════════════════════════════════
  filters: {
    // Status filter (dropdown)
    status: {
      type: 'select',
      label: 'Status',
      param: 'status', // Query parameter name
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ],
      defaultValue: ''
    },

    // Search filter (text input)
    search: {
      type: 'search',
      label: 'Search',
      param: 'search',
      placeholder: 'Search by name, order number...',
      // Fields to search in (for backend/RPC)
      searchFields: ['name', 'order_number', 'customer.name'],
      debounceMs: 300
    },

    // Date range filter
    dateRange: {
      type: 'dateRange',
      label: 'Date',
      param: 'time_period', // Or 'start_date' + 'end_date' for custom
      field: 'created_at',
      presets: [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' },
        { value: 'all', label: 'All time' }
      ],
      defaultValue: 'all',
      allowCustomRange: true
    },

    // Relationship filter (e.g., filter by customer)
    customerId: {
      type: 'relation',
      label: 'Customer',
      param: 'customer_id',
      relation: {
        table: 'customers',
        valueField: 'id',
        labelField: 'name',
        searchable: true
      }
    },

    // Boolean filter
    isActive: {
      type: 'boolean',
      label: 'Active Only',
      param: 'is_active',
      defaultValue: false
    },

    // Number range filter
    totalRange: {
      type: 'numberRange',
      label: 'Total Amount',
      paramMin: 'total_min',
      paramMax: 'total_max',
      min: 0,
      max: 10000,
      step: 100
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // DISPLAY CONFIGURATION
  // ═══════════════════════════════════════════════════════════════
  display: {
    // List view columns
    listColumns: [
      { field: 'name', label: 'Name', width: '30%' },
      { field: 'status', label: 'Status', width: '15%', type: 'badge' },
      { field: 'total', label: 'Total', width: '15%', type: 'currency' },
      { field: 'createdAt', label: 'Created', width: '20%', type: 'date' },
      { field: 'actions', label: '', width: '20%', type: 'actions' }
    ],

    // Card view fields
    cardFields: {
      title: 'name',
      subtitle: 'customer.name',
      badge: 'status',
      metadata: ['total', 'createdAt']
    },

    // Empty state
    emptyState: {
      title: 'No [name]s found',
      description: 'Create your first [name] to get started.',
      actionLabel: 'Create [Name]',
      actionPath: '/[name]s/new'
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // ENRICHMENT (auto-transform related data)
  // ═══════════════════════════════════════════════════════════════
  enrichment: [
    {
      sourceField: 'customer_id',
      targetField: 'customer',
      relation: 'customers',
      select: ['id', 'name', 'email']
    }
  ],

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════
  actions: {
    create: { enabled: true, label: 'New [Name]' },
    edit: { enabled: true },
    delete: { enabled: true, confirm: true },
    export: { enabled: true, formats: ['csv', 'xlsx'] },
    bulkActions: ['delete', 'archive']
  }
};

// Type-safe export
export type [Name]Config = typeof [name]Config;
```

## STAP 4: Maak Shared Components

Als deze nog niet bestaan, maak ze aan in `src/shared/components/config-driven/`:

### ConfigDrivenPage.tsx
```typescript
import { useConfigDrivenQuery } from '@/shared/hooks/useConfigDrivenQuery';
import { FeatureConfig } from '@/shared/types/config';
import { ConfigFilters } from './ConfigFilters';
import { ConfigSort } from './ConfigSort';
import { ConfigPagination } from './ConfigPagination';
import { EmptyState, LoadingState } from '../feedback';

interface ConfigDrivenPageProps<T> {
  config: FeatureConfig;
  renderItem: (item: T) => React.ReactNode;
  renderList?: (items: T[]) => React.ReactNode;
  header?: React.ReactNode;
}

export function ConfigDrivenPage<T>({
  config,
  renderItem,
  renderList,
  header
}: ConfigDrivenPageProps<T>) {
  const {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    sort,
    setSort,
    page,
    setPage,
    totalCount
  } = useConfigDrivenQuery<T>(config);

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {header}

      {/* Filters & Sort Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <ConfigFilters
          config={config.filters}
          value={filters}
          onChange={setFilters}
        />
        <ConfigSort
          options={config.sortFields}
          value={sort}
          onChange={setSort}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : data?.length === 0 ? (
        <EmptyState {...config.display.emptyState} />
      ) : renderList ? (
        renderList(data)
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item, index) => (
            <div key={(item as any).id || index}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <ConfigPagination
        config={config.pagination}
        page={page}
        totalCount={totalCount}
        onChange={setPage}
      />
    </div>
  );
}
```

### useConfigDrivenQuery.ts
```typescript
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FeatureConfig, FilterValues, SortValue } from '@/shared/types/config';

export function useConfigDrivenQuery<T>(config: FeatureConfig) {
  // State from config defaults
  const [filters, setFilters] = useState<FilterValues>(() =>
    getDefaultFilters(config.filters)
  );
  const [sort, setSort] = useState<SortValue>(config.defaultSort);
  const [page, setPage] = useState(1);
  const [limit] = useState(config.pagination.defaultLimit);

  // Build query parameters
  const queryParams = useMemo(() => ({
    ...filters,
    sortBy: sort.field,
    sortOrder: sort.order,
    page,
    limit
  }), [filters, sort, page, limit]);

  // Query key includes all parameters
  const queryKey = [config.name, queryParams];

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchConfigData<T>(config.endpoint, queryParams)
  });

  return {
    data: data?.data ?? [],
    totalCount: data?.pagination?.totalCount ?? 0,
    isLoading,
    error,
    filters,
    setFilters,
    sort,
    setSort,
    page,
    setPage
  };
}

function getDefaultFilters(filtersConfig: FeatureConfig['filters']): FilterValues {
  const defaults: FilterValues = {};

  for (const [key, config] of Object.entries(filtersConfig)) {
    if (config.defaultValue !== undefined) {
      defaults[key] = config.defaultValue;
    }
  }

  return defaults;
}

async function fetchConfigData<T>(endpoint: string, params: Record<string, any>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== null) {
      searchParams.set(key, String(value));
    }
  }

  const response = await fetch(`${endpoint}?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch');

  return response.json();
}
```

## STAP 5: Migreer de Feature Page

Vervang de bestaande page component:

### Before (Old Pattern)
```typescript
// src/features/orders/pages/OrdersPage.tsx - 150+ lines
export function OrdersPage() {
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', { status, search, dateRange, sortBy, sortOrder, page }],
    queryFn: () => orderService.getAll({ status, search, dateRange, sortBy, sortOrder, page })
  });

  // ... 100+ more lines of filter components, pagination, etc.
}
```

### After (Config-Driven)
```typescript
// src/features/orders/pages/OrdersPage.tsx - 20 lines
import { ConfigDrivenPage } from '@/shared/components/config-driven';
import { ordersConfig } from '../config';
import { OrderCard } from '../components/OrderCard';
import { Order } from '../types';

export function OrdersPage() {
  return (
    <ConfigDrivenPage<Order>
      config={ordersConfig}
      header={
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Orders</h1>
          <Link to="/orders/new" className="btn btn-primary">
            New Order
          </Link>
        </div>
      }
      renderItem={(order) => <OrderCard order={order} />}
    />
  );
}
```

## STAP 6: Update Backend (Optional)

Als de backend nog geen config-driven queries ondersteunt, update de controller:

```typescript
// src/features/orders/controller.ts
import { ordersConfig } from './config';
import { parseConfigQuery } from '@/shared/utils/configQuery';

export async function getAll(req: Request, res: Response) {
  const userId = req.user!.id;

  // Parse query based on config
  const { filters, sort, pagination } = parseConfigQuery(req.query, ordersConfig);

  const result = await service.getAll(userId, { filters, sort, pagination });

  return ApiResponse.success(res, result);
}
```

## STAP 7: Genereer Rapport

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    ⚙️  CONFIG-DRIVEN MIGRATION COMPLETE                    ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  Feature: [name]                                                           ║
║                                                                            ║
║  LINES OF CODE                                                             ║
║  ┌─────────────────────────┬──────────┬──────────┬───────────┐             ║
║  │ Component               │  Before  │  After   │  Saved    │             ║
║  ├─────────────────────────┼──────────┼──────────┼───────────┤             ║
║  │ Sort Options            │    45    │    8     │    37     │             ║
║  │ Filter Components       │   120    │    0*    │   120     │             ║
║  │ Pagination              │    60    │    0*    │    60     │             ║
║  │ Controller Parsing      │    88    │   15     │    73     │             ║
║  │ Page Component          │   150    │   20     │   130     │             ║
║  ├─────────────────────────┼──────────┼──────────┼───────────┤             ║
║  │ TOTAL                   │   463    │   43     │   420     │             ║
║  └─────────────────────────┴──────────┴──────────┴───────────┘             ║
║                                                                            ║
║  * Uses shared ConfigDrivenPage component                                  ║
║                                                                            ║
║  REDUCTION: 91% less feature-specific code                                 ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  FILES CREATED/MODIFIED                                                    ║
║  ├─ ✅ src/features/[name]/config.ts ········ NEW                          ║
║  ├─ ✅ src/features/[name]/pages/[Name]Page.tsx · SIMPLIFIED               ║
║  └─ ✅ src/features/[name]/controller.ts ···· UPDATED                      ║
║                                                                            ║
║  SHARED COMPONENTS (if created)                                            ║
║  ├─ src/shared/components/config-driven/ConfigDrivenPage.tsx               ║
║  ├─ src/shared/components/config-driven/ConfigFilters.tsx                  ║
║  ├─ src/shared/components/config-driven/ConfigSort.tsx                     ║
║  ├─ src/shared/components/config-driven/ConfigPagination.tsx               ║
║  └─ src/shared/hooks/useConfigDrivenQuery.ts                               ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  BENEFITS                                                                  ║
║  ✅ Single source of truth for feature behavior                            ║
║  ✅ Consistent UX across all features                                      ║
║  ✅ Easy to add/modify filters and sorting                                 ║
║  ✅ Type-safe configuration                                                ║
║  ✅ Reduced maintenance burden                                             ║
║                                                                            ║
║  NEXT STEPS                                                                ║
║  1. Test all filters and sorting options                                   ║
║  2. Migrate next feature: /codebase-setup:config-driven [next-feature]     ║
║  3. Consider creating RPC functions for complex queries                    ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## BELANGRIJKE NOTES

1. **Incrementeel migreren** - Migreer één feature tegelijk
2. **Tests behouden** - Zorg dat bestaande tests blijven werken
3. **Backwards compatible** - Oude URLs/API's blijven werken
4. **Shared components eerst** - Maak shared components als ze niet bestaan
5. **Type safety** - Gebruik TypeScript voor config validation

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
