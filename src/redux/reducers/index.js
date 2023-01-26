import {combineReducers} from 'redux';
import like from './like';
import user from './user';
import dream from './dream';

export default combineReducers({
  like,
  user,
  dream,
});
