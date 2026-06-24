// ============================================================
//  DATA DEFINITIONS
// ============================================================

const DATA = {
  aiml: [
    'Python Revision',
    'SQL Revision',
    'Statistics Revision',
    'Machine Learning Revision',
    'Deep Learning Revision',
    'Pandas Revision',
    'Scikit-Learn Revision'
  ],

  cs: [
    'DBMS',
    'OOP',
    'Operating Systems',
    'Computer Networks',
    'System Design Basics'
  ],

  comm: [
    'Daily English Speaking Practice',
    'Daily Audio Recording Practice'
  ],

  interview: [
    'HR Questions Practice',
    'Technical Questions Practice',
    'Mock Interview Session'
  ],

  projExplain: [
    'AttendIQ — Explanation Ready',
    'PG Management Platform — Explanation Ready',
    'Financial Intelligence System — Explanation Ready'
  ],

  aptitude: [
    'Quantitative Aptitude Practice',
    'Logical Reasoning Practice'
  ],

  networking: [
    'LinkedIn Connections Sent',
    'Referral Requests Sent',
    'Mentorship Requests Sent'
  ],

  dsaTopics: [
    'Arrays',
    'Strings',
    'Hashing',
    'Linked Lists',
    'Trees',
    'Graphs',
    'Dynamic Programming',
    'Others'
  ],

  projPhases: [
    { id: 'research',   label: 'Research',             icon: 'ti-search' },
    { id: 'dataset',    label: 'Dataset Collection',   icon: 'ti-database' },
    { id: 'cleaning',   label: 'Data Cleaning',        icon: 'ti-filter' },
    { id: 'model',      label: 'Model Building',       icon: 'ti-brain' },
    { id: 'dashboard',  label: 'Dashboard Dev',        icon: 'ti-layout-dashboard' },
    { id: 'deployment', label: 'Deployment',           icon: 'ti-rocket' },
    { id: 'testing',    label: 'Testing',              icon: 'ti-test-pipe' },
    { id: 'docs',       label: 'Documentation',        icon: 'ti-file-text' }
  ],

  scoreItems: [
    { id: 'aiml',      label: 'AI/ML Study',     icon: 'ti ti-school' },
    { id: 'dsa',       label: 'DSA',             icon: 'ti ti-code' },
    { id: 'apps',      label: 'Applications',    icon: 'ti ti-briefcase' },
    { id: 'comm',      label: 'Communication',   icon: 'ti ti-microphone' },
    { id: 'interview', label: 'Interview Prep',  icon: 'ti ti-message-circle' },
    { id: 'project',   label: 'Major Project',   icon: 'ti ti-brain' }
  ],

  statusLabels: {
    applied:  'Applied',
    oa:       'OA Received',
    hr:       'HR Round',
    tech:     'Technical',
    final:    'Final Round',
    rejected: 'Rejected',
    selected: 'Selected 🎉'
  }
};

const START_DATE = new Date('2026-06-24');
