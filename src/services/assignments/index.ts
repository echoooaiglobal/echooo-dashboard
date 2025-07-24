// src/services/assignments/index.ts
export * from './assignments.service';
export * from './assignments.server';

// Export new functions with clear naming
export { 
  getAgentAssignments,
  getAssignmentInfluencers
} from './assignments.service';

export { 
  getAgentAssignmentsServer,
  getAssignmentInfluencersServer
} from './assignments.server';