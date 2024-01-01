import React from "react";
import { Route } from "react-router-dom";
import { App, ZMPRouter, AnimationRoutes, SnackbarProvider } from "zmp-ui";
import { RecoilRoot } from "recoil";
import HomePage from "../pages/home/index";
import DetailTicketPage from "../pages/tickets/detail";
import SearchPage from "../pages/tickets/search";
import DetailAccountPage from "../pages/profiles/index";
import LoginPage from "../pages/login";
import AboutUsPage from "../pages/about_us";
import TicketsListPage from "../pages/tickets/list";
import ConfirmTicketPage from "../pages/tickets/confirm";
import SaveTicketPage from "../pages/tickets/save";
import TicketItem from "./ticket";
import BottomNavigationPage from "../pages/bottom_navigation";

const MyApp = () => {
  return (
    <RecoilRoot>
      <App>
        <SnackbarProvider>
          <ZMPRouter>
            <AnimationRoutes>
              <Route path="/" element={<LoginPage />} />
              <Route
                path="/bottom_navigation"
                element={<BottomNavigationPage />}
              />
              <Route path="/ticket" element={<TicketItem />} />
              <Route path="/tickets/list" element={<TicketsListPage />} />
              <Route
                path="/tickets/detail/:id"
                element={<DetailTicketPage />}
              />
              <Route path="/tickets/save" element={<SaveTicketPage />} />
              <Route path="/tickets/search" element={<SearchPage />} />
              <Route path="/about_us" element={<AboutUsPage />} />
              <Route path="/tickets/confirm" element={<ConfirmTicketPage />} />
              <Route path="/profiles/index" element={<DetailAccountPage />} />
              <Route path="/home/index" element={<HomePage />} />
            </AnimationRoutes>
          </ZMPRouter>
        </SnackbarProvider>
      </App>
    </RecoilRoot>
  );
};

export default MyApp;
