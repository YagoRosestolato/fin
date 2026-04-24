import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api';

export const useSummary = (month?: number, year?: number) => {
  return useQuery({
    queryKey: ['summary', month, year],
    queryFn: async () => {
      const res = await userApi.getSummary({ month, year });
      return res.data.data;
    },
    staleTime: 1000 * 30,
  });
};

export const useSavingsHistory = () => {
  return useQuery({
    queryKey: ['savings-history'],
    queryFn: async () => {
      const res = await userApi.getSavingsHistory();
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpsertMonthlyConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { month: number; year: number; salary: number; savingsGoal: number; paymentDay: number }) =>
      userApi.upsertMonthlyConfig(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['monthly-config', vars.year, vars.month] });
      queryClient.invalidateQueries({ queryKey: ['summary', vars.month, vars.year] });
      queryClient.invalidateQueries({ queryKey: ['savings-history'] });
    },
  });
};

export const useDailySpending = (month?: number, year?: number) => {
  return useQuery({
    queryKey: ['daily-spending', month, year],
    queryFn: async () => {
      const res = await userApi.getDailySpending({ month, year });
      return res.data.data;
    },
    staleTime: 1000 * 60,
  });
};
