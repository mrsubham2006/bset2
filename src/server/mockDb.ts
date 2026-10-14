// Stateful in-memory database seeded with Odisha Smart City default data

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  sla_hours: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  department_id?: number;
  is_active: boolean;
  created_at: string;
}

export interface Incident {
  id: number;
  incident_code: string;
  title: string;
  category: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'REPORTED' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
  address: string;
  latitude: number;
  longitude: number;
  assigned_department_id?: number;
  is_verified: boolean;
  priority_score: number;
  priority_factors?: any;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  report_code: string;
  incident_id?: number;
  citizen_name?: string;
  citizen_phone?: string;
  title: string;
  category: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  media_urls?: string[];
  voice_url?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ATTACHED_TO_INCIDENT' | 'RESOLVED';
  ai_processed: boolean;
  created_at: string;
}

export interface TaskProgressUpdate {
  id: number;
  task_id: number;
  status: string;
  notes: string;
  blocker_reported?: boolean;
  photo_url?: string;
  created_at: string;
}

export interface TaskHistoryEvent {
  id: number;
  task_id: number;
  event_type: string;
  actor_role: string;
  actor_name: string;
  message: string;
  created_at: string;
}

export interface Task {
  id: number;
  incident_id: number;
  department_id: number;
  department_name?: string;
  assigned_to_worker_id?: number;
  worker_name?: string;
  worker_phone?: string;
  worker_code?: string;
  supervisor_id?: number;
  supervisor_name?: string;
  title: string;
  category?: string;
  description?: string;
  instructions?: string;
  priority: string;
  status: 'CREATED' | 'ASSIGNED' | 'ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'COMPLETED' | 'REJECTED' | 'RETURNED' | 'CANCELLED';
  rejection_reason?: string;
  rejection_notes?: string;
  deadline?: string;
  started_at?: string;
  accepted_at?: string;
  on_the_way_at?: string;
  arrived_at?: string;
  completed_at?: string;
  submitted_at?: string;
  verified_at?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  checkin_latitude?: number;
  checkin_longitude?: number;
  checkin_distance_meters?: number;
  checkin_within_radius?: boolean;
  before_photo_url?: string;
  before_photo_desc?: string;
  after_photo_url?: string;
  after_photo_desc?: string;
  worker_notes?: string;
  completion_summary?: string;
  materials_used?: string;
  equipment_required?: string;
  completion_proof_url?: string;
  supervisor_feedback?: string;
  progress_updates?: TaskProgressUpdate[];
  history?: TaskHistoryEvent[];
  created_at: string;
  updated_at?: string;
}

export interface EmergencyCase {
  id: number;
  incident_id: number;
  emergency_type: string;
  severity: string;
  coordinator_id?: number;
  assigned_units?: string[];
  ambulance_id?: string;
  hospital_id?: number;
  destination_hospital_name?: string;
  eta_minutes: number;
  route_status: string;
  route_waypoints?: { lat: number; lng: number; name?: string }[];
  status: string;
  created_at: string;
}

export interface Hospital {
  id: number;
  name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  total_beds: number;
  available_beds: number;
  icu_beds: number;
  available_icu: number;
  blood_bank_status: string;
  trauma_level: string;
  contact_phone?: string;
}

export interface RoadRestriction {
  id: number;
  incident_id?: number;
  road_name: string;
  segment_description: string;
  restriction_type: string;
  status: 'ACTIVE' | 'CLEARED';
  lat_start: number;
  lng_start: number;
  lat_end: number;
  lng_end: number;
  created_at: string;
  cleared_at?: string;
}

export interface CameraSource {
  id: number;
  camera_code: string;
  location_name: string;
  latitude: number;
  longitude: number;
  status: string;
  stream_status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  stream_url?: string;
  fps: number;
  frame_sampling_fps: number;
  supported_types: string[];
  active_detections: any[];
  current_model: string;
  last_successful_frame_at: string;
  last_heartbeat: string;
}

export interface BoundingBoxDetection {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  trackId?: string;
}

export interface AIDetectionEvent {
  candidateId: string;
  cameraId: number;
  cameraCode: string;
  locationName: string;
  latitude: number;
  longitude: number;
  detectionType: string;
  confidenceScore: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  evidenceReferences: string[];
  locationReference: string;
  verificationStatus: 'AI-DETECTED' | 'AWAITING-VERIFICATION' | 'VERIFIED' | 'FALSE-ALARM' | 'RESOLVED';
  modelVersion: string;
  processingStatus: 'STREAMING' | 'ANALYZING' | 'STABLE' | 'DEGRADED';
  incidentId?: number;
  boundingBoxes: BoundingBoxDetection[];
  estimatedVehicleCount?: number;
  notes?: string;
}

export interface EmergencyAlert {
  alertId: string;
  incidentId: number;
  candidateId?: string;
  emergencyType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  alertStatus: 'NEW' | 'ACKNOWLEDGED' | 'ESCALATED' | 'DISPATCHED' | 'RESOLVED' | 'FALSE_ALARM';
  verificationStatus: 'AI-DETECTED' | 'AWAITING-VERIFICATION' | 'VERIFIED' | 'FALSE-ALARM' | 'RESOLVED';
  createdAt: string;
  acknowledgementDeadline: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  escalated: boolean;
  escalationLevel: number;
  escalationLog?: { level: number; notifiedRole: string; timestamp: string; reason: string }[];
  cameraCode?: string;
  location: string;
  latitude: number;
  longitude: number;
  confidenceScore: number;
  recommendedAction: string;
  soundTriggered: boolean;
  assignedUnitId?: string;
  assignedDepartmentName?: string;
  summaryAi?: string;
}

export interface EmergencyVehicle {
  id: string;
  vehicleType: 'AMBULANCE_108' | 'FIRE_ENGINE' | 'POLICE_PATROL' | 'DISASTER_RESCUE';
  callSign: string;
  licensePlate: string;
  baseStationName: string;
  driverName: string;
  contactNumber: string;
  currentStatus: 'ON_PATROL' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'RETURNING' | 'AVAILABLE';
  latitude: number;
  longitude: number;
  speedKmh: number;
  heading: number;
  fuelPercent: number;
  assignedIncidentId?: number;
  destinationHospitalName?: string;
  etaMinutes?: number;
  lastGpsUpdate: string;
  isDemo: boolean;
}

export interface EmergencyResponseDispatch {
  responseId: string;
  incidentId: number;
  alertId?: string;
  responseType: 'AMBULANCE' | 'FIRE_BRIGADE' | 'POLICE_ESCORT' | 'MUNICIPAL_DISASTER_CREW';
  assignedUnitId: string;
  assignedUnitName: string;
  dispatchedBy: string;
  dispatchedAt: string;
  responseStatus: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'PATIENT_LOADED' | 'COMPLETED' | 'CANCELLED';
  arrivedAt?: string;
  resolvedAt?: string;
  etaMinutes: number;
  responderNotes?: string;
  isDemo: boolean;
}

export interface AlertDeliveryLog {
  deliveryId: string;
  alertId: string;
  recipientRole: string;
  recipientEmail: string;
  channel: 'IN_APP' | 'SSE_STREAM' | 'WEBHOOK' | 'SMS_SIMULATED';
  deliveryStatus: 'DELIVERED' | 'PENDING' | 'FAILED';
  attemptedAt: string;
}

export interface AlertEscalationRecord {
  escalationId: string;
  alertId: string;
  level: number;
  escalatedToRole: string;
  reason: string;
  timestamp: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface VideoAnalysisEvent {
  eventId: string;
  videoAnalysisId: string;
  eventType: string;
  videoTimestamp: string;
  videoTimestampSeconds: number;
  confidenceScore: number;
  evidenceThumbnail: string;
  boundingBoxes: { label: string; confidence: number; x: number; y: number; width: number; height: number; color: string }[];
  trackingId?: string;
  trackingStatus?: string;
  description: string;
  verificationStatus: 'AI_CANDIDATE' | 'AWAITING_VERIFICATION' | 'VERIFIED' | 'FALSE_ALARM' | 'RESOLVED';
  recommendedAction: string;
  incidentId?: number;
  alertId?: string;
}

export interface VideoAnalysis {
  videoAnalysisId: string;
  uploadedBy: string;
  storageReference: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  durationSeconds: number;
  resolution: string;
  framesAnalyzed: number;
  analysisStatus: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processingStartedAt: string;
  processingCompletedAt?: string;
  pipelineVersion: string;
  locationName: string;
  cameraCode?: string;
  recordedAt?: string;
  description?: string;
  summaryNarrative: string;
  detectedEmergency: boolean;
  events: VideoAnalysisEvent[];
  routeVerificationStatus?: 'UNVERIFIED' | 'VERIFIED' | 'NOT_APPLICABLE';
  routeClearanceRequestId?: string;
  errorDetail?: string;
}

export interface RouteClearanceRequest {
  requestId: string;
  incidentId: number;
  alertId?: string;
  videoAnalysisId?: string;
  vehicleType: 'AMBULANCE' | 'FIRE_ENGINE' | 'POLICE_ESCORT' | 'DISASTER_RESCUE';
  vehicleCallSign?: string;
  routeReference: string;
  requestedBy: string;
  requestStatus: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'CLEARED' | 'REJECTED';
  originLocation: string;
  destinationHospital: string;
  corridorSegments: { segmentName: string; roadName: string; status: 'CLEAR' | 'CONGESTED' | 'PREEMPTED'; etaMinutes: number }[];
  preemptionSignals: string[];
  trafficClearanceNotice: string;
  createdAt: string;
  updatedAt: string;
}

export interface TourismPlace {
  id: number;
  name: string;
  odia_name: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  cultural_significance?: string;
  timings: string;
  accessibility_notes: string;
  current_safety_status: string;
}

// ── BALASORE SMART TOURISM EXTENDED INTERFACES ──────────────────────────────

export interface TourismDestination {
  id: number;
  destination_code: string;
  name: string;
  odia_name: string;
  hindi_name?: string;
  category: string; // HERITAGE_TEMPLE | BEACHES_COAST | NATURE_WILDLIFE | ARTS_CRAFTS | HERITAGE_TOWN
  district: string;
  state: string;
  tagline?: string;
  description: string;
  cultural_significance?: string;
  history_context?: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
  google_maps_url?: string;
  official_source_url?: string;
  image_url?: string;
  gallery_urls: string[];
  photo_attribution?: string;
  timings: string;
  entry_fee: string;
  estimated_visit_duration: string;
  best_time_to_visit: string;
  nearest_railway?: string;
  nearest_airport: string;
  how_to_reach?: string;
  accessibility_status: string; // VERIFIED_ACCESSIBLE | PARTIALLY_ACCESSIBLE | NOT_ASSESSED
  accessibility_details?: string;
  facilities: Record<string, boolean>;
  visitor_rules?: string;
  environmental_guidelines?: string;
  rating: number;
  review_count: number;
  safety_status: string; // OPEN | SEASONAL | ADVISORY_ACTIVE | CLOSED
  is_featured: boolean;
  is_inside_balasore_district: boolean;
  verification_status: string; // VERIFIED | PENDING_VERIFICATION | UNVERIFIED
  official_source: string;
  last_verified_at: string;
  created_at: string;
  updated_at: string;
}

export interface TourismSavedDestination {
  id: number;
  citizen_id: number;
  destination_id: number;
  name?: string;
  odia_name?: string;
  image_url?: string;
  district?: string;
  created_at: string;
}

export interface TourismItinerary {
  id: number;
  citizen_id?: number;
  title: string;
  starting_location: string;
  duration_days: number;
  main_interest: string;
  travel_pace: string;
  require_accessibility: boolean;
  stops_data: TourismItineraryStop[];
  summary: string;
  created_at: string;
}

export interface TourismItineraryStop {
  day: number;
  destination_name: string;
  destination_id?: number;
  district?: string;
  activity: string;
  arrival_window: string;
  duration: string;
  travel_buffer: string;
  notes?: string;
  maps_url?: string;
}

export interface TourismEvent {
  id: number;
  event_code: string;
  title: string;
  odia_title?: string;
  venue: string;
  district: string;
  category: string;
  start_date: string;
  end_date: string;
  timings: string;
  ticket_info: string;
  organiser: string;
  verified_source: string;
  status: string;
  cover_image_url?: string;
}

export interface TourismAdvisory {
  id: number;
  advisory_code: string;
  title: string;
  severity: string;
  category: string;
  district: string;
  description: string;
  alternative_suggestion?: string;
  issuing_authority: string;
  valid_from?: string;
  valid_until?: string;
}

export interface HeritageTrail {
  id: string;
  name: string;
  odia_name: string;
  description: string;
  duration: string;
  distance_km: number;
  theme: string;
  highlights: string[];
  image_url: string;
}

export interface TourismAssistanceRequest {
  id: number;
  request_code: string;
  requester_name: string;
  requester_phone?: string;
  category: string; // MEDICAL | ACCIDENT | LOST_PERSON | SAFETY | FIRE | INFO | OTHER
  description: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  destination_id?: number;
  incident_id?: number;
  status: string; // SUBMITTED | ACKNOWLEDGED | DISPATCHED | RESOLVED
  created_at: string;
  updated_at: string;
}

export interface TourismContentCorrection {
  id: number;
  correction_code: string;
  destination_id: number;
  reported_by_name: string;
  correction_type: string;
  description: string;
  status: string; // PENDING | REVIEWED | APPLIED | REJECTED
  created_at: string;
}

export interface TourismAccommodation {
  id: number;
  name: string;
  category: 'OTDC_GOVT' | 'BEACH_RESORT' | 'HOTEL' | 'ECO_CAMP' | 'HOMESTAY';
  location: string;
  district: string;
  destination_id?: number;
  latitude: number;
  longitude: number;
  price_range: string;
  rating: number;
  contact_phone: string;
  booking_url?: string;
  amenities: string[];
  image_url: string;
  description: string;
}

export interface TourismDining {
  id: number;
  name: string;
  cuisine_type: string;
  speciality: string;
  location: string;
  district: string;
  destination_id?: number;
  latitude: number;
  longitude: number;
  price_range: string;
  rating: number;
  timings: string;
  must_try: string[];
  image_url: string;
  is_veg_friendly: boolean;
}

export interface TourismTravelCondition {
  id: number;
  location: string;
  coastal_tide_status: {
    condition: 'LOW_TIDE' | 'HIGH_TIDE' | 'TRANSITION';
    next_high_tide: string;
    next_low_tide: string;
    recession_distance: string;
    safety_message: string;
  };
  weather: {
    temp_c: number;
    condition: string;
    wind_kmh: number;
    humidity: number;
    uv_index: number;
  };
  road_status: {
    corridor: string;
    condition: 'CLEAR' | 'MODERATE' | 'CAUTION' | 'RESTRICTED';
    travel_time_from_balasore: string;
    notes: string;
  };
}

export interface TourismEmergencyContact {
  id: number;
  name: string;
  role: string;
  service_type: 'POLICE' | 'MEDICAL' | 'COASTAL_RESCUE' | 'TOURIST_HELP' | 'FOREST_DEPT';
  phone: string;
  emergency_number: string;
  location: string;
  is_24x7: boolean;
  latitude: number;
  longitude: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: 'INFO' | 'ALERT' | 'CRITICAL' | 'SUCCESS';
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_email: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
}

export interface MunicipalAsset {
  id: number;
  asset_code: string;
  name: string;
  category: string;
  ward: string;
  condition: 'GOOD' | 'FAIR' | 'NEEDS_MAINTENANCE' | 'CRITICAL_FAULT';
  last_inspected: string;
  location: string;
}

export interface InventoryItem {
  id: number;
  item_code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_reorder_level: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL_REORDER';
}

export interface StaffRegistration {
  id: number;
  ref_code: string;
  full_name: string;
  email: string;
  phone: string;
  employee_id: string;
  department_id: number;
  department_name: string;
  designation: string;
  zone_or_office: string;
  password_hash?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'INFO_REQUESTED';
  role: string;
  rejection_reason?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface IncidentEvent {
  eventId: string;
  eventType: string;
  incidentId?: number;
  assignmentId?: number;
  actorUserId?: string | number;
  eventPayload?: any;
  eventVersion: number;
  createdAt: string;
}

export function createInitialDb() {
  const departments: Department[] = [
    { id: 1, name: "Drainage and Flood Management", code: "MUNICIPAL_DRAINAGE", description: "Stormwater drains, sluice pumps, culverts, and urban waterlogging relief.", contact_email: "drainage@civicnexus.gov.in", contact_phone: "+91 674 2431001", sla_hours: 12 },
    { id: 2, name: "Roads and Infrastructure", code: "MUNICIPAL_ROADS", description: "Municipal road repair, pothole restoration, flyover integrity.", contact_email: "roads@civicnexus.gov.in", contact_phone: "+91 674 2431002", sla_hours: 24 },
    { id: 3, name: "Traffic Management & Corridor Safety", code: "TRAFFIC_OPERATIONS", description: "Traffic control, signal timing, arterial diversions, and green corridors.", contact_email: "traffic@civicnexus.gov.in", contact_phone: "+91 674 2431003", sla_hours: 6 },
    { id: 4, name: "Fire and Rescue Services", code: "FIRE_RESCUE", description: "Odisha Fire & Emergency Services, disaster response, and boat deployment.", contact_email: "fire@civicnexus.gov.in", contact_phone: "+91 674 2431101", sla_hours: 4 },
    { id: 5, name: "Sanitation and Waste Management", code: "SANITATION_WASTE", description: "Solid waste collection, bio-medical waste compliance, drain desilting.", contact_email: "sanitation@civicnexus.gov.in", contact_phone: "+91 674 2431004", sla_hours: 24 },
    { id: 6, name: "Street Lighting and Electrical", code: "STREET_LIGHTING", description: "Smart LED streetlights, transformer safety, high-mast illumination.", contact_email: "lighting@civicnexus.gov.in", contact_phone: "+91 674 2431005", sla_hours: 18 },
    { id: 7, name: "Emergency Healthcare Coordination", code: "HEALTH_SERVICES", description: "108 Ambulance dispatch and trauma bed coordination.", contact_email: "health@civicnexus.gov.in", contact_phone: "+91 674 2431006", sla_hours: 2 },
    { id: 8, name: "Smart Tourism & Cultural Heritage", code: "TOURISM_CULTURE", description: "Odisha Tourism visitor safety, heritage corridor monitoring.", contact_email: "tourism@civicnexus.gov.in", contact_phone: "+91 674 2431007", sla_hours: 48 },
  ];

  const users: User[] = [
    { id: 1, email: "citizen@civicnexus.gov.in", full_name: "Debabrata Mohanty", phone: "+91 94370 12345", role: "CITIZEN", is_active: true, created_at: new Date().toISOString() },
    { id: 2, email: "worker@civicnexus.gov.in", full_name: "Bikash Mohapatra", phone: "+91 94371 23456", role: "FIELD_WORKER", department_id: 1, is_active: true, created_at: new Date().toISOString() },
    { id: 3, email: "officer@civicnexus.gov.in", full_name: "Ananya Patnaik", phone: "+91 94372 34567", role: "DEPARTMENT_OFFICER", department_id: 1, is_active: true, created_at: new Date().toISOString() },
    { id: 4, email: "supervisor@civicnexus.gov.in", full_name: "Sanjay Tripathy", phone: "+91 94373 45678", role: "DEPARTMENT_SUPERVISOR", department_id: 1, is_active: true, created_at: new Date().toISOString() },
    { id: 5, email: "traffic@civicnexus.gov.in", full_name: "Rakesh Behera", phone: "+91 94374 56789", role: "TRAFFIC_OPERATOR", department_id: 3, is_active: true, created_at: new Date().toISOString() },
    { id: 6, email: "hospital@civicnexus.gov.in", full_name: "Dr. Subhasree Nayak", phone: "+91 94375 67890", role: "HOSPITAL_COORDINATOR", department_id: 7, is_active: true, created_at: new Date().toISOString() },
    { id: 7, email: "fire@civicnexus.gov.in", full_name: "Pradeep Jena", phone: "+91 94376 78901", role: "FIRE_RESCUE_OPERATOR", department_id: 4, is_active: true, created_at: new Date().toISOString() },
    { id: 8, email: "emergency@civicnexus.gov.in", full_name: "Manoj Das", phone: "+91 94377 89012", role: "EMERGENCY_COORDINATOR", is_active: true, created_at: new Date().toISOString() },
    { id: 9, email: "tourism@civicnexus.gov.in", full_name: "Swagatika Mishra", phone: "+91 94378 90123", role: "TOURISM_ADMIN", department_id: 8, is_active: true, created_at: new Date().toISOString() },
    { id: 10, email: "commander@civicnexus.gov.in", full_name: "Asit Kumar Rath", phone: "+91 94379 01234", role: "CITY_COMMANDER", is_active: true, created_at: new Date().toISOString() },
    { id: 11, email: "admin@civicnexus.gov.in", full_name: "Administrator Code Blaze", phone: "+91 94380 12345", role: "SUPER_ADMIN", is_active: true, created_at: new Date().toISOString() },
  ];

  const hospitals: Hospital[] = [
    { id: 1, name: "AIIMS Bhubaneswar", location_name: "Sijua, Patrapada, Bhubaneswar", latitude: 20.2294, longitude: 85.7766, total_beds: 1200, available_beds: 142, icu_beds: 150, available_icu: 18, blood_bank_status: "A+ O+ B- Highly Available", trauma_level: "Level I Trauma Center", contact_phone: "+91 674 2476789" },
    { id: 2, name: "Capital Hospital", location_name: "Unit-6, Bhubaneswar", latitude: 20.2608, longitude: 85.8286, total_beds: 750, available_beds: 88, icu_beds: 60, available_icu: 7, blood_bank_status: "All Major Groups Available", trauma_level: "Level II Trauma Center", contact_phone: "+91 674 2391983" },
    { id: 3, name: "SCB Medical College", location_name: "Mangalabag, Cuttack", latitude: 20.4789, longitude: 85.8821, total_beds: 2100, available_beds: 215, icu_beds: 200, available_icu: 22, blood_bank_status: "Apex Regional Blood Bank", trauma_level: "Level I Apex Trauma", contact_phone: "+91 671 2414080" },
    { id: 4, name: "KIMS Hospital", location_name: "KIIT Campus, Patia, Bhubaneswar", latitude: 20.3541, longitude: 85.8188, total_beds: 1500, available_beds: 310, icu_beds: 180, available_icu: 34, blood_bank_status: "Full Stock", trauma_level: "Level I Multispecialty", contact_phone: "+91 674 2725182" },
    { id: 5, name: "District Headquarter Hospital Puri", location_name: "Grand Road, Puri", latitude: 19.8083, longitude: 85.8267, total_beds: 400, available_beds: 52, icu_beds: 30, available_icu: 4, blood_bank_status: "O+ B+ A+ Stocked", trauma_level: "Level II Emergency Care", contact_phone: "+91 6752 222022" },
  ];

  const cameras: CameraSource[] = [
    {
      id: 1,
      camera_code: "CCTV-OD-101",
      location_name: "Rasulgarh Junction Flyover NH-16",
      latitude: 20.2961,
      longitude: 85.8645,
      status: "ACTIVE",
      stream_status: "ONLINE",
      stream_url: "/streams/cctv-od-101-live.m3u8",
      fps: 30,
      frame_sampling_fps: 2.5,
      supported_types: ["POSSIBLE_ROAD_ACCIDENT", "POSSIBLE_FIRE_OR_SMOKE", "YOLO_TRAFFIC"],
      active_detections: [
        { type: "POSSIBLE_ROAD_ACCIDENT", severity: "CRITICAL", confidence: 0.92, bbox: [140, 220, 360, 480], label: "COLLISION_IMPACT_ZONE" }
      ],
      current_model: "NexusVision-OD-v2.4-YOLO11",
      last_successful_frame_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString()
    },
    {
      id: 2,
      camera_code: "CCTV-OD-102",
      location_name: "Vani Vihar Corridor & Utkal University Gate",
      latitude: 20.3015,
      longitude: 85.8452,
      status: "ACTIVE",
      stream_status: "ONLINE",
      stream_url: "/streams/cctv-od-102-live.m3u8",
      fps: 30,
      frame_sampling_fps: 2.5,
      supported_types: ["AMBULANCE_108_IN_TRANSIT", "POSSIBLE_ROAD_ACCIDENT"],
      active_detections: [
        { type: "AMBULANCE_108_IN_TRANSIT", severity: "HIGH", confidence: 0.97, bbox: [110, 180, 290, 410], label: "108_LIFELINE_AMBULANCE" }
      ],
      current_model: "NexusVision-OD-v2.4-YOLO11",
      last_successful_frame_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString()
    },
    {
      id: 3,
      camera_code: "CCTV-OD-103",
      location_name: "Bomikhal Canal Underpass Sluice",
      latitude: 20.2831,
      longitude: 85.8512,
      status: "ACTIVE",
      stream_status: "ONLINE",
      stream_url: "/streams/cctv-od-103-live.m3u8",
      fps: 25,
      frame_sampling_fps: 2.0,
      supported_types: ["POSSIBLE_FIRE_OR_SMOKE", "ROADWAY_OBSTRUCTION"],
      active_detections: [
        { type: "POSSIBLE_FIRE_OR_SMOKE", severity: "HIGH", confidence: 0.88, bbox: [210, 120, 480, 390], label: "THERMAL_SMOKE_PLUME" }
      ],
      current_model: "NexusVision-OD-v2.4-ThermalSmoke",
      last_successful_frame_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString()
    },
    {
      id: 4,
      camera_code: "CCTV-OD-104",
      location_name: "AIIMS Lifeline Trauma Access Corridor",
      latitude: 20.2294,
      longitude: 85.7766,
      status: "ACTIVE",
      stream_status: "ONLINE",
      stream_url: "/streams/cctv-od-104-live.m3u8",
      fps: 30,
      frame_sampling_fps: 2.5,
      supported_types: ["AMBULANCE_108_IN_TRANSIT", "GREEN_CORRIDOR_CLEARANCE"],
      active_detections: [],
      current_model: "NexusVision-OD-v2.4-FleetTracker",
      last_successful_frame_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString()
    },
    {
      id: 5,
      camera_code: "CCTV-OD-105",
      location_name: "Master Canteen Smart City Transit Plaza",
      latitude: 20.2642,
      longitude: 85.8398,
      status: "ACTIVE",
      stream_status: "ONLINE",
      stream_url: "/streams/cctv-od-105-live.m3u8",
      fps: 30,
      frame_sampling_fps: 2.5,
      supported_types: ["CROWD_CONGESTION", "POTENTIAL_CROWD_SAFETY_RISK"],
      active_detections: [
        { type: "CROWD_CONGESTION", severity: "MEDIUM", confidence: 0.85, bbox: [90, 140, 520, 680], label: "PEDESTRIAN_DENSITY_HIGH" }
      ],
      current_model: "NexusVision-OD-v2.4-CrowdDensity",
      last_successful_frame_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString()
    },
    {
      id: 6,
      camera_code: "CCTV-OD-106",
      location_name: "Khandagiri Ancient Cave Approach Bypass",
      latitude: 20.2588,
      longitude: 85.7865,
      status: "DEGRADED",
      stream_status: "DEGRADED",
      stream_url: "/streams/cctv-od-106-live.m3u8",
      fps: 12,
      frame_sampling_fps: 1.0,
      supported_types: ["HERITAGE_SAFETY", "VEHICLE_COLLISION"],
      active_detections: [],
      current_model: "NexusVision-OD-v2.4-YOLO11",
      last_successful_frame_at: new Date(Date.now() - 45000).toISOString(),
      last_heartbeat: new Date(Date.now() - 45000).toISOString()
    }
  ];

  // AI Detection Candidate Events (Structured Candidate Events)
  const aiDetectionEvents: AIDetectionEvent[] = [
    {
      candidateId: "CAND-OD-2026-01",
      cameraId: 1,
      cameraCode: "CCTV-OD-101",
      locationName: "Rasulgarh Junction Flyover NH-16",
      latitude: 20.2961,
      longitude: 85.8645,
      detectionType: "POSSIBLE_ROAD_ACCIDENT",
      confidenceScore: 0.92,
      firstDetectedAt: new Date(Date.now() - 240000).toISOString(),
      lastDetectedAt: new Date(Date.now() - 30000).toISOString(),
      evidenceReferences: [
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
        "/evidence/cctv-101-frame-0824.jpg",
        "/evidence/cctv-101-frame-0825.jpg"
      ],
      locationReference: "NH-16 Overbridge Rasulgarh East Approach Lane 2",
      verificationStatus: "AWAITING-VERIFICATION",
      modelVersion: "NexusVision-OD-v2.4-YOLO11",
      processingStatus: "STREAMING",
      incidentId: 1,
      boundingBoxes: [
        { label: "VEHICLE_COLLISION", confidence: 0.92, x: 28, y: 35, width: 38, height: 42, color: "#EF4444", trackId: "TRK-CAR-88" },
        { label: "STOPPED_VEHICLE_OBSTRUCTION", confidence: 0.89, x: 62, y: 44, width: 22, height: 28, color: "#F59E0B", trackId: "TRK-CAR-91" }
      ],
      estimatedVehicleCount: 2,
      notes: "Abrupt deceleration followed by rotational collision detected across frames 0820-0835. Traffic slowdown in progress."
    },
    {
      candidateId: "CAND-OD-2026-02",
      cameraId: 3,
      cameraCode: "CCTV-OD-103",
      locationName: "Bomikhal Canal Underpass Sluice",
      latitude: 20.2831,
      longitude: 85.8512,
      detectionType: "POSSIBLE_FIRE_OR_SMOKE",
      confidenceScore: 0.88,
      firstDetectedAt: new Date(Date.now() - 360000).toISOString(),
      lastDetectedAt: new Date(Date.now() - 60000).toISOString(),
      evidenceReferences: [
        "/evidence/cctv-103-thermal-frame-0112.jpg",
        "/evidence/cctv-103-thermal-frame-0113.jpg"
      ],
      locationReference: "Bomikhal Canal Service Road Near Electrical Transformer Hub",
      verificationStatus: "AI-DETECTED",
      modelVersion: "NexusVision-OD-v2.4-ThermalSmoke",
      processingStatus: "STREAMING",
      boundingBoxes: [
        { label: "POSSIBLE_SMOKE_PLUME", confidence: 0.88, x: 38, y: 18, width: 44, height: 50, color: "#F97316", trackId: "TRK-SMK-04" }
      ],
      notes: "Expanding dense grey plume with upward thermal convection detected near roadside transformer bank."
    },
    {
      candidateId: "CAND-OD-2026-03",
      cameraId: 2,
      cameraCode: "CCTV-OD-102",
      locationName: "Vani Vihar Corridor & Utkal University Gate",
      latitude: 20.3015,
      longitude: 85.8452,
      detectionType: "AMBULANCE_108_IN_TRANSIT",
      confidenceScore: 0.97,
      firstDetectedAt: new Date(Date.now() - 120000).toISOString(),
      lastDetectedAt: new Date(Date.now() - 15000).toISOString(),
      evidenceReferences: [
        "/evidence/cctv-102-ambulance-lifeline-frame.jpg"
      ],
      locationReference: "Vani Vihar Janpath Overpass Green Corridor",
      verificationStatus: "VERIFIED",
      modelVersion: "NexusVision-OD-v2.4-FleetTracker",
      processingStatus: "STREAMING",
      boundingBoxes: [
        { label: "108_LIFELINE_AMBULANCE", confidence: 0.97, x: 22, y: 40, width: 34, height: 38, color: "#10B981", trackId: "VEH-108-01" }
      ],
      notes: "Emergency 108 Lifeline unit detected moving westbound towards AIIMS. Corridor transit speeds nominal at 58 km/h."
    },
    {
      candidateId: "CAND-OD-2026-04",
      cameraId: 5,
      cameraCode: "CCTV-OD-105",
      locationName: "Master Canteen Smart City Transit Plaza",
      latitude: 20.2642,
      longitude: 85.8398,
      detectionType: "CROWD_CONGESTION",
      confidenceScore: 0.85,
      firstDetectedAt: new Date(Date.now() - 600000).toISOString(),
      lastDetectedAt: new Date(Date.now() - 120000).toISOString(),
      evidenceReferences: [
        "/evidence/cctv-105-crowd-density.jpg"
      ],
      locationReference: "Master Canteen Bus Concourse South Gate",
      verificationStatus: "AWAITING-VERIFICATION",
      modelVersion: "NexusVision-OD-v2.4-CrowdDensity",
      processingStatus: "STREAMING",
      boundingBoxes: [
        { label: "CROWD_COMPRESSION_AREA", confidence: 0.85, x: 15, y: 25, width: 70, height: 55, color: "#F59E0B", trackId: "CROWD-ZONE-B" }
      ],
      notes: "Pedestrian density peak measured at 4.2 persons/m² during peak railway connection arrival. Non-conflict gathering."
    }
  ];

  // Automatic High-Priority Emergency Alerts
  const emergencyAlerts: EmergencyAlert[] = [
    {
      alertId: "ALT-CRIT-901",
      incidentId: 1,
      candidateId: "CAND-OD-2026-01",
      emergencyType: "POSSIBLE_ROAD_ACCIDENT",
      severity: "CRITICAL",
      alertStatus: "NEW",
      verificationStatus: "AWAITING-VERIFICATION",
      createdAt: new Date(Date.now() - 35000).toISOString(),
      acknowledgementDeadline: new Date(Date.now() + 55000).toISOString(),
      escalated: false,
      escalationLevel: 0,
      cameraCode: "CCTV-OD-101",
      location: "Rasulgarh Junction Flyover NH-16 (Westbound Carriageway)",
      latitude: 20.2961,
      longitude: 85.8645,
      confidenceScore: 0.92,
      recommendedAction: "Review live CCTV evidence, confirm lane blockage, and dispatch nearest Traffic Police & 108 Ambulance Unit.",
      soundTriggered: true,
      summaryAi: "AI Vision detected high-velocity vehicle impact at 20.2961°N followed by lane 2 obstruction. 2 passenger vehicles involved."
    },
    {
      alertId: "ALT-HIGH-902",
      incidentId: 1,
      candidateId: "CAND-OD-2026-02",
      emergencyType: "POSSIBLE_FIRE_OR_SMOKE",
      severity: "HIGH",
      alertStatus: "ACKNOWLEDGED",
      verificationStatus: "AI-DETECTED",
      createdAt: new Date(Date.now() - 300000).toISOString(),
      acknowledgementDeadline: new Date(Date.now() - 180000).toISOString(),
      acknowledgedBy: "operator.emergency@civicnexus.gov.in",
      acknowledgedAt: new Date(Date.now() - 250000).toISOString(),
      escalated: false,
      escalationLevel: 1,
      cameraCode: "CCTV-OD-103",
      location: "Bomikhal Canal Underpass Sluice Near Transformer Bank",
      latitude: 20.2831,
      longitude: 85.8512,
      confidenceScore: 0.88,
      recommendedAction: "Notify Odisha Fire Services (Kalpana Station) and inspect roadside dry-waste accumulation near transformer.",
      soundTriggered: true,
      assignedDepartmentName: "Fire and Rescue Services",
      summaryAi: "Thermal optical analysis detected smoke column expanding at 1.2m/s near electrical distribution infrastructure."
    }
  ];

  // Emergency Vehicles (Fleet GPS Telemetry)
  const emergencyVehicles: EmergencyVehicle[] = [
    {
      id: "OD-02-AMB-108-01",
      vehicleType: "AMBULANCE_108",
      callSign: "LIFELINE-ONE",
      licensePlate: "OD-02-AZ-1081",
      baseStationName: "AIIMS Bhubaneswar Trauma Hub",
      driverName: "Santosh Kumar Pradhan",
      contactNumber: "+91 94370 88101",
      currentStatus: "EN_ROUTE",
      latitude: 20.2785,
      longitude: 85.8210,
      speedKmh: 54,
      heading: 260,
      fuelPercent: 88,
      assignedIncidentId: 1,
      destinationHospitalName: "AIIMS Bhubaneswar",
      etaMinutes: 8,
      lastGpsUpdate: new Date().toISOString(),
      isDemo: true
    },
    {
      id: "OD-02-AMB-108-02",
      vehicleType: "AMBULANCE_108",
      callSign: "CAPITAL-TWO",
      licensePlate: "OD-02-BX-1082",
      baseStationName: "Capital Hospital Dispatch Station",
      driverName: "Bishnu Charan Jena",
      contactNumber: "+91 94370 88102",
      currentStatus: "ON_PATROL",
      latitude: 20.2650,
      longitude: 85.8340,
      speedKmh: 38,
      heading: 90,
      fuelPercent: 76,
      lastGpsUpdate: new Date().toISOString(),
      isDemo: true
    },
    {
      id: "OD-02-FIRE-101-01",
      vehicleType: "FIRE_ENGINE",
      callSign: "KALPANA-WATER-TENDER",
      licensePlate: "OD-02-FT-1011",
      baseStationName: "Kalpana Square Fire Station",
      driverName: "Chief Officer Rabindra Swain",
      contactNumber: "+91 674 2431101",
      currentStatus: "AVAILABLE",
      latitude: 20.2550,
      longitude: 85.8420,
      speedKmh: 0,
      heading: 0,
      fuelPercent: 95,
      lastGpsUpdate: new Date().toISOString(),
      isDemo: true
    },
    {
      id: "OD-02-POL-PCR-04",
      vehicleType: "POLICE_PATROL",
      callSign: "TRAFFIC-FLYING-SQUAD-4",
      licensePlate: "OD-02-TS-9904",
      baseStationName: "Saheed Nagar Police Station",
      driverName: "ASI N. C. Mohanty",
      contactNumber: "+91 94374 99004",
      currentStatus: "DISPATCHED",
      latitude: 20.2910,
      longitude: 85.8580,
      speedKmh: 46,
      heading: 330,
      fuelPercent: 82,
      assignedIncidentId: 1,
      etaMinutes: 4,
      lastGpsUpdate: new Date().toISOString(),
      isDemo: true
    },
    {
      id: "OD-02-MUNI-DIS-02",
      vehicleType: "DISASTER_RESCUE",
      callSign: "BMC-DEWATER-STRIKE-UNIT",
      licensePlate: "OD-02-DS-8802",
      baseStationName: "BMC Central Engineering Yard",
      driverName: "Pradeep Rout",
      contactNumber: "+91 94371 44002",
      currentStatus: "ON_SCENE",
      latitude: 20.2961,
      longitude: 85.8645,
      speedKmh: 0,
      heading: 0,
      fuelPercent: 91,
      assignedIncidentId: 1,
      lastGpsUpdate: new Date().toISOString(),
      isDemo: true
    }
  ];

  // Emergency Response Dispatches
  const emergencyResponses: EmergencyResponseDispatch[] = [
    {
      responseId: "DSP-EM-2026-101",
      incidentId: 1,
      alertId: "ALT-CRIT-901",
      responseType: "AMBULANCE",
      assignedUnitId: "OD-02-AMB-108-01",
      assignedUnitName: "108 Lifeline Trauma Unit #01",
      dispatchedBy: "emergency@civicnexus.gov.in",
      dispatchedAt: new Date(Date.now() - 300000).toISOString(),
      responseStatus: "EN_ROUTE",
      etaMinutes: 8,
      responderNotes: "Patient stabilization unit proceeding on green corridor bypass.",
      isDemo: true
    },
    {
      responseId: "DSP-EM-2026-102",
      incidentId: 1,
      alertId: "ALT-CRIT-901",
      responseType: "POLICE_ESCORT",
      assignedUnitId: "OD-02-POL-PCR-04",
      assignedUnitName: "Traffic PCR Squad #04",
      dispatchedBy: "emergency@civicnexus.gov.in",
      dispatchedAt: new Date(Date.now() - 280000).toISOString(),
      responseStatus: "EN_ROUTE",
      etaMinutes: 4,
      responderNotes: "Clearing lane 1 & 2 for ambulance ingress.",
      isDemo: true
    }
  ];

  const alertDeliveryLogs: AlertDeliveryLog[] = [
    {
      deliveryId: "DLV-001",
      alertId: "ALT-CRIT-901",
      recipientRole: "SUPER_ADMIN",
      recipientEmail: "admin@civicnexus.gov.in",
      channel: "IN_APP",
      deliveryStatus: "DELIVERED",
      attemptedAt: new Date(Date.now() - 34000).toISOString()
    },
    {
      deliveryId: "DLV-002",
      alertId: "ALT-CRIT-901",
      recipientRole: "DEPARTMENT_OFFICER",
      recipientEmail: "officer@civicnexus.gov.in",
      channel: "SSE_STREAM",
      deliveryStatus: "DELIVERED",
      attemptedAt: new Date(Date.now() - 33000).toISOString()
    }
  ];

  const alertEscalations: AlertEscalationRecord[] = [];

  const videoAnalyses: VideoAnalysis[] = [
    {
      videoAnalysisId: "VID-ANALYSIS-2026-001",
      uploadedBy: "emergency.operator@civicnexus.gov.in",
      storageReference: "/evidence/videos/sample-cctv-rasulgarh.mp4",
      fileName: "Rasulgarh_Flyover_Traffic_108Amb.mp4",
      fileSizeBytes: 14850000,
      mimeType: "video/mp4",
      durationSeconds: 38,
      resolution: "1920x1080",
      framesAnalyzed: 19,
      analysisStatus: "COMPLETED",
      processingStartedAt: new Date(Date.now() - 180000).toISOString(),
      processingCompletedAt: new Date(Date.now() - 172000).toISOString(),
      pipelineVersion: "NexusVision-MultiCategory-v3.2",
      locationName: "Rasulgarh Junction Flyover NH-16",
      cameraCode: "CCTV-OD-101",
      recordedAt: new Date(Date.now() - 240000).toISOString(),
      description: "108 Lifeline Trauma Ambulance traversing through congested bottleneck lane",
      summaryNarrative: "AI Vision analysis verified 108 Lifeline Ambulance vehicle in transit at 00:00:18 with siren illuminator active. Route clearance preemption recommended along NH-16 corridor to AIIMS.",
      detectedEmergency: true,
      events: [
        {
          eventId: "EVT-VID-01",
          videoAnalysisId: "VID-ANALYSIS-2026-001",
          eventType: "AMBULANCE_IN_TRANSIT",
          videoTimestamp: "00:00:18",
          videoTimestampSeconds: 18,
          confidenceScore: 0.94,
          evidenceThumbnail: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=640",
          boundingBoxes: [
            { label: "108 Ambulance", confidence: 0.94, x: 22, y: 35, width: 34, height: 28, color: "#10B981" }
          ],
          trackingId: "TRK-AMB-108",
          trackingStatus: "Tracked across frames t=14s to t=24s",
          description: "An ambulance-like vehicle with active medical livery was detected moving westbound through the corridor.",
          verificationStatus: "VERIFIED",
          recommendedAction: "Activate Green Corridor Signal Preemption to AIIMS Bhubaneswar Hospital.",
          incidentId: 1,
          alertId: "ALT-CRIT-901"
        }
      ],
      routeVerificationStatus: "VERIFIED",
      routeClearanceRequestId: "CLR-REQ-2026-101"
    }
  ];

  const routeClearanceRequests: RouteClearanceRequest[] = [
    {
      requestId: "CLR-REQ-2026-101",
      incidentId: 1,
      alertId: "ALT-CRIT-901",
      videoAnalysisId: "VID-ANALYSIS-2026-001",
      vehicleType: "AMBULANCE",
      vehicleCallSign: "OD-02-AMB-108-01",
      routeReference: "Rasulgarh Flyover -> Vani Vihar -> Master Canteen -> AIIMS Bhubaneswar",
      requestedBy: "emergency.operator@civicnexus.gov.in",
      requestStatus: "ACTIVE",
      originLocation: "Rasulgarh Junction Flyover NH-16",
      destinationHospital: "AIIMS Bhubaneswar Super Specialty Trauma Center",
      corridorSegments: [
        { segmentName: "NH-16 Rasulgarh Flyover Ingress", roadName: "National Highway 16", status: "PREEMPTED", etaMinutes: 2 },
        { segmentName: "Vani Vihar Square Underpass", roadName: "Cuttack-Puri Road Bypass", status: "CLEAR", etaMinutes: 4 },
        { segmentName: "Sishu Bhawan Chowk Junction", roadName: "Rajpath Arterial", status: "CLEAR", etaMinutes: 3 },
        { segmentName: "AIIMS Expressway Terminal Approach", roadName: "AIIMS Access Boulevard", status: "CLEAR", etaMinutes: 3 }
      ],
      preemptionSignals: ["SIG-RASULGARH-01", "SIG-VANIVIHAR-03", "SIG-SISHUBHAWAN-02"],
      trafficClearanceNotice: "Green Corridor Activated by Traffic Control Room. All 3 intersections switched to emergency preemption override.",
      createdAt: new Date(Date.now() - 170000).toISOString(),
      updatedAt: new Date(Date.now() - 60000).toISOString()
    }
  ];

  const tourismPlaces: TourismPlace[] = [
    { id: 1, name: "Konark Sun Temple", odia_name: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର", category: "UNESCO World Heritage Site", description: "13th century architectural marvel built as a giant stone chariot with 24 carved wheels.", latitude: 19.8876, longitude: 86.0945, image_url: "https://images.unsplash.com/photo-1627894006066-b457863ca898?w=800", cultural_significance: "Kalinga Architecture Golden Era", timings: "06:00 AM - 08:00 PM", accessibility_notes: "Wheelchair ramps available at main entrance", current_safety_status: "ALL_CLEAR" },
    { id: 2, name: "Shree Jagannath Temple Puri", odia_name: "ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର ପୁରୀ", category: "Sacred Shrine & Pilgrimage", description: "12th century sacred temple dedicated to Lord Jagannath, Balabhadra and Subhadra.", latitude: 19.8047, longitude: 85.8180, image_url: "https://images.unsplash.com/photo-1609946782782-720610f63b6a?w=800", cultural_significance: "Char Dham Pilgrimage", timings: "05:00 AM - 11:00 PM", accessibility_notes: "Special assistance queues available", current_safety_status: "ALL_CLEAR" },
    { id: 3, name: "Lingaraj Temple", odia_name: "ଲିଙ୍ଗରାଜ ମନ୍ଦିର", category: "Kalinga Temple Architecture", description: "11th century masterpiece towering 180 feet over the ancient Ekamra Kshetra.", latitude: 20.2382, longitude: 85.8336, image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800", cultural_significance: "Heart of Old Bhubaneswar Ekamra Kshetra", timings: "06:00 AM - 09:00 PM", accessibility_notes: "Cobblestone courtyard walking required", current_safety_status: "ALL_CLEAR" },
    { id: 4, name: "Chilika Lake & Nalabana Sanctuary", odia_name: "ଚିଲିକା ହ୍ରଦ", category: "Ramsar Wetland & Ecotourism", description: "Asia's largest brackish water lagoon, home to Irrawaddy dolphins and migratory birds.", latitude: 19.7000, longitude: 85.3167, image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", cultural_significance: "Odisha Maritime Trade Heritage", timings: "07:00 AM - 05:00 PM (Boating)", accessibility_notes: "Life jackets mandatory for all jetty boardings", current_safety_status: "ALL_CLEAR" },
    { id: 5, name: "Dhauli Shanti Stupa", odia_name: "ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ", category: "Peace Pagoda & Ashokan Rock Edicts", description: "Historic hill where Emperor Ashoka renounced violence after the Kalinga War.", latitude: 20.1923, longitude: 85.8394, image_url: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800", cultural_significance: "Birthplace of Global Buddhist Peace Heritage", timings: "06:00 AM - 07:00 PM", accessibility_notes: "Gentle paved slopes up the hill", current_safety_status: "ALL_CLEAR" },
  ];

  // ── BALASORE SMART TOURISM DESTINATIONS (VERIFIED RECORDS) ──────────────────
  const tourismDestinations: TourismDestination[] = [
    {
      id: 1,
      destination_code: 'BLSR-DEST-001',
      name: 'Chandipur Beach',
      odia_name: 'ଚାଁଦିପୁର ସମୁଦ୍ର ସୈକତ',
      hindi_name: 'चांदीपुर बीच',
      category: 'BEACHES_COAST',
      district: 'Balasore',
      state: 'Odisha',
      tagline: 'Where the sea disappears and reappears — a rare tidal wonder',
      description: 'Chandipur Beach is uniquely famous for its mysterious "hide-and-seek sea" — the Bay of Bengal recedes up to 5 km during low tide, exposing wide mudflats, and returns during high tide. This natural phenomenon, caused by exceptionally shallow continental shelf, makes it one of India\'s most unusual beaches. The beach is also historically significant as the site of India\'s Integrated Guided Missile Development Programme (IGMDP) launch facility managed by DRDO.',
      cultural_significance: 'Sacred to local Odisha coastal communities; site of integrated missile testing, a point of national pride. Associated with the Balaramgadi fishing community heritage.',
      history_context: 'The beach gained national importance when India\'s first Surface-to-Air missile test was conducted from the Chandipur Integrated Test Range (ITR) in 1989. The DRDO\'s ITR facility continues operations here.',
      latitude: 21.4563,
      longitude: 87.0170,
      formatted_address: 'Chandipur, Balasore District, Odisha 756025, India',
      google_maps_url: 'https://maps.google.com/?q=Chandipur+Beach+Balasore+Odisha',
      official_source_url: 'https://odishatourism.gov.in/destination/chandipur',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800',
      ],
      photo_attribution: 'Images sourced via Unsplash; destination photos require Google Places API configuration for real photographs.',
      timings: 'Open 24 hours (Beach). Best time: Low tide (6 AM–9 AM & 6 PM–9 PM for disappearing sea)',
      entry_fee: 'No entry fee. Parking charges may apply (check with local authority).',
      estimated_visit_duration: '2–4 hours',
      best_time_to_visit: 'October to March (post-monsoon, winter). Avoid June–September (active cyclone season).',
      nearest_railway: 'Balasore Railway Station (16 km)',
      nearest_airport: 'Biju Patnaik International Airport, Bhubaneswar (230 km)',
      how_to_reach: 'By road from Balasore town (16 km via NH-16 service road). State buses and auto-rickshaws available from Balasore bus stand.',
      accessibility_status: 'PARTIALLY_ACCESSIBLE',
      accessibility_details: 'Paved road to beach entry point. Sandy beach terrain is not wheelchair-friendly. Portable ramps not available. Contact District Tourism Office for assistance.',
      facilities: { parking: true, toilets: true, changing_rooms: false, food_stalls: true, lifeguard: false, boat_rides: false, first_aid: false },
      visitor_rules: 'Swimming is not recommended due to tidal currents and DRDO restricted zone proximity. Do not enter the restricted ITR area. Do not litter on the beach.',
      environmental_guidelines: 'Carry all waste back. No plastic bags. Do not disturb coastal flora or the crabs and mudskippers that emerge at low tide.',
      rating: 4.1,
      review_count: 2847,
      safety_status: 'OPEN',
      is_featured: true,
      is_inside_balasore_district: true,
      verification_status: 'VERIFIED',
      official_source: 'Odisha Tourism Department & District Tourism Office, Balasore',
      last_verified_at: '2024-10-01T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-10-01T00:00:00.000Z',
    },
    {
      id: 2,
      destination_code: 'BLSR-DEST-002',
      name: 'Panchalingeswar Temple',
      odia_name: 'ପଞ୍ଚଲିଙ୍ଗେଶ୍ୱର ମନ୍ଦିର',
      category: 'HERITAGE_TEMPLE',
      district: 'Balasore',
      state: 'Odisha',
      tagline: 'Five Shiva lingas bathed by a perennial hill stream — a living sacred site',
      description: 'Panchalingeswar is a revered hilltop shrine in the Nilagiri subdivision of Balasore district, dedicated to Lord Shiva in the form of five naturally formed Shiva lingas perpetually bathed by a stream of flowing water. The temple is situated atop a rocky hill in the Nilgiri Hills at approximately 900 feet elevation, surrounded by dense forest. Devotees climb stone steps carved into the hillside to reach the shrine. The stream that flows over the five lingas is believed to originate from a natural spring and is considered spiritually significant.',
      cultural_significance: 'One of the most revered Shaiva temples in Balasore district. The five naturally occurring Shiva lingas (Panchalinga) are considered sacred manifestations. The site draws pilgrims year-round from across Odisha and neighbouring states. Maha Shivaratri festival brings large congregations.',
      history_context: 'The temple is ancient in origin, with the current shrine structure maintained by the local community and the Odisha government\'s Endowments Department. The surrounding Nilgiri Hills are the northernmost fringe of the Eastern Ghats in Odisha.',
      latitude: 21.4611,
      longitude: 86.7685,
      formatted_address: 'Panchalingeswar Hill, Nilagiri Block, Balasore District, Odisha 756040, India',
      google_maps_url: 'https://maps.google.com/?q=Panchalingeswar+Temple+Nilagiri+Balasore',
      official_source_url: 'https://odishatourism.gov.in/destination/panchalingeswar',
      image_url: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800',
        'https://images.unsplash.com/photo-1477061002590-7aeef7afb3e0?w=800',
      ],
      photo_attribution: 'Images via Unsplash. Configure Google Places API to display authentic destination photographs.',
      timings: '6:00 AM – 8:00 PM daily. Special puja timings on Mondays and Shiva Chaturdashi.',
      entry_fee: 'No entry fee. Voluntary offerings at temple.',
      estimated_visit_duration: '2–3 hours (includes 20-minute hill climb)',
      best_time_to_visit: 'October to March. Maha Shivaratri (Feb/March) is the major festival. Avoid July–September (monsoon, slippery steps).',
      nearest_railway: 'Nilagiri Railway Station (8 km) or Balasore Railway Station (55 km)',
      nearest_airport: 'Biju Patnaik International Airport, Bhubaneswar (260 km)',
      how_to_reach: 'From Balasore town, take NH-516 towards Nilagiri (~55 km). From Nilagiri town, the temple is 8 km by road. Auto-rickshaws and taxis available from Nilagiri.',
      accessibility_status: 'PARTIALLY_ACCESSIBLE',
      accessibility_details: 'The final approach to the shrine involves climbing stone steps set into the hillside. Wheelchair and mobility-impaired access is not possible to the inner shrine. Road access to the base of the hill is available.',
      facilities: { parking: true, toilets: true, changing_rooms: false, food_stalls: true, lifeguard: false, boat_rides: false, first_aid: false },
      visitor_rules: 'Remove footwear before entering the temple precinct. Dress modestly. Photography permitted outside the sanctum. No alcohol or non-vegetarian food on the hill.',
      environmental_guidelines: 'No plastic bags or single-use plastic. The hillside forest is a protected area; do not disturb flora or wildlife.',
      rating: 4.4,
      review_count: 1654,
      safety_status: 'OPEN',
      is_featured: true,
      is_inside_balasore_district: true,
      verification_status: 'VERIFIED',
      official_source: 'Odisha Tourism Department & Shri Jagannath Temple Administration-affiliated records',
      last_verified_at: '2024-10-01T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-10-01T00:00:00.000Z',
    },
    {
      id: 3,
      destination_code: 'BLSR-DEST-003',
      name: 'Kuldiha Wildlife Sanctuary',
      odia_name: 'କୁଳଦିହା ଅଭୟାରଣ୍ୟ',
      category: 'NATURE_WILDLIFE',
      district: 'Balasore',
      state: 'Odisha',
      tagline: 'A critical elephant corridor at the foot of the Similipal biosphere',
      description: 'Kuldiha Wildlife Sanctuary, established in 1984, covers approximately 272.75 sq km of tropical moist deciduous forest in Balasore district. It is a vital elephant corridor connecting the Similipal Tiger Reserve with the Hadgarh Wildlife Sanctuary, forming part of the larger Odisha elephant migration landscape. The sanctuary supports populations of Indian elephants, leopards, sambar deer, barking deer, sloth bears, pangolins, and a diverse avifauna. The terrain includes forested hills, seasonal streams, and sal-dominated forest.',
      cultural_significance: 'Sacred forest associated with tribal communities (particularly Kolha and Munda) who have historically co-existed with the forest ecosystem. Forest deities are worshipped at several points within the sanctuary.',
      history_context: 'Notified as a wildlife sanctuary in 1984 under the Wildlife Protection Act, 1972. Managed by the Divisional Forest Officer, Balasore. Critical to conserving the Northern Odisha elephant landscape.',
      latitude: 21.4875,
      longitude: 86.5291,
      formatted_address: 'Kuldiha Wildlife Sanctuary, Balasore District, Odisha 756001, India',
      google_maps_url: 'https://maps.google.com/?q=Kuldiha+Wildlife+Sanctuary+Balasore',
      official_source_url: 'https://odisha.gov.in/department/forest/kuldiha',
      image_url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      ],
      photo_attribution: 'Images via Unsplash. Configure Google Places API for authentic wildlife sanctuary photographs.',
      timings: 'Sanctuary open for eco-tourism: 6:00 AM – 6:00 PM. Entry permit required from DFO Office, Balasore.',
      entry_fee: 'Entry permit fees apply. Check with Divisional Forest Office, Balasore for current rates.',
      estimated_visit_duration: 'Half day to full day (safari/nature walk)',
      best_time_to_visit: 'November to February for wildlife sightings. July–September: monsoon, sanctuary may restrict access.',
      nearest_railway: 'Nilgiri Road Railway Station (approx. 15 km from sanctuary periphery)',
      nearest_airport: 'Biju Patnaik International Airport, Bhubaneswar (250 km)',
      how_to_reach: 'From Balasore town, head towards Nilagiri on NH-516, then follow forest department roads. A 4WD vehicle is recommended for forest tracks.',
      accessibility_status: 'NOT_ASSESSED',
      accessibility_details: 'Mostly forest tracks unsuitable for mobility-impaired visitors. Please contact the DFO office for any special arrangements.',
      facilities: { parking: true, toilets: false, changing_rooms: false, food_stalls: false, lifeguard: false, boat_rides: false, first_aid: false },
      visitor_rules: 'Forest Department entry permit mandatory. No night stay without official permission. No loud noise or smoking inside the sanctuary. Do not feed wildlife. Stay on designated paths.',
      environmental_guidelines: 'Strict no-litter policy. No plastic bags inside the sanctuary. No firewood collection. Report any injured wildlife to the nearest forest beat office.',
      rating: 4.2,
      review_count: 876,
      safety_status: 'OPEN',
      is_featured: false,
      is_inside_balasore_district: true,
      verification_status: 'VERIFIED',
      official_source: 'Odisha Forest Department — Divisional Forest Office, Balasore',
      last_verified_at: '2024-10-01T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-10-01T00:00:00.000Z',
    },
    {
      id: 4,
      destination_code: 'BLSR-DEST-004',
      name: 'Khirachora Gopinath Temple, Remuna',
      odia_name: 'ଖିରଚୋର ଗୋପୀନାଥ ମନ୍ଦିର, ରେମୁଣା',
      category: 'HERITAGE_TEMPLE',
      district: 'Balasore',
      state: 'Odisha',
      tagline: 'The "Thief of Cream" — a beloved Vaishnava temple steeped in devotion',
      description: 'The Khirachora Gopinath Temple at Remuna, approximately 8 km from Balasore town, is dedicated to Lord Gopinath (a form of Lord Krishna) and is among the most revered Vaishnava shrines in Odisha. The presiding deity is famously called "Khirachora" (thief of khira/cream) based on a beloved legend: when saint-poet Madhavendra Puri was on a pilgrimage and passed through Remuna, Lord Gopinath appeared in his dream and offered him the sacred khira (condensed milk pudding) that had been set aside as the deity\'s prasad. This miracle gave the deity the title "Khirachora." The temple\'s khira bhog is prepared daily and offered with great devotion. The temple is maintained by the Gaudiya Vaishnava tradition.',
      cultural_significance: 'Deeply revered in the Gaudiya Vaishnava tradition. Connected to the lineage of Sri Madhavendra Puri, the spiritual ancestor of Sri Chaitanya Mahaprabhu. The khira bhog is considered one of the most sacred prasads in Odisha.',
      history_context: 'The original temple and its traditions date back several centuries. The current temple complex has been expanded and beautified over generations. Balasore district celebrates Janmashtami here with great fervor.',
      latitude: 21.5230,
      longitude: 86.9820,
      formatted_address: 'Remuna, Balasore District, Odisha 756019, India',
      google_maps_url: 'https://maps.google.com/?q=Khirachora+Gopinath+Temple+Remuna+Balasore',
      image_url: 'https://images.unsplash.com/photo-1563299796-17596ed6b017?w=800&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1563299796-17596ed6b017?w=800',
        'https://images.unsplash.com/photo-1477061002590-7aeef7afb3e0?w=800',
      ],
      photo_attribution: 'Images via Unsplash. Configure Google Places API for authentic temple photographs.',
      timings: '5:00 AM – 9:00 PM. Multiple bhog (offering) timings throughout the day. Confirm current schedule with temple authorities.',
      entry_fee: 'No entry fee. Prasad and special sevas may have associated donations.',
      estimated_visit_duration: '1–2 hours',
      best_time_to_visit: 'Year-round. Janmashtami (July/August) is the major festival. Ekadashi is especially significant.',
      nearest_railway: 'Balasore Railway Station (8 km)',
      nearest_airport: 'Biju Patnaik International Airport, Bhubaneswar (220 km)',
      how_to_reach: 'Remuna is 8 km from Balasore town on the Balasore–Baripada road. Autos, taxis, and state buses available from Balasore.',
      accessibility_status: 'PARTIALLY_ACCESSIBLE',
      accessibility_details: 'The main temple courtyard is paved and accessible at ground level. Inner sanctum has a small step threshold. Contact temple authorities for assistance.',
      facilities: { parking: true, toilets: true, changing_rooms: false, food_stalls: true, lifeguard: false, boat_rides: false, first_aid: false },
      visitor_rules: 'Remove footwear before entering. Dress modestly (dhoti/saree recommended). Non-Hindus should check temple\'s current policy at the entrance. Photography inside the sanctum may be restricted.',
      environmental_guidelines: 'No plastic near temple premises. Maintain cleanliness as per temple standards.',
      rating: 4.6,
      review_count: 3241,
      safety_status: 'OPEN',
      is_featured: true,
      is_inside_balasore_district: true,
      verification_status: 'VERIFIED',
      official_source: 'Temple administration, Remuna & Odisha Tourism Department',
      last_verified_at: '2024-10-01T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-10-01T00:00:00.000Z',
    },
    {
      id: 5,
      destination_code: 'BLSR-DEST-005',
      name: 'Talsari Beach',
      odia_name: 'ତଳସାରୀ ସମୁଦ୍ର ସୈକତ',
      category: 'BEACHES_COAST',
      district: 'Balasore',
      state: 'Odisha',
      tagline: 'Casuarina-fringed serenity near the Odisha-West Bengal border',
      description: 'Talsari Beach is a quiet, scenic stretch of coastline in the northeastern tip of Balasore district, near the Odisha–West Bengal border. The beach is renowned for its thick casuarina forest that runs alongside the shoreline, offering shade and a tranquil atmosphere distinct from more commercialized beaches. The beach is relatively unspoilt and offers a peaceful nature experience. It lies near the mouth of the Subarnarekha river. Talsari is situated within Odisha, though the nearby town of Digha is in West Bengal.',
      cultural_significance: 'Important coastal habitat supporting nesting activities of Olive Ridley sea turtles. Part of the Odisha coastal fishing community heritage.',
      history_context: 'Talsari has emerged as an eco-tourism and nature tourism destination under Odisha Tourism\'s coastal circuit. The Subarnarekha river creates a natural estuary near the beach. Note: Digha (the commercially developed beach) is in West Bengal, not in Odisha. Talsari itself is within Balasore district, Odisha.',
      latitude: 21.5422,
      longitude: 87.3218,
      formatted_address: 'Talsari, Balasore District, Odisha, India (near Odisha-West Bengal border)',
      google_maps_url: 'https://maps.google.com/?q=Talsari+Beach+Balasore+Odisha',
      official_source_url: 'https://odishatourism.gov.in/destination/talsari',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800',
      ],
      photo_attribution: 'Images via Unsplash. Configure Google Places API for authentic destination photographs.',
      timings: 'Open access (beach). Best visited at sunrise or sunset.',
      entry_fee: 'No entry fee.',
      estimated_visit_duration: '2–3 hours',
      best_time_to_visit: 'November to February. Avoid monsoon season (June–September) due to rough seas.',
      nearest_railway: 'Digha Railway Station, West Bengal (across state border, ~8 km) or Balasore Railway Station (~70 km)',
      nearest_airport: 'Biju Patnaik International Airport, Bhubaneswar (280 km)',
      how_to_reach: 'From Balasore, take NH-16 north to Jaleswar, then head east on state roads to Talsari (~70 km from Balasore town). Shared jeeps and autos available from Jaleswar.',
      accessibility_status: 'NOT_ASSESSED',
      accessibility_details: 'Sandy beach terrain. Not assessed for wheelchair accessibility. Nearest paved road ends at the casuarina forest edge.',
      facilities: { parking: false, toilets: false, changing_rooms: false, food_stalls: true, lifeguard: false, boat_rides: false, first_aid: false },
      visitor_rules: 'Swimming not recommended due to strong currents near river mouth. Respect coastal ecology. No littering.',
      environmental_guidelines: 'The area has Olive Ridley turtle nesting sites. Do not disturb nesting activity (November–March). No fires on the beach. Carry all waste out.',
      rating: 4.0,
      review_count: 1102,
      safety_status: 'OPEN',
      is_featured: false,
      is_inside_balasore_district: true,
      verification_status: 'VERIFIED',
      official_source: 'Odisha Tourism Department — Coastal Circuit. Note: Adjacent Digha beach is in West Bengal, not Odisha.',
      last_verified_at: '2024-10-01T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-10-01T00:00:00.000Z',
    },
    {
      id: 6,
      destination_code: 'BLSR-DEST-006',
      name: 'Nilagiri Heritage Town',
      odia_name: 'ନୀଳଗିରି ଐତିହ୍ୟ ନଗର',
      category: 'HERITAGE_TOWN',
      district: 'Balasore',
      state: 'Odisha',
      tagline: 'A princely state town in the Nilgiri Hills with royal heritage',
      description: 'Nilagiri is a historic town and sub-division headquarter in Balasore district, nestled at the foothills of the Nilgiri Hills (the northernmost extension of the Eastern Ghats). It was the seat of the erstwhile Nilagiri kingdom, one of the significant princely states of Odisha under British India. The town retains colonial-era and pre-colonial heritage buildings, temples, and a scenic natural backdrop. The Nilgiri Hills surrounding the town support wildlife and offer trekking opportunities. Nilagiri is also the gateway to Panchalingeswar Temple.',
      cultural_significance: 'Former seat of the Nilagiri royal family. Rich traditions of Odia folk art, music (particularly dhap and ghudka), and tribal cultural heritage from adjacent communities.',
      history_context: 'The Nilagiri kingdom was historically documented in medieval Odisha. After Indian independence, it merged into the Union of India. Several heritage structures from the princely era survive in the town.',
      latitude: 21.4614,
      longitude: 86.7708,
      formatted_address: 'Nilagiri Town, Balasore District, Odisha 756040, India',
      google_maps_url: 'https://maps.google.com/?q=Nilagiri+Balasore+Odisha',
      image_url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800',
      ],
      photo_attribution: 'Images via Unsplash. Configure Google Places API for authentic photographs.',
      timings: 'Town open year-round. Heritage sites: dawn to dusk.',
      entry_fee: 'No entry fee for town. Check individual heritage sites.',
      estimated_visit_duration: 'Half day to full day',
      best_time_to_visit: 'October to March',
      nearest_railway: 'Nilagiri Road Railway Station (5 km)',
      nearest_airport: 'Biju Patnaik International Airport, Bhubaneswar (260 km)',
      how_to_reach: 'Well connected by state highways from Balasore (55 km) and Bhubaneswar. NH-516 passes through Nilagiri.',
      accessibility_status: 'PARTIALLY_ACCESSIBLE',
      accessibility_details: 'Town roads are paved. Heritage structures vary in accessibility.',
      facilities: { parking: true, toilets: true, changing_rooms: false, food_stalls: true, lifeguard: false, boat_rides: false, first_aid: true },
      visitor_rules: 'Respect private heritage properties. Follow temple decorum at religious sites.',
      environmental_guidelines: 'Respect the Nilgiri Hills ecosystem. No littering.',
      rating: 3.9,
      review_count: 589,
      safety_status: 'OPEN',
      is_featured: false,
      is_inside_balasore_district: true,
      verification_status: 'VERIFIED',
      official_source: 'Odisha Tourism & Balasore District Administration',
      last_verified_at: '2024-10-01T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-10-01T00:00:00.000Z',
    },
    {
      id: 7,
      destination_code: 'BLSR-DEST-007',
      name: 'Budhabalanga River Mouth & Balaramgadi',
      odia_name: 'ବୁଢ଼ାବଳଙ୍ଗ ନଦୀ ମୁଖ ଓ ବଳରାମଗଡ଼ି',
      category: 'NATURE_WILDLIFE',
      district: 'Balasore',
      state: 'Odisha',
      tagline: 'A river mouth estuary and fishing village offering coastal nature experience',
      description: 'The Budhabalanga river meets the Bay of Bengal near Balaramgadi, south of Chandipur, forming a scenic estuary that attracts migratory birds and supports rich aquatic biodiversity. The area offers opportunities for birdwatching, observing traditional Odisha fishing practices, and experiencing the coastal landscape. Balaramgadi is a traditional fishing village with colourful boats and local seafood. The river mouth area is part of the Balasore coastal ecosystem and is distinct from the main Chandipur Beach area.',
      cultural_significance: 'The Budhabalanga river is sacred to local communities. Balaramgadi village is associated with traditional Odia fishing culture and the maritime heritage of coastal Odisha.',
      latitude: 21.4200,
      longitude: 87.0180,
      formatted_address: 'Balaramgadi, Balasore District, Odisha, India',
      google_maps_url: 'https://maps.google.com/?q=Balaramgadi+Budhabalanga+Balasore',
      image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
      ],
      photo_attribution: 'Images via Unsplash. Configure Google Places API for authentic photographs.',
      timings: 'Open year-round. Best for birdwatching: dawn hours.',
      entry_fee: 'No entry fee.',
      estimated_visit_duration: '1–3 hours',
      best_time_to_visit: 'October to March (migratory birds; pleasant weather).',
      nearest_railway: 'Balasore Railway Station (15 km)',
      nearest_airport: 'Biju Patnaik International Airport, Bhubaneswar (235 km)',
      how_to_reach: 'From Chandipur Beach, proceed south approximately 3–4 km along the coastal road to Balaramgadi.',
      accessibility_status: 'NOT_ASSESSED',
      accessibility_details: 'Mix of coastal road and sandy/muddy terrain near the river mouth.',
      facilities: { parking: false, toilets: false, changing_rooms: false, food_stalls: true, lifeguard: false, boat_rides: true, first_aid: false },
      visitor_rules: 'Respect the fishing community. Do not interfere with fishing activities. Life jacket required if taking a boat ride.',
      environmental_guidelines: 'This is a sensitive estuary ecosystem. No plastic waste. Avoid disturbing nesting birds.',
      rating: 3.8,
      review_count: 312,
      safety_status: 'OPEN',
      is_featured: false,
      is_inside_balasore_district: true,
      verification_status: 'VERIFIED',
      official_source: 'Balasore District Tourism Information',
      last_verified_at: '2024-10-01T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-10-01T00:00:00.000Z',
    },
    {
      id: 8,
      destination_code: 'BLSR-DEST-008',
      name: 'Bhushandeshwar Shiva Temple, Bhograi',
      odia_name: 'ଭୂଷଣ୍ଡେଶ୍ୱର ଶିବ ମନ୍ଦିର, ଭୋଗରାଇ',
      category: 'HERITAGE_TEMPLE',
      district: 'Balasore',
      state: 'Odisha',
      tagline: 'Home to one of the largest black granite Shiva Lingams in Asia',
      description: 'The Bhushandeshwar Temple is situated in the Bhograi block of Balasore district, adjacent to the Subarnarekha river and the Bay of Bengal coastline. It enshrines a colossal, naturally carved black granite Shiva lingam measuring approximately 12 feet long and 14 feet in circumference, regarded by scholars as one of the largest known monolithic lingams in Asia. According to regional legend, the demon king Ravana was carrying this giant lingam from Lord Shiva to Lanka when he was tricked into resting it on the ground at this very sacred spot, where it became permanently rooted into mother earth.',
      cultural_significance: 'Monumental Shaivite pilgrimage destination. Devotees perform circumambulation (Parikrama) and offer holy water of river Subarnarekha. Maha Shivaratri witnesses massive footfall from Odisha and Bengal.',
      history_context: 'Mentioned in regional Puranic folk traditions. The temple precinct features archaeological remnants dating back several centuries.',
      latitude: 21.6385,
      longitude: 87.4520,
      formatted_address: 'Bhushandeshwar, Bhograi Block, Balasore District, Odisha 756038, India',
      google_maps_url: 'https://maps.google.com/?q=Bhushandeshwar+Temple+Bhograi+Balasore',
      image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
        'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800'
      ],
      photo_attribution: 'Images via Unsplash. Authentic photograph verification through Odisha Tourism archival records.',
      timings: '5:30 AM – 8:30 PM daily',
      entry_fee: 'No entry fee',
      estimated_visit_duration: '1–2 hours',
      best_time_to_visit: 'October to March; Maha Shivaratri',
      nearest_railway: 'Jaleswar Railway Station (45 km) or Digha (30 km)',
      nearest_airport: 'Biju Patnaik International Airport, Bhubaneswar (270 km)',
      how_to_reach: 'Via NH-16 up to Jaleswar or Basta, then state highway towards Bhograi.',
      accessibility_status: 'PARTIALLY_ACCESSIBLE',
      accessibility_details: 'Courtyard level ground; inner sanctum descent requires caution.',
      facilities: { parking: true, toilets: true, changing_rooms: false, food_stalls: true, lifeguard: false, boat_rides: false, first_aid: false },
      visitor_rules: 'Traditional temple attire, footwear deposited at shoe counter, photography inside inner sanctum restricted.',
      environmental_guidelines: 'Clean campus initiative. Dispose floral offerings in designated compost bins.',
      rating: 4.5,
      review_count: 1420,
      safety_status: 'OPEN',
      is_featured: true,
      is_inside_balasore_district: true,
      verification_status: 'VERIFIED',
      official_source: 'Odisha State Archaeology & Balasore District Administration',
      last_verified_at: '2024-10-01T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-10-01T00:00:00.000Z',
    },
  ];

  // ── TOURISM EVENTS (Balasore) ──────────────────────────────────────────────
  const tourismEvents: TourismEvent[] = [
    {
      id: 1,
      event_code: 'EVT-BLSR-2026-001',
      title: 'Balasore Beach Festival',
      odia_title: 'ବାଲେଶ୍ୱର ଶିଳ୍ପ ଓ ସମୁଦ୍ର ଉତ୍ସବ',
      venue: 'Chandipur Beach, Balasore',
      district: 'Balasore',
      category: 'CULTURAL_FESTIVAL',
      start_date: '2026-12-26',
      end_date: '2026-12-28',
      timings: '10:00 AM – 9:00 PM',
      ticket_info: 'Free entry. Check with District Tourism Office for programme schedule.',
      organiser: 'Odisha Tourism Department & Balasore District Administration',
      verified_source: 'District Tourism Office, Balasore',
      status: 'UPCOMING',
    },
    {
      id: 2,
      event_code: 'EVT-BLSR-2026-002',
      title: 'Maha Shivaratri at Panchalingeswar',
      odia_title: 'ପଞ୍ଚଲିଙ୍ଗେଶ୍ୱର ମହା ଶିବରାତ୍ରୀ',
      venue: 'Panchalingeswar Temple, Nilagiri, Balasore',
      district: 'Balasore',
      category: 'RELIGIOUS_FESTIVAL',
      start_date: '2027-02-26',
      end_date: '2027-02-26',
      timings: 'All night (4:00 AM preceding day to sunrise 27th Feb)',
      ticket_info: 'No entry fee. Open to all devotees.',
      organiser: 'Temple Trust & Balasore District Administration',
      verified_source: 'Panchalingeswar Temple Trust',
      status: 'UPCOMING',
    },
    {
      id: 3,
      event_code: 'EVT-BLSR-2026-003',
      title: 'Janmashtami Celebration, Remuna',
      odia_title: 'ରେମୁଣା ଜନ୍ମାଷ୍ଟମୀ ମହୋତ୍ସବ',
      venue: 'Khirachora Gopinath Temple, Remuna',
      district: 'Balasore',
      category: 'RELIGIOUS_FESTIVAL',
      start_date: '2026-08-16',
      end_date: '2026-08-16',
      timings: 'All day and night celebrations',
      ticket_info: 'Free entry. Special prasad distribution.',
      organiser: 'Khirachora Gopinath Temple Trust',
      verified_source: 'Temple Trust, Remuna',
      status: 'UPCOMING',
    },
  ];

  // ── TOURISM ADVISORIES (Balasore) ─────────────────────────────────────────
  const tourismAdvisories: TourismAdvisory[] = [
    {
      id: 1,
      advisory_code: 'ADV-BLSR-2026-001',
      title: 'Chandipur Beach: Swimming Strictly Prohibited',
      severity: 'HIGH',
      category: 'SAFETY',
      district: 'Balasore',
      description: 'Swimming at Chandipur Beach is not permitted due to unpredictable tidal currents and proximity to the DRDO Integrated Test Range. The "disappearing sea" phenomenon creates deceptive conditions — the sea appears calm but returns rapidly. Visitors must stay on dry sand and observe only.',
      alternative_suggestion: 'Enjoy the tidal phenomenon from the shore. Early morning (6–9 AM) is the best time to observe the sea recession. Talsari Beach also has strong currents; swimming is not advised at either location.',
      issuing_authority: 'District Collector, Balasore & Odisha Disaster Management Authority',
      valid_from: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      advisory_code: 'ADV-BLSR-2026-002',
      title: 'Kuldiha Sanctuary: Elephant Movement Season Alert',
      severity: 'MEDIUM',
      category: 'WILDLIFE',
      district: 'Balasore',
      description: 'October to January is active elephant movement season in and around Kuldiha Wildlife Sanctuary. Visitors must strictly follow forest department guide instructions, avoid going off designated trails, and not approach any wildlife.',
      alternative_suggestion: 'Visit with an authorised forest guide only. Book entry permits in advance from the DFO Office, Balasore. Morning safaris are recommended for wildlife sightings.',
      issuing_authority: 'Divisional Forest Officer, Balasore',
      valid_from: '2024-10-01T00:00:00.000Z',
      valid_until: '2025-01-31T00:00:00.000Z',
    },
  ];

  // ── HERITAGE TRAILS (Balasore) ─────────────────────────────────────────────
  const heritageTrails: HeritageTrail[] = [
    {
      id: 'TRAIL-BLSR-001',
      name: 'Balasore Coast Discovery Circuit',
      odia_name: 'ବାଲେଶ୍ୱର ଉପକୂଳ ଯାତ୍ରା',
      description: 'A coastal journey covering Chandipur\'s disappearing sea, Balaramgadi fishing village, and Talsari\'s casuarina-lined shore — a one-day coastal experience in Balasore district.',
      duration: '1 full day',
      distance_km: 120,
      theme: 'COASTAL_NATURE',
      highlights: ['Chandipur disappearing sea at low tide', 'Balaramgadi fishing village & Budhabalanga river mouth', 'Talsari beach and casuarina forest', 'Fresh local seafood at coastal stalls'],
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    },
    {
      id: 'TRAIL-BLSR-002',
      name: 'Balasore Temple & Heritage Circuit',
      odia_name: 'ବାଲେଶ୍ୱର ମନ୍ଦିର ଓ ଐତିହ୍ୟ ପରିକ୍ରମା',
      description: 'A spiritual and heritage journey through Khirachora Gopinath Temple at Remuna and the sacred Panchalingeswar Temple on the Nilgiri Hills, combined with the heritage town of Nilagiri.',
      duration: '1–2 days',
      distance_km: 75,
      theme: 'HERITAGE_TEMPLE',
      highlights: ['Khira prasad at Gopinath Temple, Remuna', 'Hill climb to Panchalingeswar Temple', 'Nilagiri heritage town & Nilgiri Hills', 'Odia tribal arts and local cuisine'],
      image_url: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800',
    },
    {
      id: 'TRAIL-BLSR-003',
      name: 'Nilgiri Hills Wildlife & Nature Trail',
      odia_name: 'ନୀଳଗିରି ଅଭୟାରଣ୍ୟ ଓ ପ୍ରକୃତି ଯାତ୍ରା',
      description: 'An eco-tourism circuit through Kuldiha Wildlife Sanctuary and the Nilgiri Hills, focusing on birdwatching, forest walks, and wildlife encounters in a critical elephant landscape.',
      duration: '1–2 days',
      distance_km: 80,
      theme: 'NATURE_WILDLIFE',
      highlights: ['Kuldiha wildlife safari (elephant, leopard)', 'Nilgiri Hills forest trekking', 'Birdwatching at forest edges', 'Tribal village interaction (with community consent)'],
      image_url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800',
    },
  ];

  // ── TOURISM SAVED DESTINATIONS, ITINERARIES, ASSISTANCE ───────────────────
  const tourismSavedDestinations: TourismSavedDestination[] = [];
  const tourismItineraries: TourismItinerary[] = [];
  const tourismAssistanceRequests: TourismAssistanceRequest[] = [];
  const tourismContentCorrections: TourismContentCorrection[] = [];

  // ── TOURISM ACCOMMODATIONS (Balasore & Coastal Zone) ────────────────────────
  const tourismAccommodations: TourismAccommodation[] = [
    {
      id: 1,
      name: 'OTDC Panthanivas Chandipur',
      category: 'OTDC_GOVT',
      location: 'Chandipur Sea Beach, Balasore',
      district: 'Balasore',
      destination_id: 1,
      latitude: 21.4580,
      longitude: 87.0190,
      price_range: '₹1,500 – ₹3,500 / night',
      rating: 4.2,
      contact_phone: '+91-6782-270051',
      booking_url: 'https://panthanivas.com/chandipur',
      amenities: ['Sea View', 'AC Rooms', 'Odia Restaurant', 'Secure Parking', 'Tourist Help Desk'],
      image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      description: 'Official government tourism lodge right by the shoreline. Famous for its relaxed ambiance and authentic Odia coastal fish thali.',
    },
    {
      id: 2,
      name: 'Arpita Beach Resort',
      category: 'BEACH_RESORT',
      location: 'Chandipur Main Beach Road, Balasore',
      district: 'Balasore',
      destination_id: 1,
      latitude: 21.4550,
      longitude: 87.0145,
      price_range: '₹2,800 – ₹5,500 / night',
      rating: 4.3,
      contact_phone: '+91-6782-270142',
      booking_url: 'https://arpitabeachresort.com',
      amenities: ['Swimming Pool', 'Landscaped Lawns', 'Multi-Cuisine Dining', 'Wi-Fi', 'Conference Hall'],
      image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
      description: 'Sprawling holiday resort near the sea. Ideal for families and group vacations discovering the disappearing sea of Chandipur.',
    },
    {
      id: 3,
      name: 'OTDC Panthanivas Talsari',
      category: 'OTDC_GOVT',
      location: 'Talsari Beach, Bhograi Block, Balasore',
      district: 'Balasore',
      destination_id: 5,
      latitude: 21.5435,
      longitude: 87.3225,
      price_range: '₹1,200 – ₹2,800 / night',
      rating: 4.1,
      contact_phone: '+91-6781-232014',
      booking_url: 'https://panthanivas.com/talsari',
      amenities: ['Casuarina Forest View', 'Cottages', 'Local Fish Dining', '24h Security'],
      image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      description: 'Peaceful pine-flanked eco cottages situated near the Subarnarekha estuary. Perfect for birdwatchers and quiet retreats.',
    },
    {
      id: 4,
      name: 'Hotel Nocci Residency',
      category: 'HOTEL',
      location: 'NOCCI Business Park, Bampada, Balasore (NH-16)',
      district: 'Balasore',
      destination_id: 6,
      latitude: 21.4720,
      longitude: 86.9150,
      price_range: '₹3,200 – ₹6,000 / night',
      rating: 4.5,
      contact_phone: '+91-6782-255010',
      booking_url: 'https://nocciresidency.com',
      amenities: ['Gym & Spa', 'Fine Dining', 'Business Center', 'Free High-Speed Wi-Fi', 'Travel Desk'],
      image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      description: 'Top-rated modern executive hotel with luxury suites, seamless connectivity to NH-16 and central Balasore city.',
    },
    {
      id: 5,
      name: 'Nilagiri Forest Nature Camp & Cottages',
      category: 'ECO_CAMP',
      location: 'Foothills of Panchalingeswar, Nilagiri, Balasore',
      district: 'Balasore',
      destination_id: 2,
      latitude: 21.4625,
      longitude: 86.7650,
      price_range: '₹1,000 – ₹2,200 / night',
      rating: 4.4,
      contact_phone: '+91-6782-233215',
      amenities: ['Hill View', 'Eco Treks', 'Campfire Zone', 'Pure Desi Odia Meals'],
      image_url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800',
      description: 'Rustic eco-living at the threshold of the Eastern Ghats and Kuldiha sanctuary. Waking up to stream murmurs and peacock calls.',
    },
    {
      id: 6,
      name: 'Hotel Torrento',
      category: 'HOTEL',
      location: 'Station Road, Near Balasore Railway Station, Balasore',
      district: 'Balasore',
      latitude: 21.4980,
      longitude: 86.9320,
      price_range: '₹1,800 – ₹3,200 / night',
      rating: 4.0,
      contact_phone: '+91-6782-262100',
      amenities: ['Near Railway Junction', '24h Front Desk', 'Veg & Non-Veg Dining', 'Taxi Booking'],
      image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      description: 'Comfortable centrally located city hotel 2 minutes from Balasore Junction, offering fast transit access to all tourist spots.',
    }
  ];

  // ── TOURISM DINING (Authentic Odia & Coastal Delicacies) ───────────────────
  const tourismDining: TourismDining[] = [
    {
      id: 1,
      name: 'Balaramgadi Sea Harvest Kitchen',
      cuisine_type: 'Coastal Odia Seafood',
      speciality: 'Fresh Crab Masala & Pomfret Mustard Curry',
      location: 'Near Balaramgadi Fish Landing Harbor, Chandipur',
      district: 'Balasore',
      destination_id: 7,
      latitude: 21.4215,
      longitude: 87.0195,
      price_range: '₹200 – ₹550 per person',
      rating: 4.6,
      timings: '11:30 AM – 4:00 PM & 6:30 PM – 10:00 PM',
      must_try: ['Chilika Crab Sukha', 'Prawn Chingudi Jhola', 'Tawa Masala Pomfret', 'Steamed Rice with Odia Dalma'],
      image_url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800',
      is_veg_friendly: true,
    },
    {
      id: 2,
      name: 'Remuna Khira Gopinath Divine Prasad Counter',
      cuisine_type: 'Sacred Heritage Confectionery',
      speciality: 'Famous Remuna Khira (Condensed Cream Sweet Offering)',
      location: 'Khirachora Gopinath Temple Precinct, Remuna',
      district: 'Balasore',
      destination_id: 4,
      latitude: 21.5235,
      longitude: 86.9825,
      price_range: '₹40 – ₹150 per earthen pot (Kullad)',
      rating: 4.9,
      timings: '6:00 AM – 1:00 PM & 4:30 PM – 8:30 PM',
      must_try: ['Khira Bhog in Terracotta Pot', 'Mahaprasad Kanika', 'Chenna Poda (Caramelized Cottage Cheese)'],
      image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800',
      is_veg_friendly: true,
    },
    {
      id: 3,
      name: 'Balasore Mudhi Mansa & Odia Bhojanalaya',
      cuisine_type: 'Northern Odisha Heritage Feast',
      speciality: 'Iconic Baripada/Balasore Mudhi Mansa (Puffed Rice with Spiced Mutton)',
      location: 'Cinema Chhaka, OT Road, Balasore',
      district: 'Balasore',
      latitude: 21.4920,
      longitude: 86.9280,
      price_range: '₹180 – ₹420 per person',
      rating: 4.7,
      timings: '11:00 AM – 10:30 PM',
      must_try: ['Mudhi Mansa Platter', 'Desi Kukkuda Jhola', 'Badi Chura with Green Chillies', 'Machha Besara (Fish in Mustard Paste)'],
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
      is_veg_friendly: true,
    },
    {
      id: 4,
      name: 'Panthanivas Sagarika Coastal Dining',
      cuisine_type: 'Traditional Odia & Coastal Seafood',
      speciality: 'Authentic 12-Item Odisha Heritage Thali',
      location: 'Inside OTDC Panthanivas, Chandipur',
      district: 'Balasore',
      destination_id: 1,
      latitude: 21.4582,
      longitude: 87.0192,
      price_range: '₹150 – ₹380 per person',
      rating: 4.3,
      timings: '7:30 AM – 10:30 PM',
      must_try: ['Royal Odia Veg Thali', 'Santula (Simmered Vegetables)', 'Pakhala Bhata with Fried Fish', 'Chhena Jhili'],
      image_url: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=800',
      is_veg_friendly: true,
    },
    {
      id: 5,
      name: 'Talsari Casuarina Beach Shacks',
      cuisine_type: 'Fresh Coastal Grill & Coconut Refreshments',
      speciality: 'Live Tawa Fried Bhetki & Prawn Cutlets',
      location: 'Talsari Beach Front, Bhograi',
      district: 'Balasore',
      destination_id: 5,
      latitude: 21.5425,
      longitude: 87.3210,
      price_range: '₹100 – ₹300 per person',
      rating: 4.2,
      timings: '8:00 AM – 6:30 PM (Daylight hours)',
      must_try: ['Crispy Fried Sea Pomfret', 'Tender Green Coconut Water', 'Spiced Prawn Fry'],
      image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800',
      is_veg_friendly: true,
    }
  ];

  // ── TOURISM TRAVEL CONDITIONS & TIDES ──────────────────────────────────────
  const tourismTravelConditions: TourismTravelCondition[] = [
    {
      id: 1,
      location: 'Chandipur Sea Beach',
      coastal_tide_status: {
        condition: 'LOW_TIDE',
        next_high_tide: '03:45 PM today',
        next_low_tide: '09:20 AM today',
        recession_distance: '4.8 km seaward recession active',
        safety_message: 'Sea has receded ~4.8 km. Walking on wet seabed is permissible. DO NOT walk beyond safety flags or attempt swimming.',
      },
      weather: {
        temp_c: 29,
        condition: 'Pleasant Coastal Breeze & Clear Skies',
        wind_kmh: 14,
        humidity: 68,
        uv_index: 5,
      },
      road_status: {
        corridor: 'Balasore City to Chandipur (SH-19)',
        condition: 'CLEAR',
        travel_time_from_balasore: '22 minutes (16 km)',
        notes: 'Four-lane smooth blacktop. No waterlogging or construction bottlenecks.',
      }
    },
    {
      id: 2,
      location: 'Talsari Beach & Subarnarekha Estuary',
      coastal_tide_status: {
        condition: 'TRANSITION',
        next_high_tide: '04:15 PM today',
        next_low_tide: '10:00 AM today',
        recession_distance: '1.2 km normal coastal tide',
        safety_message: 'Water levels rising gently. Avoid crossing the estuary channel by foot after 3 PM.',
      },
      weather: {
        temp_c: 30,
        condition: 'Partly Cloudy with Coastal Swell',
        wind_kmh: 18,
        humidity: 72,
        uv_index: 6,
      },
      road_status: {
        corridor: 'Balasore to Jaleswar & Talsari (NH-16 & Coastal Route)',
        condition: 'CLEAR',
        travel_time_from_balasore: '1 hour 20 minutes (72 km)',
        notes: 'NH-16 expressway in excellent condition; minor speed reduction near Basta bridge.',
      }
    },
    {
      id: 3,
      location: 'Panchalingeswar & Nilagiri Hills',
      coastal_tide_status: {
        condition: 'LOW_TIDE',
        next_high_tide: 'N/A (Inland Hill Sanctuary)',
        next_low_tide: 'N/A',
        recession_distance: 'Hill spring flowing at steady 12 L/min',
        safety_message: 'Perennial natural stream over the sacred Shiva Lingas flowing smoothly. Hill steps damp; footwear deposit mandatory.',
      },
      weather: {
        temp_c: 26,
        condition: 'Cool Hill Canopy & Crisp Air',
        wind_kmh: 10,
        humidity: 62,
        uv_index: 4,
      },
      road_status: {
        corridor: 'Balasore to Nilagiri (SH-516)',
        condition: 'CLEAR',
        travel_time_from_balasore: '45 minutes (32 km)',
        notes: 'Scenic foothill drive. Hill roads fully operational with guardrails intact.',
      }
    }
  ];

  // ── TOURISM EMERGENCY CONTACTS (Balasore District) ─────────────────────────
  const tourismEmergencyContacts: TourismEmergencyContact[] = [
    {
      id: 1,
      name: 'Balasore District Tourist Police Cell',
      role: 'Tourist Safety & Assistance Wing',
      service_type: 'POLICE',
      phone: '+91-6782-262002',
      emergency_number: '112',
      location: 'SP Office Campus, Balasore Town',
      is_24x7: true,
      latitude: 21.4940,
      longitude: 86.9310,
    },
    {
      id: 2,
      name: 'Chandipur Marine Police Station',
      role: 'Coastal Security & Shore Lifeguard Operations',
      service_type: 'COASTAL_RESCUE',
      phone: '+91-6782-272100',
      emergency_number: '112',
      location: 'Chandipur Beach Front',
      is_24x7: true,
      latitude: 21.4570,
      longitude: 87.0175,
    },
    {
      id: 3,
      name: 'Balasore District Headquarters Hospital (DHH) & Trauma Unit',
      role: '24x7 Emergency Medical & Ambulance Hub',
      service_type: 'MEDICAL',
      phone: '+91-6782-262010',
      emergency_number: '108',
      location: 'Hospital Square, Balasore Town',
      is_24x7: true,
      latitude: 21.4910,
      longitude: 86.9240,
    },
    {
      id: 4,
      name: 'OTDC Government Tourist Information Counter',
      role: 'Itinerary, Guide & Verified Travel Information',
      service_type: 'TOURIST_HELP',
      phone: '+91-6782-262048',
      emergency_number: '1363',
      location: 'Platform 1 Exit, Balasore Railway Station',
      is_24x7: false,
      latitude: 21.4985,
      longitude: 86.9325,
    },
    {
      id: 5,
      name: 'Odisha Disaster Rapid Action Force (ODRAF) & Coastal Fire Unit',
      role: 'Flood, Storm & Water Body Rescue Operations',
      service_type: 'COASTAL_RESCUE',
      phone: '+91-6782-262101',
      emergency_number: '101',
      location: 'Fire Station Chowk, Balasore',
      is_24x7: true,
      latitude: 21.4880,
      longitude: 86.9260,
    },
    {
      id: 6,
      name: 'Kuldiha Wildlife Range & Nilagiri Forest Squad',
      role: 'Forest Rescue, Animal Encounter Safety & Eco Permits',
      service_type: 'FOREST_DEPT',
      phone: '+91-6782-256034',
      emergency_number: '1926',
      location: 'Nilagiri Range Office, Balasore',
      is_24x7: true,
      latitude: 21.4630,
      longitude: 86.7690,
    }
  ];

  const notifications: NotificationItem[] = [
    { id: 1, title: "Urgent Drain Cleared", message: "Drainage team deployed sluice pump at Rasulgarh chowk.", notification_type: "CRITICAL", is_read: false, created_at: new Date().toISOString() },
    { id: 2, title: "Green Corridor Activated", message: "Traffic clearance for 108 Ambulance en route to AIIMS.", notification_type: "ALERT", is_read: false, created_at: new Date().toISOString() },
    { id: 3, title: "Weather Advisory", message: "IMD predicts heavy rain over coastal districts next 12 hours.", notification_type: "INFO", is_read: true, created_at: new Date().toISOString() },
  ];

  const auditLogs: AuditLog[] = [
    { id: 1, user_email: "commander@civicnexus.gov.in", action: "SYSTEM_INITIALIZED", resource: "CORE_PLATFORM", details: "CIVIC NEXUS AI operational nervous system started.", timestamp: new Date().toISOString() },
  ];

  const municipalAssets: MunicipalAsset[] = [
    { id: 1, asset_code: "PUMP-BMC-09", name: "Heavy Dewatering Sluice Pump (300 HP)", category: "Drainage Infrastructure", ward: "BMC Ward 28 (North-Central)", condition: "GOOD", last_inspected: new Date().toISOString(), location: "Rasulgarh Underpass Sluice Gate" },
    { id: 2, asset_code: "CULVERT-BMC-14", name: "Concrete Box Stormwater Culvert 2.5m", category: "Drainage Infrastructure", ward: "BMC Ward 28 (North-Central)", condition: "NEEDS_MAINTENANCE", last_inspected: new Date().toISOString(), location: "NH-16 Service Channel" },
    { id: 3, asset_code: "LIGHT-BMC-102", name: "High-Mast 250W LED Transformer Unit", category: "Street Lighting", ward: "BMC Ward 14 (Old Town)", condition: "GOOD", last_inspected: new Date().toISOString(), location: "Lingaraj Temple Approach Road" },
    { id: 4, asset_code: "ROAD-BMC-204", name: "Arterial Flyover Expansion Joint", category: "Road Infrastructure", ward: "BMC Ward 42 (Patia)", condition: "FAIR", last_inspected: new Date().toISOString(), location: "Jayadev Vihar Flyover Span 4" },
  ];

  const inventoryItems: InventoryItem[] = [
    { id: 1, item_code: "MAT-ASP-50", name: "Cold-Mix Asphalt Patching Compound", category: "Road Repair", quantity: 450, unit: "Bags (25kg)", min_reorder_level: 100, status: "IN_STOCK" },
    { id: 2, item_code: "MAT-PVC-300", name: "Reinforced 300mm PVC Drain Conduit", category: "Drainage", quantity: 18, unit: "Pipes (6m)", min_reorder_level: 25, status: "LOW_STOCK" },
    { id: 3, item_code: "MAT-LED-150", name: "Smart Photocell 150W LED Fixture", category: "Lighting", quantity: 85, unit: "Units", min_reorder_level: 30, status: "IN_STOCK" },
    { id: 4, item_code: "MAT-DESILT-01", name: "Heavy Duty Hydraulic Drain Desilting Rake", category: "Sanitation", quantity: 4, unit: "Sets", min_reorder_level: 5, status: "CRITICAL_REORDER" },
  ];

  const incidents: Incident[] = [
    {
      id: 1,
      incident_code: "INC-OD-FLAGSHIP-01",
      title: "Severe Waterlogging at Rasulgarh Overbridge Underpass",
      category: "Waterlogging",
      description: "Water accumulation exceeding 40cm. Multiple light vehicles stalled. Heavy traffic bottleneck forming near Rasulgarh Chowk.",
      severity: "HIGH",
      status: "REPORTED",
      address: "Rasulgarh Junction Underpass, National Highway 16, Bhubaneswar, Odisha",
      latitude: 20.2961,
      longitude: 85.8645,
      priority_score: 68.0,
      priority_factors: { factor: "Arterial Corridor Waterlogging", points: 68.0 },
      is_verified: true,
      assigned_department_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const reports: Report[] = [
    {
      id: 1,
      report_code: "REP-OD-2026-001",
      incident_id: 1,
      citizen_name: "Debabrata Mohanty",
      citizen_phone: "+91 94370 12345",
      title: "Severe Waterlogging at Rasulgarh Overbridge Underpass",
      category: "Waterlogging",
      description: "Deep waterlogging after heavy rain. Vehicles cannot cross. Water level rising rapidly.",
      address: "Rasulgarh Junction Underpass, NH-16, Bhubaneswar",
      latitude: 20.2961,
      longitude: 85.8645,
      media_urls: ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"],
      status: "SUBMITTED",
      ai_processed: true,
      created_at: new Date().toISOString()
    }
  ];

  const tasks: Task[] = [
    {
      id: 1,
      incident_id: 1,
      department_id: 1,
      department_name: "Drainage and Flood Management",
      assigned_to_worker_id: 2,
      worker_name: "Bikash Mohapatra",
      worker_phone: "+91 94371 23456",
      worker_code: "FW-1024",
      supervisor_id: 4,
      supervisor_name: "Sanjay Tripathy (BMC Asst Engineer)",
      title: "Deploy Dewatering Pump at Rasulgarh Underpass",
      category: "Waterlogging",
      description: "Severe water accumulation exceeding 40cm at NH-16 underpass blocking traffic.",
      instructions: "Deploy 300 HP dewatering suction pump to drain 40cm waterlogging at NH-16 underpass immediately.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      address: "Rasulgarh Junction Underpass, NH-16, Bhubaneswar",
      latitude: 20.2961,
      longitude: 85.8645,
      accepted_at: new Date(Date.now() - 3600000).toISOString(),
      on_the_way_at: new Date(Date.now() - 2700000).toISOString(),
      arrived_at: new Date(Date.now() - 1800000).toISOString(),
      started_at: new Date(Date.now() - 1200000).toISOString(),
      checkin_latitude: 20.2962,
      checkin_longitude: 85.8644,
      checkin_distance_meters: 15,
      checkin_within_radius: true,
      before_photo_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      before_photo_desc: "Flooded underpass segment before pump deployment",
      worker_notes: "Sluice gate unblocked. Dewatering pump operating at 120 L/min capacity.",
      equipment_required: "300 HP Sluice Dewatering Pump, Safety Jackets, Traffic Cones",
      deadline: new Date(Date.now() + 14400000).toISOString(),
      created_at: new Date(Date.now() - 7200000).toISOString(),
      history: [
        { id: 1, task_id: 1, event_type: "COMPLAINT_SUBMITTED", actor_role: "CITIZEN", actor_name: "Debabrata Mohanty", message: "Complaint filed via Citizen Portal", created_at: new Date(Date.now() - 7200000).toISOString() },
        { id: 2, task_id: 1, event_type: "TASK_ASSIGNED", actor_role: "DEPARTMENT_OFFICER", actor_name: "Ananya Patnaik", message: "Assigned to Drainage Crew #4 (Bikash Mohapatra)", created_at: new Date(Date.now() - 5400000).toISOString() },
        { id: 3, task_id: 1, event_type: "TASK_ACCEPTED", actor_role: "FIELD_WORKER", actor_name: "Bikash Mohapatra", message: "Worker accepted assignment", created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 4, task_id: 1, event_type: "ON_THE_WAY", actor_role: "FIELD_WORKER", actor_name: "Bikash Mohapatra", message: "Worker dispatched to site", created_at: new Date(Date.now() - 2700000).toISOString() },
        { id: 5, task_id: 1, event_type: "WORKER_ARRIVED", actor_role: "FIELD_WORKER", actor_name: "Bikash Mohapatra", message: "Arrived on site. Verified within 15m radius.", created_at: new Date(Date.now() - 1800000).toISOString() },
        { id: 6, task_id: 1, event_type: "WORK_STARTED", actor_role: "FIELD_WORKER", actor_name: "Bikash Mohapatra", message: "Dewatering pump started", created_at: new Date(Date.now() - 1200000).toISOString() }
      ]
    },
    {
      id: 2,
      incident_id: 1,
      department_id: 2,
      department_name: "Roads and Infrastructure",
      assigned_to_worker_id: 2,
      worker_name: "Bikash Mohapatra",
      worker_phone: "+91 94371 23456",
      worker_code: "FW-1024",
      supervisor_id: 4,
      supervisor_name: "Sanjay Tripathy",
      title: "Pothole Patching at Vani Vihar Flyover Approach",
      category: "Pothole & Roads",
      description: "Deep pothole 1.2m wide causing severe motorcycle hazard near university gate.",
      instructions: "Apply cold-mix asphalt compound and compact with roller.",
      priority: "MEDIUM",
      status: "ASSIGNED",
      address: "Vani Vihar Junction, Janpath, Bhubaneswar",
      latitude: 20.3015,
      longitude: 85.8452,
      equipment_required: "Cold-Mix Asphalt Compound (4 Bags), Plate Compactor, Safety Signs",
      deadline: new Date(Date.now() + 28800000).toISOString(),
      created_at: new Date(Date.now() - 1800000).toISOString(),
      history: [
        { id: 1, task_id: 2, event_type: "TASK_ASSIGNED", actor_role: "DEPARTMENT_OFFICER", actor_name: "Ananya Patnaik", message: "Assigned to Bikash Mohapatra", created_at: new Date(Date.now() - 1800000).toISOString() }
      ]
    },
    {
      id: 3,
      incident_id: 1,
      department_id: 1,
      department_name: "Drainage and Flood Management",
      assigned_to_worker_id: 2,
      worker_name: "Bikash Mohapatra",
      worker_phone: "+91 94371 23456",
      worker_code: "FW-1024",
      supervisor_id: 4,
      supervisor_name: "Sanjay Tripathy",
      title: "Drain Desilting at Bomikhal Canal Grate",
      category: "Drainage",
      description: "Plastic waste accumulation blocking stormwater culvert flow into Gangua Nallah.",
      instructions: "Deploy hydraulic desilting rake to remove 2 cubic meters of plastic waste.",
      priority: "CRITICAL",
      status: "PENDING_VERIFICATION",
      address: "Bomikhal Canal Sluice Gate, Puri Road, Bhubaneswar",
      latitude: 20.2831,
      longitude: 85.8512,
      started_at: new Date(Date.now() - 14400000).toISOString(),
      submitted_at: new Date(Date.now() - 1800000).toISOString(),
      checkin_latitude: 20.2830,
      checkin_longitude: 85.8513,
      checkin_distance_meters: 8,
      checkin_within_radius: true,
      before_photo_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800",
      before_photo_desc: "Blocked culvert grate with plastic waste accumulation",
      after_photo_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      after_photo_desc: "Culvert cleared and stormwater flowing freely",
      worker_notes: "Hydraulic desilting complete. Removed 18 bags of plastic waste.",
      completion_summary: "Desilted 2.5 cubic meters of solid waste. Flow restored.",
      materials_used: "Desilting rake, 20 heavy duty bags",
      completion_proof_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      deadline: new Date(Date.now() + 7200000).toISOString(),
      created_at: new Date(Date.now() - 21600000).toISOString(),
      history: [
        { id: 1, task_id: 3, event_type: "COMPLAINT_SUBMITTED", actor_role: "CITIZEN", actor_name: "Prasant Sahoo", message: "Reported blocked canal grate", created_at: new Date(Date.now() - 21600000).toISOString() },
        { id: 2, task_id: 3, event_type: "TASK_ASSIGNED", actor_role: "DEPARTMENT_OFFICER", actor_name: "Ananya Patnaik", message: "Assigned work order TSK-3", created_at: new Date(Date.now() - 18000000).toISOString() },
        { id: 3, task_id: 3, event_type: "COMPLETION_SUBMITTED", actor_role: "FIELD_WORKER", actor_name: "Bikash Mohapatra", message: "Work completed & evidence uploaded. Awaiting supervisor sign-off.", created_at: new Date(Date.now() - 1800000).toISOString() }
      ]
    },
    {
      id: 4,
      incident_id: 1,
      department_id: 6,
      department_name: "Street Lighting and Electrical",
      assigned_to_worker_id: 2,
      worker_name: "Bikash Mohapatra",
      worker_phone: "+91 94371 23456",
      worker_code: "FW-1024",
      supervisor_id: 4,
      supervisor_name: "Sanjay Tripathy",
      title: "High-Mast LED Fixture Replacement at Lingaraj Temple Road",
      category: "Street Lighting",
      description: "Transformer photocell trip causing 200m dark stretch near Old Town.",
      instructions: "Replace photocell sensor and reset 250W high-mast breaker.",
      priority: "HIGH",
      status: "ACCEPTED",
      address: "Lingaraj Temple Approach Road, Old Town, Bhubaneswar",
      latitude: 20.2382,
      longitude: 85.8336,
      accepted_at: new Date(Date.now() - 900000).toISOString(),
      equipment_required: "150W Photocell Sensor, Insulation Gloves, Ladder Truck",
      deadline: new Date(Date.now() + 18000000).toISOString(),
      created_at: new Date(Date.now() - 3600000).toISOString(),
      history: [
        { id: 1, task_id: 4, event_type: "TASK_ASSIGNED", actor_role: "DEPARTMENT_OFFICER", actor_name: "Ananya Patnaik", message: "Assigned to Bikash Mohapatra", created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, task_id: 4, event_type: "TASK_ACCEPTED", actor_role: "FIELD_WORKER", actor_name: "Bikash Mohapatra", message: "Worker accepted task", created_at: new Date(Date.now() - 900000).toISOString() }
      ]
    },
    {
      id: 5,
      incident_id: 1,
      department_id: 5,
      department_name: "Sanitation and Waste Management",
      assigned_to_worker_id: 2,
      worker_name: "Bikash Mohapatra",
      worker_phone: "+91 94371 23456",
      worker_code: "FW-1024",
      supervisor_id: 4,
      supervisor_name: "Sanjay Tripathy",
      title: "Fallen Tree Branch Removal at Jayadev Vihar",
      category: "Sanitation",
      description: "Heavy rain caused banyan branch fall on footpath near Mayfair lagoon.",
      instructions: "Cut branch into segments and haul away using Tipper truck.",
      priority: "MEDIUM",
      status: "COMPLETED",
      address: "Jayadev Vihar Chowk, Bhubaneswar",
      latitude: 20.3081,
      longitude: 85.8274,
      started_at: new Date(Date.now() - 86400000).toISOString(),
      completed_at: new Date(Date.now() - 43200000).toISOString(),
      before_photo_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      after_photo_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      worker_notes: "Branch cut and loaded into BMC Tipper Truck #08. Footpath open.",
      completion_summary: "Footpath cleared and obstacle removed.",
      supervisor_feedback: "Prompt execution. Verified on site.",
      created_at: new Date(Date.now() - 90000000).toISOString(),
      history: [
        { id: 1, task_id: 5, event_type: "TASK_ASSIGNED", actor_role: "DEPARTMENT_OFFICER", actor_name: "Ananya Patnaik", message: "Assigned task", created_at: new Date(Date.now() - 90000000).toISOString() },
        { id: 2, task_id: 5, event_type: "SUPERVISOR_APPROVED", actor_role: "DEPARTMENT_SUPERVISOR", actor_name: "Sanjay Tripathy", message: "Supervisor approved completion report.", created_at: new Date(Date.now() - 43200000).toISOString() }
      ]
    }
  ];

  const emergencyCases: EmergencyCase[] = [];
  const roadRestrictions: RoadRestriction[] = [];

  const staffRegistrations: StaffRegistration[] = [
    {
      id: 1,
      ref_code: 'MUNI-REG-2026-1001',
      full_name: 'Er. Soumya Ranjan Mohanty',
      email: 'soumya.mohanty@bmc.gov.in',
      phone: '+91 98612 34567',
      employee_id: 'BMC-EMP-8821',
      department_id: 1,
      department_name: 'Drainage and Flood Management',
      designation: 'Assistant Executive Engineer',
      zone_or_office: 'BMC Zone-2 North Headquarters',
      status: 'PENDING_APPROVAL',
      role: 'MUNICIPAL_OFFICER',
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 2,
      ref_code: 'MUNI-REG-2026-1002',
      full_name: 'Priyanka Priyadarshini',
      email: 'priyanka.p@bmc.gov.in',
      phone: '+91 94378 11223',
      employee_id: 'BMC-EMP-9043',
      department_id: 5,
      department_name: 'Sanitation and Waste Management',
      designation: 'Senior Sanitation Inspector',
      zone_or_office: 'Saheed Nagar Ward 28 Office',
      status: 'PENDING_APPROVAL',
      role: 'SUPERVISOR',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      ref_code: 'MUNI-REG-2026-1000',
      full_name: 'Ananya Patnaik',
      email: 'officer@civicnexus.gov.in',
      phone: '+91 94372 34567',
      employee_id: 'BMC-EMP-1001',
      department_id: 1,
      department_name: 'Drainage and Flood Management',
      designation: 'Executive Officer',
      zone_or_office: 'CMC Central Office',
      status: 'APPROVED',
      role: 'MUNICIPAL_OFFICER',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      approved_at: new Date(Date.now() - 43200000).toISOString(),
      approved_by: 'admin@civicnexus.gov.in'
    }
  ];

  return {
    departments,
    users,
    hospitals,
    cameras,
    tourismPlaces,
    tourismDestinations,
    tourismEvents,
    tourismAdvisories,
    heritageTrails,
    tourismSavedDestinations,
    tourismItineraries,
    tourismAssistanceRequests,
    tourismContentCorrections,
    tourismAccommodations,
    tourismDining,
    tourismTravelConditions,
    tourismEmergencyContacts,
    notifications,
    auditLogs,
    municipalAssets,
    inventoryItems,
    incidents,
    reports,
    tasks,
    emergencyCases,
    roadRestrictions,
    staffRegistrations,
    aiDetectionEvents,
    emergencyAlerts,
    emergencyVehicles,
    emergencyResponses,
    alertDeliveryLogs,
    alertEscalations,
    videoAnalyses,
    routeClearanceRequests,
    incidentEvents: [
      {
        eventId: 'EVT-INIT-101',
        eventType: 'incident.created',
        incidentId: 1,
        actorUserId: 'cit-101',
        eventPayload: { title: 'Severe Waterlogging at Rasulgarh Overbridge Underpass', status: 'REPORTED' },
        eventVersion: 1,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        eventId: 'EVT-INIT-102',
        eventType: 'assignment.created',
        incidentId: 1,
        assignmentId: 1,
        actorUserId: 'muni-204',
        eventPayload: { assigned_to_worker_id: 2, status: 'ASSIGNED' },
        eventVersion: 1,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ] as IncidentEvent[],
    flagshipStep: 2,
  };
}

export const dbStore = createInitialDb();
