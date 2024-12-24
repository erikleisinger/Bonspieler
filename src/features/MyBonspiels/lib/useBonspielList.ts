import { useApi } from "@/shared/composables/useApi"
import { useQuery } from "@tanstack/vue-query"
export const useBonspielList = () => {
  function getAllBonspiels() {
    async function f() {
      const { data, error } = await useApi().from('events').select('*')
      if (error) throw new Error(error.message)
      return data;
    }
    return useQuery({
      queryKey: ['bonspiels'],
      queryFn: f,
      initialData: []
    })
  }

  function getMyBonspiels() {
    const userId = import.meta.env.VITE_SUPABASE_USER_ID
    async function f() {
      const { data, error } = await useApi().from('events').select('*').eq('owner_id', userId)
      if (error) throw new Error(error.message)
      return data;
    }
    return useQuery({
      queryKey: ['bonspiels'],
      queryFn: f,
      initialData: []
    })
  }


  return {
    getAllBonspiels,
    getMyBonspiels,
  }
}
