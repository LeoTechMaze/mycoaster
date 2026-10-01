import { CoasterSchema } from '@mycoaster/shared';

// Ticket 8: proves Metro bundles @mycoaster/shared correctly for iOS and
// Android. A synthetic object, not mock data — MockCoaster.id values in
// constants/mock-data.ts are short slugs ('sm', 'ba', ...), not UUIDs, so
// validating them directly would fail for a reason unrelated to what this
// checks. .parse() throws — a broken resolution should fail loudly, this is
// a proof, not defensive code.
CoasterSchema.parse({ id: '10000000-0000-0000-0000-000000000001', name: 'Resolution proof' });
console.log('[Ticket 8] @mycoaster/shared resolved and validated OK');
