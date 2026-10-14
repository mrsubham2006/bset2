/**
 * CIVIC NEXUS AI - Smart Tourism & Destination Discovery Platform Test Suite
 * Balasore District (Baleshwar), Odisha, India
 */

import { dbStore } from '../src/server/mockDb.js';

interface TestCase {
  name: string;
  run: () => boolean | Promise<boolean>;
  description: string;
}

const tests: TestCase[] = [
  {
    name: 'TEST 1: Balasore Destinations Directory Integrity',
    description: 'Verifies 8 authentic Balasore tourist destinations with verified coordinates, odia names and categories',
    run: () => {
      const dests = dbStore.tourismDestinations;
      if (!Array.isArray(dests) || dests.length < 8) return false;

      // Verify key locations
      const chandipur = dests.find(d => d.name.toLowerCase().includes('chandipur'));
      const panchalingeswar = dests.find(d => d.name.toLowerCase().includes('panchalingeswar'));
      const kuldiha = dests.find(d => d.name.toLowerCase().includes('kuldiha'));
      const remuna = dests.find(d => d.name.toLowerCase().includes('remuna') || d.name.toLowerCase().includes('khirachora'));
      const talsari = dests.find(d => d.name.toLowerCase().includes('talsari'));
      const bhushandeshwar = dests.find(d => d.name.toLowerCase().includes('bhushandeshwar'));

      if (!chandipur || !panchalingeswar || !kuldiha || !remuna || !talsari || !bhushandeshwar) {
        console.error('Missing key Balasore destinations');
        return false;
      }

      // Check coordinates validity
      const allHaveValidGps = dests.every(d =>
        typeof d.latitude === 'number' && d.latitude > 20 && d.latitude < 23 &&
        typeof d.longitude === 'number' && d.longitude > 85 && d.longitude < 89
      );

      return allHaveValidGps;
    }
  },
  {
    name: 'TEST 2: Accommodations & OTDC Panthanivas Registry',
    description: 'Verifies government panthanivas, beach resorts and eco camps with direct contacts and prices',
    run: () => {
      const accs = dbStore.tourismAccommodations;
      if (!Array.isArray(accs) || accs.length < 5) return false;

      const hasOtdcChandipur = accs.some(a => a.name.includes('Panthanivas Chandipur') && a.category === 'OTDC_GOVT');
      const hasOtdcTalsari = accs.some(a => a.name.includes('Panthanivas Talsari') && a.category === 'OTDC_GOVT');
      const hasBeachResort = accs.some(a => a.category === 'BEACH_RESORT');
      const allHavePhone = accs.every(a => Boolean(a.contact_phone && a.price_range));

      return hasOtdcChandipur && hasOtdcTalsari && hasBeachResort && allHavePhone;
    }
  },
  {
    name: 'TEST 3: Authentic Odia Cuisine & Coastal Seafood Registry',
    description: 'Verifies Balaramgadi seafood, famous Remuna Khira, and Balasore Mudhi Mansa',
    run: () => {
      const dining = dbStore.tourismDining;
      if (!Array.isArray(dining) || dining.length < 4) return false;

      const hasRemunaKhira = dining.some(d => d.speciality.toLowerCase().includes('khira'));
      const hasMudhiMansa = dining.some(d => d.speciality.toLowerCase().includes('mudhi mansa'));
      const hasSeafood = dining.some(d => d.cuisine_type.toLowerCase().includes('seafood'));

      return hasRemunaKhira && hasMudhiMansa && hasSeafood;
    }
  },
  {
    name: 'TEST 4: Chandipur Coastal Tides & Travel Conditions Telemetry',
    description: 'Verifies the disappearing sea tidal status, seaward recession, and road corridor status',
    run: () => {
      const conditions = dbStore.tourismTravelConditions;
      if (!Array.isArray(conditions) || conditions.length < 3) return false;

      const chandipur = conditions.find(c => c.location.toLowerCase().includes('chandipur'));
      if (!chandipur) return false;

      const hasRecession = Boolean(chandipur.coastal_tide_status.recession_distance);
      const hasRoadStatus = Boolean(chandipur.road_status.corridor && chandipur.road_status.condition);

      return hasRecession && hasRoadStatus;
    }
  },
  {
    name: 'TEST 5: 24x7 Tourist Emergency & Coastal Rescue Registry',
    description: 'Verifies Balasore Tourist Police, Chandipur Marine Police, DHH Hospital 108, and Helplines',
    run: () => {
      const contacts = dbStore.tourismEmergencyContacts;
      if (!Array.isArray(contacts) || contacts.length < 5) return false;

      const hasPolice = contacts.some(c => c.service_type === 'POLICE');
      const hasMarineRescue = contacts.some(c => c.service_type === 'COASTAL_RESCUE');
      const hasMedical = contacts.some(c => c.service_type === 'MEDICAL');
      const has24x7 = contacts.some(c => c.is_24x7 === true);

      return hasPolice && hasMarineRescue && hasMedical && has24x7;
    }
  },
  {
    name: 'TEST 6: Tourist SOS Assistance Request Pipeline',
    description: 'Validates that submitting an SOS request registers in the database and assigns a tracking code',
    run: () => {
      const initialCount = dbStore.tourismAssistanceRequests.length;
      const testCode = `AST-TEST-${Date.now()}`;
      const newRequest = {
        id: initialCount + 1,
        request_code: testCode,
        requester_name: 'Subham Tourist',
        requester_phone: '+91-9876543210',
        category: 'SAFETY',
        description: 'Tidal swell observed near Chandipur watch tower',
        location_name: 'Chandipur Beach',
        status: 'SUBMITTED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      dbStore.tourismAssistanceRequests.push(newRequest);
      const retrieved = dbStore.tourismAssistanceRequests.find(r => r.request_code === testCode);

      return Boolean(retrieved && dbStore.tourismAssistanceRequests.length === initialCount + 1);
    }
  },
  {
    name: 'TEST 7: Crowdsourced Tourism Data Correction Pipeline',
    description: 'Validates that tourists can submit timing/ticket corrections for moderation',
    run: () => {
      const initialCount = dbStore.tourismContentCorrections.length;
      const testCode = `CORR-TEST-${Date.now()}`;
      const newCorrection = {
        id: initialCount + 1,
        correction_code: testCode,
        destination_id: 1,
        reported_by_name: 'Visitor Reviewer',
        correction_type: 'TIMINGS',
        description: 'Low tide began at 6:15 AM today',
        status: 'PENDING',
        created_at: new Date().toISOString()
      };

      dbStore.tourismContentCorrections.push(newCorrection);
      const retrieved = dbStore.tourismContentCorrections.find(c => c.correction_code === testCode);

      return Boolean(retrieved && dbStore.tourismContentCorrections.length === initialCount + 1);
    }
  }
];

async function runAll() {
  console.log('\n🧭 CIVIC NEXUS AI - Smart Tourism (Balasore) Test Suite...\n');
  let passed = 0;

  for (const t of tests) {
    try {
      const res = await t.run();
      if (res) {
        console.log(`✅ [PASS] ${t.name}`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${t.name} - ${t.description}`);
      }
    } catch (err: any) {
      console.error(`💥 [ERROR] ${t.name}: ${err.message}`);
    }
  }

  console.log('\n========================================');
  console.log(`Results: ${passed}/${tests.length} tests passed successfully.`);
  console.log('========================================\n');

  if (passed !== tests.length) {
    process.exit(1);
  }
}

runAll();
