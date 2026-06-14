const USER_ID         = '30000000-0000-0000-0000-000000000001';
const CW_ID           = '10000000-0000-0000-0000-000000004539';
const HH_ID           = '10000000-0000-0000-0000-000000004947';
const EMPTY_PARK_ID   = '10000000-0000-0000-0000-000000000003';
const CW_LEVIATHAN_ID = '20000000-0000-0000-0000-000000000001';

const users = [
  {
    id: USER_ID,
    name: 'Test User',
    email: 'test@mycoaster.app',
    firebase_uid: 'firebase-seed-user-001',
    auth_provider: 'google',
    avatar_url: null,
  },
];

const parks = [
  {
    id: CW_ID,
    name: "Canada's Wonderland",
    rcdb_id: '4539',
    country: 'Canada',
    city: 'Vaughan',
    latitude: 43.8430,
    longitude: -79.5370,
    status: 'operating',
    synced_at: new Date(),
  },
  {
    id: HH_ID,
    name: 'Hopi Hari',
    rcdb_id: '4947',
    country: 'Brazil',
    city: 'Vinhedo',
    latitude: -23.0970,
    longitude: -46.9460,
    status: 'operating',
    synced_at: new Date(),
  },
  {
    id: EMPTY_PARK_ID,
    name: 'Empty Test Park',
    rcdb_id: 'test-empty',
    country: 'Testland',
    city: 'Testville',
    latitude: 0,
    longitude: 0,
    status: 'operating',
    synced_at: new Date(),
  },
];

const coasters = [
  // Canada's Wonderland — Leviathan has a fixed ID for test assertions
  { id: CW_LEVIATHAN_ID, park_id: CW_ID, name: 'Leviathan',                   rcdb_id: '10108', status: 'operating' },
  {                       park_id: CW_ID, name: 'AlpenFury',                   rcdb_id: '22016', status: 'operating' },
  {                       park_id: CW_ID, name: 'Backlot Stunt Coaster',       rcdb_id: '2861',  status: 'operating' },
  {                       park_id: CW_ID, name: 'Bat',                         rcdb_id: '64',    status: 'operating' },
  {                       park_id: CW_ID, name: 'Behemoth',                    rcdb_id: '4005',  status: 'operating' },
  {                       park_id: CW_ID, name: 'Dragon Fyre',                 rcdb_id: '58',    status: 'operating' },
  {                       park_id: CW_ID, name: 'DareDeviler',                 rcdb_id: '57',    status: 'operating' },
  {                       park_id: CW_ID, name: 'Fly',                         rcdb_id: '540',   status: 'operating' },
  {                       park_id: CW_ID, name: 'Ghoster Coaster',             rcdb_id: '61',    status: 'operating' },
  {                       park_id: CW_ID, name: 'Mighty Canadian Minebuster',  rcdb_id: '59',    status: 'operating' },
  {                       park_id: CW_ID, name: 'Silver Streak',               rcdb_id: '734',   status: 'operating' },
  {                       park_id: CW_ID, name: "Snoopy's Racing Railway",     rcdb_id: '20343', status: 'operating' },
  {                       park_id: CW_ID, name: 'Taxi Jam',                    rcdb_id: '506',   status: 'operating' },
  {                       park_id: CW_ID, name: 'Thunder Run',                 rcdb_id: '63',    status: 'operating' },
  {                       park_id: CW_ID, name: 'Vortex',                      rcdb_id: '65',    status: 'operating' },
  {                       park_id: CW_ID, name: 'Wilde Beast',                 rcdb_id: '60',    status: 'operating' },
  {                       park_id: CW_ID, name: "Wonder Mountain's Guardian",  rcdb_id: '12140', status: 'operating' },
  {                       park_id: CW_ID, name: 'Yukon Striker',               rcdb_id: '16021', status: 'operating' },
  {                       park_id: CW_ID, name: 'Blauer Enzian',               rcdb_id: '23193', status: 'defunct'   },
  {                       park_id: CW_ID, name: 'SkyRider',                    rcdb_id: '62',    status: 'defunct'   },
  {                       park_id: CW_ID, name: 'Time Warp',                   rcdb_id: '2516',  status: 'defunct'   },

  // Hopi Hari
  { park_id: HH_ID, name: 'Katapul',    rcdb_id: '1152',  status: 'operating' },
  { park_id: HH_ID, name: 'Montezum',   rcdb_id: '1150',  status: 'operating' },
  { park_id: HH_ID, name: "Speedi '64", rcdb_id: '1153',  status: 'operating' },
  { park_id: HH_ID, name: 'Vurang',     rcdb_id: '1151',  status: 'operating' },
  { park_id: HH_ID, name: 'unknown',    rcdb_id: '10237', status: 'defunct'   },

  // Empty Test Park has no coasters — used by tests that assert an empty array
];

// Initial-data seed: runs once against an empty database. It deliberately
// never deletes anything — the test harness (tests/globalSetup.js) owns
// resetting the test DB before seeding.
exports.seed = async function (knex) {
  await knex('users').insert(users);
  await knex('parks').insert(parks);
  await knex('coasters').insert(
    coasters.map((c) => ({ ...c, synced_at: new Date() }))
  );
};
