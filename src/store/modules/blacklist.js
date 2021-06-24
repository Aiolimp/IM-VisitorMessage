import tim from '../../utils/tim'
import store from '..'
const blacklistModule = {
  state: {
    blacklist: []
  },
  mutations: {
    updateBlacklist(state, blacklist) {
      state.blacklist = blacklist
    },
    removeFromBlacklist(state, userID) {
      state.blacklist = state.blacklist.filter(item => item.userID !== userID)
    },
    reset(state) {
      Object.assign(state, {
        blacklist: []
      })
    }
  },
  actions: {
    getBlacklist(context) {
      tim(store.state.basic.imInfo.sdkAppID)
        .getBlacklist()
        .then(({ data }) => {
          if (data.length > 0) {
            tim(store.state.basic.imInfo.sdkAppID).getUserProfile({ userIDList: data })
              .then(({ data }) => {
                context.commit('updateBlacklist', data)
              })
          }
        })
    }
  }
}

export default blacklistModule
