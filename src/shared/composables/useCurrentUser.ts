export const useCurrentUser = () => {
  const userId = import.meta.env.VITE_SUPABASE_USER_ID;
  function isCurrentUser(id: string) {
    return userId === id;
  }
  return {
    isCurrentUser,
    userId
  }
}
