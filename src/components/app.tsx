import React from "react";
import { Route } from "react-router-dom";
import { App, ZMPRouter, AnimationRoutes, SnackbarProvider } from "zmp-ui";
import { RecoilRoot } from "recoil";
import HomePage from "../pages/home";
import CreateTicketPage from "../pages/create_ticket";
import DetailTicketPage from "../pages/detail_ticket";
import EditTicketPage from "../pages/edit_ticket";
import SearchPage from "../pages/search_ticket";
import MyAccountPage from "../pages/my_account";
import DetailAccountPage from "../pages/detail_account";
import NewsPage from "../pages/news";
import BottomNavigationPage from "../pages/main";
import LoginPage from "../pages/login";

const MyApp = () => {
  return (
    <RecoilRoot>
      <App>
        <SnackbarProvider>
          <ZMPRouter>
            <AnimationRoutes>
              <Route path="/" element={<LoginPage></LoginPage>}></Route>
              <Route
                path="/main"
                element={<BottomNavigationPage></BottomNavigationPage>}
              ></Route>
              <Route
                path="/edit_ticket"
                element={<EditTicketPage></EditTicketPage>}
              ></Route>
              <Route
                path="/detail_ticket/:id"
                element={<DetailTicketPage></DetailTicketPage>}
              ></Route>
              <Route
                path="/create_ticket"
                element={<CreateTicketPage></CreateTicketPage>}
              ></Route>
              <Route
                path="/search_ticket"
                element={<SearchPage></SearchPage>}
              ></Route>
              <Route
                path="/my_account"
                element={<MyAccountPage></MyAccountPage>}
              ></Route>
              <Route
                path="/detail_account"
                element={<DetailAccountPage></DetailAccountPage>}
              ></Route>
              <Route path="/news" element={<NewsPage></NewsPage>}></Route>
              <Route path="/home" element={<HomePage></HomePage>}></Route>
            </AnimationRoutes>
          </ZMPRouter>
        </SnackbarProvider>
      </App>
    </RecoilRoot>
  );
};
export default MyApp;
