import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/api/profile';
import { getSubscriptionPlans } from '@/api/subscription';
import type { UpdateProfileData } from '@/types/profile';

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getProfile(userId),
    enabled: !!userId,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      userId, 
      updates 
    }: { 
      userId: string; 
      updates: UpdateProfileData
    }) => updateProfile(userId, updates),
    onSuccess: (data) => {
      if (data?.user_id) {
        queryClient.invalidateQueries({ queryKey: ['userProfile', data.user_id] });
      }
    },
  });
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: getSubscriptionPlans,
  });
};

// Alias for compatibility
export { useUserProfile as useProfile };
