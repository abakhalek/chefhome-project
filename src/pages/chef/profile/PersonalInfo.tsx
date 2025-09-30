import React, { useEffect, useState } from 'react';
import { chefService, ChefProfile } from '../../../services/chefService';

const PersonalInfo: React.FC = () => {
  const [profile, setProfile] = useState<ChefProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await chefService.getProfile();
        setProfile(profileData);
      } catch (err) {
        setError('Failed to fetch profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!profile) {
    return <div>No profile found.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Personal Info</h1>
      {/* Display other personal info fields here */}
      <p>Name: {profile.name}</p>
      <p>Email: {profile.user.email}</p>
      <p>Phone: {profile.user.phone}</p>
      {/* Add more personal info fields as needed */}
    </div>
  );
};

export default PersonalInfo;