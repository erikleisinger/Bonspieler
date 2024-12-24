import type { BracketEvent } from "./types"
import { useApi } from "@/shared/composables/useApi"
import { useBracket } from './useBracket'
import type { Tables } from "@/shared/types/database.types"

function isLocalId(id: string | number) {
  return `${id}`.split('id')?.length === 2
}

export const useSaveBracket = () => {

  async function createNewBracket(bracketGroupId: string) {
    return (await useApi().from('brackets').insert({
      bracket_group_id: bracketGroupId,
    }).select('id').single())
  }

  async function updateBracket(bracketGroupId: string, bracketId: string) {
    return (await useApi().from('brackets').update({
      bracket_group_id: bracketGroupId,
    }).eq('id', bracketId).select('id').single())
  }

  async function insertBracketGames(games, bracketId) {
    const { data } = await useApi().from('bracket_games').insert(games.map((g) => {
      const { y, lineWidth } = g.transform
      return {
        local_id: g.id,
        readable_id: g.readableId,
        round_number: g.roundNumber,
        bracket_id: bracketId,
        y,
        lineWidth: `${lineWidth}`
      }
    })).select('*')
    return data
  }

  async function upsertBracketGames(games, bracketId) {
    const { data } = await useApi().from('bracket_games').upsert(games.map((g) => {
      const { y, lineWidth } = g.transform
      return {
        id: g.id,
        readable_id: g.readableId,
        round_number: g.roundNumber,
        bracket_id: bracketId,
        y,
        lineWidth: `${lineWidth}`
      }
    })).select('*')
    return data
  }

  function getConnectionIdToSave(gameId: string | null | undefined, gamesArr: Tables<'bracket_games'>[]) {
    if (!gameId) return null;
    const n = Number(gamesArr.find(({ local_id, id }) => local_id === gameId || `${id}` === gameId)?.id)
    if (Number.isNaN(n)) return null;
    return n;
  }

  async function saveBracket(bracketStoreId: string, bracketGroupId: string) {
    const { gamesIndex, gamesBracketIndex, getEditableGames, deletedGameIds, deletedBracketIds, getNumEndTeamsForBracketEvent, getNumRequiredTeamsForBracketEvent } = useBracket(bracketStoreId)
    let bracketGames: Tables<'bracket_games'>[] = []

    const startTeams = getNumRequiredTeamsForBracketEvent();
    const endTeams = getNumEndTeamsForBracketEvent()

    await useApi().from('bracket_groups').update({
      start_team_count: startTeams,
      end_team_count: endTeams
    }).eq('id', bracketGroupId)

    await Array.from(gamesBracketIndex.entries()).reduce(async (prom, [bracketId, games]) => {
      await prom
      let dbBracketId;
      if (isLocalId(bracketId)) {
        const { data } = await createNewBracket(bracketGroupId)
        dbBracketId = data?.id;
      } else {
        const { data } = await updateBracket(bracketGroupId, bracketId)
        dbBracketId = data?.id;
      }

      const gamesWithReadable = getEditableGames(games)
      const insertedGames = await insertBracketGames(gamesWithReadable.filter(({ id }) => isLocalId(id)), dbBracketId) || []
      const upsertedGames = await upsertBracketGames(gamesWithReadable.filter(({ id }) => !isLocalId(id)), dbBracketId) || []
      bracketGames = [...bracketGames, ...insertedGames, ...upsertedGames]
    }, Promise.resolve())

    await useApi().from('bracket_games').upsert(bracketGames?.map((g) => {
      const { game } = gamesIndex.get(`${g.local_id}`) || gamesIndex.get(`${g.id}`) || {};
      const { connections } = game || {};
      const { winner, loser } = connections || {};
      const winnerConnection = getConnectionIdToSave(winner, bracketGames);
      const loserConnection = getConnectionIdToSave(loser, bracketGames)
      return {
        ...g,
        winner_bracket_game_id: winnerConnection,
        loser_bracket_game_id: loserConnection,
      }
    }))
    console.log(deletedBracketIds)
    await useApi().from('bracket_games').delete().in('id', deletedGameIds)
    await useApi().from('brackets').delete().in('id', deletedBracketIds)

  }

  return { saveBracket }
}
