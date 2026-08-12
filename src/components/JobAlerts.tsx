import React from 'react';
import { JobAlertsView } from './JobAlertsView';
import { JobAlert, UserProfile } from '../types';

interface JobAlertsProps {
  alerts: JobAlert[];
  user: UserProfile;
  onLaunchTestForJob: (jobTitle: string, tags: string[]) => void;
}

export const JobAlerts: React.FC<JobAlertsProps> = (props) => {
  return <JobAlertsView {...props} />;
};

export default JobAlerts;
