import {combineReducers} from 'redux';
import * as actionTypes from '../actions/types';
const initUserState ={
    currentUser:null,
    isLoading:true
} 
const user_reducer = (state = initUserState,action)=>{
    switch(action.type)
    {
        case actionTypes.SET_USER:
            return {
                currentUser:action.payload.currentUser,
                isLoading:false
            }
        case actionTypes.CLEAR_USER:
            return {
                ...initUserState,
                isLoading:false
            }
        default:
            return state;
    }
}

const initChannelState = {
    currentChannel:null,
    isPrivateChannel:false,
    userPosts:null,
    updatedChannel:null,
    allChannels:[],
    starreds:[]
}
const channel_reducers = (state=initChannelState,action)=>{
    switch (action.type) {
        case actionTypes.SET_CURRENT_CHANNEL:
            return {
                ...state,
                currentChannel:action.payload.currentChannel
            }
        case actionTypes.SET_PRIVATE_CHANNEL:
            return {
                ...state,
                isPrivateChannel:action.payload.isPrivateChannel
            }
        case actionTypes.SET_USER_POSTS:
            return {
                ...state,
                userPosts:action.payload.userPosts
            }
        case actionTypes.UPDATED_CURRENT_CHANNEL:
            return {
                ...state,
                updatedChannel:action.payload.updatedChannel
            }
        case actionTypes.GET_ALL_CHANNELS:
            return {
                ...state,
                allChannels:action.payload.allChannels
            }
        case actionTypes.GET_ALL_STARRED_CHANNELS:
            return {
                ...state,
                starreds:action.payload.starreds
            }
        default:
            return state;
    }
}

const initColorState = {
    primaryColor:'#4c3c4c',
    secondaryColor:'#eee'
}

const color_reducer = (state=initColorState,action)=>{
    switch(action.type){
        case actionTypes.SET_COLORS:
            return {
                primaryColor:action.payload.primaryColor,
                secondaryColor:action.payload.secondaryColor
            }
        default:
            return state;
    }

}

const root_reducer = combineReducers({
    user:user_reducer,
    channel:channel_reducers,
    colors:color_reducer
})

export default root_reducer;