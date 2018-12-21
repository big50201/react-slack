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
    currentChannel:null
}
const channel_reducers = (state=initChannelState,action)=>{
    switch (action.type) {
        case actionTypes.SET_CURRENT_CHANNEL:
            return {
                ...state,
                currentChannel:action.payload.currentChannel
            }
    
        default:
            return state;
    }
}

const root_reducer = combineReducers({
    user:user_reducer,
    channel:channel_reducers
})

export default root_reducer;