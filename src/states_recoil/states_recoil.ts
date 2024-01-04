// recoilAtoms.js
import { atom } from "recoil";
import { TicketType } from "../type";

// global list tickets
export const resState = atom({
  key: "resState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
});

export const resCompanyState = atom({
  key: "resCompanyState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
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

export const allTicketState = atom({
  key: "allTicketsState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
});
export const followTicketState = atom({
  key: "followTicketState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
});
export const openTicketState = atom({
  key: "openTicketState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
});
export const processTicketState = atom({
  key: "processTicketState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
});
export const closedTicketState = atom({
  key: "closedTicketState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
});
export const cancelTicketState = atom({
  key: "cancelTicketState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
});

export const allTicketCompanyState = atom({
  key: "allTicketCompanyState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
});
export const followTicketCompanyState = atom({
  key: "followTicketCompanyState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
});
export const openTicketCompanyState = atom({
  key: "openTicketCompanyState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
});
export const processTicketCompanyState = atom({
  key: "processTicketCompanyState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
});
export const closedTicketCompanyState = atom({
  key: "closedTicketCompanyState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
});
export const cancelTicketCompanyState = atom({
  key: "cancelTicketCompanyState",
  default: { entry_list: <TicketType[]>[], paging: { total_count: 0 } },
});
