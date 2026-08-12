import React from 'react';
import { ProUpgradeModal } from './ProUpgradeModal';
import { UserProfile } from '../types';

interface PhonePeModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  onSuccessProUnlocked: (updatedUser?: UserProfile) => void;
  user?: UserProfile;
}

export const PhonePeModal: React.FC<PhonePeModalProps> = ({
  isOpen,
  onClose,
  uid,
  onSuccessProUnlocked,
  user,
}) => {
  const fallbackUser: UserProfile = user || {
    uid,
    displayName: 'Candidate',
    email: 'candidate@crackitai.com',
    role: 'free',
    isPro: false,
    trialStartDate: new Date().toISOString(),
    preferredGoals: [],
    targetCategory: 'all',
    targetExamsOrCompanies: [],
    weakTopics: [],
  };

  return (
    <ProUpgradeModal
      isOpen={isOpen}
      onClose={onClose}
      user={fallbackUser}
      onSuccessProUnlocked={(updated) => {
        onSuccessProUnlocked(updated);
      }}
    />
  );
};
