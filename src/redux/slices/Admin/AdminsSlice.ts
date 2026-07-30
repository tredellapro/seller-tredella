import { createSlice } from '@reduxjs/toolkit';

const initialState: {
  userLoading: boolean;
  loggedInUser: any | undefined; //eslint-disable-line
} = {
  userLoading: false,
  loggedInUser: undefined
};

const usersSlice = createSlice({
  name: 'usersSlice',
  initialState: initialState,
  reducers: {
    loggedInAdminAction: (state, action) => {
      state.loggedInUser = action.payload;
    }
  }
});

export const { loggedInAdminAction } = usersSlice.actions;
export default usersSlice.reducer;
