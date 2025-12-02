import { supabase } from '../lib/supabaseClient';
import type { Category } from '../types/finia';

const requireUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data?.user) throw new Error('User not authenticated');
  return data.user.id;
};

export async function createCategory(
  payload: Omit<Category, 'id' | 'user_id' | 'created_at'>
): Promise<Category> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('categories')
    .insert([{ ...payload, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}

export async function listCategoriesForCurrentUser(): Promise<Category[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as Category[];
}
