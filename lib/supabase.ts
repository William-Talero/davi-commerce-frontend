// Mock Supabase client for compatibility
// Since we're using the NestJS backend instead of Supabase directly,
// this is a compatibility layer for existing code

interface MockSupabaseClient {
  from: (table: string) => MockSupabaseQuery;
}

interface MockSupabaseQuery {
  select: (columns?: string) => MockSupabaseQuery;
  insert: (data: any) => MockSupabaseQuery;
  update: (data: any) => MockSupabaseQuery;
  delete: () => MockSupabaseQuery;
  eq: (column: string, value: any) => MockSupabaseQuery;
  order: (column: string, options?: { ascending?: boolean }) => MockSupabaseQuery;
  limit: (count: number) => MockSupabaseQuery;
  single: () => Promise<{ data: any; error: any }>;
  lt: (column: string, value: any) => MockSupabaseQuery;
  data?: any;
  error?: any;
}

// Mock implementation that redirects to our backend
const createMockQuery = (): MockSupabaseQuery => ({
  select: () => createMockQuery(),
  insert: () => createMockQuery(),
  update: () => createMockQuery(),
  delete: () => createMockQuery(),
  eq: () => createMockQuery(),
  order: () => createMockQuery(),
  limit: () => createMockQuery(),
  lt: () => createMockQuery(),
  single: async () => ({ data: null, error: new Error("Mock Supabase - use backend API instead") }),
  data: null,
  error: new Error("Mock Supabase - use backend API instead"),
});

export const supabase: MockSupabaseClient = {
  from: (table: string) => {
    console.warn(`Mock Supabase call to table '${table}'. Consider migrating to backend API calls.`);
    return createMockQuery();
  }
};

// Note: This is a compatibility layer. For new features, use the backend API directly
// through apiClient from @/lib/api instead of this mock Supabase client.