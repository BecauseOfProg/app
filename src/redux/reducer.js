import {light_others, lightsb, styles, theme} from '../theme/light';
import {dark_others, darksb, darkstyles, darktheme} from '../theme/dark';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-community/async-storage';

const light = {
  t: 'light',
  sb: lightsb,
  styles: styles,
  theme: theme,
  others: light_others,
};

const dark = {
  t: 'dark',
  sb: darksb,
  styles: darkstyles,
  theme: darktheme,
  others: dark_others,
};

export const CLOSE_BANNERS = 'CLOSE_BANNERS';
export const OPEN_BANNERS = 'OPEN_BANNERS';
export const CHANGE_THEME = 'CHANGE_THEME';
export const READ_ARTICLES = 'READ_ARTICLES';

export const closeBanners = (item) => ({
  type: CLOSE_BANNERS,
  payload: item,
});

export const openBanners = (item) => ({
  type: OPEN_BANNERS,
  payload: item,
});

export const changeTheme = (item) => ({
  type: CHANGE_THEME,
  payload: item,
});

export const readArticles = (item) => ({
  type: READ_ARTICLES,
  payload: item,
});

const initialState = {
  banner: false,
  theme: light,
  readArticles: [],
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLOSE_BANNERS:
      return {
        ...state,
        banner: false,
      };
    case OPEN_BANNERS:
      return {
        ...state,
        banner: true,
      };
    case READ_ARTICLES:
      if (Array.isArray(action.payload)) {
        return {...state, readArticles: action.payload};
      } else {
        if (!state.readArticles.includes(action.payload)) {
          AsyncStorage.setItem(
            '@readArticles',
            JSON.stringify([...state.readArticles, action.payload]),
          ).then(() => {});
          return {
            ...state,
            readArticles: [...state.readArticles, action.payload],
          };
        } else {
          return state;
        }
      }
    case CHANGE_THEME:
      let t = action.payload === 'light';
      changeNavigationBarColor(t ? light.sb : dark.sb, true);
      SplashScreen.hide();
      return {
        ...state,
        theme: t ? light : dark,
      };
    default:
      return state;
  }
};

export default rootReducer;
