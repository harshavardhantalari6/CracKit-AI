import React from 'react';
import { UserProfile } from '../types';
import { SmartRevisionDashboard } from './SmartRevisionDashboard';

interface SmartRevisionEngineProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const SmartRevisionEngine: React.FC<SmartRevisionEngineProps> = ({ user, onUpdateUser }) => {
  return <SmartRevisionDashboard user={user} onUpdateUser={onUpdateUser} />;
};

export default SmartRevisionEngine;

