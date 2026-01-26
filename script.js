/* Self Improvement Tracker
   - Single-page, localStorage-backed
   - Daily checklist + notes
   - Weekly/Monthly/Yearly summaries
   - Streak based on fully completed days
*/

const STORAGE_KEY = "si_tracker_v1";
const UI_STATE_KEY = "si_ui_state_v1";

const DEFAULT_TASKS = [
  {
    id: "wake_5am",
    title: "5 AM wake up",
    desc: "Start the day early and intentionally.",
    category: "Morning",
    weight: 2,
    timeBlock: "morning",
  },
  {
    id: "meditation_20",
    title: "20 min meditation",
    desc: "Calm focus and mental clarity.",
    category: "Mindset",
    weight: 2,
    timeBlock: "morning",
  },
  {
    id: "walk_30",
    title: "30 min walking",
    desc: "Low-stress movement and sunlight.",
    category: "Movement",
    weight: 1,
    timeBlock: "afternoon",
  },
  {
    id: "stretch_30",
    title: "30 min stretching",
    desc: "Mobility and posture.",
    category: "Mobility",
    weight: 1,
    timeBlock: "evening",
  },
  {
    id: "study_10h",
    title: "10 hours study / work",
    desc: "Deep work to build your future.",
    category: "Work",
    weight: 3,
    timeBlock: "afternoon",
  },
  {
    id: "gym",
    title: "Gym",
    desc: "Strength, conditioning, resilience.",
    category: "Training",
    weight: 3,
    timeBlock: "evening",
  },
  {
    id: "nutrition",
    title: "Nutrition",
    desc: "Hit your nutrition plan for the day.",
    category: "Nutrition",
    weight: 2,
    timeBlock: "any",
  },
  {
    id: "reading_30",
    title: "30 min reading",
    desc: "Read something that sharpens you.",
    category: "Learning",
    weight: 1,
    timeBlock: "evening",
  },
  {
    id: "no_porn",
    title: "No porn",
    desc: "Protect your focus and discipline.",
    category: "Discipline",
    weight: 2,
    timeBlock: "any",
  },
  {
    id: "no_doomscroll",
    title: "No doomscrolling",
    desc: "Avoid mindless scrolling and feed loops.",
    category: "Discipline",
    weight: 2,
    timeBlock: "any",
  },
];

const NOTES_TABS = {
  wins: {
    prompt: "What went well today? Capture wins and momentum.",
    placeholder: "Wins, progress, proud moments…",
  },
  lessons: {
    prompt: "What did you learn or want to improve?",
    placeholder: "Lessons, friction, adjustments…",
  },
  tomorrow: {
    prompt: "What will you focus on tomorrow?",
    placeholder: "Top priorities, next moves…",
  },
};

const ACHIEVEMENTS = [
  {
    id: "first_day",
    title: "First day logged",
    desc: "Any day with at least one checked habit.",
    reward: 1,
    test: (stats) => stats.daysWithAnyTask >= 1,
  },
  {
    id: "three_day",
    title: "3-day streak",
    desc: "Build a 3-day streak.",
    reward: 1,
    test: (stats) => stats.bestStreak >= 3,
  },
  {
    id: "seven_day",
    title: "7-day streak",
    desc: "A full week of consistency.",
    reward: 1,
    test: (stats) => stats.bestStreak >= 7,
  },
  {
    id: "fourteen_day",
    title: "14-day streak",
    desc: "Two weeks in a row.",
    reward: 1,
    test: (stats) => stats.bestStreak >= 14,
  },
  {
    id: "thirty_day",
    title: "30-day streak",
    desc: "A month of momentum.",
    reward: 2,
    test: (stats) => stats.bestStreak >= 30,
  },
  {
    id: "hundred_points",
    title: "100 points",
    desc: "Score 100 total points.",
    reward: 1,
    test: (stats) => stats.totalPoints >= 100,
  },
  {
    id: "focus_5h",
    title: "5 focus hours",
    desc: "Log 5 hours of focus sessions.",
    reward: 1,
    test: (stats) => stats.totalFocusMinutes >= 300,
  },
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const TIME_BLOCKS = [
  { id: "any", label: "Any time" },
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];
const FLOW_BLOCK_OPTIONS = [
  { id: "now", label: "Now" },
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "all", label: "All" },
];

const DEFAULT_ANTI_HABITS = [
  { title: "No porn", desc: "Protect focus and discipline." },
  { title: "No doomscrolling", desc: "Avoid endless feeds and time sinks." },
];

const MOOD_SCALE = [
  { value: 0, label: "Not set", emoji: "😶" },
  { value: 1, label: "Rough", emoji: "😞" },
  { value: 2, label: "Low", emoji: "😕" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Great", emoji: "😁" },
];

const ENERGY_SCALE = [
  { value: 0, label: "Not set", emoji: "🔋" },
  { value: 1, label: "Drained", emoji: "😴" },
  { value: 2, label: "Low", emoji: "😪" },
  { value: 3, label: "Steady", emoji: "🙂" },
  { value: 4, label: "Strong", emoji: "😄" },
  { value: 5, label: "Full", emoji: "🤩" },
];

const URGE_SCALE = [
  { value: 0, label: "Not set", emoji: "😶" },
  { value: 1, label: "Mild", emoji: "🙂" },
  { value: 2, label: "Tug", emoji: "😐" },
  { value: 3, label: "Strong", emoji: "😬" },
  { value: 4, label: "Intense", emoji: "😣" },
  { value: 5, label: "Overwhelming", emoji: "😵" },
];

const SOCIAL_CHALLENGE_BANK = [
  { id: "smile_hi", text: "Make eye contact and say hi to someone." },
  { id: "compliment", text: "Give a genuine compliment to a stranger." },
  { id: "small_talk", text: "Start a short small talk conversation (30-60 sec)." },
  { id: "reach_friend", text: "Send a check-in text to a friend." },
  { id: "voice_note", text: "Send one voice note instead of text." },
  { id: "ask_question", text: "Ask a simple question to a worker (directions, recommendation)." },
  { id: "join_space", text: "Spend 10 minutes in a public place without headphones." },
  { id: "share_update", text: "Share one short personal update with someone." },
  { id: "call_someone", text: "Make one short call (2-5 minutes)." },
  { id: "reconnect", text: "Message someone you have not talked to in a while." },
  { id: "group_reply", text: "Reply in a group chat or forum once." },
  { id: "thanks", text: "Say thank you with a smile to a service worker." },
  { id: "introduce", text: "Introduce yourself to one person." },
  { id: "follow_up", text: "Follow up on a conversation you started earlier." },
  { id: "invite", text: "Invite someone to grab coffee or a walk." },
];

const TREND_METRICS = [
  { id: "completion", label: "Completion %", axis: "y" },
  { id: "score", label: "Score %", axis: "y" },
  { id: "deepwork", label: "Deep work %", axis: "y" },
  { id: "focus", label: "Focus min", axis: "y2" },
  { id: "study", label: "Study hrs", axis: "y2" },
];

const XP_CONFIG = {
  completionPerPct: 1.6,
  scorePerPct: 1.0,
  deepWorkPerPct: 0.8,
  focusPerMinute: 0.25,
  focusCapMinutes: 180,
  studyPerHour: 6,
  studyCapHours: 12,
  antiPerPct: 0.5,
  sleepPerPct: 0.3,
  socialChallenge: 20,
  reachoutPerItem: 6,
  reachoutCap: 5,
  notesPerItem: 6,
  notesCap: 6,
  dayClosedBonus: 10,
  perfectDayBonus: 40,
};

const LEVEL_CONFIG = {
  startXp: 120,
  growth: 1.18,
  bonusPerLevel: 40,
};

const $ = (id) => document.getElementById(id);

const el = {
  dataMenu: $("dataMenu"),
  dataMenuBtn: $("dataMenuBtn"),
  dataMenuPanel: $("dataMenuPanel"),
  focusModeBtn: $("focusModeBtn"),
  flowModeBtn: $("flowModeBtn"),
  progressPanel: $("progressPanel"),
  flowPanel: $("flowPanel"),
  flowDateLabel: $("flowDateLabel"),
  flowProgressLabel: $("flowProgressLabel"),
  flowProgressBar: $("flowProgressBar"),
  flowChecklistMeta: $("flowChecklistMeta"),
  flowMitBlock: $("flowMitBlock"),
  flowMitInput: $("flowMitInput"),
  flowMitDoneBtn: $("flowMitDoneBtn"),
  flowMitStatus: $("flowMitStatus"),
  flowBlockFilters: $("flowBlockFilters"),
  flowShowAllBtn: $("flowShowAllBtn"),
  flowCategoryFilters: $("flowCategoryFilters"),
  flowTaskList: $("flowTaskList"),
  flowFocusTime: $("flowFocusTime"),
  flowFocusLabel: $("flowFocusLabel"),
  flowFocusStartBtn: $("flowFocusStartBtn"),
  flowFocusStopBtn: $("flowFocusStopBtn"),
  flowFocusStatus: $("flowFocusStatus"),
  flowFocusList: $("flowFocusList"),
  flowFocusMeta: $("flowFocusMeta"),
  flowNotesWins: $("flowNotesWins"),
  flowNotesLessons: $("flowNotesLessons"),
  flowNotesTomorrow: $("flowNotesTomorrow"),
  flowIntentionInput: $("flowIntentionInput"),
  flowLessonInput: $("flowLessonInput"),
  flowGratitude1: $("flowGratitude1"),
  flowGratitude2: $("flowGratitude2"),
  flowGratitude3: $("flowGratitude3"),
  flowNotesSavedAt: $("flowNotesSavedAt"),
  flowReviewSummary: $("flowReviewSummary"),
  flowEndDayBtn: $("flowEndDayBtn"),
  flowEndDayStatus: $("flowEndDayStatus"),

  focusLaneCard: $("focusLaneCard"),
  focusLaneBlock: $("focusLaneBlock"),
  focusLaneMit: $("focusLaneMit"),
  focusLaneIntention: $("focusLaneIntention"),
  focusLaneTasks: $("focusLaneTasks"),
  focusLaneLabel: $("focusLaneLabel"),
  focusLaneStartBtn: $("focusLaneStartBtn"),
  focusLaneChecklistBtn: $("focusLaneChecklistBtn"),

  datePill: $("datePill"),
  datePicker: $("datePicker"),
  prevDayBtn: $("prevDayBtn"),
  nextDayBtn: $("nextDayBtn"),

  dailyCompletionMeta: $("dailyCompletionMeta"),
  dailyCompletion: $("dailyCompletion"),
  dailyScore: $("dailyScore"),
  dailyPoints: $("dailyPoints"),
  dailyStudy: $("dailyStudy"),
  dailyEarnings: $("dailyEarnings"),
  dailyStreak: $("dailyStreak"),
  dailyStudyTarget: $("dailyStudyTarget"),
  dailyEarningsTarget: $("dailyEarningsTarget"),
  dailyStudyBar: $("dailyStudyBar"),
  dailyEarningsBar: $("dailyEarningsBar"),

  mitBlock: $("mitBlock"),
  mitInput: $("mitInput"),
  mitDoneBtn: $("mitDoneBtn"),
  mitStatus: $("mitStatus"),

  dailyChecklistCard: $("dailyChecklistCard"),

  antiHabitsMeta: $("antiHabitsMeta"),
  antiHabitsList: $("antiHabitsList"),
  antiMarkAllBtn: $("antiMarkAllBtn"),
  antiClearBtn: $("antiClearBtn"),
  socialChallengeText: $("socialChallengeText"),
  socialNewBtn: $("socialNewBtn"),
  socialDoneBtn: $("socialDoneBtn"),
  socialChallengeStatus: $("socialChallengeStatus"),
  socialReachType: $("socialReachType"),
  socialReachWho: $("socialReachWho"),
  socialReachNote: $("socialReachNote"),
  socialReachAddBtn: $("socialReachAddBtn"),
  socialReachList: $("socialReachList"),
  socialReachMeta: $("socialReachMeta"),

  categoryFilters: $("categoryFilters"),
  showAllTasksBtn: $("showAllTasksBtn"),
  taskList: $("taskList"),

  studyHours: $("studyHours"),
  earnings: $("earnings"),
  studyTargetHint: $("studyTargetHint"),
  earningsTargetHint: $("earningsTargetHint"),

  moodInput: $("moodInput"),
  energyInput: $("energyInput"),
  sleepInput: $("sleepInput"),
  moodEmoji: $("moodEmoji"),
  moodLabel: $("moodLabel"),
  moodClearBtn: $("moodClearBtn"),
  energyEmoji: $("energyEmoji"),
  energyLabel: $("energyLabel"),
  energyClearBtn: $("energyClearBtn"),
  sleepScoreValue: $("sleepScoreValue"),
  sleepScoreLabel: $("sleepScoreLabel"),
  temptationMeta: $("temptationMeta"),
  temptationTrigger: $("temptationTrigger"),
  temptationUrgeInput: $("temptationUrgeInput"),
  temptationEmoji: $("temptationEmoji"),
  temptationLabel: $("temptationLabel"),
  temptationWant: $("temptationWant"),
  temptationDid: $("temptationDid"),
  temptationNote: $("temptationNote"),
  temptationAddBtn: $("temptationAddBtn"),
  temptationClearBtn: $("temptationClearBtn"),
  temptationList: $("temptationList"),
  slipMeta: $("slipMeta"),
  slipWhat: $("slipWhat"),
  slipWhy: $("slipWhy"),
  slipRoot: $("slipRoot"),
  slipNext: $("slipNext"),
  slipAddBtn: $("slipAddBtn"),
  slipClearBtn: $("slipClearBtn"),
  slipList: $("slipList"),

  focusTime: $("focusTime"),
  focusLabel: $("focusLabel"),
  focusStartBtn: $("focusStartBtn"),
  focusStopBtn: $("focusStopBtn"),
  focusStatus: $("focusStatus"),
  focusList: $("focusList"),
  focusWeekTotal: $("focusWeekTotal"),

  priority1: $("priority1"),
  priority2: $("priority2"),
  priority3: $("priority3"),
  copyPrioritiesBtn: $("copyPrioritiesBtn"),
  clearPrioritiesBtn: $("clearPrioritiesBtn"),
  weekLabel: $("weekLabel"),

  tabWins: $("tabWins"),
  tabLessons: $("tabLessons"),
  tabTomorrow: $("tabTomorrow"),
  notesArea: $("notesArea"),
  notesTagsInput: $("notesTagsInput"),
  notesPinBtn: $("notesPinBtn"),
  notesPrompt: $("notesPrompt"),
  notesSavedAt: $("notesSavedAt"),
  notesSearchInput: $("notesSearchInput"),
  notesTagFilters: $("notesTagFilters"),
  notesPinnedList: $("notesPinnedList"),
  notesResults: $("notesResults"),

  intentionInput: $("intentionInput"),
  lessonInput: $("lessonInput"),
  gratitude1: $("gratitude1"),
  gratitude2: $("gratitude2"),
  gratitude3: $("gratitude3"),

  rangeWeek: $("rangeWeek"),
  rangeMonth: $("rangeMonth"),
  rangeYear: $("rangeYear"),

  sectionSummary: $("sectionSummary"),
  sectionInsights: $("sectionInsights"),
  sectionManage: $("sectionManage"),

  summaryRangeLabel: $("summaryRangeLabel"),
  kpiCompletion: $("kpiCompletion"),
  kpiScore: $("kpiScore"),
  kpiStudy: $("kpiStudy"),
  kpiDeepWork: $("kpiDeepWork"),
  kpiEarnings: $("kpiEarnings"),
  kpiDays: $("kpiDays"),
  completionBar: $("completionBar"),
  summaryHint: $("summaryHint"),
  levelRangeMeta: $("levelRangeMeta"),
  levelCardValue: $("levelCardValue"),
  levelTotalXp: $("levelTotalXp"),
  levelRangeXp: $("levelRangeXp"),
  levelNextXp: $("levelNextXp"),
  levelNextMeta: $("levelNextMeta"),
  levelProgressBar: $("levelProgressBar"),
  levelProgressMeta: $("levelProgressMeta"),
  levelSourcesList: $("levelSourcesList"),
  perfectWeek: $("perfectWeek"),
  perfectMonth: $("perfectMonth"),
  perfectMonthLabel: $("perfectMonthLabel"),
  projectShowcaseMeta: $("projectShowcaseMeta"),
  projectShowcaseList: $("projectShowcaseList"),

  streakValue: $("streakValue"),
  levelValue: $("levelValue"),
  levelBar: $("levelBar"),
  levelMeta: $("levelMeta"),

  objectiveInput: $("objectiveInput"),
  objectiveDeadline: $("objectiveDeadline"),
  addObjectiveBtn: $("addObjectiveBtn"),
  objectiveList: $("objectiveList"),

  skillNameInput: $("skillNameInput"),
  skillPctInput: $("skillPctInput"),
  addSkillBtn: $("addSkillBtn"),
  skillList: $("skillList"),

  historyStrip: $("historyStrip"),
  taskStats: $("taskStats"),
  weeklyReviewLabel: $("weeklyReviewLabel"),
  weeklyWins: $("weeklyWins"),
  weeklyMisses: $("weeklyMisses"),
  weeklyFocus: $("weeklyFocus"),
  leaderboardRange: $("leaderboardRange"),
  leaderboardList: $("leaderboardList"),
  communityLeaderboardMeta: $("communityLeaderboardMeta"),
  communityLeaderboardList: $("communityLeaderboardList"),
  freezeTokens: $("freezeTokens"),
  useFreezeBtn: $("useFreezeBtn"),
  achievementsList: $("achievementsList"),

  kpiBestStreak: $("kpiBestStreak"),
  kpiPerfectDays: $("kpiPerfectDays"),
  kpiAllStudy: $("kpiAllStudy"),
  kpiAllEarnings: $("kpiAllEarnings"),
  kpiAllPoints: $("kpiAllPoints"),
  kpiAllXp: $("kpiAllXp"),
  kpiAllLevel: $("kpiAllLevel"),

  calPrev: $("calPrev"),
  calNext: $("calNext"),
  calTitle: $("calTitle"),
  calendarGrid: $("calendarGrid"),

  chartCompletion: $("chartCompletion"),
  chartWorkMoney: $("chartWorkMoney"),
  chartCorrelationCompletion: $("chartCorrelationCompletion"),
  chartCorrelationStudy: $("chartCorrelationStudy"),
  chartFinance: $("chartFinance"),
  chartTrend: $("chartTrend"),
  trendRangeSelect: $("trendRangeSelect"),
  trendMetricFilters: $("trendMetricFilters"),
  trendMeta: $("trendMeta"),
  autoInsightsList: $("autoInsightsList"),

  profileNameInput: $("profileNameInput"),
  profileLevelHint: $("profileLevelHint"),
  profileXpHint: $("profileXpHint"),
  friendNameInput: $("friendNameInput"),
  friendXpInput: $("friendXpInput"),
  addFriendBtn: $("addFriendBtn"),
  friendsList: $("friendsList"),

  voltarisChatLog: $("voltarisChatLog"),
  voltarisInput: $("voltarisInput"),
  voltarisSendBtn: $("voltarisSendBtn"),
  voltarisBuildBtn: $("voltarisBuildBtn"),
  voltarisRoutineBtn: $("voltarisRoutineBtn"),
  voltarisCoachBtn: $("voltarisCoachBtn"),
  voltarisWeeklyBtn: $("voltarisWeeklyBtn"),
  voltarisResetBtn: $("voltarisResetBtn"),
  voltarisMemoryExtractBtn: $("voltarisMemoryExtractBtn"),
  voltarisAutoMemoryToggle: $("voltarisAutoMemoryToggle"),
  voltarisPendingList: $("voltarisPendingList"),
  voltarisPendingMeta: $("voltarisPendingMeta"),
  voltarisAddPendingBtn: $("voltarisAddPendingBtn"),
  voltarisApiInput: $("voltarisApiInput"),
  voltarisCheckBtn: $("voltarisCheckBtn"),
  voltarisStatus: $("voltarisStatus"),
  voltarisAiToggle: $("voltarisAiToggle"),
  voltarisContextToggle: $("voltarisContextToggle"),
  voltarisDockBtn: $("voltarisDockBtn"),
  voltarisDockPanel: $("voltarisDockPanel"),
  voltarisDockCloseBtn: $("voltarisDockCloseBtn"),
  voltarisDockLog: $("voltarisDockLog"),
  voltarisDockInput: $("voltarisDockInput"),
  voltarisDockSendBtn: $("voltarisDockSendBtn"),
  voltarisDockCoachBtn: $("voltarisDockCoachBtn"),
  voltarisDockRoutineBtn: $("voltarisDockRoutineBtn"),
  voltarisDockMemoryBtn: $("voltarisDockMemoryBtn"),
  voltarisDockStatus: $("voltarisDockStatus"),
  voltarisCheckinFocus: $("voltarisCheckinFocus"),
  voltarisCheckinObstacle: $("voltarisCheckinObstacle"),
  voltarisCheckinWin: $("voltarisCheckinWin"),
  voltarisCheckinNotes: $("voltarisCheckinNotes"),
  voltarisCheckinMood: $("voltarisCheckinMood"),
  voltarisCheckinEnergy: $("voltarisCheckinEnergy"),
  voltarisCheckinMoodLabel: $("voltarisCheckinMoodLabel"),
  voltarisCheckinEnergyLabel: $("voltarisCheckinEnergyLabel"),
  voltarisCheckinSaveBtn: $("voltarisCheckinSaveBtn"),
  voltarisCheckinClearBtn: $("voltarisCheckinClearBtn"),
  voltarisCheckinMeta: $("voltarisCheckinMeta"),
  voltarisPlanInput: $("voltarisPlanInput"),
  voltarisPlanBtn: $("voltarisPlanBtn"),
  voltarisPlanList: $("voltarisPlanList"),
  voltarisPlanMeta: $("voltarisPlanMeta"),
  voltarisMemoryInput: $("voltarisMemoryInput"),
  voltarisMemoryAddBtn: $("voltarisMemoryAddBtn"),
  voltarisMemoryList: $("voltarisMemoryList"),
  supabaseUrlInput: $("supabaseUrlInput"),
  supabaseKeyInput: $("supabaseKeyInput"),
  supabaseAdminEmails: $("supabaseAdminEmails"),
  supabaseConnectBtn: $("supabaseConnectBtn"),
  supabaseAutoSyncToggle: $("supabaseAutoSyncToggle"),
  supabaseEmailInput: $("supabaseEmailInput"),
  supabasePasswordInput: $("supabasePasswordInput"),
  supabaseSignInBtn: $("supabaseSignInBtn"),
  supabaseSignUpBtn: $("supabaseSignUpBtn"),
  supabaseSignOutBtn: $("supabaseSignOutBtn"),
  supabaseSyncBtn: $("supabaseSyncBtn"),
  supabaseAuthMeta: $("supabaseAuthMeta"),
  globalLeaderboardList: $("globalLeaderboardList"),
  globalLeaderboardMeta: $("globalLeaderboardMeta"),
  adminUserList: $("adminUserList"),
  adminPanelMeta: $("adminPanelMeta"),
  multiplayerStatus: $("multiplayerStatus"),

  goalStudyInput: $("goalStudyInput"),
  goalEarningsInput: $("goalEarningsInput"),
  goalSleepInput: $("goalSleepInput"),
  mantraInput: $("mantraInput"),
  mantraDisplay: $("mantraDisplay"),
  vision1Input: $("vision1Input"),
  vision5Input: $("vision5Input"),
  quarterYearInput: $("quarterYearInput"),
  quarterQ1: $("quarterQ1"),
  quarterQ2: $("quarterQ2"),
  quarterQ3: $("quarterQ3"),
  quarterQ4: $("quarterQ4"),

  syncKey: $("syncKey"),
  firebaseConfig: $("firebaseConfig"),
  enableSyncBtn: $("enableSyncBtn"),
  syncNowBtn: $("syncNowBtn"),
  syncStatus: $("syncStatus"),

  markAllBtn: $("markAllBtn"),
  clearChecklistBtn: $("clearChecklistBtn"),
  copyYesterdayPlanBtn: $("copyYesterdayPlanBtn"),

  taskTitleInput: $("taskTitleInput"),
  taskDescInput: $("taskDescInput"),
  taskCategoryInput: $("taskCategoryInput"),
  taskWeightInput: $("taskWeightInput"),
  addTaskBtn: $("addTaskBtn"),
  taskManagerList: $("taskManagerList"),
  taskOptions: $("taskOptions"),

  antiHabitTitleInput: $("antiHabitTitleInput"),
  antiHabitDescInput: $("antiHabitDescInput"),
  addAntiHabitBtn: $("addAntiHabitBtn"),
  antiHabitManagerList: $("antiHabitManagerList"),
  socialStepInput: $("socialStepInput"),
  socialStepDifficulty: $("socialStepDifficulty"),
  addSocialStepBtn: $("addSocialStepBtn"),
  socialStepList: $("socialStepList"),

  projectInput: $("projectInput"),
  projectMilestoneInput: $("projectMilestoneInput"),
  projectDeadlineInput: $("projectDeadlineInput"),
  addProjectBtn: $("addProjectBtn"),
  projectList: $("projectList"),

  reminderTime: $("reminderTime"),
  reminderTask: $("reminderTask"),
  reminderLabel: $("reminderLabel"),
  addReminderBtn: $("addReminderBtn"),
  reminderDays: $("reminderDays"),
  enableNotificationsBtn: $("enableNotificationsBtn"),
  notificationsStatus: $("notificationsStatus"),
  remindersList: $("remindersList"),

  importBtn: $("importBtn"),
  importFile: $("importFile"),
  exportBtn: $("exportBtn"),
  exportCsvBtn: $("exportCsvBtn"),
  resetBtn: $("resetBtn"),
};

const SYNC_SETTINGS_KEY = "si_sync_settings_v1";

function todayLocalDate() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function toISODate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISODate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function currency(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(num);
}

function safeNumber(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return n;
}

function formatNumber(n) {
  const num = safeNumber(n);
  return String(Math.round(num * 100) / 100);
}

function normalizeCategory(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  return raw || "General";
}

function categoryKey(value) {
  return normalizeCategory(value).toLowerCase();
}

function normalizeWeight(value) {
  const n = Math.round(safeNumber(value));
  if (!Number.isFinite(n) || n <= 0) return 1;
  return clamp(n, 1, 10);
}

function normalizeScheduleDays(days) {
  const list = Array.isArray(days)
    ? days.map((d) => Number(d)).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    : [];
  const unique = Array.from(new Set(list));
  if (!unique.length) return DAY_ORDER.slice();
  return unique.sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
}

function normalizeTimeBlock(value) {
  const raw = typeof value === "string" ? value.toLowerCase() : "";
  return TIME_BLOCKS.some((block) => block.id === raw) ? raw : "any";
}

function normalizeStartDate(value) {
  const iso = typeof value === "string" ? value.trim() : "";
  return isIsoDate(iso) ? iso : "";
}

function formatTimeBlock(value) {
  const normalized = normalizeTimeBlock(value);
  return TIME_BLOCKS.find((block) => block.id === normalized)?.label ?? "Any time";
}

function formatScheduleDays(days) {
  const normalized = normalizeScheduleDays(days);
  if (normalized.length === 7) return "Daily";
  return normalized.map((d) => DAY_LABELS[d]).join(", ");
}

function getCurrentTimeBlock(dateObj) {
  const now = dateObj ?? new Date();
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

function formatTimeBlockWindow(block) {
  switch (block) {
    case "morning":
      return "5am–12pm";
    case "afternoon":
      return "12pm–5pm";
    case "evening":
      return "5pm–5am";
    default:
      return "Any time";
  }
}

function getDueTasksForBlock(dateObj, block) {
  const due = getDueTasksForDate(dateObj);
  return due.filter((task) => isTaskInBlock(task, block));
}

function isTaskScheduledForDate(task, dateObj) {
  const startIso = normalizeStartDate(task?.startDate);
  if (startIso) {
    const startDate = parseISODate(startIso);
    if (dateObj < startDate) return false;
  }
  const days = normalizeScheduleDays(task.scheduleDays);
  return days.includes(dateObj.getDay());
}

function isTaskInBlock(task, block) {
  if (block === "all") return true;
  const target = block === "now" ? getCurrentTimeBlock(new Date()) : block;
  const taskBlock = normalizeTimeBlock(task.timeBlock);
  if (taskBlock === "any") return true;
  return taskBlock === target;
}

function filterTasksByCategory(tasks) {
  if (!uiState.categoryFilter || uiState.categoryFilter === "All") return tasks;
  return tasks.filter((task) => categoryKey(task.category) === categoryKey(uiState.categoryFilter));
}

function normalizeTask(task) {
  const title = typeof task?.title === "string" ? task.title.trim() : "";
  return {
    id: typeof task?.id === "string" && task.id ? task.id : crypto.randomUUID(),
    title: title || "Untitled habit",
    desc: typeof task?.desc === "string" ? task.desc : "",
    category: normalizeCategory(task?.category),
    weight: normalizeWeight(task?.weight),
    scheduleDays: normalizeScheduleDays(task?.scheduleDays),
    timeBlock: normalizeTimeBlock(task?.timeBlock),
    startDate: normalizeStartDate(task?.startDate),
  };
}

function normalizeTasks(tasks) {
  if (!Array.isArray(tasks)) return DEFAULT_TASKS.map((t) => normalizeTask(t));
  return tasks.map((t) => normalizeTask(t));
}

function normalizeAntiHabit(item) {
  const title = typeof item?.title === "string" ? item.title.trim() : "";
  return {
    id: typeof item?.id === "string" && item.id ? item.id : crypto.randomUUID(),
    title: title || "Untitled anti-habit",
    desc: typeof item?.desc === "string" ? item.desc : "",
  };
}

function normalizeAntiHabits(items) {
  if (!Array.isArray(items)) return DEFAULT_ANTI_HABITS.map((item) => normalizeAntiHabit(item));
  return items.map((item) => normalizeAntiHabit(item));
}

function normalizeMilestone(item) {
  const title = typeof item?.title === "string" ? item.title.trim() : "";
  return {
    id: typeof item?.id === "string" && item.id ? item.id : crypto.randomUUID(),
    title: title || "Untitled milestone",
    dueDate: typeof item?.dueDate === "string" ? item.dueDate : "",
    done: Boolean(item?.done),
    createdAt: safeNumber(item?.createdAt ?? Date.now()),
  };
}

function normalizeProject(item) {
  const title = typeof item?.title === "string" ? item.title.trim() : "";
  const milestones = Array.isArray(item?.milestones) ? item.milestones.map((m) => normalizeMilestone(m)) : [];
  return {
    id: typeof item?.id === "string" && item.id ? item.id : crypto.randomUUID(),
    title: title || "Untitled project",
    milestones,
    createdAt: safeNumber(item?.createdAt ?? Date.now()),
  };
}

function normalizeProjects(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => normalizeProject(item));
}

function normalizeSocialStep(item) {
  const text = typeof item?.text === "string" ? item.text.trim() : "";
  const difficulty = clamp(Math.round(safeNumber(item?.difficulty)), 1, 5);
  return {
    id: typeof item?.id === "string" && item.id ? item.id : crypto.randomUUID(),
    text: text || "Untitled step",
    difficulty,
    active: item?.active !== false,
  };
}

function normalizeSocialSteps(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => normalizeSocialStep(item));
}

function normalizeSocialChallenge(item) {
  if (!item || typeof item !== "object") return { id: "", text: "", done: false };
  const text = typeof item.text === "string" ? item.text.trim() : "";
  return {
    id: typeof item.id === "string" ? item.id : "",
    text,
    done: Boolean(item.done) && Boolean(text),
  };
}

function normalizeReachout(entry) {
  if (!entry || typeof entry !== "object") return null;
  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : crypto.randomUUID(),
    type: typeof entry.type === "string" ? entry.type : "Text",
    who: typeof entry.who === "string" ? entry.who : "",
    note: typeof entry.note === "string" ? entry.note : "",
    createdAt: safeNumber(entry.createdAt ?? Date.now()),
  };
}

function normalizeReachouts(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.map((entry) => normalizeReachout(entry)).filter(Boolean);
}

function normalizeTemptation(entry) {
  if (!entry || typeof entry !== "object") return null;
  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : crypto.randomUUID(),
    trigger: typeof entry.trigger === "string" ? entry.trigger : "",
    urge: clamp(Math.round(safeNumber(entry.urge)), 0, 5),
    want: typeof entry.want === "string" ? entry.want : "",
    did: typeof entry.did === "string" ? entry.did : "",
    note: typeof entry.note === "string" ? entry.note : "",
    createdAt: safeNumber(entry.createdAt ?? Date.now()),
  };
}

function normalizeTemptations(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.map((entry) => normalizeTemptation(entry)).filter(Boolean);
}

function normalizeSlip(entry) {
  if (!entry || typeof entry !== "object") return null;
  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : crypto.randomUUID(),
    what: typeof entry.what === "string" ? entry.what : "",
    why: typeof entry.why === "string" ? entry.why : "",
    root: typeof entry.root === "string" ? entry.root : "",
    next: typeof entry.next === "string" ? entry.next : "",
    createdAt: safeNumber(entry.createdAt ?? Date.now()),
  };
}

function normalizeSlips(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.map((entry) => normalizeSlip(entry)).filter(Boolean);
}

function normalizeProfile(profile) {
  const username = typeof profile?.username === "string" ? profile.username.trim() : "";
  return {
    username: username || "You",
    createdAt: safeNumber(profile?.createdAt ?? Date.now()),
  };
}

function normalizeFriend(entry) {
  if (!entry || typeof entry !== "object") return null;
  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  if (!name) return null;
  const xp = Math.max(0, Math.round(safeNumber(entry.xp)));
  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : crypto.randomUUID(),
    name,
    xp,
    createdAt: safeNumber(entry.createdAt ?? Date.now()),
  };
}

function normalizeFriends(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.map((entry) => normalizeFriend(entry)).filter(Boolean);
}

const VOLTARIS_MAX_MESSAGES = 80;
const VOLTARIS_MAX_PENDING = 12;
const VOLTARIS_MAX_MEMORY = 40;
const VOLTARIS_MAX_PLANS = 12;
const VOLTARIS_STEPS = [
  "idle",
  "ask_title",
  "ask_category",
  "ask_frequency",
  "ask_difficulty",
  "ask_duration",
  "ask_block",
  "confirm",
];

function createVoltarisDraft(partial = {}) {
  const base = {
    title: "",
    desc: "",
    category: "Mindset",
    scheduleDays: DAY_ORDER.slice(),
    frequencyLabel: "Daily",
    difficulty: 3,
    minutes: 30,
    timeBlock: "any",
  };
  return { ...base, ...partial };
}

function normalizeVoltarisMessage(entry) {
  if (!entry || typeof entry !== "object") return null;
  const text = typeof entry.text === "string" ? entry.text.trim() : "";
  if (!text) return null;
  const role = entry.role === "user" ? "user" : "ai";
  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : crypto.randomUUID(),
    role,
    text,
    ts: safeNumber(entry.ts ?? Date.now()),
  };
}

function normalizeVoltarisMessages(list) {
  if (!Array.isArray(list)) return [];
  const normalized = list.map((entry) => normalizeVoltarisMessage(entry)).filter(Boolean);
  return normalized.slice(-VOLTARIS_MAX_MESSAGES);
}

function normalizeVoltarisPendingTask(entry) {
  if (!entry || typeof entry !== "object") return null;
  const title = typeof entry.title === "string" ? entry.title.trim() : "";
  if (!title) return null;
  const difficulty = clamp(Math.round(safeNumber(entry.difficulty ?? 3)), 1, 5);
  const minutes = clamp(Math.round(safeNumber(entry.minutes ?? 30)), 5, 240);
  const category = normalizeCategory(entry.category);
  const timeBlock = normalizeTimeBlock(entry.timeBlock);
  const scheduleDays = normalizeScheduleDays(entry.scheduleDays);
  const weight = normalizeWeight(entry.weight ?? computeVoltarisWeight(difficulty, minutes));
  const frequencyLabel = typeof entry.frequencyLabel === "string" && entry.frequencyLabel.trim()
    ? entry.frequencyLabel.trim()
    : formatScheduleDays(scheduleDays);
  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : crypto.randomUUID(),
    title,
    desc: typeof entry.desc === "string" ? entry.desc : "",
    category,
    difficulty,
    minutes,
    timeBlock,
    scheduleDays,
    frequencyLabel,
    weight,
    reason: typeof entry.reason === "string" ? entry.reason : "",
    createdAt: safeNumber(entry.createdAt ?? Date.now()),
  };
}

function normalizeVoltarisPendingTasks(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((entry) => normalizeVoltarisPendingTask(entry))
    .filter(Boolean)
    .slice(0, VOLTARIS_MAX_PENDING);
}

function normalizeVoltarisMemoryItem(entry) {
  if (!entry || typeof entry !== "object") return null;
  const text = typeof entry.text === "string" ? entry.text.trim() : "";
  if (!text) return null;
  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : crypto.randomUUID(),
    text,
    createdAt: safeNumber(entry.createdAt ?? Date.now()),
  };
}

function normalizeVoltarisMemory(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((entry) => normalizeVoltarisMemoryItem(entry))
    .filter(Boolean)
    .slice(0, VOLTARIS_MAX_MEMORY);
}

function normalizeVoltarisCheckin(entry) {
  if (!entry || typeof entry !== "object") return null;
  return {
    focus: typeof entry.focus === "string" ? entry.focus : "",
    obstacle: typeof entry.obstacle === "string" ? entry.obstacle : "",
    win: typeof entry.win === "string" ? entry.win : "",
    notes: typeof entry.notes === "string" ? entry.notes : "",
    mood: clamp(Math.round(safeNumber(entry.mood ?? 0)), 0, 5),
    energy: clamp(Math.round(safeNumber(entry.energy ?? 0)), 0, 5),
    createdAt: safeNumber(entry.createdAt ?? Date.now()),
  };
}

function normalizeVoltarisCheckins(map) {
  if (!map || typeof map !== "object") return {};
  const normalized = {};
  for (const [iso, entry] of Object.entries(map)) {
    if (!isIsoDate(iso)) continue;
    const checkin = normalizeVoltarisCheckin(entry);
    if (checkin) normalized[iso] = checkin;
  }
  return normalized;
}

function normalizeVoltarisPlan(entry) {
  if (!entry || typeof entry !== "object") return null;
  const title = typeof entry.title === "string" ? entry.title.trim() : "";
  const steps = Array.isArray(entry.steps)
    ? entry.steps.map((step) => String(step).trim()).filter(Boolean)
    : [];
  if (!title && steps.length === 0) return null;
  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : crypto.randomUUID(),
    title: title || "Action plan",
    steps,
    source: typeof entry.source === "string" ? entry.source : "",
    createdAt: safeNumber(entry.createdAt ?? Date.now()),
  };
}

function normalizeVoltarisPlans(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((entry) => normalizeVoltarisPlan(entry))
    .filter(Boolean)
    .slice(0, VOLTARIS_MAX_PLANS);
}

function normalizeVoltarisFlow(flow) {
  const step = VOLTARIS_STEPS.includes(flow?.step) ? flow.step : "idle";
  const draftRaw = flow && typeof flow === "object" ? flow.draft : null;
  const draftBase = createVoltarisDraft(draftRaw ?? {});
  const draft = {
    ...draftBase,
    title: typeof draftBase.title === "string" ? draftBase.title.trim() : "",
    desc: typeof draftBase.desc === "string" ? draftBase.desc : "",
    category: normalizeCategory(draftBase.category),
    scheduleDays: normalizeScheduleDays(draftBase.scheduleDays),
    difficulty: clamp(Math.round(safeNumber(draftBase.difficulty ?? 3)), 1, 5),
    minutes: clamp(Math.round(safeNumber(draftBase.minutes ?? 30)), 5, 240),
    timeBlock: normalizeTimeBlock(draftBase.timeBlock),
  };
  draft.frequencyLabel = typeof draftBase.frequencyLabel === "string" && draftBase.frequencyLabel.trim()
    ? draftBase.frequencyLabel.trim()
    : formatScheduleDays(draft.scheduleDays);
  const mode = flow?.mode === "habit" || flow?.mode === "routine" ? flow.mode : "";
  return { step, draft, mode };
}

function defaultVoltarisState() {
  return {
    messages: [
      {
        id: crypto.randomUUID(),
        role: "ai",
        text: "I’m Voltaris. I help you design habits, score them fairly, and add them fast. Tap “Build a habit” to begin.",
        ts: Date.now(),
      },
    ],
    pendingTasks: [],
    memory: [],
    checkins: {},
    plans: [],
    flow: normalizeVoltarisFlow({ step: "idle", draft: createVoltarisDraft(), mode: "" }),
    lastUpdatedAt: Date.now(),
  };
}

function normalizeVoltarisState(raw) {
  if (!raw || typeof raw !== "object") return defaultVoltarisState();
  const messages = normalizeVoltarisMessages(raw.messages);
  const pendingTasks = normalizeVoltarisPendingTasks(raw.pendingTasks);
  const memory = normalizeVoltarisMemory(raw.memory);
  const checkins = normalizeVoltarisCheckins(raw.checkins);
  const plans = normalizeVoltarisPlans(raw.plans);
  const flow = normalizeVoltarisFlow(raw.flow);
  const normalized = {
    messages: messages.length ? messages : defaultVoltarisState().messages,
    pendingTasks,
    memory,
    checkins,
    plans,
    flow,
    lastUpdatedAt: safeNumber(raw.lastUpdatedAt ?? Date.now()),
  };
  return normalized;
}

function parseTags(text) {
  if (!text) return [];
  const parts = String(text)
    .split(/[,#]/)
    .flatMap((part) => part.split(/\s+/))
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(parts));
}

function formatTags(tags) {
  if (!Array.isArray(tags)) return "";
  return tags.join(", ");
}

function normalizeReminder(reminder) {
  const time = typeof reminder?.time === "string" && /^\d{2}:\d{2}$/.test(reminder.time)
    ? reminder.time
    : "09:00";
  const days = Array.isArray(reminder?.days)
    ? reminder.days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    : [1, 2, 3, 4, 5];
  const uniqueDays = Array.from(new Set(days));
  return {
    id: typeof reminder?.id === "string" && reminder.id ? reminder.id : crypto.randomUUID(),
    time,
    task: typeof reminder?.task === "string" ? reminder.task : "",
    label: typeof reminder?.label === "string" ? reminder.label : "",
    days: uniqueDays.length ? uniqueDays : [1, 2, 3, 4, 5],
    enabled: reminder?.enabled !== false,
  };
}

function normalizeReminders(reminders) {
  if (!Array.isArray(reminders)) return [];
  return reminders.map((reminder) => normalizeReminder(reminder));
}

function normalizeAchievements(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && typeof item.id === "string")
    .map((item) => ({
      id: item.id,
      unlockedAt: safeNumber(item.unlockedAt ?? Date.now()),
    }));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  state.meta ??= {};
  state.meta.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  scheduleAutoSync();
}

function loadUiState() {
  try {
    const raw = localStorage.getItem(UI_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveUiState(uiState) {
  localStorage.setItem(UI_STATE_KEY, JSON.stringify(uiState));
}

function createDayRecord(tasks, antiHabits = []) {
  const tasksObj = {};
  for (const t of tasks) tasksObj[t.id] = false;
  const antiObj = {};
  for (const habit of antiHabits) antiObj[habit.id] = false;
  return {
    tasks: tasksObj,
    antiHabits: antiObj,
    studyHours: 0,
    earnings: 0,
    notes: {
      wins: "",
      lessons: "",
      tomorrow: "",
      learned: "",
      plan: "",
    },
    mit: { text: "", done: false },
    notesTags: [],
    notesPinned: false,
    notesUpdatedAt: 0,
    intention: "",
    lessonLearned: "",
    gratitude: ["", "", ""],
    socialChallenge: { id: "", text: "", done: false },
    socialReachouts: [],
    temptations: [],
    slips: [],
    checkin: { mood: 0, energy: 0, sleep: 0 },
    focusSessions: [],
    dayClosedAt: 0,
  };
}

function normalizeDayRecord(rec, tasks, antiHabits = []) {
  if (!rec || typeof rec !== "object") return createDayRecord(tasks, antiHabits);
  if (!rec.tasks || typeof rec.tasks !== "object") rec.tasks = {};
  if (!rec.antiHabits || typeof rec.antiHabits !== "object") rec.antiHabits = {};

  for (const t of tasks) {
    if (typeof rec.tasks[t.id] !== "boolean") rec.tasks[t.id] = false;
  }
  for (const habit of antiHabits) {
    if (typeof rec.antiHabits[habit.id] !== "boolean") rec.antiHabits[habit.id] = false;
  }

  if (!rec.notes || typeof rec.notes !== "object") rec.notes = {};
  if (typeof rec.notes.wins !== "string") rec.notes.wins = rec.notes.learned ?? "";
  if (typeof rec.notes.lessons !== "string") rec.notes.lessons = "";
  if (typeof rec.notes.tomorrow !== "string") rec.notes.tomorrow = rec.notes.plan ?? "";
  if (typeof rec.notes.learned !== "string") rec.notes.learned = rec.notes.wins ?? "";
  if (typeof rec.notes.plan !== "string") rec.notes.plan = rec.notes.tomorrow ?? "";

  if (!rec.mit || typeof rec.mit !== "object") rec.mit = { text: "", done: false };
  if (typeof rec.mit.text !== "string") rec.mit.text = "";
  rec.mit.done = Boolean(rec.mit.done) && Boolean(rec.mit.text.trim());

  if (!Array.isArray(rec.notesTags)) rec.notesTags = [];
  rec.notesTags = Array.from(new Set(
    rec.notesTags
      .filter((tag) => typeof tag === "string" && tag.trim())
      .map((tag) => tag.trim().toLowerCase())
  ));
  rec.notesPinned = Boolean(rec.notesPinned);
  if (!Number.isFinite(Number(rec.notesUpdatedAt))) rec.notesUpdatedAt = 0;

  if (!Number.isFinite(Number(rec.studyHours))) rec.studyHours = 0;
  if (!Number.isFinite(Number(rec.earnings))) rec.earnings = 0;

  if (typeof rec.intention !== "string") rec.intention = "";
  if (typeof rec.lessonLearned !== "string") rec.lessonLearned = "";
  if (!Array.isArray(rec.gratitude)) rec.gratitude = ["", "", ""];
  rec.gratitude = [
    typeof rec.gratitude[0] === "string" ? rec.gratitude[0] : "",
    typeof rec.gratitude[1] === "string" ? rec.gratitude[1] : "",
    typeof rec.gratitude[2] === "string" ? rec.gratitude[2] : "",
  ];

  rec.socialChallenge = normalizeSocialChallenge(rec.socialChallenge);
  rec.socialReachouts = normalizeReachouts(rec.socialReachouts);
  rec.temptations = normalizeTemptations(rec.temptations);
  rec.slips = normalizeSlips(rec.slips);

  if (!rec.checkin || typeof rec.checkin !== "object") rec.checkin = {};
  if (!Number.isFinite(Number(rec.checkin.mood))) rec.checkin.mood = 0;
  if (!Number.isFinite(Number(rec.checkin.energy))) rec.checkin.energy = 0;
  if (!Number.isFinite(Number(rec.checkin.sleep))) rec.checkin.sleep = 0;

  if (!Array.isArray(rec.focusSessions)) rec.focusSessions = [];
  if (!Number.isFinite(Number(rec.dayClosedAt))) rec.dayClosedAt = 0;
  return rec;
}

function initialState() {
  return {
    version: 1,
    meta: { updatedAt: Date.now() },
    tasks: normalizeTasks(DEFAULT_TASKS),
    antiHabits: normalizeAntiHabits(DEFAULT_ANTI_HABITS),
    days: {
      // [isoDate]: { tasks: {id:boolean}, studyHours:number, earnings:number, notes:{wins,lessons,tomorrow} }
    },
    weeks: {},
    goals: { studyDaily: 0, earningsDaily: 0, sleepDaily: 8 },
    profile: normalizeProfile({ username: "" }),
    friends: [],
    voltaris: defaultVoltarisState(),
    mantra: "",
    vision: { oneYear: "", fiveYear: "" },
    quarterlyGoals: { label: "", goals: ["", "", "", ""] },
    objectives: [],
    skills: [],
    socialSteps: [],
    projects: [],
    reminders: [],
    achievements: [],
    freezeUsed: [],
  };
}

let state = normalizeImportedState(loadState()) ?? initialState();
const uiState = loadUiState() ?? { rightTab: "summary", collapsed: { skills: true, sync: true } };
if (!uiState.collapsed) uiState.collapsed = { skills: true, sync: true };
if (!("rightTab" in uiState)) uiState.rightTab = "summary";
if (!("categoryFilter" in uiState)) uiState.categoryFilter = "All";
if (!("notesTagFilter" in uiState)) uiState.notesTagFilter = "all";
if (!("notesQuery" in uiState)) uiState.notesQuery = "";
if (!("focusMode" in uiState)) uiState.focusMode = false;
if (!("flowMode" in uiState)) uiState.flowMode = false;
if (!("flowBlockFilter" in uiState)) uiState.flowBlockFilter = "now";
if (!("flowShowAll" in uiState)) uiState.flowShowAll = false;
if (!("showAllTasks" in uiState)) uiState.showAllTasks = false;
if (!("trendRange" in uiState)) uiState.trendRange = 30;
if (!Array.isArray(uiState.trendMetrics)) uiState.trendMetrics = ["completion", "deepwork", "focus"];
if (!Array.isArray(uiState.reminderDays)) uiState.reminderDays = [1, 2, 3, 4, 5, 6, 0];
if (!("voltarisAiEnabled" in uiState)) uiState.voltarisAiEnabled = false;
if (!("voltarisContextEnabled" in uiState)) uiState.voltarisContextEnabled = true;
if (!("voltarisAutoMemory" in uiState)) uiState.voltarisAutoMemory = false;
if (!("voltarisApiUrl" in uiState)) uiState.voltarisApiUrl = "http://localhost:8787/api/voltaris";
if (!("supabaseUrl" in uiState)) uiState.supabaseUrl = "";
if (!("supabaseKey" in uiState)) uiState.supabaseKey = "";
if (!("supabaseAdminEmails" in uiState)) uiState.supabaseAdminEmails = "";
if (!("supabaseAutoSync" in uiState)) uiState.supabaseAutoSync = false;

let activeDate = todayLocalDate();
let activeNotesTab = "wins"; // wins | lessons | tomorrow
let activeRange = "week"; // week | month | year
let activeRightTab = uiState.rightTab ?? "summary";
let calendarMonth = new Date(todayLocalDate().getFullYear(), todayLocalDate().getMonth(), 1);

let chartCompletionInstance = null;
let chartWorkMoneyInstance = null;
let chartCorrelationCompletionInstance = null;
let chartCorrelationStudyInstance = null;
let chartFinanceInstance = null;
let chartTrendInstance = null;

let focusTimer = {
  running: false,
  startTs: 0,
  interval: null,
  label: "",
};

let draggingTaskId = null;
let reminderInterval = null;
let reminderLastFired = {};
let selectedReminderDays = new Set(uiState.reminderDays);

let sync = {
  enabled: false,
  key: "",
  firebaseConfig: null,
  firestore: null,
  authReady: false,
  unsub: null,
  uploadTimer: null,
  lastPulledUpdatedAt: 0,
};

let supabaseClient = null;
let multiplayerState = {
  connected: false,
  user: null,
  role: "member",
  lastSyncAt: 0,
  leaderboard: [],
  adminUsers: [],
};

function getDayRecord(isoDate) {
  if (!state.days[isoDate]) {
    state.days[isoDate] = createDayRecord(state.tasks, state.antiHabits);
  } else {
    state.days[isoDate] = normalizeDayRecord(state.days[isoDate], state.tasks, state.antiHabits);
  }
  return state.days[isoDate];
}

function isIsoDate(iso) {
  return typeof iso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(iso);
}

function isDayFullyComplete(isoDate) {
  const rec = state.days[isoDate];
  if (!rec) return false;
  const dueTasks = getDueTasksForDate(parseISODate(isoDate));
  if (dueTasks.length === 0) return true;
  return dueTasks.every((t) => rec.tasks?.[t.id] === true);
}

function isDayCompleteForStreak(isoDate) {
  if (isDayFullyComplete(isoDate)) return true;
  return Array.isArray(state.freezeUsed) && state.freezeUsed.includes(isoDate);
}

function isTaskDoneOnDay(taskId, isoDate) {
  const rec = state.days[isoDate];
  return rec?.tasks?.[taskId] === true;
}

function computeStreakFrom(dateObj) {
  // Streak counts consecutive fully-completed days ending at `dateObj`.
  // If today isn't complete yet, streak ends at yesterday.
  let d = new Date(dateObj);
  d.setHours(0, 0, 0, 0);

  const todayIso = toISODate(d);
  if (!isDayCompleteForStreak(todayIso)) {
    d.setDate(d.getDate() - 1);
  }

  let streak = 0;
  for (;;) {
    const iso = toISODate(d);
    if (!isDayCompleteForStreak(iso)) break;
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function computeTaskStreak(taskId, dateObj) {
  // Consecutive scheduled days the task is checked, ending at dateObj.
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return 0;

  const anchor = new Date(dateObj);
  anchor.setHours(0, 0, 0, 0);
  const startIso = normalizeStartDate(task.startDate);
  if (startIso) {
    const startDate = parseISODate(startIso);
    if (anchor < startDate) return 0;
  }

  let d = new Date(anchor);

  let guard = 0;
  while (!isTaskScheduledForDate(task, d) && guard < 7) {
    d.setDate(d.getDate() - 1);
    guard += 1;
  }

  const todayIso = toISODate(d);
  if (isTaskScheduledForDate(task, d) && !isTaskDoneOnDay(taskId, todayIso)) {
    d.setDate(d.getDate() - 1);
  }

  let streak = 0;
  guard = 0;
  for (;;) {
    if (guard++ > 3660) break;
    if (!isTaskScheduledForDate(task, d)) {
      d.setDate(d.getDate() - 1);
      continue;
    }
    const iso = toISODate(d);
    if (!isTaskDoneOnDay(taskId, iso)) break;
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function computeLastDoneDate(taskId) {
  let latest = "";
  for (const iso of Object.keys(state.days)) {
    if (!isTaskDoneOnDay(taskId, iso)) continue;
    if (!latest || iso > latest) latest = iso;
  }
  return latest || "";
}

function computeBestStreak(predicate) {
  const keys = Object.keys(state.days);
  if (keys.length === 0) return 0;
  const dates = keys.map(parseISODate).sort((a, b) => a - b);
  const start = dates[0];
  const end = dates[dates.length - 1];

  let best = 0;
  let cur = 0;
  for (const d of iterDatesInclusive(start, end)) {
    const iso = toISODate(d);
    if (predicate(iso)) {
      cur += 1;
      if (cur > best) best = cur;
    } else {
      cur = 0;
    }
  }
  return best;
}

function computeBestTaskStreak(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return 0;
  const keys = Object.keys(state.days);
  if (keys.length === 0) return 0;
  const dates = keys.map(parseISODate).sort((a, b) => a - b);
  let start = dates[0];
  const end = dates[dates.length - 1];
  const startIso = normalizeStartDate(task.startDate);
  if (startIso) {
    const startDate = parseISODate(startIso);
    if (startDate > end) return 0;
    if (startDate > start) start = startDate;
  }

  let best = 0;
  let cur = 0;
  for (const d of iterDatesInclusive(start, end)) {
    if (!isTaskScheduledForDate(task, d)) continue;
    const iso = toISODate(d);
    if (isTaskDoneOnDay(taskId, iso)) {
      cur += 1;
      if (cur > best) best = cur;
    } else {
      cur = 0;
    }
  }
  return best;
}

function computeBestPerfectDayStreak() {
  return computeBestStreak((iso) => isDayCompleteForStreak(iso));
}

function normalizeAllDaysToTasks() {
  const taskIds = new Set(state.tasks.map((t) => t.id));
  const antiIds = new Set((state.antiHabits ?? []).map((h) => h.id));
  for (const iso of Object.keys(state.days)) {
    const rec = normalizeDayRecord(state.days[iso], state.tasks, state.antiHabits);
    // Remove deleted tasks
    for (const existingId of Object.keys(rec.tasks)) {
      if (!taskIds.has(existingId)) delete rec.tasks[existingId];
    }
    for (const existingId of Object.keys(rec.antiHabits ?? {})) {
      if (!antiIds.has(existingId)) delete rec.antiHabits[existingId];
    }
    state.days[iso] = rec;
  }
}

function formatPrettyDate(d) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

function formatShortDate(d) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
  }).format(d);
}

function formatTime(ts) {
  const d = new Date(ts);
  if (!Number.isFinite(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function formatRelativeIso(iso) {
  if (!iso) return "Never";
  const todayIso = toISODate(todayLocalDate());
  if (iso === todayIso) return "Today";
  const y = new Date(todayLocalDate());
  y.setDate(y.getDate() - 1);
  if (iso === toISODate(y)) return "Yesterday";
  return formatShortDate(parseISODate(iso));
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatMinutes(mins) {
  const m = Math.max(0, Math.round(mins));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

function setActiveDate(d) {
  activeDate = new Date(d);
  activeDate.setHours(0, 0, 0, 0);
  render();
}

function renderCategoryFilters(container) {
  if (!container) return;
  container.innerHTML = "";

  const categories = Array.from(
    new Set(state.tasks.map((t) => normalizeCategory(t.category)))
  ).sort((a, b) => a.localeCompare(b));

  if (uiState.categoryFilter && uiState.categoryFilter !== "All") {
    const exists = categories.some((cat) => categoryKey(cat) === categoryKey(uiState.categoryFilter));
    if (!exists) uiState.categoryFilter = "All";
  }

  const buttons = ["All", ...categories];
  for (const label of buttons) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chipBtn";
    const isActive = label === "All"
      ? uiState.categoryFilter === "All"
      : categoryKey(label) === categoryKey(uiState.categoryFilter);
    if (isActive) btn.classList.add("is-active");
    btn.textContent = label;
    btn.addEventListener("click", () => {
      uiState.categoryFilter = label === "All" ? "All" : label;
      saveUiState(uiState);
      render();
    });
    container.appendChild(btn);
  }
}

function renderTasks(isoDate) {
  const rec = getDayRecord(isoDate);
  renderCategoryFilters(el.categoryFilters);
  const dueTasks = getDueTasksForDate(activeDate);
  const visibleTasks = getMainVisibleTasks(activeDate);
  renderTasksList(el.taskList, rec, visibleTasks);

  if (el.dailyCompletionMeta) {
    const totalDue = dueTasks.length;
    if (totalDue === 0) {
      el.dailyCompletionMeta.textContent = "No tasks";
    } else {
      el.dailyCompletionMeta.textContent = `${countDoneTasks(rec, dueTasks)} / ${totalDue}`;
    }
  }

  if (el.showAllTasksBtn) {
    el.showAllTasksBtn.textContent = uiState.showAllTasks ? "Due only" : "Show all";
  }
}

function countDoneTasks(rec, tasks = state.tasks) {
  let done = 0;
  for (const task of tasks) {
    if (rec.tasks?.[task.id] === true) done += 1;
  }
  return done;
}

function getVisibleTasks(tasks = state.tasks) {
  return filterTasksByCategory(tasks);
}

function renderTasksList(container, rec, tasks = null) {
  if (!container) return;
  container.innerHTML = "";

  const visibleTasks = tasks ?? getVisibleTasks();
  if (visibleTasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "No habits in this category yet.";
    container.appendChild(empty);
    return;
  }

  for (const task of visibleTasks) {
    const wrap = document.createElement("div");
    wrap.className = "task";

    const left = document.createElement("div");
    left.className = "task__left";

    const cb = document.createElement("input");
    cb.className = "task__check";
    cb.type = "checkbox";
    cb.checked = rec.tasks[task.id] === true;
    cb.addEventListener("change", () => {
      rec.tasks[task.id] = cb.checked;
      saveState(state);
      render();
    });

    left.appendChild(cb);

    const main = document.createElement("div");
    main.className = "task__main";

    const title = document.createElement("div");
    title.className = "task__title";
    title.textContent = task.title;

    const desc = document.createElement("div");
    desc.className = "task__desc";
    desc.textContent = task.desc;

    main.appendChild(title);
    main.appendChild(desc);

    const meta = document.createElement("div");
    meta.className = "task__meta";
    const streak = computeTaskStreak(task.id, activeDate);
    const lastDoneIso = computeLastDoneDate(task.id);
    meta.textContent = `Streak ${streak} • Last done: ${formatRelativeIso(lastDoneIso)}`;
    main.appendChild(meta);

    const badges = document.createElement("div");
    badges.className = "task__badges";
    const cat = document.createElement("span");
    cat.className = "task__badge";
    cat.textContent = normalizeCategory(task.category);
    const weight = document.createElement("span");
    weight.className = "task__badge task__badge--points";
    weight.textContent = `${normalizeWeight(task.weight)} pts`;
    badges.appendChild(cat);
    badges.appendChild(weight);
    main.appendChild(badges);

    wrap.appendChild(left);
    wrap.appendChild(main);

    container.appendChild(wrap);
  }
}

function renderAntiHabits(isoDate) {
  if (!el.antiHabitsList) return;
  const rec = getDayRecord(isoDate);
  const habits = Array.isArray(state.antiHabits) ? state.antiHabits : [];
  el.antiHabitsList.innerHTML = "";

  if (habits.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "No anti-habits yet. Add some in Manage.";
    el.antiHabitsList.appendChild(empty);
    if (el.antiHabitsMeta) el.antiHabitsMeta.textContent = "0 / 0";
    return;
  }

  let cleanCount = 0;
  for (const habit of habits) {
    const wrap = document.createElement("div");
    wrap.className = "antiHabit";

    const check = document.createElement("input");
    check.className = "task__check";
    check.type = "checkbox";
    check.checked = rec.antiHabits?.[habit.id] === true;
    if (check.checked) wrap.classList.add("is-clean");

    check.addEventListener("change", () => {
      rec.antiHabits[habit.id] = check.checked;
      saveState(state);
      renderAntiHabits(isoDate);
      scheduleProgressRefresh();
    });

    const main = document.createElement("div");
    const title = document.createElement("div");
    title.className = "antiHabit__title";
    title.textContent = habit.title;
    const desc = document.createElement("div");
    desc.className = "antiHabit__desc";
    desc.textContent = habit.desc || "Stay clean today.";
    main.appendChild(title);
    main.appendChild(desc);

    wrap.appendChild(check);
    wrap.appendChild(main);
    el.antiHabitsList.appendChild(wrap);

    if (check.checked) cleanCount += 1;
  }

  if (el.antiHabitsMeta) {
    el.antiHabitsMeta.textContent = `${cleanCount} / ${habits.length}`;
  }
}

function pickSocialChallenge() {
  const steps = Array.isArray(state.socialSteps)
    ? state.socialSteps.filter((step) => step.active !== false)
    : [];
  if (steps.length) {
    const pick = steps[Math.floor(Math.random() * steps.length)];
    return { id: pick.id, text: pick.text };
  }
  const pick = SOCIAL_CHALLENGE_BANK[Math.floor(Math.random() * SOCIAL_CHALLENGE_BANK.length)];
  return { id: pick.id, text: pick.text };
}

function renderSocialMomentum(isoDate) {
  if (!el.socialChallengeText) return;
  const rec = getDayRecord(isoDate);
  const challenge = normalizeSocialChallenge(rec.socialChallenge);
  rec.socialChallenge = challenge;

  el.socialChallengeText.textContent = challenge.text || "Not set yet.";
  if (el.socialChallengeStatus) {
    el.socialChallengeStatus.textContent = challenge.text
      ? challenge.done ? "Challenge done" : "In progress"
      : "Pick a challenge";
  }
  if (el.socialDoneBtn) {
    el.socialDoneBtn.textContent = challenge.done ? "Done" : "Mark done";
  }

  if (el.socialReachList) {
    el.socialReachList.innerHTML = "";
    const entries = normalizeReachouts(rec.socialReachouts);
    rec.socialReachouts = entries;

    if (entries.length === 0) {
      const empty = document.createElement("div");
      empty.className = "emptyState";
      empty.textContent = "No reach-outs logged yet.";
      el.socialReachList.appendChild(empty);
    } else {
      for (const entry of entries.slice().reverse()) {
        const item = document.createElement("div");
        item.className = "item";

        const top = document.createElement("div");
        top.className = "item__top";
        const title = document.createElement("div");
        title.className = "item__title";
        title.textContent = entry.who ? `${entry.type}: ${entry.who}` : entry.type;

        const actions = document.createElement("div");
        actions.className = "item__actions";
        const del = document.createElement("button");
        del.className = "smallBtn";
        del.type = "button";
        del.textContent = "Delete";
        del.addEventListener("click", () => {
          rec.socialReachouts = rec.socialReachouts.filter((r) => r.id !== entry.id);
          saveState(state);
          renderSocialMomentum(isoDate);
        });
        actions.appendChild(del);

        top.appendChild(title);
        top.appendChild(actions);

        const meta = document.createElement("div");
        meta.className = "item__meta";
        const note = entry.note ? ` • ${entry.note}` : "";
        const time = entry.createdAt ? formatTime(entry.createdAt) : "";
        meta.textContent = `${time}${note}`;

        item.appendChild(top);
        item.appendChild(meta);
        el.socialReachList.appendChild(item);
      }
    }

    if (el.socialReachMeta) {
      el.socialReachMeta.textContent = `${entries.length} today`;
    }
  }
}

function renderTemptationLog(isoDate) {
  if (!el.temptationList) return;
  const rec = getDayRecord(isoDate);
  const entries = normalizeTemptations(rec.temptations);
  rec.temptations = entries;

  el.temptationList.innerHTML = "";
  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "Nothing logged yet.";
    el.temptationList.appendChild(empty);
  } else {
    for (const entry of entries.slice().reverse()) {
      const item = document.createElement("div");
      item.className = "item";

      const top = document.createElement("div");
      top.className = "item__top";
      const title = document.createElement("div");
      title.className = "item__title";
      const urge = getScaleEntry(URGE_SCALE, entry.urge);
      title.textContent = `${entry.trigger || "Temptation"} • ${urge.label}`;

      const actions = document.createElement("div");
      actions.className = "item__actions";
      const del = document.createElement("button");
      del.className = "smallBtn";
      del.type = "button";
      del.textContent = "Delete";
      del.addEventListener("click", () => {
        rec.temptations = rec.temptations.filter((t) => t.id !== entry.id);
        saveState(state);
        renderTemptationLog(isoDate);
      });
      actions.appendChild(del);

      top.appendChild(title);
      top.appendChild(actions);

      const meta = document.createElement("div");
      meta.className = "item__meta";
      const time = entry.createdAt ? formatTime(entry.createdAt) : "";
      meta.textContent = time ? `${time}` : "";

      const detail = document.createElement("div");
      detail.className = "muted";
      detail.style.marginTop = "6px";
      const want = entry.want ? `Wanted: ${entry.want}` : "";
      const did = entry.did ? `Did: ${entry.did}` : "";
      const note = entry.note ? `Note: ${entry.note}` : "";
      detail.textContent = [want, did, note].filter(Boolean).join(" • ");

      item.appendChild(top);
      if (meta.textContent) item.appendChild(meta);
      if (detail.textContent) item.appendChild(detail);
      el.temptationList.appendChild(item);
    }
  }

  if (el.temptationMeta) {
    el.temptationMeta.textContent = `${entries.length} today`;
  }
}

function renderSlipLog(isoDate) {
  if (!el.slipList) return;
  const rec = getDayRecord(isoDate);
  const entries = normalizeSlips(rec.slips);
  rec.slips = entries;

  el.slipList.innerHTML = "";
  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "No reflections logged yet.";
    el.slipList.appendChild(empty);
  } else {
    for (const entry of entries.slice().reverse()) {
      const item = document.createElement("div");
      item.className = "item";

      const top = document.createElement("div");
      top.className = "item__top";
      const title = document.createElement("div");
      title.className = "item__title";
      title.textContent = entry.what || "Reflection";

      const actions = document.createElement("div");
      actions.className = "item__actions";
      const del = document.createElement("button");
      del.className = "smallBtn";
      del.type = "button";
      del.textContent = "Delete";
      del.addEventListener("click", () => {
        rec.slips = rec.slips.filter((s) => s.id !== entry.id);
        saveState(state);
        renderSlipLog(isoDate);
      });
      actions.appendChild(del);

      top.appendChild(title);
      top.appendChild(actions);

      const meta = document.createElement("div");
      meta.className = "item__meta";
      const time = entry.createdAt ? formatTime(entry.createdAt) : "";
      meta.textContent = time ? `${time}` : "";

      const detail = document.createElement("div");
      detail.className = "muted";
      detail.style.marginTop = "6px";
      const details = [];
      if (entry.why) details.push(`Why: ${entry.why}`);
      if (entry.root) details.push(`Root: ${entry.root}`);
      if (entry.next) details.push(`Next: ${entry.next}`);
      detail.textContent = details.join(" • ");

      item.appendChild(top);
      if (meta.textContent) item.appendChild(meta);
      if (detail.textContent) item.appendChild(detail);
      el.slipList.appendChild(item);
    }
  }

  if (el.slipMeta) {
    el.slipMeta.textContent = `${entries.length} today`;
  }
}

function renderFlowTasks(isoDate) {
  const rec = getDayRecord(isoDate);
  renderCategoryFilters(el.flowCategoryFilters);
  renderFlowBlockFilters();

  const dueTasks = getDueTasksForDate(activeDate);
  const visibleTasks = getFlowVisibleTasks(activeDate);

  renderTasksList(el.flowTaskList, rec, visibleTasks);
  if (el.flowChecklistMeta) {
    if (dueTasks.length === 0) {
      el.flowChecklistMeta.textContent = "No tasks";
    } else {
      el.flowChecklistMeta.textContent = `${countDoneTasks(rec, dueTasks)} / ${dueTasks.length}`;
    }
  }

  if (el.flowShowAllBtn) {
    el.flowShowAllBtn.textContent = uiState.flowShowAll ? "Due only" : "Show all";
  }
}

function getDueTasksForDate(dateObj) {
  return state.tasks.filter((task) => isTaskScheduledForDate(task, dateObj));
}

function getMainVisibleTasks(dateObj) {
  const baseTasks = uiState.showAllTasks ? state.tasks : getDueTasksForDate(dateObj);
  return filterTasksByCategory(baseTasks);
}

function getFlowVisibleTasks(dateObj) {
  const baseTasks = uiState.flowShowAll ? state.tasks : getDueTasksForDate(dateObj);
  const inBlock = baseTasks.filter((task) => isTaskInBlock(task, uiState.flowBlockFilter));
  return filterTasksByCategory(inBlock);
}

function renderFlowBlockFilters() {
  if (!el.flowBlockFilters) return;
  el.flowBlockFilters.innerHTML = "";
  if (!FLOW_BLOCK_OPTIONS.some((option) => option.id === uiState.flowBlockFilter)) {
    uiState.flowBlockFilter = "now";
  }
  for (const option of FLOW_BLOCK_OPTIONS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chipBtn";
    if (uiState.flowBlockFilter === option.id) btn.classList.add("is-active");
    btn.textContent = option.label;
    btn.addEventListener("click", () => {
      uiState.flowBlockFilter = option.id;
      saveUiState(uiState);
      render();
    });
    el.flowBlockFilters.appendChild(btn);
  }
}

function computeDayCompletionPct(isoDate) {
  const rec = state.days[isoDate];
  if (!rec) return 0;
  const dueTasks = getDueTasksForDate(parseISODate(isoDate));
  let done = 0;
  for (const t of dueTasks) {
    if (rec.tasks?.[t.id] === true) done += 1;
  }
  if (dueTasks.length === 0) return 100;
  return Math.round((done / dueTasks.length) * 100);
}

function computeDayPoints(isoDate) {
  const rec = state.days[isoDate];
  if (!rec) return { done: 0, total: 0, scorePct: 0 };
  const dueTasks = getDueTasksForDate(parseISODate(isoDate));
  let done = 0;
  let total = 0;
  for (const t of dueTasks) {
    const weight = normalizeWeight(t.weight);
    total += weight;
    if (rec.tasks?.[t.id] === true) done += weight;
  }
  const scorePct = total === 0 ? 100 : Math.round((done / total) * 100);
  return { done, total, scorePct };
}

function renderGoals() {
  const studyTarget = safeNumber(state.goals?.studyDaily);
  const earningsTarget = safeNumber(state.goals?.earningsDaily);
  const sleepTarget = safeNumber(state.goals?.sleepDaily);

  if (el.goalStudyInput && document.activeElement !== el.goalStudyInput) {
    el.goalStudyInput.value = studyTarget ? formatNumber(studyTarget) : "";
  }
  if (el.goalEarningsInput && document.activeElement !== el.goalEarningsInput) {
    el.goalEarningsInput.value = earningsTarget ? formatNumber(earningsTarget) : "";
  }
  if (el.goalSleepInput && document.activeElement !== el.goalSleepInput) {
    el.goalSleepInput.value = sleepTarget ? formatNumber(sleepTarget) : "";
  }

  if (el.studyTargetHint) el.studyTargetHint.textContent = studyTarget ? formatNumber(studyTarget) : "0";
  if (el.earningsTargetHint) el.earningsTargetHint.textContent = currency(earningsTarget);
}

function renderMantra() {
  const mantra = typeof state.mantra === "string" ? state.mantra.trim() : "";
  if (el.mantraInput && document.activeElement !== el.mantraInput) {
    el.mantraInput.value = mantra;
  }
  if (el.mantraDisplay) {
    el.mantraDisplay.textContent = mantra;
    el.mantraDisplay.style.display = mantra ? "block" : "none";
  }
}

function renderVision() {
  if (!el.vision1Input || !el.vision5Input) return;
  const oneYear = typeof state.vision?.oneYear === "string" ? state.vision.oneYear : "";
  const fiveYear = typeof state.vision?.fiveYear === "string" ? state.vision.fiveYear : "";
  if (document.activeElement !== el.vision1Input) el.vision1Input.value = oneYear;
  if (document.activeElement !== el.vision5Input) el.vision5Input.value = fiveYear;
}

function renderQuarterlyGoals() {
  if (!el.quarterYearInput) return;
  const label = typeof state.quarterlyGoals?.label === "string" ? state.quarterlyGoals.label : "";
  const goals = Array.isArray(state.quarterlyGoals?.goals)
    ? state.quarterlyGoals.goals.slice(0, 4)
    : ["", "", "", ""];
  while (goals.length < 4) goals.push("");

  if (document.activeElement !== el.quarterYearInput) el.quarterYearInput.value = label;
  if (el.quarterQ1 && document.activeElement !== el.quarterQ1) el.quarterQ1.value = goals[0] ?? "";
  if (el.quarterQ2 && document.activeElement !== el.quarterQ2) el.quarterQ2.value = goals[1] ?? "";
  if (el.quarterQ3 && document.activeElement !== el.quarterQ3) el.quarterQ3.value = goals[2] ?? "";
  if (el.quarterQ4 && document.activeElement !== el.quarterQ4) el.quarterQ4.value = goals[3] ?? "";
}

function renderProjects() {
  if (!el.projectList) {
    renderProjectShowcase();
    return;
  }
  el.projectList.innerHTML = "";

  const projects = Array.isArray(state.projects) ? state.projects : [];
  if (projects.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "No projects yet. Add your first milestone above.";
    el.projectList.appendChild(empty);
    renderProjectShowcase();
    return;
  }

  for (const project of projects) {
    const card = document.createElement("div");
    card.className = "projectCard";

    const head = document.createElement("div");
    head.className = "projectHead";

    const title = document.createElement("div");
    title.className = "projectTitle";
    title.textContent = project.title;

    const meta = document.createElement("div");
    meta.className = "projectMeta";
    const total = project.milestones?.length ?? 0;
    const done = project.milestones?.filter((m) => m.done).length ?? 0;
    meta.textContent = total ? `${done}/${total} milestones` : "No milestones yet";

    const actions = document.createElement("div");
    actions.className = "item__actions";
    const delBtn = document.createElement("button");
    delBtn.className = "smallBtn";
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      const ok = confirm(`Delete project “${project.title}”?`);
      if (!ok) return;
      state.projects = state.projects.filter((p) => p.id !== project.id);
      saveState(state);
      renderProjects();
    });
    actions.appendChild(delBtn);

    const left = document.createElement("div");
    left.appendChild(title);
    left.appendChild(meta);

    head.appendChild(left);
    head.appendChild(actions);

    card.appendChild(head);

    const list = document.createElement("div");
    list.className = "milestoneList";

    if (!project.milestones || project.milestones.length === 0) {
      const empty = document.createElement("div");
      empty.className = "emptyState";
      empty.textContent = "Add a milestone to keep this moving.";
      list.appendChild(empty);
    } else {
      for (const milestone of project.milestones) {
        const row = document.createElement("div");
        row.className = "milestoneRow";

        const check = document.createElement("input");
        check.type = "checkbox";
        check.className = "task__check";
        check.checked = Boolean(milestone.done);
        check.addEventListener("change", () => {
          milestone.done = check.checked;
          saveState(state);
          renderProjects();
        });

        const main = document.createElement("div");
        const titleEl = document.createElement("div");
        titleEl.className = "milestoneTitle";
        titleEl.textContent = milestone.title;
        const metaEl = document.createElement("div");
        metaEl.className = "milestoneMeta";
        metaEl.textContent = milestone.dueDate ? `Due ${milestone.dueDate}` : "No due date";
        main.appendChild(titleEl);
        main.appendChild(metaEl);

        const actions = document.createElement("div");
        actions.className = "item__actions";
        const del = document.createElement("button");
        del.className = "smallBtn";
        del.type = "button";
        del.textContent = "Remove";
        del.addEventListener("click", () => {
          project.milestones = project.milestones.filter((m) => m.id !== milestone.id);
          saveState(state);
          renderProjects();
        });
        actions.appendChild(del);

        row.appendChild(check);
        row.appendChild(main);
        row.appendChild(actions);
        list.appendChild(row);
      }
    }

    card.appendChild(list);
    el.projectList.appendChild(card);
  }

  renderProjectShowcase();
}

function renderProjectShowcase() {
  const hasList = Boolean(el.projectShowcaseList);
  const hasMeta = Boolean(el.projectShowcaseMeta);
  if (!hasList && !hasMeta) return;

  const projects = Array.isArray(state.projects) ? state.projects : [];
  const milestones = [];
  let totalMilestones = 0;
  for (const project of projects) {
    const list = Array.isArray(project.milestones) ? project.milestones : [];
    totalMilestones += list.length;
    for (const milestone of list) {
      if (!milestone.done) continue;
      const dueTs = milestone.dueDate ? Date.parse(milestone.dueDate) : 0;
      milestones.push({
        id: milestone.id,
        title: milestone.title,
        dueDate: milestone.dueDate,
        createdAt: safeNumber(milestone.createdAt ?? 0),
        sortKey: dueTs || safeNumber(milestone.createdAt ?? 0),
        projectTitle: project.title,
      });
    }
  }

  const completedCount = milestones.length;
  if (hasMeta) {
    const projectCount = projects.length;
    const base = `${completedCount} completed milestones`;
    const suffix = projectCount ? ` • ${projectCount} projects` : "";
    const totalSuffix = totalMilestones ? ` • ${totalMilestones} total milestones` : "";
    el.projectShowcaseMeta.textContent = `${base}${suffix}${totalSuffix}`;
  }

  if (!hasList) return;
  el.projectShowcaseList.innerHTML = "";

  if (completedCount === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "Complete a milestone to showcase it here.";
    el.projectShowcaseList.appendChild(empty);
    return;
  }

  milestones.sort((a, b) => b.sortKey - a.sortKey);
  for (const milestone of milestones.slice(0, 8)) {
    const item = document.createElement("div");
    item.className = "item";

    const top = document.createElement("div");
    top.className = "item__top";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = milestone.title;

    const actions = document.createElement("div");
    actions.className = "item__actions";
    const badge = document.createElement("span");
    badge.className = "pill";
    badge.textContent = "Done";
    actions.appendChild(badge);

    top.appendChild(title);
    top.appendChild(actions);

    const meta = document.createElement("div");
    meta.className = "item__meta";
    const due = milestone.dueDate ? ` • Due ${milestone.dueDate}` : "";
    meta.textContent = `${milestone.projectTitle}${due}`;

    item.appendChild(top);
    item.appendChild(meta);
    el.projectShowcaseList.appendChild(item);
  }
}

function renderDailyScorecard() {
  if (!el.dailyCompletion) return;
  const iso = toISODate(activeDate);
  const rec = getDayRecord(iso);
  const completion = computeDayCompletionPct(iso);
  const points = computeDayPoints(iso);
  const streak = computeStreakFrom(activeDate);

  el.dailyCompletion.textContent = `${completion}%`;
  if (el.dailyScore) el.dailyScore.textContent = `${points.scorePct}%`;
  if (el.dailyPoints) el.dailyPoints.textContent = `${points.done} / ${points.total} pts`;
  el.dailyStudy.textContent = formatNumber(rec.studyHours);
  el.dailyEarnings.textContent = currency(rec.earnings);
  el.dailyStreak.textContent = String(streak);

  const studyTarget = safeNumber(state.goals?.studyDaily);
  const earningsTarget = safeNumber(state.goals?.earningsDaily);
  el.dailyStudyTarget.textContent = studyTarget
    ? `${formatNumber(rec.studyHours)} / ${formatNumber(studyTarget)}h`
    : `${formatNumber(rec.studyHours)} / —`;
  el.dailyEarningsTarget.textContent = earningsTarget
    ? `${currency(rec.earnings)} / ${currency(earningsTarget)}`
    : `${currency(rec.earnings)} / —`;

  const studyPct = studyTarget > 0 ? clamp((safeNumber(rec.studyHours) / studyTarget) * 100, 0, 100) : 0;
  const earningsPct = earningsTarget > 0 ? clamp((safeNumber(rec.earnings) / earningsTarget) * 100, 0, 100) : 0;
  el.dailyStudyBar.style.width = `${studyPct}%`;
  el.dailyEarningsBar.style.width = `${earningsPct}%`;
}

function getScaleEntry(scale, value) {
  const v = clamp(Math.round(safeNumber(value)), 0, 5);
  return scale.find((item) => item.value === v) ?? scale[0];
}

function renderMoodEnergy(moodValue, energyValue) {
  const mood = getScaleEntry(MOOD_SCALE, moodValue);
  const energy = getScaleEntry(ENERGY_SCALE, energyValue);
  if (el.moodEmoji) el.moodEmoji.textContent = mood.emoji;
  if (el.moodLabel) el.moodLabel.textContent = mood.label;
  if (el.energyEmoji) el.energyEmoji.textContent = energy.emoji;
  if (el.energyLabel) el.energyLabel.textContent = energy.label;
}

function renderUrgeScale(value) {
  const urge = getScaleEntry(URGE_SCALE, value);
  if (el.temptationEmoji) el.temptationEmoji.textContent = urge.emoji;
  if (el.temptationLabel) el.temptationLabel.textContent = urge.label;
}

function renderCheckin(isoDate) {
  const rec = getDayRecord(isoDate);
  const moodValue = clamp(safeNumber(rec.checkin.mood), 0, 5);
  const energyValue = clamp(safeNumber(rec.checkin.energy), 0, 5);
  if (el.moodInput && document.activeElement !== el.moodInput) el.moodInput.value = String(moodValue);
  if (el.energyInput && document.activeElement !== el.energyInput) el.energyInput.value = String(energyValue);
  renderMoodEnergy(moodValue, energyValue);
  if (el.sleepInput && document.activeElement !== el.sleepInput) {
    el.sleepInput.value = rec.checkin.sleep ? String(rec.checkin.sleep) : "";
  }

  const sleepTarget = safeNumber(state.goals?.sleepDaily);
  const sleepScore = computeSleepScore(rec.checkin.sleep, sleepTarget);
  if (el.sleepScoreValue) el.sleepScoreValue.textContent = `${sleepScore.score}%`;
  if (el.sleepScoreLabel) {
    el.sleepScoreLabel.textContent = sleepTarget
      ? `${sleepScore.label} • Target ${formatNumber(sleepTarget)}h`
      : "Set sleep target";
  }
}

function renderFocusLane(isoDate) {
  if (!el.focusLaneCard) return;
  const rec = getDayRecord(isoDate);
  const block = getCurrentTimeBlock(new Date());
  const blockLabel = formatTimeBlock(block);
  const windowLabel = formatTimeBlockWindow(block);

  if (el.focusLaneBlock) {
    el.focusLaneBlock.textContent = windowLabel ? `${blockLabel} • ${windowLabel}` : blockLabel;
  }
  if (el.focusLaneMit) {
    const mit = rec.mit?.text?.trim() ?? "";
    el.focusLaneMit.textContent = mit || "Not set";
  }
  if (el.focusLaneIntention) {
    const intention = rec.intention?.trim() ?? "";
    el.focusLaneIntention.textContent = intention || "—";
  }
  if (el.focusLaneTasks) {
    const blockTasks = getDueTasksForBlock(activeDate, block);
    const done = countDoneTasks(rec, blockTasks);
    el.focusLaneTasks.textContent = blockTasks.length ? `${done} / ${blockTasks.length}` : "No tasks";
  }
}

function renderReflection(isoDate) {
  const rec = getDayRecord(isoDate);
  if (el.intentionInput && document.activeElement !== el.intentionInput) {
    el.intentionInput.value = rec.intention ?? "";
  }
  if (el.lessonInput && document.activeElement !== el.lessonInput) {
    el.lessonInput.value = rec.lessonLearned ?? "";
  }
  if (el.gratitude1 && document.activeElement !== el.gratitude1) {
    el.gratitude1.value = rec.gratitude?.[0] ?? "";
  }
  if (el.gratitude2 && document.activeElement !== el.gratitude2) {
    el.gratitude2.value = rec.gratitude?.[1] ?? "";
  }
  if (el.gratitude3 && document.activeElement !== el.gratitude3) {
    el.gratitude3.value = rec.gratitude?.[2] ?? "";
  }
}

function computeFocusWeekTotal(anchorDate) {
  const { start, end } = rangeFor(anchorDate, "week");
  const days = iterDatesInclusive(start, end);
  let total = 0;
  for (const d of days) {
    const iso = toISODate(d);
    const rec = state.days[iso];
    if (!rec?.focusSessions) continue;
    for (const session of rec.focusSessions) {
      total += safeNumber(session.minutes ?? 0);
    }
  }
  return total;
}

function renderFocusList(listEl, rec, isoDate) {
  if (!listEl) return;
  listEl.innerHTML = "";
  if (rec.focusSessions.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "No focus sessions yet.";
    listEl.appendChild(empty);
    return;
  }

  let needsSave = false;
  for (const session of rec.focusSessions.slice().reverse()) {
    if (!session.id) {
      session.id = crypto.randomUUID();
      needsSave = true;
    }
    const item = document.createElement("div");
    item.className = "item";

    const top = document.createElement("div");
    top.className = "item__top";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = session.label || "Focus session";

    const actions = document.createElement("div");
    actions.className = "item__actions";
    const del = document.createElement("button");
    del.className = "smallBtn";
    del.type = "button";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      rec.focusSessions = rec.focusSessions.filter((s) => s.id !== session.id);
      saveState(state);
      renderFocus(isoDate);
      scheduleProgressRefresh();
      renderAchievements();
    });
    actions.appendChild(del);

    top.appendChild(title);
    top.appendChild(actions);

    const meta = document.createElement("div");
    meta.className = "item__meta";
    const start = formatTime(session.start);
    const end = formatTime(session.end);
    const timeRange = start && end ? `${start}-${end}` : "";
    const durationLabel = formatMinutes(session.minutes ?? 0);
    meta.textContent = timeRange ? `${durationLabel} • ${timeRange}` : durationLabel;

    item.appendChild(top);
    item.appendChild(meta);
    listEl.appendChild(item);
  }
  if (needsSave) saveState(state);
}

function renderFocus(isoDate) {
  const rec = getDayRecord(isoDate);
  const elapsed = focusTimer.running ? formatDuration(Date.now() - focusTimer.startTs) : "00:00";
  const label = focusTimer.label ? `: ${focusTimer.label}` : "";
  const statusText = focusTimer.running ? `Focusing${label}` : "Idle";

  if (el.focusTime) el.focusTime.textContent = elapsed;
  if (el.flowFocusTime) el.flowFocusTime.textContent = elapsed;

  if (el.focusStatus) el.focusStatus.textContent = statusText;
  if (el.flowFocusStatus) el.flowFocusStatus.textContent = statusText;

  if (el.focusStartBtn) el.focusStartBtn.disabled = focusTimer.running;
  if (el.focusStopBtn) el.focusStopBtn.disabled = !focusTimer.running;
  if (el.flowFocusStartBtn) el.flowFocusStartBtn.disabled = focusTimer.running;
  if (el.flowFocusStopBtn) el.flowFocusStopBtn.disabled = !focusTimer.running;

  renderFocusList(el.focusList, rec, isoDate);
  renderFocusList(el.flowFocusList, rec, isoDate);

  const total = computeFocusWeekTotal(activeDate);
  if (el.focusWeekTotal) el.focusWeekTotal.textContent = `${formatMinutes(total)} this week`;
  if (el.flowFocusMeta) el.flowFocusMeta.textContent = `${formatMinutes(total)} this week`;

  renderFlowReview(isoDate);
  renderFlowHeader(isoDate);
}

function getWeekKey(d) {
  return toISODate(startOfWeek(d));
}

function getWeekRecord(d) {
  const key = getWeekKey(d);
  if (!state.weeks || typeof state.weeks !== "object") state.weeks = {};
  if (!state.weeks[key] || typeof state.weeks[key] !== "object") {
    state.weeks[key] = { priorities: ["", "", ""] };
  }
  const rec = state.weeks[key];
  if (!Array.isArray(rec.priorities)) rec.priorities = ["", "", ""];
  rec.priorities = [rec.priorities[0] ?? "", rec.priorities[1] ?? "", rec.priorities[2] ?? ""];
  if (rec.review && typeof rec.review === "object") {
    rec.review.wins = Array.isArray(rec.review.wins) ? rec.review.wins : [];
    rec.review.misses = Array.isArray(rec.review.misses) ? rec.review.misses : [];
    rec.review.focus = Array.isArray(rec.review.focus) ? rec.review.focus : [];
    rec.review.updatedAt = safeNumber(rec.review.updatedAt ?? 0);
  } else if (rec.review) {
    rec.review = null;
  }
  return rec;
}

function renderWeeklyPriorities() {
  if (!el.weekLabel) return;
  const weekStart = startOfWeek(activeDate);
  el.weekLabel.textContent = `Week of ${formatShortDate(weekStart)}`;

  const rec = getWeekRecord(activeDate);
  if (el.priority1) el.priority1.value = rec.priorities[0] ?? "";
  if (el.priority2) el.priority2.value = rec.priorities[1] ?? "";
  if (el.priority3) el.priority3.value = rec.priorities[2] ?? "";
}

function computeWeeklyReview(anchorDate) {
  const { start, end } = rangeFor(anchorDate, "week");
  const today = todayLocalDate();
  const endBound = end < today ? end : today;
  const days = iterDatesInclusive(start, endBound);

  const stats = state.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    task,
    done: 0,
    total: 0,
  }));

  for (const d of days) {
    const iso = toISODate(d);
    const rec = state.days[iso];
    for (const stat of stats) {
      if (!isTaskScheduledForDate(stat.task, d)) continue;
      stat.total += 1;
      if (rec?.tasks?.[stat.id] === true) stat.done += 1;
    }
  }

  for (const stat of stats) {
    stat.pct = stat.total === 0 ? 0 : Math.round((stat.done / stat.total) * 100);
  }

  const wins = stats.filter((stat) => stat.total > 0 && stat.pct >= 80).sort((a, b) => b.pct - a.pct);
  const misses = stats.filter((stat) => stat.total > 0 && stat.pct <= 40).sort((a, b) => a.pct - b.pct);
  const focus = stats
    .filter((stat) => stat.total > 0)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);

  return { start, wins, misses, focus };
}

function renderWeeklyReview() {
  if (!el.weeklyReviewLabel || !el.weeklyWins || !el.weeklyMisses || !el.weeklyFocus) return;
  const weekRec = getWeekRecord(activeDate);
  let items = null;
  let label = `Week of ${formatShortDate(startOfWeek(activeDate))}`;

  if (weekRec.review && (weekRec.review.wins.length || weekRec.review.misses.length || weekRec.review.focus.length)) {
    items = weekRec.review;
    if (weekRec.review.updatedAt) {
      label = `${label} (saved ${formatShortDate(new Date(weekRec.review.updatedAt))})`;
    }
  } else {
    const review = computeWeeklyReview(activeDate);
    items = buildReviewItems(review);
    label = `Week of ${formatShortDate(review.start)}`;
  }

  el.weeklyReviewLabel.textContent = label;
  renderReviewList(el.weeklyWins, items.wins, "No wins yet.");
  renderReviewList(el.weeklyMisses, items.misses, "Nothing flagged.");
  renderReviewList(el.weeklyFocus, items.focus, "Pick 1-3 habits to push.");
}

function renderLeaderboard() {
  if (!el.leaderboardList || !el.leaderboardRange) return;
  el.leaderboardList.innerHTML = "";

  const { start, end } = rangeFor(activeDate, activeRange);
  const prevRange = previousRangeWindow(start, end);
  const current = computeSummaryForWindow(start, end);
  const previous = computeSummaryForWindow(prevRange.start, prevRange.end);

  const rangeLabel = activeRange === "week"
    ? "This week vs last week"
    : activeRange === "month"
      ? "This month vs last month"
      : "This year vs last year";
  el.leaderboardRange.textContent = rangeLabel;

  const metrics = [
    { label: "Completion", get: (s) => s.completionPct, suffix: "%" },
    { label: "Score", get: (s) => s.scorePct, suffix: "%" },
    { label: "Study hours", get: (s) => s.study, format: formatNumber },
    { label: "Earnings", get: (s) => s.earnings, format: currency },
    { label: "Focus minutes", get: (s) => s.focusMinutes, format: (v) => formatMinutes(v) },
    { label: "Deep work ratio", get: (s) => s.deepWorkPct, suffix: "%" },
    { label: "Anti-habits clean", get: (s) => s.antiCleanPct, suffix: "%" },
    { label: "XP earned", get: (s) => s.xpTotal, format: formatXp },
  ];

  const formatMetric = (metric, value) => {
    if (metric.format) return metric.format(value);
    if (metric.suffix) return `${Math.round(value)}${metric.suffix}`;
    return formatNumber(value);
  };

  const rows = metrics.map((metric) => {
    const value = safeNumber(metric.get(current));
    const prev = safeNumber(metric.get(previous));
    const delta = value - prev;
    return {
      label: metric.label,
      value,
      prev,
      delta,
      deltaAbs: Math.abs(delta),
      valueLabel: formatMetric(metric, value),
      prevLabel: formatMetric(metric, prev),
      deltaLabel: delta === 0 ? "0" : `${delta > 0 ? "+" : "-"}${formatMetric(metric, Math.abs(delta))}`,
    };
  }).filter((row) => row.value !== 0 || row.prev !== 0);

  if (rows.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "Not enough data yet. Log a few days to compare.";
    el.leaderboardList.appendChild(empty);
    return;
  }

  rows.sort((a, b) => b.deltaAbs - a.deltaAbs);

  for (const row of rows.slice(0, 6)) {
    const item = document.createElement("div");
    item.className = "leaderboardRow";

    const left = document.createElement("div");
    const label = document.createElement("div");
    label.className = "leaderboardLabel";
    label.textContent = row.label;

    const meta = document.createElement("div");
    meta.className = "leaderboardMeta";
    meta.textContent = `Now ${row.valueLabel} • Prev ${row.prevLabel}`;

    left.appendChild(label);
    left.appendChild(meta);

    const delta = document.createElement("div");
    delta.className = "leaderboardDelta";
    if (row.delta > 0) delta.classList.add("is-up");
    else if (row.delta < 0) delta.classList.add("is-down");
    else delta.classList.add("is-flat");
    delta.textContent = row.deltaLabel;

    item.appendChild(left);
    item.appendChild(delta);
    el.leaderboardList.appendChild(item);
  }
}

function renderReviewList(container, items, emptyLabel) {
  container.innerHTML = "";
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = emptyLabel;
    container.appendChild(empty);
    return;
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "reviewItem";
    row.textContent = item;
    container.appendChild(row);
  }
}

function buildReviewItems(review) {
  const formatItem = (stat) => `${stat.title} (${stat.pct}%)`;
  return {
    wins: review.wins.map(formatItem),
    misses: review.misses.map(formatItem),
    focus: review.focus.map(formatItem),
  };
}

function computeNotesFilled(rec) {
  const notes = [rec.notes?.wins, rec.notes?.lessons, rec.notes?.tomorrow];
  const reflection = [rec.intention, rec.lessonLearned];
  const gratitudeFilled = Array.isArray(rec.gratitude) && rec.gratitude.some((v) => typeof v === "string" && v.trim());
  const filled = [
    ...notes,
    ...reflection,
    gratitudeFilled ? "yes" : "",
  ].filter((v) => typeof v === "string" && v.trim()).length;
  return filled;
}

function computeFocusMinutesForDay(rec) {
  if (!Array.isArray(rec.focusSessions)) return 0;
  return rec.focusSessions.reduce((sum, session) => sum + safeNumber(session.minutes ?? 0), 0);
}

function computeDeepWorkRatio(rec) {
  const focusMinutes = computeFocusMinutesForDay(rec);
  const studyMinutes = safeNumber(rec.studyHours) * 60;
  if (studyMinutes <= 0) return 0;
  return clamp(Math.round((focusMinutes / studyMinutes) * 100), 0, 100);
}

function computeSleepScore(sleepHours, targetHours) {
  const sleep = safeNumber(sleepHours);
  const target = safeNumber(targetHours);
  if (target <= 0) return { score: 0, label: "Set target" };
  if (sleep <= 0) return { score: 0, label: "Log sleep" };
  const diff = Math.abs(sleep - target);
  const score = clamp(Math.round(100 - diff * 20), 0, 100);
  const label = diff <= 0.5 ? "On target" : sleep < target ? "Below target" : "Above target";
  return { score, label };
}

const XP_FORMATTER = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

function formatXp(value) {
  return XP_FORMATTER.format(Math.max(0, Math.round(safeNumber(value))));
}

function computeCompletionForTasks(rec, dueTasks) {
  if (!rec || !dueTasks.length) return { done: 0, total: dueTasks.length, pct: 0 };
  let done = 0;
  for (const task of dueTasks) {
    if (rec.tasks?.[task.id] === true) done += 1;
  }
  const pct = dueTasks.length ? Math.round((done / dueTasks.length) * 100) : 0;
  return { done, total: dueTasks.length, pct };
}

function computeScoreForTasks(rec, dueTasks) {
  if (!rec || !dueTasks.length) return { done: 0, total: 0, pct: 0 };
  let done = 0;
  let total = 0;
  for (const task of dueTasks) {
    const weight = normalizeWeight(task.weight);
    total += weight;
    if (rec.tasks?.[task.id] === true) done += weight;
  }
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

function computeAntiHabitPct(rec) {
  const habits = Array.isArray(state.antiHabits) ? state.antiHabits : [];
  if (!rec || habits.length === 0) return { clean: 0, total: habits.length, pct: 0 };
  let clean = 0;
  for (const habit of habits) {
    if (rec.antiHabits?.[habit.id] === true) clean += 1;
  }
  const total = habits.length;
  const pct = total > 0 ? Math.round((clean / total) * 100) : 0;
  return { clean, total, pct };
}

function pushXpSource(sources, label, value) {
  const xp = Math.max(0, Math.round(safeNumber(value)));
  if (xp <= 0) return 0;
  sources.push({ label, xp });
  return xp;
}

function computeDayXpBreakdown(_dateObj, rec, dueTasks) {
  if (!rec) return { total: 0, sources: [] };
  const sources = [];

  const completion = computeCompletionForTasks(rec, dueTasks);
  const score = computeScoreForTasks(rec, dueTasks);
  const deepWorkPct = computeDeepWorkRatio(rec);
  const focusMinutesRaw = computeFocusMinutesForDay(rec);
  const focusMinutes = Math.min(focusMinutesRaw, XP_CONFIG.focusCapMinutes);
  const studyHoursRaw = safeNumber(rec.studyHours);
  const studyHours = Math.min(studyHoursRaw, XP_CONFIG.studyCapHours);
  const anti = computeAntiHabitPct(rec);
  const sleepTarget = safeNumber(state.goals?.sleepDaily);
  const sleepScore = computeSleepScore(rec.checkin?.sleep, sleepTarget);
  const notesFilledRaw = computeNotesFilled(rec);
  const notesFilled = Math.min(notesFilledRaw, XP_CONFIG.notesCap);
  const reachoutsRaw = Array.isArray(rec.socialReachouts) ? rec.socialReachouts.length : 0;
  const reachouts = Math.min(reachoutsRaw, XP_CONFIG.reachoutCap);
  const socialChallengeDone = Boolean(rec.socialChallenge?.done);

  pushXpSource(sources, "Completion", completion.pct * XP_CONFIG.completionPerPct);
  pushXpSource(sources, "Score quality", score.pct * XP_CONFIG.scorePerPct);
  pushXpSource(sources, "Deep work", deepWorkPct * XP_CONFIG.deepWorkPerPct);
  pushXpSource(sources, "Focus minutes", focusMinutes * XP_CONFIG.focusPerMinute);
  pushXpSource(sources, "Study hours", studyHours * XP_CONFIG.studyPerHour);
  pushXpSource(sources, "Anti-habits", anti.pct * XP_CONFIG.antiPerPct);
  pushXpSource(sources, "Sleep score", sleepScore.score * XP_CONFIG.sleepPerPct);
  pushXpSource(sources, "Notes & reflection", notesFilled * XP_CONFIG.notesPerItem);
  pushXpSource(sources, "Reach-outs", reachouts * XP_CONFIG.reachoutPerItem);
  if (socialChallengeDone) pushXpSource(sources, "Social challenge", XP_CONFIG.socialChallenge);
  if (safeNumber(rec.dayClosedAt) > 0) pushXpSource(sources, "End day review", XP_CONFIG.dayClosedBonus);

  const perfectDay = dueTasks.length > 0 && completion.done === dueTasks.length;
  if (perfectDay) pushXpSource(sources, "Perfect day bonus", XP_CONFIG.perfectDayBonus);

  const total = sources.reduce((sum, source) => sum + source.xp, 0);
  return { total, sources };
}

function mergeXpSources(targetMap, sources) {
  for (const source of sources) {
    const prev = targetMap.get(source.label) ?? 0;
    targetMap.set(source.label, prev + source.xp);
  }
}

function computeLevelInfo(totalXp) {
  let remaining = Math.max(0, Math.round(safeNumber(totalXp)));
  let spent = 0;
  let level = 1;
  let nextXp = LEVEL_CONFIG.startXp;

  while (remaining >= nextXp) {
    remaining -= nextXp;
    spent += nextXp;
    level += 1;
    nextXp = Math.round(nextXp * LEVEL_CONFIG.growth + LEVEL_CONFIG.bonusPerLevel);
  }

  const progressPct = nextXp > 0 ? clamp((remaining / nextXp) * 100, 0, 100) : 0;
  return {
    level,
    totalXp: spent + remaining,
    currentXp: remaining,
    nextXp,
    progressPct,
    remainingToNext: Math.max(0, nextXp - remaining),
  };
}

function computeAllTimeXp() {
  const entries = Object.entries(state.days);
  if (entries.length === 0) {
    const levelInfo = computeLevelInfo(0);
    return { ...levelInfo };
  }

  let totalXp = 0;
  for (const [iso, recRaw] of entries) {
    if (!isIsoDate(iso) || !recRaw) continue;
    const dateObj = parseISODate(iso);
    const rec = normalizeDayRecord(recRaw, state.tasks, state.antiHabits);
    const dueTasks = getDueTasksForDate(dateObj);
    totalXp += computeDayXpBreakdown(dateObj, rec, dueTasks).total;
  }

  return computeLevelInfo(totalXp);
}

function rangeLabel(range) {
  return range === "week" ? "This week" : range === "month" ? "This month" : "This year";
}

function renderFlowHeader(iso) {
  if (!el.flowPanel) return;
  if (el.flowDateLabel) el.flowDateLabel.textContent = formatPrettyDate(activeDate);

  const rec = getDayRecord(iso);
  const dueTasks = getDueTasksForDate(activeDate);
  const tasksDone = countDoneTasks(rec, dueTasks);
  const checklistDone = dueTasks.length === 0 ? true : tasksDone === dueTasks.length;
  const focusDone = rec.focusSessions.length > 0 || (focusTimer.running && iso === toISODate(todayLocalDate()));
  const notesDone = computeNotesFilled(rec) > 0;
  const reviewDone = safeNumber(rec.dayClosedAt) > 0;

  const stepsTotal = 4;
  const stepsDone = [checklistDone, focusDone, notesDone, reviewDone].filter(Boolean).length;
  const pct = stepsTotal === 0 ? 0 : Math.round((stepsDone / stepsTotal) * 100);

  if (el.flowProgressLabel) el.flowProgressLabel.textContent = `${stepsDone}/${stepsTotal} steps`;
  if (el.flowProgressBar) el.flowProgressBar.style.width = `${pct}%`;
}

function renderFlowReview(iso) {
  if (!el.flowReviewSummary) return;
  const rec = getDayRecord(iso);
  const completion = computeDayCompletionPct(iso);
  const points = computeDayPoints(iso);
  const dueTasks = getDueTasksForDate(activeDate);
  const tasksDone = countDoneTasks(rec, dueTasks);
  const focusMinutes = computeFocusMinutesForDay(rec);
  const notesFilled = computeNotesFilled(rec);
  const notesTotal = 6;
  const deepWorkPct = computeDeepWorkRatio(rec);
  const mitText = rec.mit?.text?.trim() ?? "";
  const mitDone = Boolean(rec.mit?.done) && Boolean(mitText);
  const antiHabits = Array.isArray(state.antiHabits) ? state.antiHabits : [];
  const antiClean = antiHabits.reduce((sum, habit) => sum + (rec.antiHabits?.[habit.id] ? 1 : 0), 0);

  const completionMeta = dueTasks.length ? `${tasksDone}/${dueTasks.length}` : "No tasks";

  const stats = [
    {
      label: "MIT",
      value: mitText ? (mitDone ? "Done" : "Set") : "Empty",
      meta: mitText || "Not set",
    },
    { label: "Completion", value: `${completion}%`, meta: completionMeta },
    { label: "Score", value: `${points.scorePct}%`, meta: `${points.done}/${points.total} pts` },
    { label: "Focus", value: formatMinutes(focusMinutes), meta: "today" },
    { label: "Deep work", value: `${deepWorkPct}%`, meta: "focus / study" },
    { label: "Notes", value: `${notesFilled}/${notesTotal}`, meta: "sections" },
    antiHabits.length ? { label: "Anti-habits", value: `${antiClean}/${antiHabits.length}`, meta: "clean today" } : null,
    { label: "Study", value: formatNumber(rec.studyHours), meta: "hours" },
    { label: "Earnings", value: currency(rec.earnings), meta: "today" },
  ].filter(Boolean);

  el.flowReviewSummary.innerHTML = "";
  for (const stat of stats) {
    const kpi = document.createElement("div");
    kpi.className = "kpi";
    const label = document.createElement("div");
    label.className = "kpi__label";
    label.textContent = stat.label;
    const value = document.createElement("div");
    value.className = "kpi__value";
    value.textContent = stat.value;
    const meta = document.createElement("div");
    meta.className = "kpi__meta";
    meta.textContent = stat.meta;
    kpi.appendChild(label);
    kpi.appendChild(value);
    kpi.appendChild(meta);
    el.flowReviewSummary.appendChild(kpi);
  }

  const endedAt = safeNumber(rec.dayClosedAt);
  if (el.flowEndDayBtn) {
    el.flowEndDayBtn.textContent = endedAt ? "Update Review" : "End Day";
  }
  if (el.flowEndDayStatus) {
    el.flowEndDayStatus.textContent = endedAt ? `Ended at ${formatTime(endedAt)}` : "Not ended yet.";
  }
}

function renderFlow(iso) {
  renderFlowHeader(iso);
  renderFlowTasks(iso);
  renderFlowNotes(iso);
  renderFlowReview(iso);
}

function updateFocusDisplay() {
  const elapsed = focusTimer.running ? formatDuration(Date.now() - focusTimer.startTs) : "00:00";
  if (el.focusTime) el.focusTime.textContent = elapsed;
  if (el.flowFocusTime) el.flowFocusTime.textContent = elapsed;
}

function startFocusTimer(labelOverride) {
  if (focusTimer.running) return;
  focusTimer.running = true;
  focusTimer.startTs = Date.now();
  focusTimer.label = (labelOverride ?? el.focusLabel?.value ?? el.flowFocusLabel?.value ?? "").trim();
  if (focusTimer.interval) window.clearInterval(focusTimer.interval);
  focusTimer.interval = window.setInterval(updateFocusDisplay, 1000);
  updateFocusDisplay();
  renderFocus(toISODate(activeDate));
  renderFlowHeader(toISODate(activeDate));
}

function stopFocusTimer() {
  if (!focusTimer.running) return;
  const end = Date.now();
  const durationMs = end - focusTimer.startTs;
  const minutes = Math.max(1, Math.round(durationMs / 60000));
  const label = focusTimer.label;
  focusTimer.running = false;
  if (focusTimer.interval) window.clearInterval(focusTimer.interval);
  focusTimer.interval = null;
  focusTimer.label = "";

  const iso = toISODate(activeDate);
  const rec = getDayRecord(iso);
  rec.focusSessions.push({
    id: crypto.randomUUID(),
    label: label || "",
    start: focusTimer.startTs,
    end,
    minutes,
  });

  if (el.focusLabel) el.focusLabel.value = "";
  if (el.flowFocusLabel) el.flowFocusLabel.value = "";
  saveState(state);
  updateFocusDisplay();
  renderFocus(iso);
  renderFlowReview(iso);
  renderFlowHeader(iso);
  scheduleProgressRefresh();
  renderAchievements();
}

function renderHistory() {
  if (!el.historyStrip) return;
  el.historyStrip.innerHTML = "";

  const days = [];
  const end = new Date(activeDate);
  end.setHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i += 1) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  for (const d of days) {
    const iso = toISODate(d);
    const pct = computeDayCompletionPct(iso);
    const full = isDayFullyComplete(iso);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    if (iso === toISODate(activeDate)) btn.classList.add("is-active");
    btn.addEventListener("click", () => setActiveDate(d));

    const top = document.createElement("div");
    top.className = "chip__top";

    const date = document.createElement("div");
    date.className = "chip__date";
    date.textContent = formatShortDate(d);

    const p = document.createElement("div");
    p.className = "chip__pct";
    p.textContent = `${pct}%`;

    top.appendChild(date);
    top.appendChild(p);

    const sub = document.createElement("div");
    sub.className = "chip__sub";
    sub.textContent = full ? "Fully complete" : "In progress";

    btn.appendChild(top);
    btn.appendChild(sub);
    el.historyStrip.appendChild(btn);
  }
}

function setNotesTab(tab) {
  activeNotesTab = tab;
  el.tabWins.classList.toggle("is-active", tab === "wins");
  el.tabLessons.classList.toggle("is-active", tab === "lessons");
  el.tabTomorrow.classList.toggle("is-active", tab === "tomorrow");
  el.tabWins.setAttribute("aria-selected", String(tab === "wins"));
  el.tabLessons.setAttribute("aria-selected", String(tab === "lessons"));
  el.tabTomorrow.setAttribute("aria-selected", String(tab === "tomorrow"));

  const iso = toISODate(activeDate);
  const rec = getDayRecord(iso);
  el.notesArea.value = rec.notes?.[tab] ?? "";
  if (el.notesPrompt) el.notesPrompt.textContent = NOTES_TABS[tab]?.prompt ?? "";
  if (el.notesArea) el.notesArea.placeholder = NOTES_TABS[tab]?.placeholder ?? "";
  renderNotesSavedAt(iso);
  renderNotesMeta(iso);
}

function renderNotesSavedAt(iso) {
  const rec = getDayRecord(iso);
  const ts = safeNumber(rec.notesUpdatedAt ?? 0);
  if (!ts) {
    if (el.notesSavedAt) el.notesSavedAt.textContent = "Last saved: —";
    if (el.flowNotesSavedAt) el.flowNotesSavedAt.textContent = "Last saved: —";
    return;
  }
  const time = formatTime(ts);
  const label = time ? `Last saved: ${time}` : "Last saved: —";
  if (el.notesSavedAt) el.notesSavedAt.textContent = label;
  if (el.flowNotesSavedAt) el.flowNotesSavedAt.textContent = label;
}

function renderNotesMeta(iso) {
  const rec = getDayRecord(iso);
  if (el.notesTagsInput && document.activeElement !== el.notesTagsInput) {
    el.notesTagsInput.value = formatTags(rec.notesTags);
  }
  if (el.notesPinBtn) {
    el.notesPinBtn.textContent = rec.notesPinned ? "Pinned day" : "Pin this day";
    el.notesPinBtn.classList.toggle("is-active", rec.notesPinned);
  }
}

function renderFlowNotes(iso) {
  const rec = getDayRecord(iso);
  if (el.flowNotesWins && document.activeElement !== el.flowNotesWins) {
    el.flowNotesWins.value = rec.notes?.wins ?? "";
  }
  if (el.flowNotesLessons && document.activeElement !== el.flowNotesLessons) {
    el.flowNotesLessons.value = rec.notes?.lessons ?? "";
  }
  if (el.flowNotesTomorrow && document.activeElement !== el.flowNotesTomorrow) {
    el.flowNotesTomorrow.value = rec.notes?.tomorrow ?? "";
  }
  if (el.flowIntentionInput && document.activeElement !== el.flowIntentionInput) {
    el.flowIntentionInput.value = rec.intention ?? "";
  }
  if (el.flowLessonInput && document.activeElement !== el.flowLessonInput) {
    el.flowLessonInput.value = rec.lessonLearned ?? "";
  }
  if (el.flowGratitude1 && document.activeElement !== el.flowGratitude1) {
    el.flowGratitude1.value = rec.gratitude?.[0] ?? "";
  }
  if (el.flowGratitude2 && document.activeElement !== el.flowGratitude2) {
    el.flowGratitude2.value = rec.gratitude?.[1] ?? "";
  }
  if (el.flowGratitude3 && document.activeElement !== el.flowGratitude3) {
    el.flowGratitude3.value = rec.gratitude?.[2] ?? "";
  }
}

function renderMit(iso) {
  const rec = getDayRecord(iso);
  const text = rec.mit?.text ?? "";
  const done = Boolean(rec.mit?.done) && Boolean(text.trim());

  if (el.mitInput && document.activeElement !== el.mitInput) el.mitInput.value = text;
  if (el.flowMitInput && document.activeElement !== el.flowMitInput) el.flowMitInput.value = text;

  const status = !text.trim() ? "Not set" : done ? "Done" : "In progress";
  if (el.mitStatus) el.mitStatus.textContent = status;
  if (el.flowMitStatus) el.flowMitStatus.textContent = status;

  const btnLabel = done ? "Done" : "Mark done";
  if (el.mitDoneBtn) el.mitDoneBtn.textContent = btnLabel;
  if (el.flowMitDoneBtn) el.flowMitDoneBtn.textContent = btnLabel;

  if (el.mitBlock) el.mitBlock.classList.toggle("is-done", done);
  if (el.flowMitBlock) el.flowMitBlock.classList.toggle("is-done", done);
}

function notesTextFromRecord(rec) {
  if (!rec || !rec.notes) return "";
  const gratitudeParts = Array.isArray(rec.gratitude) ? rec.gratitude.filter(Boolean) : [];
  const parts = [
    rec.notes.wins,
    rec.notes.lessons,
    rec.notes.tomorrow,
    rec.intention,
    rec.lessonLearned,
    ...gratitudeParts,
  ].filter(Boolean);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function collectNotesEntries() {
  const entries = [];
  for (const [iso, rec] of Object.entries(state.days)) {
    if (!rec) continue;
    const text = notesTextFromRecord(rec);
    const tags = Array.isArray(rec.notesTags) ? rec.notesTags : [];
    const pinned = Boolean(rec.notesPinned);
    if (!text && tags.length === 0 && !pinned) continue;
    entries.push({ iso, rec, text });
  }
  entries.sort((a, b) => b.iso.localeCompare(a.iso));
  return entries;
}

function renderNotesTagFilters(tags) {
  if (!el.notesTagFilters) return;
  el.notesTagFilters.innerHTML = "";
  const safeTags = tags.slice().sort((a, b) => a.localeCompare(b));

  if (uiState.notesTagFilter && uiState.notesTagFilter !== "all") {
    const exists = safeTags.includes(uiState.notesTagFilter);
    if (!exists) uiState.notesTagFilter = "all";
  }

  const labels = ["All", ...safeTags];
  for (const label of labels) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chipBtn";
    const isActive = label === "All"
      ? uiState.notesTagFilter === "all"
      : uiState.notesTagFilter === label;
    if (isActive) btn.classList.add("is-active");
    btn.textContent = label;
    btn.addEventListener("click", () => {
      uiState.notesTagFilter = label === "All" ? "all" : label;
      saveUiState(uiState);
      renderNotesVault();
    });
    el.notesTagFilters.appendChild(btn);
  }
}

function renderNotesList(container, entries, emptyLabel) {
  container.innerHTML = "";
  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = emptyLabel;
    container.appendChild(empty);
    return;
  }

  for (const entry of entries) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "item item--clickable";
    item.addEventListener("click", () => {
      setActiveDate(parseISODate(entry.iso));
    });

    const top = document.createElement("div");
    top.className = "item__top";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = formatShortDate(parseISODate(entry.iso));

    const badge = document.createElement("div");
    badge.className = "pill";
    badge.textContent = entry.rec.notesPinned ? "Pinned" : "Notes";

    top.appendChild(title);
    top.appendChild(badge);

    const meta = document.createElement("div");
    meta.className = "item__meta";
    meta.textContent = entry.rec.notesTags?.length ? entry.rec.notesTags.join(", ") : "No tags";

    const snippet = document.createElement("div");
    snippet.className = "muted";
    const text = entry.text || "";
    snippet.textContent = text.length > 140 ? `${text.slice(0, 140)}...` : text || "No notes text.";

    item.appendChild(top);
    item.appendChild(meta);
    item.appendChild(snippet);
    container.appendChild(item);
  }
}

function renderNotesVault() {
  if (!el.notesResults || !el.notesPinnedList) return;
  const entries = collectNotesEntries();
  const allTags = Array.from(
    new Set(entries.flatMap((entry) => entry.rec.notesTags ?? []))
  );

  renderNotesTagFilters(allTags);

  if (el.notesSearchInput && document.activeElement !== el.notesSearchInput) {
    el.notesSearchInput.value = uiState.notesQuery ?? "";
  }

  const query = String(uiState.notesQuery ?? "").trim().toLowerCase();
  const activeTag = uiState.notesTagFilter ?? "all";

  const filtered = entries.filter((entry) => {
    if (activeTag !== "all" && !(entry.rec.notesTags ?? []).includes(activeTag)) return false;
    if (query && !entry.text.toLowerCase().includes(query)) return false;
    return true;
  });

  const pinned = filtered.filter((entry) => entry.rec.notesPinned);
  renderNotesList(el.notesPinnedList, pinned, "No pinned days yet.");
  renderNotesList(el.notesResults, filtered, "No matching notes found.");
}

function renderObjectives() {
  el.objectiveList.innerHTML = "";
  for (const obj of state.objectives) {
    const item = document.createElement("div");
    item.className = "item";

    const top = document.createElement("div");
    top.className = "item__top";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = obj.text;

    const actions = document.createElement("div");
    actions.className = "item__actions";

    const doneBtn = document.createElement("button");
    doneBtn.className = "smallBtn";
    doneBtn.type = "button";
    doneBtn.textContent = obj.done ? "Done" : "Mark done";
    doneBtn.addEventListener("click", () => {
      obj.done = !obj.done;
      saveState(state);
      renderObjectives();
    });

    const delBtn = document.createElement("button");
    delBtn.className = "smallBtn";
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      state.objectives = state.objectives.filter((o) => o.id !== obj.id);
      saveState(state);
      renderObjectives();
    });

    actions.appendChild(doneBtn);
    actions.appendChild(delBtn);

    top.appendChild(title);
    top.appendChild(actions);

    item.appendChild(top);

    if (obj.done) {
      item.style.opacity = "0.75";
    }

    if (obj.deadline) {
      const dl = document.createElement("div");
      dl.className = "muted";
      dl.style.marginTop = "8px";
      const overdue = isIsoDate(obj.deadline) && parseISODate(obj.deadline) < todayLocalDate() && !obj.done;
      dl.textContent = overdue ? `Deadline: ${obj.deadline} (overdue)` : `Deadline: ${obj.deadline}`;
      if (overdue) dl.style.color = "rgba(255,123,114,0.9)";
      item.appendChild(dl);
    }

    el.objectiveList.appendChild(item);
  }
}

function getObjectivesDueOn(isoDate) {
  return state.objectives.filter((o) => o.deadline === isoDate);
}

function monthLabel(d) {
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(d);
}

function renderCalendar() {
  if (!el.calendarGrid || !el.calTitle) return;
  el.calTitle.textContent = monthLabel(calendarMonth);
  el.calendarGrid.innerHTML = "";

  const headers = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (const h of headers) {
    const cell = document.createElement("div");
    cell.className = "calCell is-muted";
    cell.style.cursor = "default";
    cell.style.minHeight = "44px";
    const t = document.createElement("div");
    t.className = "calDay";
    t.textContent = h;
    cell.appendChild(t);
    el.calendarGrid.appendChild(cell);
  }

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const first = new Date(year, month, 1);
  first.setHours(0, 0, 0, 0);
  const last = new Date(year, month + 1, 0);
  last.setHours(0, 0, 0, 0);

  // Monday-based index: 0..6
  const firstDow = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - firstDow);

  // 6 weeks grid
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = toISODate(d);
    const pct = computeDayCompletionPct(iso);
    const due = getObjectivesDueOn(iso);

    const cell = document.createElement("div");
    cell.className = "calCell";

    const isCurrentMonth = d.getMonth() === month;
    if (!isCurrentMonth) cell.classList.add("is-muted");
    if (iso === toISODate(activeDate)) cell.classList.add("is-active");

    // Shade based on completion
    const alpha = 0.06 + (pct / 100) * 0.16;
    cell.style.background = `rgba(255,255,255,${alpha.toFixed(3)})`;

    cell.addEventListener("click", () => setActiveDate(d));

    const day = document.createElement("div");
    day.className = "calDay";
    day.textContent = String(d.getDate());

    const meta = document.createElement("div");
    meta.className = "calMeta";

    const pctEl = document.createElement("div");
    pctEl.className = "calPct";
    pctEl.textContent = `${pct}%`;

    const dots = document.createElement("div");
    dots.className = "dots";
    const dotCount = Math.min(3, due.length);
    for (let j = 0; j < dotCount; j += 1) {
      const dot = document.createElement("div");
      dot.className = "dot";
      dots.appendChild(dot);
    }

    meta.appendChild(pctEl);
    meta.appendChild(dots);

    cell.appendChild(day);
    cell.appendChild(meta);
    el.calendarGrid.appendChild(cell);
  }
}

function renderTaskManager() {
  if (!el.taskManagerList) return;
  el.taskManagerList.innerHTML = "";
  if (state.tasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "No habits yet. Add your first habit above.";
    el.taskManagerList.appendChild(empty);
    renderTaskOptions();
    return;
  }
  for (const task of state.tasks) {
    const item = document.createElement("div");
    item.className = "item item--draggable";
    item.draggable = true;
    item.dataset.id = task.id;

    item.addEventListener("dragstart", (event) => {
      draggingTaskId = task.id;
      item.classList.add("is-dragging");
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    });

    item.addEventListener("dragend", () => {
      draggingTaskId = null;
      item.classList.remove("is-dragging");
    });

    item.addEventListener("dragover", (event) => {
      event.preventDefault();
      item.classList.add("is-dragover");
    });

    item.addEventListener("dragleave", () => {
      item.classList.remove("is-dragover");
    });

    item.addEventListener("drop", (event) => {
      event.preventDefault();
      item.classList.remove("is-dragover");
      if (!draggingTaskId || draggingTaskId === task.id) return;
      const fromIndex = state.tasks.findIndex((t) => t.id === draggingTaskId);
      const toIndex = state.tasks.findIndex((t) => t.id === task.id);
      if (fromIndex < 0 || toIndex < 0) return;
      const [moved] = state.tasks.splice(fromIndex, 1);
      state.tasks.splice(toIndex, 0, moved);
      saveState(state);
      render();
    });

    const top = document.createElement("div");
    top.className = "item__top";

    const titleRow = document.createElement("div");
    titleRow.className = "item__titleRow";
    const drag = document.createElement("div");
    drag.className = "dragHandle";
    drag.textContent = "|||";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = task.title;

    titleRow.appendChild(drag);
    titleRow.appendChild(title);

    const actions = document.createElement("div");
    actions.className = "item__actions";

    const delBtn = document.createElement("button");
    delBtn.className = "smallBtn";
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      const ok = confirm(`Delete habit “${task.title}”? This will remove it from all dates.`);
      if (!ok) return;
      state.tasks = state.tasks.filter((t) => t.id !== task.id);
      normalizeAllDaysToTasks();
      saveState(state);
      render();
    });

    actions.appendChild(delBtn);
    top.appendChild(titleRow);
    top.appendChild(actions);

    const meta = document.createElement("div");
    meta.className = "item__meta";
    const scheduleLabel = formatScheduleDays(task.scheduleDays);
    const blockLabel = formatTimeBlock(task.timeBlock);
    const startLabel = normalizeStartDate(task.startDate);
    const startMeta = startLabel ? ` • Starts ${startLabel}` : "";
    meta.textContent = `${normalizeCategory(task.category)} • ${normalizeWeight(task.weight)} pts • ${blockLabel} • ${scheduleLabel}${startMeta}`;

    const desc = document.createElement("div");
    desc.className = "muted";
    desc.style.marginTop = "8px";
    desc.textContent = task.desc || "No description.";

    const editor = document.createElement("div");
    editor.className = "taskEditor";

    const titleInput = document.createElement("input");
    titleInput.className = "field__input";
    titleInput.type = "text";
    titleInput.value = task.title;

    const descInput = document.createElement("input");
    descInput.className = "field__input";
    descInput.type = "text";
    descInput.value = task.desc ?? "";
    descInput.placeholder = "Description";

    const categoryInput = document.createElement("input");
    categoryInput.className = "field__input";
    categoryInput.type = "text";
    categoryInput.value = normalizeCategory(task.category);
    categoryInput.placeholder = "Category";

    const weightInput = document.createElement("input");
    weightInput.className = "field__input";
    weightInput.type = "number";
    weightInput.min = "1";
    weightInput.max = "10";
    weightInput.step = "1";
    weightInput.value = String(normalizeWeight(task.weight));

    const startDateInput = document.createElement("input");
    startDateInput.className = "field__input";
    startDateInput.type = "date";
    startDateInput.value = normalizeStartDate(task.startDate);
    startDateInput.title = "Start date (prevents retroactive penalties)";

    const blockSelect = document.createElement("select");
    blockSelect.className = "field__input";
    for (const block of TIME_BLOCKS) {
      const option = document.createElement("option");
      option.value = block.id;
      option.textContent = block.label;
      blockSelect.appendChild(option);
    }
    blockSelect.value = normalizeTimeBlock(task.timeBlock);

    const dayRow = document.createElement("div");
    dayRow.className = "dayRow";
    const selectedDays = new Set(normalizeScheduleDays(task.scheduleDays));
    for (const day of DAY_ORDER) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chipBtn dayBtn";
      btn.textContent = DAY_LABELS[day];
      if (selectedDays.has(day)) btn.classList.add("is-active");
      btn.addEventListener("click", () => {
        if (selectedDays.has(day)) {
          selectedDays.delete(day);
          btn.classList.remove("is-active");
        } else {
          selectedDays.add(day);
          btn.classList.add("is-active");
        }
      });
      dayRow.appendChild(btn);
    }

    const saveBtn = document.createElement("button");
    saveBtn.className = "smallBtn";
    saveBtn.type = "button";
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", () => {
      const nextTitle = titleInput.value.trim();
      task.title = nextTitle || task.title;
      task.desc = (descInput.value ?? "").trim();
      task.category = normalizeCategory(categoryInput.value);
      task.weight = normalizeWeight(weightInput.value);
      task.startDate = normalizeStartDate(startDateInput.value);
      task.timeBlock = normalizeTimeBlock(blockSelect.value);
      task.scheduleDays = normalizeScheduleDays(Array.from(selectedDays));
      saveState(state);
      render();
    });

    item.appendChild(top);
    item.appendChild(meta);
    item.appendChild(desc);
    editor.appendChild(titleInput);
    editor.appendChild(descInput);
    editor.appendChild(categoryInput);
    editor.appendChild(weightInput);
    editor.appendChild(startDateInput);
    editor.appendChild(blockSelect);
    editor.appendChild(dayRow);
    editor.appendChild(saveBtn);
    item.appendChild(editor);
    el.taskManagerList.appendChild(item);
  }
  renderTaskOptions();
}

function renderTaskOptions() {
  if (!el.taskOptions) return;
  el.taskOptions.innerHTML = "";
  for (const task of state.tasks) {
    const option = document.createElement("option");
    option.value = task.title;
    el.taskOptions.appendChild(option);
  }
}

function renderAntiHabitManager() {
  if (!el.antiHabitManagerList) return;
  el.antiHabitManagerList.innerHTML = "";

  const habits = Array.isArray(state.antiHabits) ? state.antiHabits : [];
  if (habits.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "No anti-habits yet. Add your first above.";
    el.antiHabitManagerList.appendChild(empty);
    return;
  }

  for (const habit of habits) {
    const item = document.createElement("div");
    item.className = "item";

    const top = document.createElement("div");
    top.className = "item__top";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = habit.title;

    const actions = document.createElement("div");
    actions.className = "item__actions";

    const delBtn = document.createElement("button");
    delBtn.className = "smallBtn";
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      const ok = confirm(`Delete anti-habit “${habit.title}”?`);
      if (!ok) return;
      state.antiHabits = state.antiHabits.filter((h) => h.id !== habit.id);
      normalizeAllDaysToTasks();
      saveState(state);
      render();
    });

    actions.appendChild(delBtn);
    top.appendChild(title);
    top.appendChild(actions);

    const desc = document.createElement("div");
    desc.className = "muted";
    desc.style.marginTop = "6px";
    desc.textContent = habit.desc || "No description.";

    const editorRow = document.createElement("div");
    editorRow.className = "row";
    editorRow.style.marginTop = "10px";

    const titleInput = document.createElement("input");
    titleInput.className = "field__input";
    titleInput.type = "text";
    titleInput.value = habit.title;

    const descInput = document.createElement("input");
    descInput.className = "field__input";
    descInput.type = "text";
    descInput.value = habit.desc ?? "";
    descInput.placeholder = "Description";

    const saveBtn = document.createElement("button");
    saveBtn.className = "btn";
    saveBtn.type = "button";
    saveBtn.textContent = "Save";
    const save = () => {
      habit.title = titleInput.value.trim() || habit.title;
      habit.desc = descInput.value ?? "";
      saveState(state);
      render();
    };
    saveBtn.addEventListener("click", save);
    titleInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") save();
    });
    descInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") save();
    });

    editorRow.appendChild(titleInput);
    editorRow.appendChild(descInput);
    editorRow.appendChild(saveBtn);

    item.appendChild(top);
    item.appendChild(desc);
    item.appendChild(editorRow);

    el.antiHabitManagerList.appendChild(item);
  }
}

function renderSocialSteps() {
  if (!el.socialStepList) return;
  el.socialStepList.innerHTML = "";

  const steps = Array.isArray(state.socialSteps) ? state.socialSteps : [];
  if (steps.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "No steps yet. Add your first exposure step.";
    el.socialStepList.appendChild(empty);
    return;
  }

  for (const step of steps) {
    const item = document.createElement("div");
    item.className = "item";

    const top = document.createElement("div");
    top.className = "item__top";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = step.text;

    const actions = document.createElement("div");
    actions.className = "item__actions";

    const toggle = document.createElement("button");
    toggle.className = "smallBtn";
    toggle.type = "button";
    toggle.textContent = step.active !== false ? "Active" : "Paused";
    toggle.addEventListener("click", () => {
      step.active = step.active === false ? true : false;
      saveState(state);
      renderSocialSteps();
    });

    const del = document.createElement("button");
    del.className = "smallBtn";
    del.type = "button";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      const ok = confirm(`Delete step “${step.text}”?`);
      if (!ok) return;
      state.socialSteps = state.socialSteps.filter((s) => s.id !== step.id);
      saveState(state);
      renderSocialSteps();
    });

    actions.appendChild(toggle);
    actions.appendChild(del);

    top.appendChild(title);
    top.appendChild(actions);

    const meta = document.createElement("div");
    meta.className = "item__meta";
    meta.textContent = `Difficulty ${step.difficulty}`;

    item.appendChild(top);
    item.appendChild(meta);
    el.socialStepList.appendChild(item);
  }
}

function renderReminderDayButtons() {
  if (!el.reminderDays) return;
  const buttons = el.reminderDays.querySelectorAll("button[data-day]");
  for (const btn of buttons) {
    const day = Number(btn.dataset.day);
    btn.classList.toggle("is-active", selectedReminderDays.has(day));
  }
}

function formatReminderDays(days) {
  const sorted = days.slice().sort((a, b) => a - b);
  return sorted.map((d) => DAY_LABELS[d]).join(", ");
}

function updateNotificationStatus() {
  if (!el.notificationsStatus) return;
  if (!("Notification" in window)) {
    el.notificationsStatus.textContent = "Notifications not supported.";
    return;
  }
  const perm = Notification.permission;
  if (perm === "granted") {
    el.notificationsStatus.textContent = "Notifications enabled.";
  } else if (perm === "denied") {
    el.notificationsStatus.textContent = "Notifications blocked in browser settings.";
  } else {
    el.notificationsStatus.textContent = "Notifications not enabled.";
  }
}

function checkReminders() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!Array.isArray(state.reminders) || state.reminders.length === 0) return;

  const now = new Date();
  const day = now.getDay();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const todayIso = toISODate(now);

  for (const reminder of state.reminders) {
    if (!reminder.enabled) continue;
    if (!reminder.days.includes(day)) continue;
    if (reminder.time !== time) continue;

    const firedKey = `${todayIso} ${time}`;
    if (reminderLastFired[reminder.id] === firedKey) continue;
    reminderLastFired[reminder.id] = firedKey;

    const title = reminder.label || reminder.task || "Habit reminder";
    const body = reminder.task ? `Habit: ${reminder.task}` : "Time to check in.";
    try {
      new Notification(title, { body });
    } catch {
      // Ignore notification errors.
    }
  }
}

function ensureReminderInterval() {
  if (reminderInterval) return;
  reminderInterval = window.setInterval(checkReminders, 30000);
}

function renderReminders() {
  if (!el.remindersList) return;
  el.remindersList.innerHTML = "";
  renderReminderDayButtons();
  updateNotificationStatus();
  if ("Notification" in window && Notification.permission === "granted") {
    ensureReminderInterval();
  }

  if (!Array.isArray(state.reminders) || state.reminders.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "No reminders yet.";
    el.remindersList.appendChild(empty);
    return;
  }

  for (const reminder of state.reminders) {
    const item = document.createElement("div");
    item.className = "item";
    item.classList.toggle("is-disabled", !reminder.enabled);

    const top = document.createElement("div");
    top.className = "item__top";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = `${reminder.time} • ${reminder.label || reminder.task || "Reminder"}`;

    const actions = document.createElement("div");
    actions.className = "item__actions";

    const toggle = document.createElement("button");
    toggle.className = "smallBtn";
    toggle.type = "button";
    toggle.textContent = reminder.enabled ? "On" : "Off";
    toggle.addEventListener("click", () => {
      reminder.enabled = !reminder.enabled;
      saveState(state);
      renderReminders();
    });

    const del = document.createElement("button");
    del.className = "smallBtn";
    del.type = "button";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      state.reminders = state.reminders.filter((r) => r.id !== reminder.id);
      saveState(state);
      renderReminders();
    });

    actions.appendChild(toggle);
    actions.appendChild(del);

    top.appendChild(title);
    top.appendChild(actions);

    const meta = document.createElement("div");
    meta.className = "item__meta";
    const daysLabel = formatReminderDays(reminder.days);
    meta.textContent = daysLabel || "No days selected";

    const note = document.createElement("div");
    note.className = "muted";
    note.textContent = reminder.task ? `Habit: ${reminder.task}` : "General reminder.";

    item.appendChild(top);
    item.appendChild(meta);
    item.appendChild(note);
    el.remindersList.appendChild(item);
  }
}

function renderSkills() {
  el.skillList.innerHTML = "";
  for (const skill of state.skills) {
    const item = document.createElement("div");
    item.className = "item";

    const top = document.createElement("div");
    top.className = "item__top";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = skill.name;

    const actions = document.createElement("div");
    actions.className = "item__actions";

    const delBtn = document.createElement("button");
    delBtn.className = "smallBtn";
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      state.skills = state.skills.filter((s) => s.id !== skill.id);
      saveState(state);
      renderSkills();
    });

    actions.appendChild(delBtn);
    top.appendChild(title);
    top.appendChild(actions);

    const progressRow = document.createElement("div");
    progressRow.className = "progressRow";

    const bar = document.createElement("div");
    bar.className = "bar";
    const fill = document.createElement("div");
    fill.className = "bar__fill";
    fill.style.width = `${clamp(skill.pct, 0, 100)}%`;
    bar.appendChild(fill);

    const pct = document.createElement("div");
    pct.className = "pct";
    pct.textContent = `${clamp(skill.pct, 0, 100)}%`;

    progressRow.appendChild(bar);
    progressRow.appendChild(pct);

    const editorRow = document.createElement("div");
    editorRow.className = "row";
    editorRow.style.marginTop = "10px";

    const pctInput = document.createElement("input");
    pctInput.className = "field__input";
    pctInput.type = "number";
    pctInput.min = "0";
    pctInput.max = "100";
    pctInput.step = "1";
    pctInput.value = String(clamp(skill.pct, 0, 100));

    const noteInput = document.createElement("input");
    noteInput.className = "field__input";
    noteInput.type = "text";
    noteInput.placeholder = "Short note (what you learned / next step)…";
    noteInput.value = skill.note ?? "";

    const saveBtn = document.createElement("button");
    saveBtn.className = "btn";
    saveBtn.type = "button";
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", () => {
      skill.pct = clamp(safeNumber(pctInput.value), 0, 100);
      skill.note = noteInput.value ?? "";
      saveState(state);
      renderSkills();
    });

    editorRow.appendChild(pctInput);
    editorRow.appendChild(noteInput);
    editorRow.appendChild(saveBtn);

    item.appendChild(top);
    item.appendChild(progressRow);
    item.appendChild(editorRow);

    el.skillList.appendChild(item);
  }
}

function startOfWeek(d) {
  // Monday-based week
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  const day = dt.getDay(); // 0 Sun .. 6 Sat
  const diff = (day === 0 ? -6 : 1) - day;
  dt.setDate(dt.getDate() + diff);
  return dt;
}

function rangeFor(d, range) {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(0, 0, 0, 0);

  if (range === "week") {
    const s = startOfWeek(d);
    const e = new Date(s);
    e.setDate(e.getDate() + 6);
    return { start: s, end: e };
  }

  if (range === "month") {
    const s = new Date(d.getFullYear(), d.getMonth(), 1);
    const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    return { start: s, end: e };
  }

  // year
  const s = new Date(d.getFullYear(), 0, 1);
  const e = new Date(d.getFullYear(), 11, 31);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  return { start: s, end: e };
}

function previousRangeWindow(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const dayCount = Math.round((end - start) / 86400000) + 1;
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - Math.max(0, dayCount - 1));
  return { start: prevStart, end: prevEnd };
}

function iterDatesInclusive(start, end) {
  const out = [];
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  while (d <= e) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function computeSummaryForWindow(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const days = iterDatesInclusive(start, end);

  let totalTaskSlots = 0;
  let completedTaskSlots = 0;
  let totalPoints = 0;
  let pointsDone = 0;

  let study = 0;
  let earnings = 0;
  let completedDays = 0;
  let focusMinutes = 0;
  let studyMinutes = 0;
  let antiTotal = 0;
  let antiClean = 0;
  let xpTotal = 0;
  const xpSourceMap = new Map();
  const antiHabits = Array.isArray(state.antiHabits) ? state.antiHabits : [];

  for (const d of days) {
    const iso = toISODate(d);
    const rec = state.days[iso];
    const dueTasks = getDueTasksForDate(d);
    totalTaskSlots += dueTasks.length;
    totalPoints += dueTasks.reduce((sum, task) => sum + normalizeWeight(task.weight), 0);

    if (rec) {
      study += safeNumber(rec.studyHours);
      earnings += safeNumber(rec.earnings);
      focusMinutes += computeFocusMinutesForDay(rec);
      studyMinutes += safeNumber(rec.studyHours) * 60;

      let done = 0;
      for (const t of dueTasks) {
        if (rec.tasks?.[t.id] === true) {
          done += 1;
          completedTaskSlots += 1;
          pointsDone += normalizeWeight(t.weight);
        }
      }
      if (dueTasks.length === 0 || done === dueTasks.length) completedDays += 1;

      if (antiHabits.length) {
        for (const habit of antiHabits) {
          antiTotal += 1;
          if (rec.antiHabits?.[habit.id] === true) antiClean += 1;
        }
      }

      const xpBreakdown = computeDayXpBreakdown(d, rec, dueTasks);
      xpTotal += xpBreakdown.total;
      mergeXpSources(xpSourceMap, xpBreakdown.sources);
    }
  }

  const completionPct = totalTaskSlots === 0 ? 0 : Math.round((completedTaskSlots / totalTaskSlots) * 100);
  const scorePct = totalPoints === 0 ? 0 : Math.round((pointsDone / totalPoints) * 100);
  const deepWorkPct = studyMinutes > 0
    ? clamp(Math.round((focusMinutes / studyMinutes) * 100), 0, 100)
    : 0;
  const antiCleanPct = antiTotal > 0 ? Math.round((antiClean / antiTotal) * 100) : 0;
  const xpSources = Array.from(xpSourceMap.entries())
    .map(([label, xp]) => ({ label, xp }))
    .filter((entry) => entry.xp > 0)
    .sort((a, b) => b.xp - a.xp);
  const xpPerDay = days.length > 0 ? Math.round(xpTotal / days.length) : 0;

  return {
    start,
    end,
    completionPct,
    scorePct,
    pointsDone,
    pointsTotal: totalPoints,
    study,
    earnings,
    completedDays,
    focusMinutes,
    studyMinutes,
    deepWorkPct,
    antiClean,
    antiTotal,
    antiCleanPct,
    xpTotal,
    xpPerDay,
    xpSources,
  };
}

function computeSummary(anchorDate, range) {
  const { start, end } = rangeFor(anchorDate, range);
  return computeSummaryForWindow(start, end);
}

function computeTaskStats(anchorDate, range) {
  const { start, end } = rangeFor(anchorDate, range);
  const days = iterDatesInclusive(start, end);

  const stats = [];
  for (const task of state.tasks) {
    let done = 0;
    let total = 0;
    for (const d of days) {
      const iso = toISODate(d);
      if (!isTaskScheduledForDate(task, d)) continue;
      const rec = state.days[iso];
      total += 1;
      if (rec?.tasks?.[task.id] === true) done += 1;
    }
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    stats.push({ id: task.id, title: task.title, done, total, pct });
  }

  stats.sort((a, b) => a.pct - b.pct);
  return stats;
}

function renderTaskStats() {
  if (!el.taskStats) return;
  el.taskStats.innerHTML = "";

  const stats = computeTaskStats(activeDate, activeRange);
  if (stats.length === 0) {
    el.taskStats.textContent = "No tasks yet.";
    return;
  }

  for (const s of stats) {
    const taskStreak = computeTaskStreak(s.id, activeDate);
    const bestTaskStreak = computeBestTaskStreak(s.id);

    const row = document.createElement("div");
    row.className = "statRow";

    const top = document.createElement("div");
    top.className = "statRow__top";

    const name = document.createElement("div");
    name.className = "statRow__name";
    name.textContent = s.title;

    const meta = document.createElement("div");
    meta.className = "statRow__meta";
    meta.textContent = `${s.pct}% (${s.done}/${s.total}) • Streak ${taskStreak} • Best ${bestTaskStreak}`;

    top.appendChild(name);
    top.appendChild(meta);

    const bar = document.createElement("div");
    bar.className = "bar";
    const fill = document.createElement("div");
    fill.className = "bar__fill";
    fill.style.width = `${clamp(s.pct, 0, 100)}%`;
    bar.appendChild(fill);

    row.appendChild(top);
    row.appendChild(bar);
    el.taskStats.appendChild(row);
  }
}

function computeAchievementStats() {
  const keys = Object.keys(state.days);
  let daysWithAnyTask = 0;
  let totalPoints = 0;
  let totalFocusMinutes = 0;

  for (const iso of keys) {
    const rec = state.days[iso];
    if (!rec) continue;
    const anyDone = state.tasks.some((t) => rec.tasks?.[t.id] === true);
    if (anyDone) daysWithAnyTask += 1;
    totalPoints += computeDayPoints(iso).done;

    if (Array.isArray(rec.focusSessions)) {
      for (const session of rec.focusSessions) {
        totalFocusMinutes += safeNumber(session.minutes ?? 0);
      }
    }
  }

  const bestStreak = computeBestPerfectDayStreak();
  const currentStreak = computeStreakFrom(activeDate);

  return {
    daysWithAnyTask,
    totalPoints,
    totalFocusMinutes,
    bestStreak,
    currentStreak,
  };
}

function updateAchievements() {
  if (!Array.isArray(state.achievements)) state.achievements = [];
  const stats = computeAchievementStats();
  const unlockedIds = new Set(state.achievements.map((a) => a.id));
  let changed = false;

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;
    if (achievement.test(stats)) {
      state.achievements.push({ id: achievement.id, unlockedAt: Date.now() });
      unlockedIds.add(achievement.id);
      changed = true;
    }
  }

  if (changed) saveState(state);
  return stats;
}

function getAvailableFreezeTokens() {
  const unlockedIds = new Set((state.achievements ?? []).map((a) => a.id));
  let tokens = 0;
  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) tokens += safeNumber(achievement.reward ?? 0);
  }
  const used = Array.isArray(state.freezeUsed) ? state.freezeUsed.length : 0;
  return Math.max(0, tokens - used);
}

function renderAchievements() {
  if (!el.achievementsList || !el.freezeTokens) return;
  updateAchievements();

  const available = getAvailableFreezeTokens();
  el.freezeTokens.textContent = String(available);
  if (el.useFreezeBtn) {
    const y = new Date(activeDate);
    y.setDate(y.getDate() - 1);
    const iso = toISODate(y);
    const alreadyCovered = isDayCompleteForStreak(iso) || state.freezeUsed?.includes(iso);
    el.useFreezeBtn.disabled = available <= 0 || alreadyCovered;
  }

  el.achievementsList.innerHTML = "";
  const unlockedMap = new Map((state.achievements ?? []).map((a) => [a.id, a]));

  for (const achievement of ACHIEVEMENTS) {
    const unlocked = unlockedMap.get(achievement.id);
    const item = document.createElement("div");
    item.className = "achievement";
    if (unlocked) item.classList.add("is-unlocked");

    const top = document.createElement("div");
    top.className = "achievement__top";

    const title = document.createElement("div");
    title.className = "achievement__title";
    title.textContent = achievement.title;

    const status = document.createElement("div");
    status.className = "pill";
    status.textContent = unlocked ? "Unlocked" : "Locked";

    top.appendChild(title);
    top.appendChild(status);

    const desc = document.createElement("div");
    desc.className = "muted";
    desc.textContent = achievement.desc;

    const reward = document.createElement("div");
    reward.className = "achievement__reward";
    reward.textContent = `Freeze tokens: ${achievement.reward}`;

    const meta = document.createElement("div");
    meta.className = "achievement__meta";
    if (unlocked?.unlockedAt && Number.isFinite(unlocked.unlockedAt) && unlocked.unlockedAt > 0) {
      meta.textContent = `Unlocked ${formatShortDate(new Date(unlocked.unlockedAt))}`;
    } else {
      meta.textContent = "Not yet unlocked.";
    }

    item.appendChild(top);
    item.appendChild(desc);
    item.appendChild(reward);
    item.appendChild(meta);

    el.achievementsList.appendChild(item);
  }
}

function computeAllTimeStats() {
  const keys = Object.keys(state.days);
  let study = 0;
  let earnings = 0;
  let perfectDays = 0;
  let totalPoints = 0;

  for (const iso of keys) {
    const rec = state.days[iso];
    if (!rec) continue;
    study += safeNumber(rec.studyHours);
    earnings += safeNumber(rec.earnings);
    if (isDayFullyComplete(iso)) perfectDays += 1;
    totalPoints += computeDayPoints(iso).done;
  }

  const bestStreak = computeBestPerfectDayStreak();
  return { study, earnings, perfectDays, bestStreak, totalPoints };
}

function renderAllTimeStats(levelSnapshot) {
  if (!el.kpiBestStreak) return;
  const s = computeAllTimeStats();
  const levelInfo = levelSnapshot ?? computeAllTimeXp();
  el.kpiBestStreak.textContent = String(s.bestStreak);
  el.kpiPerfectDays.textContent = String(s.perfectDays);
  el.kpiAllStudy.textContent = formatNumber(s.study);
  el.kpiAllEarnings.textContent = currency(s.earnings);
  if (el.kpiAllPoints) el.kpiAllPoints.textContent = String(Math.round(s.totalPoints));
  if (el.kpiAllXp) el.kpiAllXp.textContent = formatXp(levelInfo.totalXp);
  if (el.kpiAllLevel) el.kpiAllLevel.textContent = String(levelInfo.level);
}

function chartTheme() {
  return {
    grid: "rgba(255,255,255,0.10)",
    tick: "rgba(255,255,255,0.72)",
    line: "rgba(139,233,253,0.95)",
    green: "rgba(126,231,135,0.90)",
    yellow: "rgba(242,204,96,0.90)",
    teal: "rgba(99,242,200,0.90)",
    orange: "rgba(255,179,100,0.90)",
  };
}

function rangeSeries(anchorDate, range) {
  const { start, end } = rangeFor(anchorDate, range);
  const days = iterDatesInclusive(start, end);
  const labels = [];
  const completion = [];
  const study = [];
  const earnings = [];

  for (const d of days) {
    const iso = toISODate(d);
    labels.push(new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(d));
    completion.push(computeDayCompletionPct(iso));
    const rec = state.days[iso];
    study.push(safeNumber(rec?.studyHours ?? 0));
    earnings.push(safeNumber(rec?.earnings ?? 0));
  }

  return { labels, completion, study, earnings };
}

function buildTrendSeries(anchorDate, daysBack) {
  const end = new Date(anchorDate);
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - Math.max(0, daysBack - 1));
  const days = iterDatesInclusive(start, end);

  const labels = [];
  const completion = [];
  const score = [];
  const focus = [];
  const deepwork = [];
  const study = [];

  for (const d of days) {
    const iso = toISODate(d);
    labels.push(new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(d));
    completion.push(computeDayCompletionPct(iso));
    score.push(computeDayPoints(iso).scorePct);

    const rec = state.days[iso];
    focus.push(rec ? computeFocusMinutesForDay(rec) : 0);
    deepwork.push(rec ? computeDeepWorkRatio(rec) : 0);
    study.push(rec ? safeNumber(rec.studyHours) : 0);
  }

  return { labels, completion, score, focus, deepwork, study };
}

function withAlpha(color, alpha) {
  const match = typeof color === "string" ? color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/) : null;
  if (!match) return color;
  return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
}

function renderTrendMetricFilters() {
  if (!el.trendMetricFilters) return;
  el.trendMetricFilters.innerHTML = "";
  const selected = new Set(uiState.trendMetrics);

  for (const metric of TREND_METRICS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chipBtn";
    if (selected.has(metric.id)) btn.classList.add("is-active");
    btn.textContent = metric.label;
    btn.addEventListener("click", () => {
      if (selected.has(metric.id)) {
        selected.delete(metric.id);
      } else {
        selected.add(metric.id);
      }
      if (selected.size === 0) selected.add(metric.id);
      uiState.trendMetrics = Array.from(selected);
      saveUiState(uiState);
      renderTrendChart();
    });
    el.trendMetricFilters.appendChild(btn);
  }
}

function renderTrendChart() {
  if (!el.chartTrend || !window.Chart) return;
  renderTrendMetricFilters();

  const allowedRanges = [7, 30, 90];
  const rawRange = safeNumber(uiState.trendRange);
  const rangeDays = allowedRanges.includes(rawRange) ? rawRange : 30;
  if (el.trendRangeSelect && document.activeElement !== el.trendRangeSelect) {
    el.trendRangeSelect.value = String(rangeDays);
  }
  if (el.trendMeta) el.trendMeta.textContent = `Last ${rangeDays} days`;

  const series = buildTrendSeries(activeDate, rangeDays);
  const theme = chartTheme();
  const colorMap = {
    completion: theme.line,
    score: theme.teal,
    deepwork: theme.green,
    focus: theme.orange,
    study: theme.yellow,
  };

  let metrics = TREND_METRICS.filter((metric) => uiState.trendMetrics.includes(metric.id));
  if (metrics.length === 0) {
    metrics = [TREND_METRICS[0]];
    uiState.trendMetrics = [TREND_METRICS[0].id];
    saveUiState(uiState);
  }
  const datasets = metrics.map((metric) => {
    const color = colorMap[metric.id] ?? theme.line;
    const ctx = el.chartTrend.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, withAlpha(color, 0.35));
    gradient.addColorStop(1, withAlpha(color, 0.05));
    return {
      label: metric.label,
      data: series[metric.id] ?? [],
      borderColor: color,
      backgroundColor: gradient,
      tension: 0.35,
      fill: metric.axis === "y",
      pointRadius: 2,
      pointHoverRadius: 4,
      yAxisID: metric.axis,
    };
  });

  if (chartTrendInstance) chartTrendInstance.destroy();
  chartTrendInstance = new window.Chart(el.chartTrend.getContext("2d"), {
    type: "line",
    data: {
      labels: series.labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: theme.tick } },
        tooltip: { enabled: true },
      },
      scales: {
        x: { ticks: { color: theme.tick }, grid: { color: theme.grid } },
        y: {
          ticks: { color: theme.tick },
          grid: { color: theme.grid },
          beginAtZero: true,
          max: 100,
        },
        y2: {
          position: "right",
          ticks: { color: theme.tick },
          grid: { drawOnChartArea: false },
          beginAtZero: true,
        },
      },
    },
  });
}

function buildCorrelationPoints(type) {
  const points = { mood: [], energy: [], sleep: [] };
  for (const [iso, rec] of Object.entries(state.days)) {
    if (!rec) continue;
    const y = type === "completion" ? computeDayCompletionPct(iso) : safeNumber(rec.studyHours);
    const mood = safeNumber(rec.checkin?.mood ?? 0);
    const energy = safeNumber(rec.checkin?.energy ?? 0);
    const sleep = safeNumber(rec.checkin?.sleep ?? 0);
    if (mood > 0) points.mood.push({ x: mood, y });
    if (energy > 0) points.energy.push({ x: energy, y });
    if (sleep > 0) points.sleep.push({ x: sleep, y });
  }
  return points;
}

function renderCorrelationCharts() {
  if (!el.chartCorrelationCompletion || !el.chartCorrelationStudy) return;
  if (!window.Chart) return;

  const theme = chartTheme();
  const completionPoints = buildCorrelationPoints("completion");
  const studyPoints = buildCorrelationPoints("study");

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: theme.tick } },
      tooltip: { enabled: true },
    },
    scales: {
      x: { ticks: { color: theme.tick }, grid: { color: theme.grid }, beginAtZero: true },
      y: { ticks: { color: theme.tick }, grid: { color: theme.grid }, beginAtZero: true },
    },
  };

  if (chartCorrelationCompletionInstance) chartCorrelationCompletionInstance.destroy();
  chartCorrelationCompletionInstance = new window.Chart(el.chartCorrelationCompletion.getContext("2d"), {
    type: "scatter",
    data: {
      datasets: [
        { label: "Mood", data: completionPoints.mood, backgroundColor: theme.teal, pointRadius: 4 },
        { label: "Energy", data: completionPoints.energy, backgroundColor: theme.green, pointRadius: 4 },
        { label: "Sleep", data: completionPoints.sleep, backgroundColor: theme.yellow, pointRadius: 4 },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        ...commonOptions.scales,
        y: { ...commonOptions.scales.y, max: 100 },
      },
    },
  });

  if (chartCorrelationStudyInstance) chartCorrelationStudyInstance.destroy();
  chartCorrelationStudyInstance = new window.Chart(el.chartCorrelationStudy.getContext("2d"), {
    type: "scatter",
    data: {
      datasets: [
        { label: "Mood", data: studyPoints.mood, backgroundColor: theme.teal, pointRadius: 4 },
        { label: "Energy", data: studyPoints.energy, backgroundColor: theme.green, pointRadius: 4 },
        { label: "Sleep", data: studyPoints.sleep, backgroundColor: theme.yellow, pointRadius: 4 },
      ],
    },
    options: {
      ...commonOptions,
    },
  });
}

function renderCharts() {
  if (!window.Chart) return;
  renderTrendChart();
  if (!el.chartCompletion || !el.chartWorkMoney) {
    renderCorrelationCharts();
    return;
  }

  const theme = chartTheme();
  const series = rangeSeries(activeDate, activeRange);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: theme.tick } },
      tooltip: { enabled: true },
    },
    scales: {
      x: { ticks: { color: theme.tick }, grid: { color: theme.grid } },
      y: { ticks: { color: theme.tick }, grid: { color: theme.grid }, beginAtZero: true },
    },
  };

  if (chartCompletionInstance) chartCompletionInstance.destroy();
  chartCompletionInstance = new window.Chart(el.chartCompletion.getContext("2d"), {
    type: "line",
    data: {
      labels: series.labels,
      datasets: [
        {
          label: "Completion %",
          data: series.completion,
          borderColor: theme.line,
          backgroundColor: "rgba(139,233,253,0.15)",
          tension: 0.35,
          fill: true,
          pointRadius: 2,
        },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        ...commonOptions.scales,
        y: { ...commonOptions.scales.y, max: 100 },
      },
    },
  });

  if (chartWorkMoneyInstance) chartWorkMoneyInstance.destroy();
  chartWorkMoneyInstance = new window.Chart(el.chartWorkMoney.getContext("2d"), {
    type: "bar",
    data: {
      labels: series.labels,
      datasets: [
        {
          label: "Study hours",
          data: series.study,
          backgroundColor: theme.green,
          borderRadius: 8,
        },
        {
          label: "Earnings",
          data: series.earnings,
          backgroundColor: theme.yellow,
          borderRadius: 8,
        },
      ],
    },
    options: {
      ...commonOptions,
    },
  });

  if (el.chartFinance) {
    const cumulative = [];
    let total = 0;
    for (const value of series.earnings) {
      total += safeNumber(value);
      cumulative.push(Math.round(total * 100) / 100);
    }

    if (chartFinanceInstance) chartFinanceInstance.destroy();
    chartFinanceInstance = new window.Chart(el.chartFinance.getContext("2d"), {
      type: "bar",
      data: {
        labels: series.labels,
        datasets: [
          {
            label: "Daily earnings",
            data: series.earnings,
            backgroundColor: theme.yellow,
            borderRadius: 8,
            yAxisID: "y",
          },
          {
            label: "Cumulative",
            data: cumulative,
            type: "line",
            borderColor: theme.teal,
            backgroundColor: "rgba(99,242,200,0.15)",
            tension: 0.35,
            pointRadius: 2,
            fill: true,
            yAxisID: "y2",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: theme.tick } },
          tooltip: { enabled: true },
        },
        scales: {
          x: { ticks: { color: theme.tick }, grid: { color: theme.grid } },
          y: { ticks: { color: theme.tick }, grid: { color: theme.grid }, beginAtZero: true },
          y2: { position: "right", ticks: { color: theme.tick }, grid: { drawOnChartArea: false }, beginAtZero: true },
        },
      },
    });
  }

  renderCorrelationCharts();
}

let chartsRefreshTimer = null;
function scheduleChartsRefresh(delay = 250) {
  if (!window.Chart) return;
  if (chartsRefreshTimer) window.clearTimeout(chartsRefreshTimer);
  chartsRefreshTimer = window.setTimeout(() => {
    chartsRefreshTimer = null;
    renderCharts();
  }, delay);
}

function setRightTab(tab) {
  if (!["summary", "insights", "manage"].includes(tab)) tab = "summary";
  activeRightTab = tab;
  if (el.sectionSummary) {
    el.sectionSummary.classList.toggle("is-active", tab === "summary");
    el.sectionSummary.setAttribute("aria-selected", String(tab === "summary"));
  }
  if (el.sectionInsights) {
    el.sectionInsights.classList.toggle("is-active", tab === "insights");
    el.sectionInsights.setAttribute("aria-selected", String(tab === "insights"));
  }
  if (el.sectionManage) {
    el.sectionManage.classList.toggle("is-active", tab === "manage");
    el.sectionManage.setAttribute("aria-selected", String(tab === "manage"));
  }

  const panels = document.querySelectorAll(".panelTab");
  for (const panel of panels) {
    panel.classList.toggle("is-active", panel.dataset.tab === tab);
  }

  uiState.rightTab = tab;
  saveUiState(uiState);
  if (tab === "insights") {
    window.requestAnimationFrame(() => renderCharts());
  }
}

function applyFocusMode() {
  document.body.classList.toggle("is-focus", Boolean(uiState.focusMode));
  if (el.focusModeBtn) {
    el.focusModeBtn.textContent = uiState.focusMode ? "Exit Focus" : "Focus Mode";
  }
}

function applyFlowMode() {
  document.body.classList.toggle("is-flow", Boolean(uiState.flowMode));
  if (el.flowPanel) el.flowPanel.setAttribute("aria-hidden", String(!uiState.flowMode));
  if (el.flowModeBtn) {
    el.flowModeBtn.textContent = uiState.flowMode ? "Exit Flow" : "Daily Flow";
  }
}

function setDataMenuOpen(open) {
  if (!el.dataMenu || !el.dataMenuPanel || !el.dataMenuBtn) return;
  el.dataMenu.classList.toggle("is-open", open);
  el.dataMenuBtn.setAttribute("aria-expanded", String(open));
  el.dataMenuPanel.setAttribute("aria-hidden", String(!open));
}

function bindCollapsibles() {
  const cards = document.querySelectorAll(".card--collapsible");
  for (const card of cards) {
    const key = card.dataset.collapsible;
    if (!uiState.collapsed) uiState.collapsed = {};
    if (typeof uiState.collapsed[key] === "boolean") {
      card.classList.toggle("is-collapsed", uiState.collapsed[key]);
    } else {
      uiState.collapsed[key] = card.classList.contains("is-collapsed");
    }

    const btn = card.querySelector(".collapseBtn");
    if (!btn) continue;
    btn.setAttribute("aria-expanded", String(!card.classList.contains("is-collapsed")));
    btn.addEventListener("click", () => {
      const next = !card.classList.contains("is-collapsed");
      card.classList.toggle("is-collapsed", next);
      btn.setAttribute("aria-expanded", String(!next));
      uiState.collapsed[key] = next;
      saveUiState(uiState);
    });
  }
}

function loadSyncSettings() {
  try {
    const raw = localStorage.getItem(SYNC_SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSyncSettings(settings) {
  localStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(settings));
}

function setSyncStatus(text) {
  if (!el.syncStatus) return;
  el.syncStatus.textContent = text;
}

function scheduleAutoSync() {
  if (!sync.enabled) return;
  if (!sync.firestore) return;
  if (sync.uploadTimer) window.clearTimeout(sync.uploadTimer);
  sync.uploadTimer = window.setTimeout(() => {
    syncNow("push");
  }, 1200);
}

async function loadFirebaseCompatScripts() {
  if (window.firebase) return;
  const urls = [
    "https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js",
    "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js",
  ];
  await new Promise((resolve, reject) => {
    let loaded = 0;
    for (const url of urls) {
      const s = document.createElement("script");
      s.src = url;
      s.onload = () => {
        loaded += 1;
        if (loaded === urls.length) resolve();
      };
      s.onerror = () => reject(new Error("Failed to load Firebase"));
      document.head.appendChild(s);
    }
  });
}

async function enableSyncFromUI() {
  const key = (el.syncKey?.value ?? "").trim();
  const configText = (el.firebaseConfig?.value ?? "").trim();
  if (!key) {
    alert("Please enter a Sync key.");
    return;
  }
  if (!configText) {
    alert("Please paste your Firebase config JSON.");
    return;
  }

  let cfg;
  try {
    cfg = JSON.parse(configText);
  } catch {
    alert("Firebase config must be valid JSON.");
    return;
  }

  try {
    setSyncStatus("Loading sync…");
    await loadFirebaseCompatScripts();
    const app = window.firebase.apps?.length ? window.firebase.app() : window.firebase.initializeApp(cfg);
    const auth = window.firebase.auth();
    const fs = window.firebase.firestore();

    await auth.signInAnonymously();

    sync.enabled = true;
    sync.key = key;
    sync.firebaseConfig = cfg;
    sync.firestore = fs;
    sync.authReady = true;

    saveSyncSettings({ enabled: true, key, firebaseConfig: cfg });
    setSyncStatus("Sync enabled");

    if (sync.unsub) sync.unsub();
    sync.unsub = fs.collection("si_sync").doc(key).onSnapshot((snap) => {
      const data = snap.data();
      const remoteState = data?.state;
      const remoteUpdatedAt = safeNumber(remoteState?.meta?.updatedAt ?? 0);
      const localUpdatedAt = safeNumber(state?.meta?.updatedAt ?? 0);
      if (remoteUpdatedAt > localUpdatedAt && remoteUpdatedAt !== sync.lastPulledUpdatedAt) {
        const next = normalizeImportedState(remoteState);
        if (!next) return;
        sync.lastPulledUpdatedAt = remoteUpdatedAt;
        state = next;
        saveState(state);
        render();
        setSyncStatus("Pulled latest from cloud");
      }
    });

    await syncNow("pull");
  } catch {
    sync.enabled = false;
    sync.firestore = null;
    setSyncStatus("Sync failed");
    alert("Sync failed. Check your Firebase project setup (Firestore + Anonymous Auth) and config.");
  }
}

async function syncNow(mode) {
  if (!sync.enabled || !sync.firestore || !sync.key) return;
  try {
    setSyncStatus("Syncing…");
    const docRef = sync.firestore.collection("si_sync").doc(sync.key);
    const snap = await docRef.get();
    const remoteState = snap.exists ? snap.data()?.state : null;
    const remoteUpdatedAt = safeNumber(remoteState?.meta?.updatedAt ?? 0);
    const localUpdatedAt = safeNumber(state?.meta?.updatedAt ?? 0);

    if (mode === "pull") {
      if (remoteUpdatedAt > localUpdatedAt) {
        const next = normalizeImportedState(remoteState);
        if (next) {
          sync.lastPulledUpdatedAt = remoteUpdatedAt;
          state = next;
          saveState(state);
          render();
          setSyncStatus("Pulled latest");
          return;
        }
      }
      setSyncStatus("Up to date");
      return;
    }

    // push
    if (localUpdatedAt >= remoteUpdatedAt) {
      await docRef.set({ state }, { merge: true });
      setSyncStatus("Pushed latest");
    } else {
      setSyncStatus("Cloud newer (pulled automatically)");
    }
  } catch {
    setSyncStatus("Sync error");
  }
}

function setActiveRange(range) {
  activeRange = range;
  el.rangeWeek.classList.toggle("is-active", range === "week");
  el.rangeMonth.classList.toggle("is-active", range === "month");
  el.rangeYear.classList.toggle("is-active", range === "year");
  el.rangeWeek.setAttribute("aria-selected", String(range === "week"));
  el.rangeMonth.setAttribute("aria-selected", String(range === "month"));
  el.rangeYear.setAttribute("aria-selected", String(range === "year"));
  renderSummary();
  refreshProgressionUI();
  renderLeaderboard();
  renderProjectShowcase();
  renderTaskStats();
  renderAutoInsights();
  renderCharts();
}

function renderSummary() {
  const s = computeSummary(activeDate, activeRange);

  el.summaryRangeLabel.textContent =
    activeRange === "week" ? "This week" : activeRange === "month" ? "This month" : "This year";

  el.kpiCompletion.textContent = `${s.completionPct}%`;
  if (el.kpiScore) el.kpiScore.textContent = `${s.scorePct}%`;
  el.kpiStudy.textContent = formatNumber(s.study);
  if (el.kpiDeepWork) el.kpiDeepWork.textContent = `${s.deepWorkPct}%`;
  el.kpiEarnings.textContent = currency(s.earnings);
  el.kpiDays.textContent = String(s.completedDays);
  el.completionBar.style.width = `${clamp(s.completionPct, 0, 100)}%`;

  const streak = computeStreakFrom(activeDate);
  el.streakValue.textContent = String(streak);

  if (streak > 0) {
    el.summaryHint.textContent = `You’re on a ${streak}-day streak. Keep it clean.`;
  } else {
    el.summaryHint.textContent = "Mark tasks to build your streak.";
  }
}

function renderLevelSystem(levelSnapshot) {
  const levelInfo = levelSnapshot ?? computeAllTimeXp();
  const summary = computeSummary(activeDate, activeRange);
  const label = rangeLabel(activeRange);

  if (el.levelRangeMeta) el.levelRangeMeta.textContent = label;
  if (el.levelCardValue) el.levelCardValue.textContent = String(levelInfo.level);
  if (el.levelTotalXp) el.levelTotalXp.textContent = formatXp(levelInfo.totalXp);
  if (el.levelRangeXp) el.levelRangeXp.textContent = formatXp(summary.xpTotal);
  if (el.levelNextXp) el.levelNextXp.textContent = formatXp(levelInfo.nextXp);
  if (el.levelNextMeta) {
    el.levelNextMeta.textContent = levelInfo.remainingToNext > 0
      ? `Need ${formatXp(levelInfo.remainingToNext)} XP`
      : "Level up ready";
  }
  if (el.levelProgressBar) el.levelProgressBar.style.width = `${levelInfo.progressPct}%`;
  if (el.levelProgressMeta) {
    el.levelProgressMeta.textContent = `${formatXp(levelInfo.currentXp)} / ${formatXp(levelInfo.nextXp)} XP`;
  }

  if (el.levelValue) el.levelValue.textContent = String(levelInfo.level);
  if (el.levelBar) el.levelBar.style.width = `${levelInfo.progressPct}%`;
  if (el.levelMeta) {
    el.levelMeta.textContent = `${formatXp(levelInfo.currentXp)} / ${formatXp(levelInfo.nextXp)} XP`;
  }

  if (el.levelSourcesList) {
    el.levelSourcesList.innerHTML = "";
    if (summary.xpTotal <= 0 || summary.xpSources.length === 0) {
      const empty = document.createElement("div");
      empty.className = "emptyState";
      empty.textContent = "Log days and complete habits to earn XP.";
      el.levelSourcesList.appendChild(empty);
    } else {
      for (const source of summary.xpSources.slice(0, 6)) {
        const item = document.createElement("div");
        item.className = "item";

        const top = document.createElement("div");
        top.className = "item__top";
        const title = document.createElement("div");
        title.className = "item__title";
        title.textContent = source.label;

        const actions = document.createElement("div");
        actions.className = "item__actions";
        const xpBadge = document.createElement("span");
        xpBadge.className = "pill";
        xpBadge.textContent = `+${formatXp(source.xp)} XP`;
        actions.appendChild(xpBadge);

        top.appendChild(title);
        top.appendChild(actions);

        const meta = document.createElement("div");
        meta.className = "item__meta";
        const pct = summary.xpTotal > 0 ? Math.round((source.xp / summary.xpTotal) * 100) : 0;
        meta.textContent = `${pct}% of ${label.toLowerCase()} XP`;

        item.appendChild(top);
        item.appendChild(meta);
        el.levelSourcesList.appendChild(item);
      }
    }
  }
}

function renderProfileCommunity(levelSnapshot) {
  const levelInfo = levelSnapshot ?? computeAllTimeXp();
  state.profile = normalizeProfile(state.profile);

  if (el.profileNameInput && document.activeElement !== el.profileNameInput) {
    el.profileNameInput.value = state.profile.username;
  }
  if (el.profileLevelHint) {
    el.profileLevelHint.textContent = `Level ${levelInfo.level} • ${formatXp(levelInfo.totalXp)} XP`;
  }
  if (el.profileXpHint) {
    el.profileXpHint.textContent = `Next level in ${formatXp(levelInfo.remainingToNext)} XP`;
  }

  renderFriendsManager();
}

function renderFriendsManager() {
  if (!el.friendsList) return;
  const friends = normalizeFriends(state.friends);
  el.friendsList.innerHTML = "";

  if (friends.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "Add friends with their XP to compare rankings.";
    el.friendsList.appendChild(empty);
    return;
  }

  friends.sort((a, b) => b.xp - a.xp);
  for (const friend of friends) {
    const item = document.createElement("div");
    item.className = "item";

    const top = document.createElement("div");
    top.className = "item__top";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = friend.name;

    const actions = document.createElement("div");
    actions.className = "item__actions";
    const del = document.createElement("button");
    del.className = "smallBtn";
    del.type = "button";
    del.textContent = "Remove";
    del.addEventListener("click", () => {
      state.friends = (state.friends ?? []).filter((entry) => entry.id !== friend.id);
      saveState(state);
      renderFriendsManager();
      const snapshot = computeAllTimeXp();
      renderCommunityLeaderboard(snapshot);
    });
    actions.appendChild(del);

    top.appendChild(title);
    top.appendChild(actions);

    const meta = document.createElement("div");
    meta.className = "item__meta";
    const level = computeLevelInfo(friend.xp).level;
    meta.textContent = `Level ${level} • ${formatXp(friend.xp)} XP`;

    item.appendChild(top);
    item.appendChild(meta);
    el.friendsList.appendChild(item);
  }
}

function renderCommunityLeaderboard(levelSnapshot) {
  if (!el.communityLeaderboardList) return;
  const levelInfo = levelSnapshot ?? computeAllTimeXp();
  state.profile = normalizeProfile(state.profile);
  const username = state.profile.username;
  const friends = normalizeFriends(state.friends);

  const entries = [
    {
      id: "you",
      name: username,
      xp: levelInfo.totalXp,
      level: levelInfo.level,
      isYou: true,
    },
    ...friends.map((friend) => {
      const friendLevel = computeLevelInfo(friend.xp);
      return {
        id: friend.id,
        name: friend.name,
        xp: friend.xp,
        level: friendLevel.level,
        isYou: false,
      };
    }),
  ];

  entries.sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));

  if (el.communityLeaderboardMeta) {
    el.communityLeaderboardMeta.textContent = `${entries.length} players • All-time XP`;
  }

  el.communityLeaderboardList.innerHTML = "";
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const rank = i + 1;
    const row = document.createElement("div");
    row.className = "leaderboardRow";
    if (entry.isYou) row.classList.add("is-you");

    const left = document.createElement("div");
    const label = document.createElement("div");
    label.className = "leaderboardLabel";
    label.textContent = `${rank}. ${entry.name}${entry.isYou ? " (you)" : ""}`;

    const meta = document.createElement("div");
    meta.className = "leaderboardMeta";
    meta.textContent = `Level ${entry.level} • ${formatXp(entry.xp)} XP`;

    left.appendChild(label);
    left.appendChild(meta);

    const delta = document.createElement("div");
    delta.className = "leaderboardDelta is-flat";
    delta.textContent = `#${rank}`;

    row.appendChild(left);
    row.appendChild(delta);
    el.communityLeaderboardList.appendChild(row);
  }
}

function refreshProgressionUI(levelSnapshot) {
  const snapshot = levelSnapshot ?? computeAllTimeXp();
  renderLevelSystem(snapshot);
  renderProfileCommunity(snapshot);
  renderCommunityLeaderboard(snapshot);
  renderAllTimeStats(snapshot);
  return snapshot;
}

let progressRefreshTimer = null;
function scheduleProgressRefresh(delay = 180) {
  if (progressRefreshTimer) window.clearTimeout(progressRefreshTimer);
  progressRefreshTimer = window.setTimeout(() => {
    progressRefreshTimer = null;
    renderSummary();
    refreshProgressionUI();
    renderLeaderboard();
    renderAutoInsights();
    scheduleChartsRefresh();
    scheduleMultiplayerSync();
  }, delay);
}

let voltarisServerStatus = {
  state: "unknown",
  message: "AI offline",
  checkedAt: 0,
  checking: false,
};

function voltarisHealthUrl(apiUrl) {
  const url = (apiUrl ?? "").trim();
  if (!url) return "";
  if (url.endsWith("/api/voltaris")) return url.replace("/api/voltaris", "/health");
  if (url.endsWith("/")) return `${url}health`;
  return `${url}/health`;
}

async function checkVoltarisServer({ force = false } = {}) {
  const now = Date.now();
  if (!force && now - voltarisServerStatus.checkedAt < 20000) return voltarisServerStatus;
  const apiUrl = uiState.voltarisApiUrl;
  const healthUrl = voltarisHealthUrl(apiUrl);
  if (!healthUrl) {
    voltarisServerStatus = { state: "offline", message: "Missing API URL", checkedAt: now, checking: false };
    return voltarisServerStatus;
  }

  voltarisServerStatus = { ...voltarisServerStatus, checking: true };
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3000);
    const response = await fetch(healthUrl, { signal: controller.signal });
    window.clearTimeout(timeout);
    if (!response.ok) {
      voltarisServerStatus = { state: "offline", message: "AI offline", checkedAt: now, checking: false };
      return voltarisServerStatus;
    }
    const data = await response.json();
    const model = data?.model ? `(${data.model})` : "";
    voltarisServerStatus = { state: "online", message: `AI online ${model}`.trim(), checkedAt: now, checking: false };
    return voltarisServerStatus;
  } catch {
    voltarisServerStatus = { state: "offline", message: "AI offline", checkedAt: now, checking: false };
    return voltarisServerStatus;
  }
}

function getVoltarisState() {
  state.voltaris = normalizeVoltarisState(state.voltaris);
  return state.voltaris;
}

function voltarisSave({ render = false } = {}) {
  const voltaris = getVoltarisState();
  voltaris.lastUpdatedAt = Date.now();
  saveState(state);
  if (render) renderVoltaris();
}

function voltarisPushMessage(role, text, { render = true } = {}) {
  const voltaris = getVoltarisState();
  const normalized = normalizeVoltarisMessage({ role, text, ts: Date.now() });
  if (!normalized) return null;
  voltaris.messages.push(normalized);
  voltaris.messages = voltaris.messages.slice(-VOLTARIS_MAX_MESSAGES);
  voltarisSave({ render });
  return normalized;
}

function voltarisSetFlow(step, draftUpdates = {}, modeOverride = null) {
  const voltaris = getVoltarisState();
  const nextMode = modeOverride === null ? voltaris.flow.mode : modeOverride;
  const draft = createVoltarisDraft({ ...voltaris.flow.draft, ...draftUpdates });
  voltaris.flow = normalizeVoltarisFlow({ step, draft, mode: nextMode });
  voltarisSave();
  return voltaris.flow;
}

function voltarisUpdateMessage(id, text) {
  const voltaris = getVoltarisState();
  const target = voltaris.messages.find((msg) => msg.id === id);
  if (!target) return;
  target.text = text;
  voltarisSave({ render: true });
}

function resetVoltaris() {
  state.voltaris = defaultVoltarisState();
  saveState(state);
  renderVoltaris();
}

function computeVoltarisWeight(difficultyValue, minutesValue) {
  const difficulty = clamp(Math.round(safeNumber(difficultyValue)), 1, 5);
  const minutes = clamp(Math.round(safeNumber(minutesValue)), 5, 240);
  const difficultyScore = difficulty * 1.6;
  const durationUnits = Math.max(1, Math.round(minutes / 30));
  const durationScore = Math.min(3.4, durationUnits * 0.7);
  const raw = difficultyScore + durationScore - 1;
  return normalizeWeight(raw);
}

function buildVoltarisReason(difficulty, minutes, weight) {
  return `Difficulty ${difficulty}/5 • ${minutes} min • ${weight} pts`;
}

function parseVoltarisDifficulty(text) {
  const lower = String(text ?? "").trim().toLowerCase();
  const numeric = Math.round(safeNumber(lower));
  if (numeric >= 1 && numeric <= 5) return numeric;
  if (lower.includes("very hard") || lower.includes("extreme")) return 5;
  if (lower.includes("hard")) return 4;
  if (lower.includes("medium") || lower.includes("mid")) return 3;
  if (lower.includes("easy")) return 2;
  if (lower.includes("tiny") || lower.includes("light")) return 1;
  return 0;
}

function parseVoltarisDurationMinutes(text) {
  const lower = String(text ?? "").trim().toLowerCase();
  if (!lower) return 0;

  let total = 0;
  const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*h/);
  if (hourMatch) total += safeNumber(hourMatch[1]) * 60;
  const minuteMatch = lower.match(/(\d+(?:\.\d+)?)\s*m/);
  if (minuteMatch) total += safeNumber(minuteMatch[1]);
  if (total > 0) return Math.round(total);

  const numeric = safeNumber(lower.replace(/[^\d.]/g, ""));
  if (numeric <= 0) return 0;
  if (lower.includes("hour")) return Math.round(numeric * 60);
  return Math.round(numeric);
}

function parseVoltarisFrequency(text) {
  const lower = String(text ?? "").trim().toLowerCase();
  const day = activeDate.getDay();

  const presets = [
    { keys: ["weekdays", "weekday", "mon-fri"], label: "Weekdays", days: [1, 2, 3, 4, 5] },
    { keys: ["weekends", "weekend"], label: "Weekends", days: [0, 6] },
    { keys: ["mwf", "mon wed fri", "monday wednesday friday"], label: "Mon/Wed/Fri", days: [1, 3, 5] },
    { keys: ["tth", "tuethu", "tue thu", "tuesday thursday"], label: "Tue/Thu", days: [2, 4] },
    { keys: ["once", "today", "one time"], label: "Today only", days: [day] },
  ];

  for (const preset of presets) {
    if (preset.keys.some((key) => lower.includes(key))) {
      return { scheduleDays: preset.days, label: preset.label };
    }
  }

  return { scheduleDays: DAY_ORDER.slice(), label: "Daily" };
}

function parseVoltarisTimeBlock(text) {
  const lower = String(text ?? "").trim().toLowerCase();
  if (lower.includes("morning") || lower.includes("am")) return "morning";
  if (lower.includes("afternoon") || lower.includes("noon") || lower.includes("pm")) return "afternoon";
  if (lower.includes("evening") || lower.includes("night")) return "evening";
  return "any";
}

function getVoltarisCategories() {
  const base = new Set([
    "Mindset",
    "Health",
    "Fitness",
    "Study",
    "Work",
    "Finance",
    "Social",
    "Learning",
    "Discipline",
  ]);
  for (const task of state.tasks ?? []) {
    base.add(normalizeCategory(task.category));
  }
  return Array.from(base);
}

function parseVoltarisCategory(text) {
  const raw = normalizeCategory(text);
  if (!raw) return "Mindset";
  const lower = raw.toLowerCase();
  const known = getVoltarisCategories();
  const exact = known.find((cat) => cat.toLowerCase() === lower);
  if (exact) return exact;
  const partial = known.find((cat) => lower.includes(cat.toLowerCase()) || cat.toLowerCase().includes(lower));
  return partial ?? raw;
}

function hasTaskWithTitle(title) {
  const key = title.trim().toLowerCase();
  return (state.tasks ?? []).some((task) => task.title.trim().toLowerCase() === key);
}

function makeVoltarisPendingTask(config) {
  const difficulty = clamp(Math.round(safeNumber(config.difficulty ?? 3)), 1, 5);
  const minutes = clamp(Math.round(safeNumber(config.minutes ?? 30)), 5, 240);
  const weight = computeVoltarisWeight(difficulty, minutes);
  const scheduleDays = normalizeScheduleDays(config.scheduleDays);
  const frequencyLabel = config.frequencyLabel || formatScheduleDays(scheduleDays);
  const reason = config.reason || buildVoltarisReason(difficulty, minutes, weight);
  return normalizeVoltarisPendingTask({
    ...config,
    difficulty,
    minutes,
    weight,
    scheduleDays,
    frequencyLabel,
    reason,
  });
}

function voltarisUpsertPendingTask(config) {
  const voltaris = getVoltarisState();
  const pendingTask = makeVoltarisPendingTask(config);
  if (!pendingTask) return { status: "invalid" };

  if (hasTaskWithTitle(pendingTask.title)) {
    return { status: "exists", task: pendingTask };
  }

  const key = pendingTask.title.toLowerCase();
  const existingIndex = voltaris.pendingTasks.findIndex((task) => task.title.trim().toLowerCase() === key);
  if (existingIndex >= 0) {
    const existing = voltaris.pendingTasks[existingIndex];
    voltaris.pendingTasks[existingIndex] = {
      ...pendingTask,
      id: existing.id,
      createdAt: existing.createdAt,
    };
  } else {
    voltaris.pendingTasks.unshift(pendingTask);
  }

  voltaris.pendingTasks = voltaris.pendingTasks.slice(0, VOLTARIS_MAX_PENDING);
  voltarisSave();
  return { status: existingIndex >= 0 ? "updated" : "added", task: pendingTask };
}

function voltarisQueueDraftTask() {
  const voltaris = getVoltarisState();
  const draft = voltaris.flow.draft;
  if (!draft.title.trim()) {
    voltarisPushMessage("ai", "Give the habit a clear name first.");
    return;
  }
  const result = voltarisUpsertPendingTask({
    title: draft.title,
    desc: draft.desc,
    category: draft.category,
    difficulty: draft.difficulty,
    minutes: draft.minutes,
    timeBlock: draft.timeBlock,
    scheduleDays: draft.scheduleDays,
    frequencyLabel: draft.frequencyLabel,
  });

  if (result.status === "exists") {
    voltarisPushMessage("ai", `You already have “${draft.title}”. Try a different name.`);
    return;
  }

  const scheduleLabel = result.task.frequencyLabel;
  voltarisPushMessage(
    "ai",
    `Queued: ${result.task.title} (${scheduleLabel}, ${formatTimeBlock(result.task.timeBlock)}, ${result.task.weight} pts).`
  );
  voltarisSetFlow("idle", createVoltarisDraft(), "");
}

function voltarisRemovePendingTask(id) {
  const voltaris = getVoltarisState();
  voltaris.pendingTasks = voltaris.pendingTasks.filter((task) => task.id !== id);
  voltarisSave({ render: true });
}

function voltarisApplyPendingTasks(taskIds = null) {
  const voltaris = getVoltarisState();
  const startDate = toISODate(activeDate);
  const pending = Array.isArray(voltaris.pendingTasks) ? voltaris.pendingTasks : [];
  const targets = taskIds
    ? pending.filter((task) => taskIds.includes(task.id))
    : pending.slice();

  if (targets.length === 0) {
    voltarisPushMessage("ai", "No pending tasks yet. Build one first.");
    return;
  }

  let added = 0;
  let skipped = 0;
  for (const pendingTask of targets) {
    if (hasTaskWithTitle(pendingTask.title)) {
      skipped += 1;
      continue;
    }
    const newTask = normalizeTask({
      id: crypto.randomUUID(),
      title: pendingTask.title,
      desc: pendingTask.desc,
      category: pendingTask.category,
      weight: pendingTask.weight,
      timeBlock: pendingTask.timeBlock,
      scheduleDays: pendingTask.scheduleDays,
      startDate,
    });
    state.tasks.unshift(newTask);
    added += 1;
  }

  if (added === 0) {
    voltarisPushMessage("ai", "Those tasks already exist. I didn’t add duplicates.");
    return;
  }

  const remainingIds = new Set(targets.map((task) => task.id));
  voltaris.pendingTasks = pending.filter((task) => !remainingIds.has(task.id));
  normalizeAllDaysToTasks();
  voltarisSave();
  render();

  const skippedNote = skipped > 0 ? ` Skipped ${skipped} duplicate${skipped > 1 ? "s" : ""}.` : "";
  voltarisPushMessage("ai", `Added ${added} habit${added > 1 ? "s" : ""} starting ${startDate}.${skippedNote}`);
}

function voltarisSuggestRoutine() {
  const voltaris = getVoltarisState();
  const studyTarget = safeNumber(state.goals?.studyDaily);
  const sleepTarget = safeNumber(state.goals?.sleepDaily);

  const routineTemplates = [
    {
      title: "Morning ignition ritual",
      desc: "Water, plan, and lock the MIT before distractions.",
      category: "Mindset",
      difficulty: 2,
      minutes: 20,
      timeBlock: "morning",
      scheduleDays: DAY_ORDER.slice(),
      frequencyLabel: "Daily",
    },
    {
      title: studyTarget >= 6 ? "Deep work block (90m)" : "Deep work block (60m)",
      desc: "Single-task your hardest priority.",
      category: "Study",
      difficulty: 4,
      minutes: studyTarget >= 6 ? 90 : 60,
      timeBlock: "morning",
      scheduleDays: [1, 2, 3, 4, 5],
      frequencyLabel: "Weekdays",
    },
    {
      title: "Skill compounding",
      desc: "Deliberate practice on the skill that pays.",
      category: "Learning",
      difficulty: 3,
      minutes: studyTarget >= 6 ? 75 : 45,
      timeBlock: "afternoon",
      scheduleDays: [1, 2, 3, 4, 5],
      frequencyLabel: "Weekdays",
    },
    {
      title: "Training session",
      desc: "Gym or hard movement. Keep it intense and short.",
      category: "Fitness",
      difficulty: 4,
      minutes: 60,
      timeBlock: "evening",
      scheduleDays: [1, 3, 5, 6],
      frequencyLabel: "4x / week",
    },
    {
      title: sleepTarget >= 8 ? "Evening shutdown + sleep prep" : "Evening review + shutdown",
      desc: "Review the day, set tomorrow, and protect sleep.",
      category: "Mindset",
      difficulty: 2,
      minutes: 20,
      timeBlock: "evening",
      scheduleDays: DAY_ORDER.slice(),
      frequencyLabel: "Daily",
    },
  ];

  let added = 0;
  let updated = 0;
  let exists = 0;
  for (const template of routineTemplates) {
    const result = voltarisUpsertPendingTask(template);
    if (result.status === "added") added += 1;
    else if (result.status === "updated") updated += 1;
    else if (result.status === "exists") exists += 1;
  }

  const parts = [];
  if (added) parts.push(`queued ${added} new`);
  if (updated) parts.push(`updated ${updated}`);
  if (exists) parts.push(`${exists} already existed`);
  const summary = parts.length ? parts.join(", ") : "nothing changed";
  voltarisPushMessage(
    "ai",
    `Routine blueprint ready — ${summary}. Review the pending list, then add them when you’re ready.`
  );
}

function voltarisStartHabitFlow(prefillTitle = "") {
  const title = typeof prefillTitle === "string" ? prefillTitle.trim() : "";
  voltarisSetFlow("ask_title", { title }, "habit");
  if (title) {
    voltarisPushMessage("ai", `Great. I’ll use “${title}”. What category should it live in?`);
    voltarisSetFlow("ask_category");
    return;
  }
  voltarisPushMessage("ai", "Let’s build a habit. What should we call it?");
}

function voltarisConfirmDraftMessage(draft) {
  const weight = computeVoltarisWeight(draft.difficulty, draft.minutes);
  const scheduleLabel = draft.frequencyLabel || formatScheduleDays(draft.scheduleDays);
  return [
    `Here’s the build:`,
    `${draft.title} — ${draft.category}`,
    `${scheduleLabel} • ${formatTimeBlock(draft.timeBlock)}`,
    `${draft.minutes} min • difficulty ${draft.difficulty}/5 • ${weight} pts`,
    "Type “add” to queue it, or “cancel”.",
  ].join("\n");
}

function voltarisHandleFlowInput(text) {
  const voltaris = getVoltarisState();
  const flow = voltaris.flow;
  const draft = flow.draft;
  const lower = text.trim().toLowerCase();

  if (flow.step === "confirm") {
    if (["add", "yes", "confirm", "queue"].some((word) => lower.includes(word))) {
      voltarisQueueDraftTask();
      return;
    }
    if (["cancel", "stop", "no"].some((word) => lower.includes(word))) {
      voltarisSetFlow("idle", createVoltarisDraft(), "");
      voltarisPushMessage("ai", "Cancelled. If you want, we can try again with a new habit.");
      return;
    }
    voltarisPushMessage("ai", "Type “add” to queue it, or “cancel”.");
    return;
  }

  if (flow.step === "ask_title") {
    const title = text.trim();
    if (!title) {
      voltarisPushMessage("ai", "Give it a short, clear name.");
      return;
    }
    voltarisSetFlow("ask_category", { title });
    voltarisPushMessage("ai", "Nice. What category fits best? (e.g., Study, Fitness, Mindset)");
    return;
  }

  if (flow.step === "ask_category") {
    const category = parseVoltarisCategory(text);
    voltarisSetFlow("ask_frequency", { category });
    voltarisPushMessage("ai", "How often should it happen? (daily, weekdays, mwf, weekends, or once)");
    return;
  }

  if (flow.step === "ask_frequency") {
    const freq = parseVoltarisFrequency(text);
    voltarisSetFlow("ask_difficulty", {
      scheduleDays: freq.scheduleDays,
      frequencyLabel: freq.label,
    });
    voltarisPushMessage("ai", "How hard is it on a 1-5 scale?");
    return;
  }

  if (flow.step === "ask_difficulty") {
    const difficulty = parseVoltarisDifficulty(text);
    if (!difficulty) {
      voltarisPushMessage("ai", "Give me a number 1-5 (or say easy, medium, hard).");
      return;
    }
    voltarisSetFlow("ask_duration", { difficulty });
    voltarisPushMessage("ai", "How long does it take? (minutes or hours)");
    return;
  }

  if (flow.step === "ask_duration") {
    const minutes = parseVoltarisDurationMinutes(text);
    if (!minutes) {
      voltarisPushMessage("ai", "Give me a duration like 20, 45m, or 1.5h.");
      return;
    }
    voltarisSetFlow("ask_block", { minutes });
    voltarisPushMessage("ai", "When should it happen? (morning, afternoon, evening, or any)");
    return;
  }

  if (flow.step === "ask_block") {
    const timeBlock = parseVoltarisTimeBlock(text);
    const nextFlow = voltarisSetFlow("confirm", { timeBlock });
    voltarisPushMessage("ai", voltarisConfirmDraftMessage(nextFlow.draft));
    return;
  }
}

function voltarisHandleIdleInput(text) {
  const lower = text.trim().toLowerCase();
  if (!lower) return;

  const wantsRoutine = ["routine", "plan my day", "blueprint", "template"].some((key) => lower.includes(key));
  if (wantsRoutine) {
    voltarisSuggestRoutine();
    return;
  }

  const wantsHabit = ["habit", "task", "build", "add"].some((key) => lower.includes(key));
  if (wantsHabit) {
    const titleHint = text.replace(/add|habit|task|build/gi, "").trim();
    voltarisStartHabitFlow(titleHint);
    return;
  }

  if (lower.includes("help")) {
    voltarisPushMessage(
      "ai",
      "Say “build a habit” or tap the buttons. I’ll ask difficulty and duration, then score it for you."
    );
    return;
  }

  voltarisPushMessage(
    "ai",
    "I can build habits and routines for you. Try “build a habit” or “plan a routine”."
  );
}

function buildVoltarisContext() {
  const iso = toISODate(activeDate);
  const rec = getDayRecord(iso);
  const voltaris = getVoltarisState();
  const dueTasks = getDueTasksForDate(activeDate);
  const completion = computeCompletionForTasks(rec, dueTasks).pct;
  const score = computeScoreForTasks(rec, dueTasks).pct;
  const focusMinutes = computeFocusMinutesForDay(rec);
  const sleepTarget = safeNumber(state.goals?.sleepDaily);
  const sleepScore = computeSleepScore(rec.checkin?.sleep, sleepTarget);
  const studyHours = safeNumber(rec.studyHours);
  const earnings = safeNumber(rec.earnings);
  const streak = computeStreakFrom(activeDate);
  const mit = rec.mit?.text?.trim() || "Not set";
  const intention = rec.intention?.trim() || "Not set";

  const memory = voltaris.memory.slice(0, 10).map((item) => `- ${item.text}`).join("\n");
  const todayCheckin = voltaris.checkins?.[iso] ?? null;
  const lastPlan = voltaris.plans?.[0];

  const tasks = (state.tasks ?? [])
    .slice(0, 18)
    .map((task) => {
      const start = normalizeStartDate(task.startDate);
      const startLabel = start ? `start ${start}` : "start: none";
      const schedule = formatScheduleDays(task.scheduleDays);
      return `- ${task.title} (${normalizeCategory(task.category)}, ${normalizeWeight(task.weight)} pts, ${schedule}, ${formatTimeBlock(task.timeBlock)}, ${startLabel})`;
    })
    .join("\\n");

  return [
    `Date: ${iso}`,
    `Goals: study ${safeNumber(state.goals?.studyDaily)}h, earnings ${currency(state.goals?.earningsDaily)}, sleep ${sleepTarget}h`,
    `Today: completion ${completion}%, score ${score}%, focus ${focusMinutes} min, study ${studyHours}h, earnings ${currency(earnings)}, sleep score ${sleepScore.score}%`,
    `Streak: ${streak} days`,
    `MIT: ${mit}`,
    `Intention: ${intention}`,
    todayCheckin
      ? `Check-in: focus "${todayCheckin.focus}", obstacle "${todayCheckin.obstacle}", win "${todayCheckin.win}", mood ${todayCheckin.mood}/5, energy ${todayCheckin.energy}/5`
      : "Check-in: not provided yet",
    memory ? `Memory:\\n${memory}` : "Memory: none",
    lastPlan ? `Last plan: ${lastPlan.title} (${lastPlan.steps.length} steps)` : "Last plan: none",
    `Top habits:\\n${tasks}`,
  ].join("\\n");
}

function buildVoltarisHistory() {
  const voltaris = getVoltarisState();
  const history = voltaris.messages.slice(-12).map((msg) => ({
    role: msg.role === "ai" ? "assistant" : "user",
    text: msg.text,
  }));
  return history;
}

async function callVoltarisAI(message, options = {}) {
  const apiUrl = uiState.voltarisApiUrl;
  const history = options.history ?? buildVoltarisHistory();
  const context = options.context ?? (uiState.voltarisContextEnabled ? buildVoltarisContext() : "");

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history,
    context,
  }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = data?.error || "Voltaris server error";
    throw new Error(error);
  }
  const data = await response.json();
  return data.reply || "I have a suggestion if you want it.";
}

async function sendVoltarisMessage(text) {
  const content = String(text ?? "").trim();
  if (!content) return;
  voltarisPushMessage("user", content, { render: false });

  if (uiState.voltarisAiEnabled) {
    await checkVoltarisServer({ force: false });
    if (voltarisServerStatus.state !== "online") {
      voltarisPushMessage("ai", "AI is offline. Check the server and try again.");
      return;
    }
    const placeholder = voltarisPushMessage("ai", "Thinking...", { render: true });
    try {
      const reply = await callVoltarisAI(content);
      if (placeholder) {
        voltarisUpdateMessage(placeholder.id, reply);
      } else {
        voltarisPushMessage("ai", reply);
      }
      if (uiState.voltarisAutoMemory) {
        await extractMemoryFromText(reply);
      }
    } catch (error) {
      const msg = error?.message || "Voltaris AI failed to respond.";
      if (placeholder) {
        voltarisUpdateMessage(placeholder.id, msg);
      } else {
        voltarisPushMessage("ai", msg);
      }
    }
    return;
  }

  const voltaris = getVoltarisState();
  if (voltaris.flow.step !== "idle") {
    voltarisHandleFlowInput(content);
  } else {
    voltarisHandleIdleInput(content);
  }
  renderVoltaris();
}

async function handleVoltarisSend() {
  if (!el.voltarisInput) return;
  const text = (el.voltarisInput.value ?? "").trim();
  if (!text) return;
  el.voltarisInput.value = "";
  await sendVoltarisMessage(text);
}

async function handleVoltarisDockSend() {
  if (!el.voltarisDockInput) return;
  const text = (el.voltarisDockInput.value ?? "").trim();
  if (!text) return;
  el.voltarisDockInput.value = "";
  await sendVoltarisMessage(text);
}

function renderVoltarisMessages(voltaris) {
  if (!el.voltarisChatLog) return;
  el.voltarisChatLog.innerHTML = "";
  for (const message of voltaris.messages) {
    const row = document.createElement("div");
    row.className = `voltarisMsg voltarisMsg--${message.role}`;
    const bubble = document.createElement("div");
    bubble.className = "voltarisBubble";
    bubble.textContent = message.text;
    row.appendChild(bubble);
    el.voltarisChatLog.appendChild(row);
  }
  el.voltarisChatLog.scrollTop = el.voltarisChatLog.scrollHeight;
}

function renderVoltarisPending(voltaris) {
  if (!el.voltarisPendingList || !el.voltarisPendingMeta) return;
  const pending = Array.isArray(voltaris.pendingTasks) ? voltaris.pendingTasks : [];
  el.voltarisPendingList.innerHTML = "";

  if (el.voltarisAddPendingBtn) {
    el.voltarisAddPendingBtn.disabled = pending.length === 0;
  }

  if (pending.length === 0) {
    el.voltarisPendingMeta.textContent = "No pending habits";
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "Voltaris will queue habits here before adding them.";
    el.voltarisPendingList.appendChild(empty);
    return;
  }

  const startDate = toISODate(activeDate);
  el.voltarisPendingMeta.textContent = `${pending.length} pending • starts ${startDate}`;

  for (const task of pending) {
    const item = document.createElement("div");
    item.className = "item";

    const top = document.createElement("div");
    top.className = "item__top";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = task.title;

    const actions = document.createElement("div");
    actions.className = "item__actions";

    const addBtn = document.createElement("button");
    addBtn.className = "smallBtn";
    addBtn.type = "button";
    addBtn.textContent = "Add";
    addBtn.addEventListener("click", () => {
      voltarisApplyPendingTasks([task.id]);
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "smallBtn";
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      voltarisRemovePendingTask(task.id);
    });

    actions.appendChild(addBtn);
    actions.appendChild(removeBtn);

    top.appendChild(title);
    top.appendChild(actions);

    const meta = document.createElement("div");
    meta.className = "item__meta";
    meta.textContent = `${task.category} • ${task.frequencyLabel} • ${formatTimeBlock(task.timeBlock)} • ${task.weight} pts`;

    const hint = document.createElement("div");
    hint.className = "muted";
    hint.style.marginTop = "6px";
    hint.textContent = task.reason;

    item.appendChild(top);
    item.appendChild(meta);
    item.appendChild(hint);
    el.voltarisPendingList.appendChild(item);
  }
}

function getVoltarisCheckin(iso) {
  const voltaris = getVoltarisState();
  const checkins = voltaris.checkins ?? {};
  return checkins[iso] ?? null;
}

function saveVoltarisCheckin(iso, data) {
  const voltaris = getVoltarisState();
  voltaris.checkins = normalizeVoltarisCheckins({
    ...(voltaris.checkins ?? {}),
    [iso]: normalizeVoltarisCheckin({ ...data, createdAt: Date.now() }),
  });
  voltarisSave();
}

function clearVoltarisCheckin(iso) {
  const voltaris = getVoltarisState();
  if (!voltaris.checkins?.[iso]) return;
  delete voltaris.checkins[iso];
  voltarisSave();
}

function renderVoltarisCheckin(voltaris) {
  if (!el.voltarisCheckinFocus || !el.voltarisCheckinMeta) return;
  const iso = toISODate(activeDate);
  const entry = voltaris.checkins?.[iso] ?? null;

  if (el.voltarisCheckinFocus && document.activeElement !== el.voltarisCheckinFocus) {
    el.voltarisCheckinFocus.value = entry?.focus ?? "";
  }
  if (el.voltarisCheckinObstacle && document.activeElement !== el.voltarisCheckinObstacle) {
    el.voltarisCheckinObstacle.value = entry?.obstacle ?? "";
  }
  if (el.voltarisCheckinWin && document.activeElement !== el.voltarisCheckinWin) {
    el.voltarisCheckinWin.value = entry?.win ?? "";
  }
  if (el.voltarisCheckinNotes && document.activeElement !== el.voltarisCheckinNotes) {
    el.voltarisCheckinNotes.value = entry?.notes ?? "";
  }
  if (el.voltarisCheckinMood && document.activeElement !== el.voltarisCheckinMood) {
    el.voltarisCheckinMood.value = String(entry?.mood ?? 0);
  }
  if (el.voltarisCheckinEnergy && document.activeElement !== el.voltarisCheckinEnergy) {
    el.voltarisCheckinEnergy.value = String(entry?.energy ?? 0);
  }
  if (el.voltarisCheckinMoodLabel) el.voltarisCheckinMoodLabel.textContent = String(entry?.mood ?? 0);
  if (el.voltarisCheckinEnergyLabel) el.voltarisCheckinEnergyLabel.textContent = String(entry?.energy ?? 0);

  if (el.voltarisCheckinMeta) {
    el.voltarisCheckinMeta.textContent = entry?.createdAt
      ? `Saved ${formatShortDate(new Date(entry.createdAt))}`
      : "Not saved";
  }
}

function addVoltarisMemory(text) {
  const voltaris = getVoltarisState();
  const memoryItem = normalizeVoltarisMemoryItem({ text });
  if (!memoryItem) return;
  voltaris.memory = normalizeVoltarisMemory([memoryItem, ...(voltaris.memory ?? [])]);
  voltarisSave({ render: true });
}

function removeVoltarisMemory(id) {
  const voltaris = getVoltarisState();
  voltaris.memory = (voltaris.memory ?? []).filter((item) => item.id !== id);
  voltarisSave({ render: true });
}

function renderVoltarisMemory(voltaris) {
  if (!el.voltarisMemoryList) return;
  el.voltarisMemoryList.innerHTML = "";
  const memory = voltaris.memory ?? [];
  if (memory.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "No memory saved yet.";
    el.voltarisMemoryList.appendChild(empty);
    return;
  }

  for (const item of memory) {
    const row = document.createElement("div");
    row.className = "item";

    const top = document.createElement("div");
    top.className = "item__top";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = item.text;

    const actions = document.createElement("div");
    actions.className = "item__actions";
    const del = document.createElement("button");
    del.className = "smallBtn";
    del.type = "button";
    del.textContent = "Remove";
    del.addEventListener("click", () => removeVoltarisMemory(item.id));
    actions.appendChild(del);

    top.appendChild(title);
    top.appendChild(actions);
    row.appendChild(top);
    el.voltarisMemoryList.appendChild(row);
  }
}

function parsePlanStepsFromText(text) {
  if (!text) return { title: "Action plan", steps: [] };
  const lines = text.split("\\n").map((line) => line.trim()).filter(Boolean);
  let title = "";
  let stepLines = lines;

  if (lines.length && !/^[-*\\d]/.test(lines[0])) {
    title = lines[0];
    stepLines = lines.slice(1);
  }

  const steps = [];
  for (const line of stepLines) {
    const cleaned = line.replace(/^[-*\\d.\\)]+\\s*/, "");
    if (cleaned) steps.push(cleaned);
  }

  if (steps.length === 0) {
    const fallback = text
      .split(/[.!?]/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 6);
    steps.push(...fallback);
  }

  return {
    title: title || "Action plan",
    steps: steps.slice(0, 7),
  };
}

function parseMemoryItems(text) {
  if (!text) return [];
  const lines = text
    .split("\\n")
    .map((line) => line.replace(/^[-*•\\d.]+\\s*/, "").trim())
    .filter(Boolean);
  return lines.slice(0, 3);
}

async function extractMemoryFromText(sourceText) {
  if (!sourceText || !uiState.voltarisAiEnabled) return;
  await checkVoltarisServer({ force: false });
  if (voltarisServerStatus.state !== "online") return;

  try {
    const reply = await callVoltarisAI(
      `Extract 1-3 concise long-term memory items from this message. Use bullet points only.\\n\\nMessage:\\n${sourceText}`,
      { context: "", history: [] }
    );
    const items = parseMemoryItems(reply);
    if (!items.length) return;
    items.forEach((item) => addVoltarisMemory(item));
    voltarisPushMessage("ai", `Saved ${items.length} memory item${items.length > 1 ? "s" : ""}.`);
  } catch {
    // ignore extraction errors
  }
}

function getLastVoltarisAiMessageText() {
  const voltaris = getVoltarisState();
  for (let i = voltaris.messages.length - 1; i >= 0; i -= 1) {
    const msg = voltaris.messages[i];
    if (msg.role === "ai" && msg.text) return msg.text;
  }
  return "";
}

function createLocalActionPlan(prompt) {
  const base = String(prompt ?? "").trim();
  const title = base ? `Plan: ${base.slice(0, 60)}` : "Action plan";
  const steps = [
    "Define the exact outcome you want in one sentence.",
    "List the 3 most important actions that move the needle.",
    "Choose the easiest first step and do it within 24 hours.",
    "Block time on your calendar for the next two steps.",
    "Review progress nightly and adjust tomorrow’s focus.",
  ];
  return { title, steps };
}

function addVoltarisPlan(plan, sourceText = "") {
  const voltaris = getVoltarisState();
  const normalized = normalizeVoltarisPlan({
    title: plan.title,
    steps: plan.steps,
    source: sourceText,
  });
  if (!normalized) return null;
  voltaris.plans = normalizeVoltarisPlans([normalized, ...(voltaris.plans ?? [])]);
  voltarisSave({ render: true });
  return normalized;
}

function createLocalDailyCoach() {
  const iso = toISODate(activeDate);
  const rec = getDayRecord(iso);
  const focus = rec.mit?.text?.trim() || "your MIT";
  const sleepTarget = safeNumber(state.goals?.sleepDaily);
  const sleepScore = computeSleepScore(rec.checkin?.sleep, sleepTarget);
  return [
    "Here’s your daily focus:",
    `1. Lock the MIT: ${focus}.`,
    "2. Protect one deep work block (60-90m).",
    "3. Finish a small win before noon to build momentum.",
    `4. Sleep score today: ${sleepScore.score}%. Adjust tonight if needed.`,
  ].join("\\n");
}

function createLocalWeeklyReview() {
  const review = computeWeeklyReview(activeDate);
  const items = buildReviewItems(review);
  const wins = items.wins.slice(0, 3).map((item) => `- ${item}`).join("\\n") || "- No wins logged yet.";
  const misses = items.misses.slice(0, 3).map((item) => `- ${item}`).join("\\n") || "- No misses yet.";
  const focus = items.focus.slice(0, 3).map((item) => `- ${item}`).join("\\n") || "- Pick 1-3 habits to push.";
  return [
    "Weekly Review Summary",
    "Wins:",
    wins,
    "Needs attention:",
    misses,
    "Next week focus:",
    focus,
  ].join("\\n");
}

async function generateDailyCoach() {
  if (uiState.voltarisAiEnabled) {
    await checkVoltarisServer({ force: false });
    if (voltarisServerStatus.state === "online") {
      const placeholder = voltarisPushMessage("ai", "Generating daily coaching...", { render: true });
      try {
        const reply = await callVoltarisAI("Give me a concise daily coaching plan based on my context.");
        if (placeholder) {
          voltarisUpdateMessage(placeholder.id, reply);
        } else {
          voltarisPushMessage("ai", reply);
        }
        if (uiState.voltarisAutoMemory) await extractMemoryFromText(reply);
        return;
      } catch (error) {
        const msg = error?.message || "Daily coaching failed.";
        if (placeholder) {
          voltarisUpdateMessage(placeholder.id, msg);
        } else {
          voltarisPushMessage("ai", msg);
        }
      }
    }
  }

  voltarisPushMessage("ai", createLocalDailyCoach());
}

async function generateWeeklyReview() {
  if (uiState.voltarisAiEnabled) {
    await checkVoltarisServer({ force: false });
    if (voltarisServerStatus.state === "online") {
      const placeholder = voltarisPushMessage("ai", "Generating weekly review...", { render: true });
      try {
        const reply = await callVoltarisAI("Generate a concise weekly review with wins, misses, and focus.");
        if (placeholder) {
          voltarisUpdateMessage(placeholder.id, reply);
        } else {
          voltarisPushMessage("ai", reply);
        }
        if (uiState.voltarisAutoMemory) await extractMemoryFromText(reply);
        return;
      } catch (error) {
        const msg = error?.message || "Weekly review failed.";
        if (placeholder) {
          voltarisUpdateMessage(placeholder.id, msg);
        } else {
          voltarisPushMessage("ai", msg);
        }
      }
    }
  }

  voltarisPushMessage("ai", createLocalWeeklyReview());
}

async function generateVoltarisPlan() {
  const prompt = (el.voltarisPlanInput?.value ?? "").trim();
  if (!prompt) {
    voltarisPushMessage("ai", "Add a situation or goal first.");
    return;
  }

  if (uiState.voltarisAiEnabled) {
    await checkVoltarisServer({ force: false });
    if (voltarisServerStatus.state !== "online") {
      voltarisPushMessage("ai", "AI is offline. Using a local plan instead.");
      const plan = createLocalActionPlan(prompt);
      addVoltarisPlan(plan, prompt);
      return;
    }

    const placeholder = voltarisPushMessage("ai", "Generating your plan...", { render: true });
    try {
      const reply = await callVoltarisAI(
        `Create a concise action plan for: ${prompt}. Format: Title on first line, then 3-7 bullet steps.`
      );
      const parsed = parsePlanStepsFromText(reply);
      const plan = addVoltarisPlan(parsed, prompt);
      const summary = plan ? `Plan ready: ${plan.title}` : "Plan ready.";
      if (placeholder) {
        voltarisUpdateMessage(placeholder.id, summary);
      } else {
        voltarisPushMessage("ai", summary);
      }
    } catch (error) {
      const msg = error?.message || "Plan generation failed.";
      if (placeholder) {
        voltarisUpdateMessage(placeholder.id, msg);
      } else {
        voltarisPushMessage("ai", msg);
      }
    }
    return;
  }

  const plan = createLocalActionPlan(prompt);
  addVoltarisPlan(plan, prompt);
  voltarisPushMessage("ai", `Plan ready: ${plan.title}`);
}

function addPlanStepsToObjectives(planId) {
  const voltaris = getVoltarisState();
  const plan = (voltaris.plans ?? []).find((p) => p.id === planId);
  if (!plan || plan.steps.length === 0) return;
  const deadline = toISODate(activeDate);
  for (const step of plan.steps) {
    state.objectives.unshift({
      id: crypto.randomUUID(),
      text: step,
      done: false,
      deadline,
    });
  }
  saveState(state);
  renderObjectives();
  voltarisPushMessage("ai", `Added ${plan.steps.length} steps to Objectives.`);
}

function renderVoltarisPlans(voltaris) {
  if (!el.voltarisPlanList || !el.voltarisPlanMeta) return;
  const plans = voltaris.plans ?? [];
  el.voltarisPlanList.innerHTML = "";
  if (plans.length === 0) {
    el.voltarisPlanMeta.textContent = "No plans yet";
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "Generate a plan to see it here.";
    el.voltarisPlanList.appendChild(empty);
    return;
  }
  el.voltarisPlanMeta.textContent = `${plans.length} saved`;

  for (const plan of plans.slice(0, 5)) {
    const item = document.createElement("div");
    item.className = "item";

    const top = document.createElement("div");
    top.className = "item__top";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = plan.title;

    const actions = document.createElement("div");
    actions.className = "item__actions";
    const addBtn = document.createElement("button");
    addBtn.className = "smallBtn";
    addBtn.type = "button";
    addBtn.textContent = "Add steps";
    addBtn.addEventListener("click", () => addPlanStepsToObjectives(plan.id));
    actions.appendChild(addBtn);

    top.appendChild(title);
    top.appendChild(actions);

    const steps = document.createElement("div");
    steps.className = "muted";
    steps.style.marginTop = "6px";
    steps.textContent = plan.steps.slice(0, 5).map((s) => `• ${s}`).join(" ");

    item.appendChild(top);
    item.appendChild(steps);
    el.voltarisPlanList.appendChild(item);
  }
}

function renderVoltaris() {
  const voltaris = getVoltarisState();
  if (el.voltarisApiInput && document.activeElement !== el.voltarisApiInput) {
    el.voltarisApiInput.value = uiState.voltarisApiUrl || "";
  }
  if (el.voltarisAiToggle) el.voltarisAiToggle.checked = Boolean(uiState.voltarisAiEnabled);
  if (el.voltarisContextToggle) el.voltarisContextToggle.checked = Boolean(uiState.voltarisContextEnabled);
  if (el.voltarisAutoMemoryToggle) el.voltarisAutoMemoryToggle.checked = Boolean(uiState.voltarisAutoMemory);

  if (el.voltarisStatus) {
    const statusText = voltarisServerStatus.checking ? "Checking..." : voltarisServerStatus.message;
    el.voltarisStatus.textContent = statusText;
  }
  if (el.voltarisDockStatus) {
    const statusText = voltarisServerStatus.checking ? "Checking..." : voltarisServerStatus.message;
    el.voltarisDockStatus.textContent = statusText;
  }
  renderVoltarisMessages(voltaris);
  renderVoltarisDock(voltaris);
  renderVoltarisPending(voltaris);
  renderVoltarisCheckin(voltaris);
  renderVoltarisPlans(voltaris);
  renderVoltarisMemory(voltaris);
}

function renderVoltarisDock(voltaris) {
  if (!el.voltarisDockLog) return;
  el.voltarisDockLog.innerHTML = "";
  for (const message of voltaris.messages) {
    const row = document.createElement("div");
    row.className = `voltarisMsg voltarisMsg--${message.role}`;
    const bubble = document.createElement("div");
    bubble.className = "voltarisBubble";
    bubble.textContent = message.text;
    row.appendChild(bubble);
    el.voltarisDockLog.appendChild(row);
  }
  el.voltarisDockLog.scrollTop = el.voltarisDockLog.scrollHeight;
}

function setVoltarisDockOpen(open) {
  if (!el.voltarisDockPanel) return;
  el.voltarisDockPanel.classList.toggle("is-open", open);
  el.voltarisDockPanel.setAttribute("aria-hidden", String(!open));
}

function parseAdminEmails(raw) {
  return String(raw ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getSupabaseConfig() {
  const url = (uiState.supabaseUrl ?? "").trim();
  const key = (uiState.supabaseKey ?? "").trim();
  if (!url || !key) return null;
  return { url, key };
}

async function initSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config || !window.supabase?.createClient) return null;
  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(config.url, config.key, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    supabaseClient.auth.onAuthStateChange((_event, session) => {
      multiplayerState.user = session?.user ?? null;
      updateMultiplayerStatus();
    });
  }
  return supabaseClient;
}

async function connectSupabase() {
  const client = await initSupabaseClient();
  if (!client) {
    multiplayerState.connected = false;
    updateMultiplayerStatus();
    return;
  }
  await loadSupabaseSession();
  await syncPublicStats();
  await loadGlobalLeaderboard();
  await loadAdminUsers();
  renderMultiplayer();
}

async function supabaseSignIn(email, password) {
  if (!supabaseClient) return;
  await supabaseClient.auth.signInWithPassword({ email, password });
  await loadSupabaseSession();
  await syncPublicStats();
  await loadGlobalLeaderboard();
  await loadAdminUsers();
}

async function supabaseSignUp(email, password) {
  if (!supabaseClient) return;
  await supabaseClient.auth.signUp({ email, password });
  await loadSupabaseSession();
  await syncPublicStats();
  await loadGlobalLeaderboard();
  await loadAdminUsers();
}

async function supabaseSignOut() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  multiplayerState.user = null;
  multiplayerState.role = "member";
  renderMultiplayer();
}

let multiplayerSyncTimer = null;
function scheduleMultiplayerSync(delay = 60000) {
  if (!uiState.supabaseAutoSync) return;
  if (multiplayerSyncTimer) window.clearTimeout(multiplayerSyncTimer);
  multiplayerSyncTimer = window.setTimeout(async () => {
    multiplayerSyncTimer = null;
    await syncPublicStats();
    await loadGlobalLeaderboard();
    await loadAdminUsers();
    renderMultiplayer();
  }, delay);
}

function updateMultiplayerStatus() {
  multiplayerState.connected = Boolean(supabaseClient);
  if (el.multiplayerStatus) {
    el.multiplayerStatus.textContent = multiplayerState.user
      ? `Connected as ${multiplayerState.user.email ?? "user"}`
      : multiplayerState.connected
        ? "Connected (not signed in)"
        : "Offline";
  }
  if (el.supabaseAuthMeta) {
    el.supabaseAuthMeta.textContent = multiplayerState.user
      ? `Signed in as ${multiplayerState.user.email ?? "user"} • role ${multiplayerState.role}`
      : "Not connected.";
  }
}

async function loadSupabaseSession() {
  if (!supabaseClient) return null;
  const { data } = await supabaseClient.auth.getSession();
  multiplayerState.user = data?.session?.user ?? null;
  return multiplayerState.user;
}

async function syncPublicStats() {
  if (!supabaseClient || !multiplayerState.user) return;
  const levelInfo = computeAllTimeXp();
  const streak = computeStreakFrom(activeDate);
  const adminEmails = parseAdminEmails(uiState.supabaseAdminEmails);
  const role = adminEmails.includes((multiplayerState.user.email ?? "").toLowerCase()) ? "admin" : "member";

  const payload = {
    id: multiplayerState.user.id,
    email: multiplayerState.user.email ?? "",
    display_name: state.profile?.username ?? "You",
    xp_total: levelInfo.totalXp,
    level: levelInfo.level,
    streak,
    role,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseClient.from("profiles").upsert(payload, { onConflict: "id" });
  if (!error) {
    multiplayerState.role = role;
    multiplayerState.lastSyncAt = Date.now();
  }
}

async function loadGlobalLeaderboard() {
  if (!supabaseClient) return;
  const { data } = await supabaseClient
    .from("profiles")
    .select("id, display_name, xp_total, level, streak, updated_at")
    .order("xp_total", { ascending: false })
    .limit(25);
  multiplayerState.leaderboard = Array.isArray(data) ? data : [];
}

async function loadAdminUsers() {
  if (!supabaseClient || multiplayerState.role !== "admin") return;
  const { data } = await supabaseClient
    .from("profiles")
    .select("id, email, display_name, xp_total, level, streak, updated_at, role")
    .order("updated_at", { ascending: false })
    .limit(50);
  multiplayerState.adminUsers = Array.isArray(data) ? data : [];
}

function renderMultiplayer() {
  if (el.supabaseUrlInput && document.activeElement !== el.supabaseUrlInput) {
    el.supabaseUrlInput.value = uiState.supabaseUrl ?? "";
  }
  if (el.supabaseKeyInput && document.activeElement !== el.supabaseKeyInput) {
    el.supabaseKeyInput.value = uiState.supabaseKey ?? "";
  }
  if (el.supabaseAdminEmails && document.activeElement !== el.supabaseAdminEmails) {
    el.supabaseAdminEmails.value = uiState.supabaseAdminEmails ?? "";
  }
  if (el.supabaseAutoSyncToggle) el.supabaseAutoSyncToggle.checked = Boolean(uiState.supabaseAutoSync);

  updateMultiplayerStatus();

  if (el.globalLeaderboardList) {
    el.globalLeaderboardList.innerHTML = "";
    if (!multiplayerState.leaderboard.length) {
      const empty = document.createElement("div");
      empty.className = "emptyState";
      empty.textContent = supabaseClient ? "No online stats yet." : "Connect Supabase to enable.";
      el.globalLeaderboardList.appendChild(empty);
    } else {
      multiplayerState.leaderboard.forEach((entry, index) => {
        const row = document.createElement("div");
        row.className = "leaderboardRow";
        const left = document.createElement("div");
        const label = document.createElement("div");
        label.className = "leaderboardLabel";
        label.textContent = `${index + 1}. ${entry.display_name || "Unknown"}`;
        const meta = document.createElement("div");
        meta.className = "leaderboardMeta";
        meta.textContent = `Level ${entry.level ?? 1} • ${formatXp(entry.xp_total ?? 0)} XP`;
        left.appendChild(label);
        left.appendChild(meta);
        const delta = document.createElement("div");
        delta.className = "leaderboardDelta is-flat";
        delta.textContent = `#${index + 1}`;
        row.appendChild(left);
        row.appendChild(delta);
        el.globalLeaderboardList.appendChild(row);
      });
    }
  }

  if (el.globalLeaderboardMeta) {
    el.globalLeaderboardMeta.textContent = supabaseClient
      ? `${multiplayerState.leaderboard.length || 0} players`
      : "Offline";
  }

  if (el.adminUserList) {
    el.adminUserList.innerHTML = "";
    if (multiplayerState.role !== "admin") {
      const empty = document.createElement("div");
      empty.className = "emptyState";
      empty.textContent = "Admin access required.";
      el.adminUserList.appendChild(empty);
    } else if (!multiplayerState.adminUsers.length) {
      const empty = document.createElement("div");
      empty.className = "emptyState";
      empty.textContent = "No users yet.";
      el.adminUserList.appendChild(empty);
    } else {
      multiplayerState.adminUsers.forEach((user) => {
        const item = document.createElement("div");
        item.className = "item";
        const top = document.createElement("div");
        top.className = "item__top";
        const title = document.createElement("div");
        title.className = "item__title";
        title.textContent = user.display_name || user.email || "Unknown";
        const actions = document.createElement("div");
        actions.className = "item__actions";
        const badge = document.createElement("span");
        badge.className = "pill";
        badge.textContent = user.role || "member";
        actions.appendChild(badge);
        top.appendChild(title);
        top.appendChild(actions);
        const meta = document.createElement("div");
        meta.className = "item__meta";
        meta.textContent = `Level ${user.level ?? 1} • ${formatXp(user.xp_total ?? 0)} XP • ${user.email ?? ""}`;
        item.appendChild(top);
        item.appendChild(meta);
        el.adminUserList.appendChild(item);
      });
    }
  }

  if (el.adminPanelMeta) {
    el.adminPanelMeta.textContent = multiplayerState.role === "admin" ? "Full access" : "Admins only";
  }
}

function buildPerfectDot(dateObj) {
  const iso = toISODate(dateObj);
  const dueTasks = getDueTasksForDate(dateObj);
  const dot = document.createElement("div");
  dot.className = "perfectDot";
  if (dueTasks.length === 0) {
    dot.classList.add("is-empty");
    dot.title = `${formatShortDate(dateObj)}: no tasks`;
    return dot;
  }
  const pct = computeDayCompletionPct(iso);
  if (pct === 100) {
    dot.classList.add("is-perfect");
  } else {
    dot.classList.add("is-miss");
  }
  dot.title = `${formatShortDate(dateObj)}: ${pct}%`;
  return dot;
}

function renderPerfectDays() {
  if (!el.perfectWeek || !el.perfectMonth || !el.perfectMonthLabel) return;

  const weekStart = startOfWeek(activeDate);
  el.perfectWeek.innerHTML = "";
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    el.perfectWeek.appendChild(buildPerfectDot(d));
  }

  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(activeDate);
  el.perfectMonthLabel.textContent = monthLabel;

  el.perfectMonth.innerHTML = "";
  const monthStart = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1);
  const monthEnd = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0);
  const startDay = monthStart.getDay();
  for (let i = 0; i < startDay; i += 1) {
    const spacer = document.createElement("div");
    spacer.className = "perfectSpacer";
    el.perfectMonth.appendChild(spacer);
  }
  for (let day = 1; day <= monthEnd.getDate(); day += 1) {
    const d = new Date(activeDate.getFullYear(), activeDate.getMonth(), day);
    el.perfectMonth.appendChild(buildPerfectDot(d));
  }
}

function renderAutoInsights() {
  if (!el.autoInsightsList) return;
  el.autoInsightsList.innerHTML = "";

  const entries = Object.entries(state.days)
    .map(([iso, rec]) => ({ iso, rec }))
    .filter(({ rec }) => rec);

  if (entries.length < 5) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "Log a few more days to unlock insights.";
    el.autoInsightsList.appendChild(empty);
    return;
  }

  const insights = [];
  const sleepTarget = safeNumber(state.goals?.sleepDaily);

  const avgCompletion = (predicate) => {
    let total = 0;
    let count = 0;
    for (const { iso, rec } of entries) {
      if (!predicate(rec, iso)) continue;
      const dueTasks = getDueTasksForDate(parseISODate(iso));
      if (dueTasks.length === 0) continue;
      total += computeDayCompletionPct(iso);
      count += 1;
    }
    if (count < 3) return null;
    return { avg: total / count, count };
  };

  if (sleepTarget > 0) {
    const onTarget = avgCompletion((rec) => safeNumber(rec.checkin?.sleep) >= sleepTarget);
    const below = avgCompletion((rec) => safeNumber(rec.checkin?.sleep) > 0 && safeNumber(rec.checkin?.sleep) < sleepTarget);
    if (onTarget && below) {
      insights.push({
        title: "Sleep on target boosts completion",
        delta: onTarget.avg - below.avg,
        meta: `${Math.round(onTarget.avg)}% vs ${Math.round(below.avg)}% (${onTarget.count}+${below.count} days)`,
      });
    }
  }

  const moodHigh = avgCompletion((rec) => safeNumber(rec.checkin?.mood) >= 4);
  const moodLow = avgCompletion((rec) => safeNumber(rec.checkin?.mood) > 0 && safeNumber(rec.checkin?.mood) <= 2);
  if (moodHigh && moodLow) {
    insights.push({
      title: "High mood days are stronger",
      delta: moodHigh.avg - moodLow.avg,
      meta: `${Math.round(moodHigh.avg)}% vs ${Math.round(moodLow.avg)}% (${moodHigh.count}+${moodLow.count} days)`,
    });
  }

  const energyHigh = avgCompletion((rec) => safeNumber(rec.checkin?.energy) >= 4);
  const energyLow = avgCompletion((rec) => safeNumber(rec.checkin?.energy) > 0 && safeNumber(rec.checkin?.energy) <= 2);
  if (energyHigh && energyLow) {
    insights.push({
      title: "Energy drives completion",
      delta: energyHigh.avg - energyLow.avg,
      meta: `${Math.round(energyHigh.avg)}% vs ${Math.round(energyLow.avg)}% (${energyHigh.count}+${energyLow.count} days)`,
    });
  }

  const focusHigh = avgCompletion((rec) => computeFocusMinutesForDay(rec) >= 60);
  const focusLow = avgCompletion((rec) => computeFocusMinutesForDay(rec) > 0 && computeFocusMinutesForDay(rec) < 30);
  if (focusHigh && focusLow) {
    insights.push({
      title: "60+ min focus lifts success",
      delta: focusHigh.avg - focusLow.avg,
      meta: `${Math.round(focusHigh.avg)}% vs ${Math.round(focusLow.avg)}% (${focusHigh.count}+${focusLow.count} days)`,
    });
  }

  const mitSet = avgCompletion((rec) => Boolean(rec.mit?.text?.trim()));
  const mitUnset = avgCompletion((rec) => !rec.mit?.text?.trim());
  if (mitSet && mitUnset) {
    insights.push({
      title: "MIT set days perform better",
      delta: mitSet.avg - mitUnset.avg,
      meta: `${Math.round(mitSet.avg)}% vs ${Math.round(mitUnset.avg)}% (${mitSet.count}+${mitUnset.count} days)`,
    });
  }

  if (insights.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "Keep logging — insights will appear once patterns emerge.";
    el.autoInsightsList.appendChild(empty);
    return;
  }

  insights.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  for (const insight of insights.slice(0, 3)) {
    const card = document.createElement("div");
    card.className = "insightCard";
    const title = document.createElement("div");
    title.className = "insightTitle";
    title.textContent = `${insight.delta >= 0 ? "▲" : "▼"} ${insight.title}`;
    const meta = document.createElement("div");
    meta.className = "insightMeta";
    meta.textContent = insight.meta;
    card.appendChild(title);
    card.appendChild(meta);
    el.autoInsightsList.appendChild(card);
  }
}

function normalizeImportedState(maybeState) {
  if (!maybeState || typeof maybeState !== "object") return null;

  const meta = typeof maybeState.meta === "object" && maybeState.meta ? { ...maybeState.meta } : { updatedAt: Date.now() };
  const normalized = {
    version: 1,
    meta,
    tasks: normalizeTasks(Array.isArray(maybeState.tasks) && maybeState.tasks.length ? maybeState.tasks : DEFAULT_TASKS),
    antiHabits: normalizeAntiHabits(maybeState.antiHabits),
    days: typeof maybeState.days === "object" && maybeState.days ? maybeState.days : {},
    weeks: typeof maybeState.weeks === "object" && maybeState.weeks ? maybeState.weeks : {},
    goals: typeof maybeState.goals === "object" && maybeState.goals
      ? maybeState.goals
      : { studyDaily: 0, earningsDaily: 0, sleepDaily: 8 },
    profile: normalizeProfile(maybeState.profile),
    friends: normalizeFriends(maybeState.friends),
    voltaris: normalizeVoltarisState(maybeState.voltaris),
    mantra: typeof maybeState.mantra === "string" ? maybeState.mantra : "",
    vision: typeof maybeState.vision === "object" && maybeState.vision
      ? { oneYear: maybeState.vision.oneYear ?? "", fiveYear: maybeState.vision.fiveYear ?? "" }
      : { oneYear: "", fiveYear: "" },
    quarterlyGoals: typeof maybeState.quarterlyGoals === "object" && maybeState.quarterlyGoals
      ? {
        label: maybeState.quarterlyGoals.label ?? "",
        goals: Array.isArray(maybeState.quarterlyGoals.goals)
          ? maybeState.quarterlyGoals.goals.slice(0, 4)
          : ["", "", "", ""],
      }
      : { label: "", goals: ["", "", "", ""] },
    objectives: Array.isArray(maybeState.objectives) ? maybeState.objectives : [],
    skills: Array.isArray(maybeState.skills) ? maybeState.skills : [],
    socialSteps: normalizeSocialSteps(maybeState.socialSteps),
    projects: normalizeProjects(maybeState.projects),
    reminders: normalizeReminders(maybeState.reminders),
    achievements: normalizeAchievements(maybeState.achievements),
    freezeUsed: Array.isArray(maybeState.freezeUsed) ? maybeState.freezeUsed.filter(isIsoDate) : [],
  };

  normalized.goals.studyDaily = Math.max(0, safeNumber(normalized.goals.studyDaily));
  normalized.goals.earningsDaily = Math.max(0, safeNumber(normalized.goals.earningsDaily));
  const sleepRaw = safeNumber(normalized.goals.sleepDaily);
  normalized.goals.sleepDaily = Math.max(0, sleepRaw || 8);
  if (!normalized.meta.antiHabitsSeeded) {
    const existing = new Set(
      (normalized.antiHabits ?? [])
        .map((habit) => (habit.title || "").trim().toLowerCase())
        .filter(Boolean)
    );
    for (const habit of DEFAULT_ANTI_HABITS) {
      const key = habit.title.trim().toLowerCase();
      if (!existing.has(key)) normalized.antiHabits.push(normalizeAntiHabit(habit));
    }
    normalized.meta.antiHabitsSeeded = true;
  }
  if (typeof normalized.mantra !== "string") normalized.mantra = "";
  if (!normalized.vision || typeof normalized.vision !== "object") {
    normalized.vision = { oneYear: "", fiveYear: "" };
  }
  if (typeof normalized.vision.oneYear !== "string") normalized.vision.oneYear = "";
  if (typeof normalized.vision.fiveYear !== "string") normalized.vision.fiveYear = "";
  if (!Array.isArray(normalized.quarterlyGoals.goals)) normalized.quarterlyGoals.goals = ["", "", "", ""];
  normalized.quarterlyGoals.goals = normalized.quarterlyGoals.goals.slice(0, 4);
  while (normalized.quarterlyGoals.goals.length < 4) normalized.quarterlyGoals.goals.push("");

  // Ensure each day has all task keys and required fields.
  for (const iso of Object.keys(normalized.days)) {
    normalized.days[iso] = normalizeDayRecord(normalized.days[iso], normalized.tasks, normalized.antiHabits);
  }

  for (const [weekKey, rec] of Object.entries(normalized.weeks)) {
    if (!rec || typeof rec !== "object") {
      normalized.weeks[weekKey] = { priorities: ["", "", ""] };
      continue;
    }
    if (!Array.isArray(rec.priorities)) rec.priorities = ["", "", ""];
    rec.priorities = [
      rec.priorities[0] ?? "",
      rec.priorities[1] ?? "",
      rec.priorities[2] ?? "",
    ];
    if (rec.review && typeof rec.review === "object") {
      rec.review.wins = Array.isArray(rec.review.wins) ? rec.review.wins : [];
      rec.review.misses = Array.isArray(rec.review.misses) ? rec.review.misses : [];
      rec.review.focus = Array.isArray(rec.review.focus) ? rec.review.focus : [];
      rec.review.updatedAt = safeNumber(rec.review.updatedAt ?? 0);
    } else if (rec.review) {
      rec.review = null;
    }
  }

  return normalized;
}

function renderInputs(isoDate) {
  const rec = getDayRecord(isoDate);
  el.studyHours.value = rec.studyHours ? String(rec.studyHours) : "";
  el.earnings.value = rec.earnings ? String(rec.earnings) : "";
}

function renderDateHeader() {
  el.datePill.textContent = formatPrettyDate(activeDate);
  el.datePicker.value = toISODate(activeDate);
}

function render() {
  const iso = toISODate(activeDate);
  if (progressRefreshTimer) {
    window.clearTimeout(progressRefreshTimer);
    progressRefreshTimer = null;
  }
  if (chartsRefreshTimer) {
    window.clearTimeout(chartsRefreshTimer);
    chartsRefreshTimer = null;
  }
  normalizeAllDaysToTasks();
  const levelSnapshot = computeAllTimeXp();
  renderDateHeader();
  renderGoals();
  renderMantra();
  renderVision();
  renderQuarterlyGoals();
  renderDailyScorecard();
  renderFocusLane(iso);
  renderTasks(iso);
  renderAntiHabits(iso);
  renderSocialMomentum(iso);
  renderMit(iso);
  renderInputs(iso);
  renderCheckin(iso);
  renderTemptationLog(iso);
  renderSlipLog(iso);
  if (el.temptationUrgeInput) renderUrgeScale(el.temptationUrgeInput.value);
  renderReflection(iso);
  renderFocus(iso);
  renderWeeklyPriorities();
  renderWeeklyReview();
  renderLeaderboard();
  setNotesTab(activeNotesTab);
  renderNotesSavedAt(iso);
  renderFlow(iso);
  renderNotesVault();
  renderObjectives();
  renderSkills();
  renderSummary();
  refreshProgressionUI(levelSnapshot);
  renderPerfectDays();
  renderAchievements();
  renderHistory();
  renderTaskStats();
  renderVoltaris();
  renderMultiplayer();
  if (!supabaseClient && getSupabaseConfig()) {
    connectSupabase();
  }
  renderTaskManager();
  renderAntiHabitManager();
  renderSocialSteps();
  renderProjects();
  renderReminders();
  renderCalendar();
  renderCharts();
  renderAutoInsights();
  applyFocusMode();
  applyFlowMode();
  checkVoltarisServer({ force: false }).then(() => renderVoltaris());
}

function escapeCsv(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function buildDaysCsv() {
  const keys = Object.keys(state.days).sort();
  const headers = [
    "date",
    "completionPct",
    "scorePct",
    "pointsDone",
    "pointsTotal",
    "studyHours",
    "earnings",
    "tasksDone",
    "tasksTotal",
    ...state.tasks.map((t) => t.title),
  ];
  const lines = [headers.map(escapeCsv).join(",")];

  for (const iso of keys) {
    const rec = state.days[iso];
    const pct = computeDayCompletionPct(iso);
    const points = computeDayPoints(iso);
    const dueTasks = getDueTasksForDate(parseISODate(iso));
    let done = 0;
    for (const t of dueTasks) if (rec?.tasks?.[t.id] === true) done += 1;

    const row = [
      iso,
      pct,
      points.scorePct,
      points.done,
      points.total,
      safeNumber(rec?.studyHours ?? 0),
      safeNumber(rec?.earnings ?? 0),
      done,
      dueTasks.length,
      ...state.tasks.map((t) => (rec?.tasks?.[t.id] === true ? 1 : 0)),
    ];
    lines.push(row.map(escapeCsv).join(","));
  }
  return lines.join("\n");
}

function bindEvents() {
  el.dataMenuBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = !el.dataMenu?.classList.contains("is-open");
    setDataMenuOpen(open);
  });

  document.addEventListener("click", (event) => {
    if (!el.dataMenu) return;
    if (!el.dataMenu.contains(event.target)) setDataMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setDataMenuOpen(false);
  });

  el.focusModeBtn?.addEventListener("click", () => {
    uiState.focusMode = !uiState.focusMode;
    saveUiState(uiState);
    applyFocusMode();
  });

  el.flowModeBtn?.addEventListener("click", () => {
    uiState.flowMode = !uiState.flowMode;
    if (uiState.flowMode) uiState.focusMode = false;
    saveUiState(uiState);
    applyFocusMode();
    applyFlowMode();
  });

  el.sectionSummary?.addEventListener("click", () => setRightTab("summary"));
  el.sectionInsights?.addEventListener("click", () => setRightTab("insights"));
  el.sectionManage?.addEventListener("click", () => setRightTab("manage"));
  el.prevDayBtn.addEventListener("click", () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 1);
    setActiveDate(d);
  });

  el.nextDayBtn.addEventListener("click", () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + 1);
    setActiveDate(d);
  });

  el.datePill.addEventListener("click", () => {
    el.datePicker.showPicker?.();
    el.datePicker.focus();
    el.datePicker.click();
  });

  el.datePicker.addEventListener("change", () => {
    if (!el.datePicker.value) return;
    setActiveDate(parseISODate(el.datePicker.value));
  });

  el.studyHours.addEventListener("input", () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    rec.studyHours = safeNumber(el.studyHours.value);
    saveState(state);
    renderDailyScorecard();
    scheduleProgressRefresh();
  });

  el.earnings.addEventListener("input", () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    rec.earnings = safeNumber(el.earnings.value);
    saveState(state);
    renderDailyScorecard();
    scheduleProgressRefresh();
  });

  el.tabWins.addEventListener("click", () => setNotesTab("wins"));
  el.tabLessons.addEventListener("click", () => setNotesTab("lessons"));
  el.tabTomorrow.addEventListener("click", () => setNotesTab("tomorrow"));

  el.notesArea.addEventListener("input", () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    rec.notes[activeNotesTab] = el.notesArea.value;
    rec.notesUpdatedAt = Date.now();
    saveState(state);
    renderNotesSavedAt(iso);
    renderFlowNotes(iso);
    renderFlowReview(iso);
    renderFlowHeader(iso);
    renderNotesVault();
    scheduleProgressRefresh();
  });

  const updateMitText = (value) => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    rec.mit.text = value.trim();
    if (!rec.mit.text) rec.mit.done = false;
    saveState(state);
    renderMit(iso);
    renderFocusLane(iso);
    renderFlowReview(iso);
    renderFlowHeader(iso);
  };

  el.mitInput?.addEventListener("input", () => updateMitText(el.mitInput.value));
  el.flowMitInput?.addEventListener("input", () => updateMitText(el.flowMitInput.value));

  const toggleMitDone = () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    if (!rec.mit.text.trim()) {
      alert("Set your most important task first.");
      return;
    }
    rec.mit.done = !rec.mit.done;
    saveState(state);
    renderMit(iso);
    renderFocusLane(iso);
    renderFlowReview(iso);
    renderFlowHeader(iso);
  };

  el.mitDoneBtn?.addEventListener("click", toggleMitDone);
  el.flowMitDoneBtn?.addEventListener("click", toggleMitDone);

  const handleFlowNotesInput = (field, value) => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    rec.notes[field] = value;
    rec.notesUpdatedAt = Date.now();
    saveState(state);
    renderNotesSavedAt(iso);
    setNotesTab(activeNotesTab);
    renderFlowReview(iso);
    renderFlowHeader(iso);
    renderNotesVault();
    scheduleProgressRefresh();
  };

  el.flowNotesWins?.addEventListener("input", () => {
    handleFlowNotesInput("wins", el.flowNotesWins.value);
  });

  el.flowNotesLessons?.addEventListener("input", () => {
    handleFlowNotesInput("lessons", el.flowNotesLessons.value);
  });

  el.flowNotesTomorrow?.addEventListener("input", () => {
    handleFlowNotesInput("tomorrow", el.flowNotesTomorrow.value);
  });

  const ensureGratitude = (rec) => {
    rec.gratitude = Array.isArray(rec.gratitude) ? rec.gratitude : ["", "", ""];
    while (rec.gratitude.length < 3) rec.gratitude.push("");
  };

  const updateReflection = (updater) => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    updater(rec);
    rec.notesUpdatedAt = Date.now();
    saveState(state);
    renderNotesSavedAt(iso);
    renderReflection(iso);
    renderFocusLane(iso);
    renderFlowNotes(iso);
    renderFlowReview(iso);
    renderFlowHeader(iso);
    renderNotesVault();
    scheduleProgressRefresh();
  };

  el.intentionInput?.addEventListener("input", () => {
    updateReflection((rec) => {
      rec.intention = el.intentionInput.value ?? "";
    });
  });

  el.lessonInput?.addEventListener("input", () => {
    updateReflection((rec) => {
      rec.lessonLearned = el.lessonInput.value ?? "";
    });
  });

  el.gratitude1?.addEventListener("input", () => {
    updateReflection((rec) => {
      ensureGratitude(rec);
      rec.gratitude[0] = el.gratitude1.value ?? "";
    });
  });

  el.gratitude2?.addEventListener("input", () => {
    updateReflection((rec) => {
      ensureGratitude(rec);
      rec.gratitude[1] = el.gratitude2.value ?? "";
    });
  });

  el.gratitude3?.addEventListener("input", () => {
    updateReflection((rec) => {
      ensureGratitude(rec);
      rec.gratitude[2] = el.gratitude3.value ?? "";
    });
  });

  el.flowIntentionInput?.addEventListener("input", () => {
    updateReflection((rec) => {
      rec.intention = el.flowIntentionInput.value ?? "";
    });
  });

  el.flowLessonInput?.addEventListener("input", () => {
    updateReflection((rec) => {
      rec.lessonLearned = el.flowLessonInput.value ?? "";
    });
  });

  el.flowGratitude1?.addEventListener("input", () => {
    updateReflection((rec) => {
      ensureGratitude(rec);
      rec.gratitude[0] = el.flowGratitude1.value ?? "";
    });
  });

  el.flowGratitude2?.addEventListener("input", () => {
    updateReflection((rec) => {
      ensureGratitude(rec);
      rec.gratitude[1] = el.flowGratitude2.value ?? "";
    });
  });

  el.flowGratitude3?.addEventListener("input", () => {
    updateReflection((rec) => {
      ensureGratitude(rec);
      rec.gratitude[2] = el.flowGratitude3.value ?? "";
    });
  });

  el.notesTagsInput?.addEventListener("input", () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    rec.notesTags = parseTags(el.notesTagsInput.value);
    rec.notesUpdatedAt = Date.now();
    saveState(state);
    renderNotesMeta(iso);
    renderNotesVault();
  });

  el.notesPinBtn?.addEventListener("click", () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    rec.notesPinned = !rec.notesPinned;
    rec.notesUpdatedAt = Date.now();
    saveState(state);
    renderNotesMeta(iso);
    renderNotesVault();
  });

  el.notesSearchInput?.addEventListener("input", () => {
    uiState.notesQuery = el.notesSearchInput.value ?? "";
    saveUiState(uiState);
    renderNotesVault();
  });

  const setMoodValue = (value) => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    rec.checkin.mood = clamp(Math.round(safeNumber(value)), 0, 5);
    saveState(state);
    renderMoodEnergy(rec.checkin.mood, rec.checkin.energy);
    renderAutoInsights();
    scheduleChartsRefresh();
  };

  const setEnergyValue = (value) => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    rec.checkin.energy = clamp(Math.round(safeNumber(value)), 0, 5);
    saveState(state);
    renderMoodEnergy(rec.checkin.mood, rec.checkin.energy);
    renderAutoInsights();
    scheduleChartsRefresh();
  };

  el.moodInput?.addEventListener("input", () => {
    setMoodValue(el.moodInput.value);
  });

  el.energyInput?.addEventListener("input", () => {
    setEnergyValue(el.energyInput.value);
  });

  el.moodClearBtn?.addEventListener("click", () => {
    if (el.moodInput) el.moodInput.value = "0";
    setMoodValue(0);
  });

  el.energyClearBtn?.addEventListener("click", () => {
    if (el.energyInput) el.energyInput.value = "0";
    setEnergyValue(0);
  });

  el.sleepInput?.addEventListener("input", () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    rec.checkin.sleep = clamp(safeNumber(el.sleepInput.value), 0, 24);
    saveState(state);
    renderCheckin(iso);
    scheduleProgressRefresh();
  });

  el.focusStartBtn?.addEventListener("click", () => startFocusTimer(el.focusLabel?.value ?? ""));
  el.focusStopBtn?.addEventListener("click", () => stopFocusTimer());
  el.flowFocusStartBtn?.addEventListener("click", () => startFocusTimer(el.flowFocusLabel?.value ?? ""));
  el.flowFocusStopBtn?.addEventListener("click", () => stopFocusTimer());
  el.focusLaneStartBtn?.addEventListener("click", () => {
    startFocusTimer(el.focusLaneLabel?.value ?? "");
    if (el.focusLaneLabel) el.focusLaneLabel.value = "";
  });
  el.focusLaneChecklistBtn?.addEventListener("click", () => {
    el.dailyChecklistCard?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  el.focusLabel?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startFocusTimer(el.focusLabel?.value ?? "");
  });

  el.flowFocusLabel?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startFocusTimer(el.flowFocusLabel?.value ?? "");
  });

  el.focusLaneLabel?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      startFocusTimer(el.focusLaneLabel?.value ?? "");
      el.focusLaneLabel.value = "";
    }
  });

  el.flowShowAllBtn?.addEventListener("click", () => {
    uiState.flowShowAll = !uiState.flowShowAll;
    saveUiState(uiState);
    render();
  });

  el.showAllTasksBtn?.addEventListener("click", () => {
    uiState.showAllTasks = !uiState.showAllTasks;
    saveUiState(uiState);
    render();
  });

  const savePriorities = () => {
    const rec = getWeekRecord(activeDate);
    rec.priorities = [
      (el.priority1?.value ?? "").trim(),
      (el.priority2?.value ?? "").trim(),
      (el.priority3?.value ?? "").trim(),
    ];
    saveState(state);
  };

  el.priority1?.addEventListener("input", savePriorities);
  el.priority2?.addEventListener("input", savePriorities);
  el.priority3?.addEventListener("input", savePriorities);

  el.clearPrioritiesBtn?.addEventListener("click", () => {
    const rec = getWeekRecord(activeDate);
    rec.priorities = ["", "", ""];
    saveState(state);
    renderWeeklyPriorities();
  });

  el.copyPrioritiesBtn?.addEventListener("click", () => {
    const rec = getWeekRecord(activeDate);
    const priorities = rec.priorities.map((p) => p.trim()).filter(Boolean);
    if (priorities.length === 0) {
      alert("Add at least one weekly priority first.");
      return;
    }

    const tomorrow = new Date(activeDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIso = toISODate(tomorrow);
    const tomorrowRec = getDayRecord(tomorrowIso);

    const block = `Top priorities:\n${priorities.map((p) => `- ${p}`).join("\n")}`;
    const existing = tomorrowRec.notes.tomorrow?.trim() ?? "";
    tomorrowRec.notes.tomorrow = existing ? `${existing}\n\n${block}` : block;
    tomorrowRec.notesUpdatedAt = Date.now();
    saveState(state);
  });

  el.profileNameInput?.addEventListener("input", () => {
    const current = normalizeProfile(state.profile);
    state.profile = normalizeProfile({ ...current, username: el.profileNameInput.value });
    saveState(state);
    const snapshot = computeAllTimeXp();
    refreshProgressionUI(snapshot);
  });

  const addFriend = () => {
    const name = (el.friendNameInput?.value ?? "").trim();
    if (!name) return;
    const xp = Math.max(0, Math.round(safeNumber(el.friendXpInput?.value)));
    const friend = normalizeFriend({ name, xp });
    if (!friend) return;
    state.friends = Array.isArray(state.friends) ? state.friends : [];
    const existing = state.friends.find((entry) => entry.name.trim().toLowerCase() === friend.name.toLowerCase());
    if (existing) {
      existing.xp = friend.xp;
    } else {
      state.friends.unshift(friend);
    }
    if (el.friendNameInput) el.friendNameInput.value = "";
    if (el.friendXpInput) el.friendXpInput.value = "";
    saveState(state);
    const snapshot = computeAllTimeXp();
    refreshProgressionUI(snapshot);
  };

  el.addFriendBtn?.addEventListener("click", addFriend);
  el.friendNameInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addFriend();
  });
  el.friendXpInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addFriend();
  });

  el.voltarisSendBtn?.addEventListener("click", () => handleVoltarisSend());
  el.voltarisInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleVoltarisSend();
    }
  });
  el.voltarisBuildBtn?.addEventListener("click", () => voltarisStartHabitFlow());
  el.voltarisRoutineBtn?.addEventListener("click", () => voltarisSuggestRoutine());
  el.voltarisCoachBtn?.addEventListener("click", () => generateDailyCoach());
  el.voltarisWeeklyBtn?.addEventListener("click", () => generateWeeklyReview());
  el.voltarisResetBtn?.addEventListener("click", () => resetVoltaris());
  el.voltarisMemoryExtractBtn?.addEventListener("click", () => {
    const last = getLastVoltarisAiMessageText();
    if (!last) {
      voltarisPushMessage("ai", "No AI message to extract memory from yet.");
      return;
    }
    extractMemoryFromText(last);
  });
  el.voltarisAutoMemoryToggle?.addEventListener("change", () => {
    uiState.voltarisAutoMemory = Boolean(el.voltarisAutoMemoryToggle.checked);
    saveUiState(uiState);
  });
  el.voltarisAddPendingBtn?.addEventListener("click", () => voltarisApplyPendingTasks());
  el.voltarisApiInput?.addEventListener("change", () => {
    uiState.voltarisApiUrl = el.voltarisApiInput.value.trim();
    saveUiState(uiState);
    checkVoltarisServer({ force: true }).then(() => renderVoltaris());
  });
  el.voltarisCheckBtn?.addEventListener("click", () => {
    checkVoltarisServer({ force: true }).then(() => renderVoltaris());
  });
  el.voltarisAiToggle?.addEventListener("change", () => {
    uiState.voltarisAiEnabled = Boolean(el.voltarisAiToggle.checked);
    saveUiState(uiState);
    if (uiState.voltarisAiEnabled) {
      checkVoltarisServer({ force: true }).then(() => renderVoltaris());
    } else {
      renderVoltaris();
    }
  });
  el.voltarisContextToggle?.addEventListener("change", () => {
    uiState.voltarisContextEnabled = Boolean(el.voltarisContextToggle.checked);
    saveUiState(uiState);
  });

  el.voltarisDockBtn?.addEventListener("click", () => setVoltarisDockOpen(true));
  el.voltarisDockCloseBtn?.addEventListener("click", () => setVoltarisDockOpen(false));
  el.voltarisDockSendBtn?.addEventListener("click", () => handleVoltarisDockSend());
  el.voltarisDockInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleVoltarisDockSend();
    }
  });
  el.voltarisDockCoachBtn?.addEventListener("click", () => generateDailyCoach());
  el.voltarisDockRoutineBtn?.addEventListener("click", () => voltarisSuggestRoutine());
  el.voltarisDockMemoryBtn?.addEventListener("click", () => {
    const last = getLastVoltarisAiMessageText();
    if (!last) {
      voltarisPushMessage("ai", "No AI message to extract memory from yet.");
      return;
    }
    extractMemoryFromText(last);
  });

  const updateCheckinLabels = () => {
    if (el.voltarisCheckinMoodLabel && el.voltarisCheckinMood) {
      el.voltarisCheckinMoodLabel.textContent = String(el.voltarisCheckinMood.value ?? 0);
    }
    if (el.voltarisCheckinEnergyLabel && el.voltarisCheckinEnergy) {
      el.voltarisCheckinEnergyLabel.textContent = String(el.voltarisCheckinEnergy.value ?? 0);
    }
  };

  el.voltarisCheckinMood?.addEventListener("input", updateCheckinLabels);
  el.voltarisCheckinEnergy?.addEventListener("input", updateCheckinLabels);

  el.voltarisCheckinSaveBtn?.addEventListener("click", () => {
    const iso = toISODate(activeDate);
    const data = {
      focus: el.voltarisCheckinFocus?.value ?? "",
      obstacle: el.voltarisCheckinObstacle?.value ?? "",
      win: el.voltarisCheckinWin?.value ?? "",
      notes: el.voltarisCheckinNotes?.value ?? "",
      mood: safeNumber(el.voltarisCheckinMood?.value ?? 0),
      energy: safeNumber(el.voltarisCheckinEnergy?.value ?? 0),
    };
    saveVoltarisCheckin(iso, data);
    renderVoltaris();
  });

  el.voltarisCheckinClearBtn?.addEventListener("click", () => {
    const iso = toISODate(activeDate);
    clearVoltarisCheckin(iso);
    renderVoltaris();
  });

  el.voltarisPlanBtn?.addEventListener("click", () => {
    generateVoltarisPlan();
  });

  el.voltarisMemoryAddBtn?.addEventListener("click", () => {
    const text = (el.voltarisMemoryInput?.value ?? "").trim();
    if (!text) return;
    addVoltarisMemory(text);
    if (el.voltarisMemoryInput) el.voltarisMemoryInput.value = "";
  });
  el.voltarisMemoryInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      el.voltarisMemoryAddBtn?.click();
    }
  });

  el.supabaseConnectBtn?.addEventListener("click", async () => {
    uiState.supabaseUrl = el.supabaseUrlInput?.value ?? "";
    uiState.supabaseKey = el.supabaseKeyInput?.value ?? "";
    uiState.supabaseAdminEmails = el.supabaseAdminEmails?.value ?? "";
    uiState.supabaseAutoSync = Boolean(el.supabaseAutoSyncToggle?.checked);
    saveUiState(uiState);
    await connectSupabase();
  });

  el.supabaseAutoSyncToggle?.addEventListener("change", () => {
    uiState.supabaseAutoSync = Boolean(el.supabaseAutoSyncToggle?.checked);
    saveUiState(uiState);
    scheduleMultiplayerSync(1000);
  });

  el.supabaseSignInBtn?.addEventListener("click", async () => {
    await connectSupabase();
    await supabaseSignIn(el.supabaseEmailInput?.value ?? "", el.supabasePasswordInput?.value ?? "");
    await loadGlobalLeaderboard();
    await loadAdminUsers();
    renderMultiplayer();
  });

  el.supabaseSignUpBtn?.addEventListener("click", async () => {
    await connectSupabase();
    await supabaseSignUp(el.supabaseEmailInput?.value ?? "", el.supabasePasswordInput?.value ?? "");
    await loadGlobalLeaderboard();
    await loadAdminUsers();
    renderMultiplayer();
  });

  el.supabaseSignOutBtn?.addEventListener("click", async () => {
    await supabaseSignOut();
  });

  el.supabaseSyncBtn?.addEventListener("click", async () => {
    await connectSupabase();
    await syncPublicStats();
    await loadGlobalLeaderboard();
    await loadAdminUsers();
    renderMultiplayer();
  });

  el.goalStudyInput?.addEventListener("input", () => {
    state.goals.studyDaily = Math.max(0, safeNumber(el.goalStudyInput.value));
    saveState(state);
    renderGoals();
    renderDailyScorecard();
    scheduleProgressRefresh();
  });

  el.goalEarningsInput?.addEventListener("input", () => {
    state.goals.earningsDaily = Math.max(0, safeNumber(el.goalEarningsInput.value));
    saveState(state);
    renderGoals();
    renderDailyScorecard();
    scheduleProgressRefresh();
  });

  el.goalSleepInput?.addEventListener("input", () => {
    state.goals.sleepDaily = Math.max(0, safeNumber(el.goalSleepInput.value));
    saveState(state);
    renderGoals();
    renderCheckin(toISODate(activeDate));
    scheduleProgressRefresh();
  });

  el.mantraInput?.addEventListener("input", () => {
    state.mantra = el.mantraInput.value ?? "";
    saveState(state);
    renderMantra();
  });

  el.vision1Input?.addEventListener("input", () => {
    state.vision = state.vision ?? { oneYear: "", fiveYear: "" };
    state.vision.oneYear = el.vision1Input.value ?? "";
    saveState(state);
  });

  el.vision5Input?.addEventListener("input", () => {
    state.vision = state.vision ?? { oneYear: "", fiveYear: "" };
    state.vision.fiveYear = el.vision5Input.value ?? "";
    saveState(state);
  });

  const updateQuarterGoal = (index, value) => {
    state.quarterlyGoals = state.quarterlyGoals ?? { label: "", goals: ["", "", "", ""] };
    if (!Array.isArray(state.quarterlyGoals.goals)) state.quarterlyGoals.goals = ["", "", "", ""];
    while (state.quarterlyGoals.goals.length < 4) state.quarterlyGoals.goals.push("");
    state.quarterlyGoals.goals[index] = value ?? "";
    saveState(state);
  };

  el.quarterYearInput?.addEventListener("input", () => {
    state.quarterlyGoals = state.quarterlyGoals ?? { label: "", goals: ["", "", "", ""] };
    state.quarterlyGoals.label = el.quarterYearInput.value ?? "";
    saveState(state);
  });

  el.quarterQ1?.addEventListener("input", () => updateQuarterGoal(0, el.quarterQ1.value));
  el.quarterQ2?.addEventListener("input", () => updateQuarterGoal(1, el.quarterQ2.value));
  el.quarterQ3?.addEventListener("input", () => updateQuarterGoal(2, el.quarterQ3.value));
  el.quarterQ4?.addEventListener("input", () => updateQuarterGoal(3, el.quarterQ4.value));

  el.markAllBtn?.addEventListener("click", () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    const dueTasks = getDueTasksForDate(activeDate);
    for (const t of dueTasks) rec.tasks[t.id] = true;
    saveState(state);
    render();
  });

  el.clearChecklistBtn?.addEventListener("click", () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    const dueTasks = getDueTasksForDate(activeDate);
    for (const t of dueTasks) rec.tasks[t.id] = false;
    saveState(state);
    render();
  });

  el.antiMarkAllBtn?.addEventListener("click", () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    for (const habit of state.antiHabits ?? []) {
      rec.antiHabits[habit.id] = true;
    }
    saveState(state);
    renderAntiHabits(iso);
    scheduleProgressRefresh();
  });

  el.antiClearBtn?.addEventListener("click", () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    for (const habit of state.antiHabits ?? []) {
      rec.antiHabits[habit.id] = false;
    }
    saveState(state);
    renderAntiHabits(iso);
    scheduleProgressRefresh();
  });

  const setSocialChallenge = (nextChallenge) => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    rec.socialChallenge = normalizeSocialChallenge(nextChallenge);
    saveState(state);
    renderSocialMomentum(iso);
  };

  el.socialNewBtn?.addEventListener("click", () => {
    const pick = pickSocialChallenge();
    setSocialChallenge({ ...pick, done: false });
  });

  el.socialDoneBtn?.addEventListener("click", () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    const challenge = normalizeSocialChallenge(rec.socialChallenge);
    if (!challenge.text) {
      alert("Pick a challenge first.");
      return;
    }
    challenge.done = !challenge.done;
    rec.socialChallenge = challenge;
    saveState(state);
    renderSocialMomentum(iso);
    scheduleProgressRefresh();
  });

  const addReachout = () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    const type = el.socialReachType?.value ?? "Text";
    const who = (el.socialReachWho?.value ?? "").trim();
    const note = (el.socialReachNote?.value ?? "").trim();
    if (!type && !who && !note) return;
    rec.socialReachouts = Array.isArray(rec.socialReachouts) ? rec.socialReachouts : [];
    rec.socialReachouts.push({
      id: crypto.randomUUID(),
      type,
      who,
      note,
      createdAt: Date.now(),
    });
    if (el.socialReachWho) el.socialReachWho.value = "";
    if (el.socialReachNote) el.socialReachNote.value = "";
    saveState(state);
    renderSocialMomentum(iso);
    scheduleProgressRefresh();
  };

  el.socialReachAddBtn?.addEventListener("click", addReachout);
  el.socialReachWho?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addReachout();
  });
  el.socialReachNote?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addReachout();
  });

  const clearTemptationInputs = () => {
    if (el.temptationTrigger) el.temptationTrigger.value = "";
    if (el.temptationWant) el.temptationWant.value = "";
    if (el.temptationDid) el.temptationDid.value = "";
    if (el.temptationNote) el.temptationNote.value = "";
    if (el.temptationUrgeInput) {
      el.temptationUrgeInput.value = "0";
      renderUrgeScale(0);
    }
  };

  const addTemptation = () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    const trigger = (el.temptationTrigger?.value ?? "").trim();
    const want = (el.temptationWant?.value ?? "").trim();
    const did = (el.temptationDid?.value ?? "").trim();
    const note = (el.temptationNote?.value ?? "").trim();
    const urge = clamp(Math.round(safeNumber(el.temptationUrgeInput?.value)), 0, 5);
    if (!trigger && !want && !did && !note && urge === 0) {
      alert("Add a trigger, urge, or note first.");
      return;
    }
    rec.temptations = Array.isArray(rec.temptations) ? rec.temptations : [];
    rec.temptations.push({
      id: crypto.randomUUID(),
      trigger,
      urge,
      want,
      did,
      note,
      createdAt: Date.now(),
    });
    saveState(state);
    clearTemptationInputs();
    renderTemptationLog(iso);
  };

  el.temptationUrgeInput?.addEventListener("input", () => {
    renderUrgeScale(el.temptationUrgeInput.value);
  });
  el.temptationAddBtn?.addEventListener("click", addTemptation);
  el.temptationClearBtn?.addEventListener("click", clearTemptationInputs);

  const clearSlipInputs = () => {
    if (el.slipWhat) el.slipWhat.value = "";
    if (el.slipWhy) el.slipWhy.value = "";
    if (el.slipRoot) el.slipRoot.value = "";
    if (el.slipNext) el.slipNext.value = "";
  };

  const addSlip = () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    const what = (el.slipWhat?.value ?? "").trim();
    const why = (el.slipWhy?.value ?? "").trim();
    const root = (el.slipRoot?.value ?? "").trim();
    const next = (el.slipNext?.value ?? "").trim();
    if (!what && !why && !root && !next) {
      alert("Add at least one detail first.");
      return;
    }
    rec.slips = Array.isArray(rec.slips) ? rec.slips : [];
    rec.slips.push({
      id: crypto.randomUUID(),
      what,
      why,
      root,
      next,
      createdAt: Date.now(),
    });
    saveState(state);
    clearSlipInputs();
    renderSlipLog(iso);
  };

  el.slipAddBtn?.addEventListener("click", addSlip);
  el.slipClearBtn?.addEventListener("click", clearSlipInputs);
  el.slipNext?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addSlip();
  });

  el.copyYesterdayPlanBtn?.addEventListener("click", () => {
    const todayIso = toISODate(activeDate);
    const todayRec = getDayRecord(todayIso);
    const y = new Date(activeDate);
    y.setDate(y.getDate() - 1);
    const yIso = toISODate(y);
    const yRec = state.days[yIso];
    const plan = yRec?.notes?.tomorrow ?? "";
    if (!plan.trim()) {
      alert("Yesterday has no plan to copy.");
      return;
    }
    todayRec.notes.tomorrow = plan;
    todayRec.notesUpdatedAt = Date.now();
    saveState(state);
    setNotesTab("tomorrow");
    renderNotesSavedAt(todayIso);
  });

  el.useFreezeBtn?.addEventListener("click", () => {
    const available = getAvailableFreezeTokens();
    if (available <= 0) {
      alert("No freeze tokens available.");
      return;
    }
    const y = new Date(activeDate);
    y.setDate(y.getDate() - 1);
    const iso = toISODate(y);
    if (isDayFullyComplete(iso)) {
      alert("Yesterday is already complete.");
      return;
    }
    if (state.freezeUsed?.includes(iso)) {
      alert("A freeze was already used for yesterday.");
      return;
    }
    state.freezeUsed = Array.isArray(state.freezeUsed) ? state.freezeUsed : [];
    state.freezeUsed.push(iso);
    saveState(state);
    render();
  });

  el.flowEndDayBtn?.addEventListener("click", () => {
    const iso = toISODate(activeDate);
    const rec = getDayRecord(iso);
    rec.dayClosedAt = Date.now();

    const review = computeWeeklyReview(activeDate);
    const items = buildReviewItems(review);
    const weekRec = getWeekRecord(activeDate);
    weekRec.review = {
      wins: items.wins,
      misses: items.misses,
      focus: items.focus,
      updatedAt: Date.now(),
    };

    saveState(state);
    renderWeeklyReview();
    renderFlowReview(iso);
    renderFlowHeader(iso);
    scheduleProgressRefresh();
  });

  el.rangeWeek.addEventListener("click", () => setActiveRange("week"));
  el.rangeMonth.addEventListener("click", () => setActiveRange("month"));
  el.rangeYear.addEventListener("click", () => setActiveRange("year"));

  el.trendRangeSelect?.addEventListener("change", () => {
    const next = safeNumber(el.trendRangeSelect.value);
    uiState.trendRange = [7, 30, 90].includes(next) ? next : 30;
    saveUiState(uiState);
    renderTrendChart();
  });

  el.addObjectiveBtn.addEventListener("click", () => {
    const text = (el.objectiveInput.value ?? "").trim();
    if (!text) return;
    const deadline = (el.objectiveDeadline?.value ?? "").trim();
    state.objectives.unshift({ id: crypto.randomUUID(), text, done: false, deadline: deadline || "" });
    el.objectiveInput.value = "";
    if (el.objectiveDeadline) el.objectiveDeadline.value = "";
    saveState(state);
    renderObjectives();
    renderCalendar();
  });

  el.objectiveInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") el.addObjectiveBtn.click();
  });

  el.addSkillBtn.addEventListener("click", () => {
    const name = (el.skillNameInput.value ?? "").trim();
    const pct = clamp(safeNumber(el.skillPctInput.value), 0, 100);
    if (!name) return;
    state.skills.unshift({ id: crypto.randomUUID(), name, pct, note: "" });
    el.skillNameInput.value = "";
    el.skillPctInput.value = "";
    saveState(state);
    renderSkills();
  });

  el.addTaskBtn?.addEventListener("click", () => {
    const title = (el.taskTitleInput.value ?? "").trim();
    const desc = (el.taskDescInput.value ?? "").trim();
    const category = normalizeCategory(el.taskCategoryInput?.value ?? "");
    const weight = normalizeWeight(el.taskWeightInput?.value ?? 1);
    if (!title) return;
    const startDate = toISODate(activeDate);
    const newTask = normalizeTask({
      id: crypto.randomUUID(),
      title,
      desc: desc || "",
      category,
      weight,
      timeBlock: "any",
      scheduleDays: DAY_ORDER.slice(),
      startDate,
    });
    state.tasks.unshift(newTask);
    el.taskTitleInput.value = "";
    el.taskDescInput.value = "";
    if (el.taskCategoryInput) el.taskCategoryInput.value = "";
    if (el.taskWeightInput) el.taskWeightInput.value = "";
    normalizeAllDaysToTasks();
    saveState(state);
    render();
  });

  el.addAntiHabitBtn?.addEventListener("click", () => {
    const title = (el.antiHabitTitleInput?.value ?? "").trim();
    if (!title) return;
    const desc = (el.antiHabitDescInput?.value ?? "").trim();
    state.antiHabits = Array.isArray(state.antiHabits) ? state.antiHabits : [];
    state.antiHabits.unshift({ id: crypto.randomUUID(), title, desc });
    if (el.antiHabitTitleInput) el.antiHabitTitleInput.value = "";
    if (el.antiHabitDescInput) el.antiHabitDescInput.value = "";
    normalizeAllDaysToTasks();
    saveState(state);
    render();
  });

  el.antiHabitTitleInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") el.addAntiHabitBtn?.click();
  });

  const addSocialStep = () => {
    const text = (el.socialStepInput?.value ?? "").trim();
    if (!text) return;
    const difficultyRaw = safeNumber(el.socialStepDifficulty?.value);
    const difficulty = difficultyRaw ? clamp(Math.round(difficultyRaw), 1, 5) : 3;
    state.socialSteps = Array.isArray(state.socialSteps) ? state.socialSteps : [];
    state.socialSteps.unshift({
      id: crypto.randomUUID(),
      text,
      difficulty,
      active: true,
    });
    if (el.socialStepInput) el.socialStepInput.value = "";
    if (el.socialStepDifficulty) el.socialStepDifficulty.value = "";
    saveState(state);
    renderSocialSteps();
  };

  el.addSocialStepBtn?.addEventListener("click", addSocialStep);
  el.socialStepInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addSocialStep();
  });
  el.socialStepDifficulty?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addSocialStep();
  });

  el.addProjectBtn?.addEventListener("click", () => {
    const title = (el.projectInput?.value ?? "").trim();
    if (!title) return;
    const milestoneTitle = (el.projectMilestoneInput?.value ?? "").trim();
    const dueDate = (el.projectDeadlineInput?.value ?? "").trim();

    state.projects = Array.isArray(state.projects) ? state.projects : [];
    let project = state.projects.find((p) => p.title.toLowerCase() === title.toLowerCase());
    if (!project) {
      project = { id: crypto.randomUUID(), title, milestones: [], createdAt: Date.now() };
      state.projects.unshift(project);
    }

    if (milestoneTitle) {
      project.milestones = Array.isArray(project.milestones) ? project.milestones : [];
      project.milestones.push({
        id: crypto.randomUUID(),
        title: milestoneTitle,
        dueDate,
        done: false,
        createdAt: Date.now(),
      });
    }

    if (el.projectInput) el.projectInput.value = "";
    if (el.projectMilestoneInput) el.projectMilestoneInput.value = "";
    if (el.projectDeadlineInput) el.projectDeadlineInput.value = "";
    saveState(state);
    renderProjects();
  });

  el.projectInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") el.addProjectBtn?.click();
  });

  el.projectMilestoneInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") el.addProjectBtn?.click();
  });

  el.taskTitleInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") el.addTaskBtn?.click();
  });

  el.taskDescInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") el.addTaskBtn?.click();
  });

  el.taskCategoryInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") el.addTaskBtn?.click();
  });

  el.taskWeightInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") el.addTaskBtn?.click();
  });

  el.reminderDays?.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-day]");
    if (!btn) return;
    const day = Number(btn.dataset.day);
    if (selectedReminderDays.has(day)) {
      selectedReminderDays.delete(day);
    } else {
      selectedReminderDays.add(day);
    }
    uiState.reminderDays = Array.from(selectedReminderDays);
    saveUiState(uiState);
    renderReminderDayButtons();
  });

  el.addReminderBtn?.addEventListener("click", () => {
    const time = el.reminderTime?.value || "09:00";
    const task = (el.reminderTask?.value ?? "").trim();
    const label = (el.reminderLabel?.value ?? "").trim();
    const days = Array.from(selectedReminderDays).sort((a, b) => a - b);

    if (!time) {
      alert("Pick a reminder time.");
      return;
    }
    if (days.length === 0) {
      alert("Select at least one day.");
      return;
    }
    if (!task && !label) {
      alert("Add a label or habit for the reminder.");
      return;
    }

    if (!Array.isArray(state.reminders)) state.reminders = [];
    state.reminders.unshift({
      id: crypto.randomUUID(),
      time,
      task,
      label,
      days,
      enabled: true,
    });
    if (el.reminderTask) el.reminderTask.value = "";
    if (el.reminderLabel) el.reminderLabel.value = "";
    saveState(state);
    renderReminders();
  });

  el.enableNotificationsBtn?.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      alert("Notifications are not supported in this browser.");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      updateNotificationStatus();
      if (perm === "granted") ensureReminderInterval();
    } catch {
      updateNotificationStatus();
    }
  });

  el.reminderTask?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") el.addReminderBtn?.click();
  });

  el.reminderLabel?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") el.addReminderBtn?.click();
  });

  el.exportBtn.addEventListener("click", () => {
    setDataMenuOpen(false);
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `self-improvement-export-${toISODate(todayLocalDate())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  });

  el.exportCsvBtn?.addEventListener("click", () => {
    setDataMenuOpen(false);
    const csv = buildDaysCsv();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `self-improvement-days-${toISODate(todayLocalDate())}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  });

  el.importBtn?.addEventListener("click", () => {
    setDataMenuOpen(false);
    el.importFile?.click();
  });

  el.importFile?.addEventListener("change", async () => {
    const file = el.importFile.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const next = normalizeImportedState(parsed);
      if (!next) throw new Error("Invalid file");
      state = next;
      normalizeAllDaysToTasks();
      saveState(state);
      el.importFile.value = "";
      setActiveDate(activeDate);
    } catch {
      alert("Import failed. Please choose a valid export JSON file.");
      el.importFile.value = "";
    }
  });

  el.resetBtn.addEventListener("click", () => {
    setDataMenuOpen(false);
    const ok = confirm("Reset all data? This clears your progress, notes, skills, and objectives.");
    if (!ok) return;
    if (focusTimer.interval) window.clearInterval(focusTimer.interval);
    focusTimer.running = false;
    focusTimer.interval = null;
    state = initialState();
    saveState(state);
    setActiveDate(todayLocalDate());
  });

  el.calPrev?.addEventListener("click", () => {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    renderCalendar();
  });

  el.calNext?.addEventListener("click", () => {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  el.enableSyncBtn?.addEventListener("click", () => {
    enableSyncFromUI();
  });

  el.syncNowBtn?.addEventListener("click", () => {
    syncNow("pull");
  });
}

bindEvents();
bindCollapsibles();
setRightTab(activeRightTab);

// Restore saved sync settings (optional)
const savedSync = loadSyncSettings();
if (savedSync?.enabled) {
  if (el.syncKey) el.syncKey.value = savedSync.key ?? "";
  if (el.firebaseConfig) el.firebaseConfig.value = JSON.stringify(savedSync.firebaseConfig ?? {}, null, 2);
  // Don’t auto-enable without user intent; show ready state.
  setSyncStatus("Sync settings loaded (click Enable)");
}

render();
