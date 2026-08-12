import React from 'react';
import { UserProfile } from '../types';
import { CurrentAffairs } from './CurrentAffairs';

interface CurrentAffairsFeedProps {
  user: UserProfile;
}

export const CurrentAffairsFeed: React.FC<CurrentAffairsFeedProps> = ({ user }) => {
  return <CurrentAffairs user={user} />;
};

export default CurrentAffairsFeed;
