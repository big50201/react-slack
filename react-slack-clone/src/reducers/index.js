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



const root_reducer = combineReducers({
    user:user_reducer
})

export default root_reducer;