// recoilAtoms.js
import { atom } from "recoil";

// global list tickets
export const resState = atom({
  key: "resState",
  default: [],
});

export const resCompanyState = atom({
  key: "resCompanyState",
  default: [],
});

export const notiState = atom({
  key: "notiState",
  default: [],
});

export const getNoti = atom({
  key: "getNoti",
  default: false,
});

export const ticketListState = atom({
  key: "ticketListState",
  default: false,
});

export const offsetState = atom({
  key: "offset",
  default: 0,
});

export const isGetDataState = atom({
  key: "isGetDataState",
  default: false,
});

export const userInfoState = atom({
  key: "userInfoState",
  default: {
    id: "",
    name: "",
    avatar: "",
  },
});

export const getNewsState = atom({
  key: "getNews",
  default: [],
});

export const loadingState = atom({
  key: "loadingState",
  default: false,
});

export const loadingListState = atom({
  key: "loadingListState",
  default: true,
});

export const loadToAppState = atom({
  key: "loadToAppState",
  default: true,
});
