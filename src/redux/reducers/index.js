import {combineReducers} from 'redux';
import like from './like';
import settings from './settings';

export default combineReducers({
  like,
  settings,
});
