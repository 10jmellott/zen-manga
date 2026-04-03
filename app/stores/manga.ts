export const useMangaStore = defineStore('manga', {
  state: () => ({
    lastUpdated: [{
		id: 1,
		title: 'One Piece',
	}, {
		id: 2,
		title: 'Naruto',
	}],
	continueReading: [{
		id: 1,
		title: 'One Piece',
	}]
  })
});
