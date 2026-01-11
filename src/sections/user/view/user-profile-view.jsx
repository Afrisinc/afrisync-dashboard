import { useState, useEffect } from 'react';

import { _userAbout } from 'src/_mock';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { ProfileHome } from '../profile-home';

// ----------------------------------------------------------------------


export function UserProfileView() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await axiosInstance.get(endpoints.post.list, {
          params: {
            page: 1,
            limit: 10,
          },
        });
        // Handle the nested response structure: response.data.data.data
        setPosts(response.data?.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch user posts:', error);
        setPosts([]);
      }
    };

    fetchUserPosts();
  }, []);

  return (
    <DashboardContent>
      <ProfileHome info={_userAbout} posts={posts} />
    </DashboardContent>
  );
}
