import React from 'react';
import { ResumeBuilder } from './ResumeBuilder';
import { UserProfile } from '../types';

export const ATSResumeBuilder: React.FC<{ user: UserProfile }> = (props) => {
  return <ResumeBuilder {...props} />;
};

export default ATSResumeBuilder;
