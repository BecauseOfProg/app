import {light_others, lightsb, styles, theme} from '../theme/light';
import {dark_others, darksb, darkstyles, darktheme} from '../theme/dark';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SplashScreen from 'react-native-splash-screen';

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

const initialState = {
  banner: false,
  theme: light,
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
    case CHANGE_THEME:
      let t = action.payload === 'light';
      // console.log('STATE change : ' + action.payload);
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
