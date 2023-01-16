import {combineReducers} from 'redux';
import like from './like';
import settings from './settings';
import dream from './dream';

export default combineReducers({
  like,
  settings,
  dream,
});
