import React, { useEffect, useState } from "react";
import { BottomNavigation, Modal, Icon, Page } from "zmp-ui";
import HomePage from "./home";
import CreateTicketPage from "./create_ticket";
import MyAccountPage from "./my_account";
import { onConfirmToExit, offConfirmToExit, closeApp } from "zmp-sdk/apis";
import { configAppView } from "zmp-sdk/apis";
const BottomNavigationPage = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const tabContents = {
    home: <HomePage />,
    create_ticket: <CreateTicketPage />,
    my_account: <MyAccountPage />,
  };
  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#1843EF",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "My CloudGO",
          leftButton: "back",
        },
      });
      // xử lý khi gọi api thành công
    } catch (error) {
      // xử lý khi gọi api thất bại
    }
  };
  useEffect(() => {
    configView();
    onConfirmToExit(() => setConfirmModalVisible(true));
    return () => offConfirmToExit();
  });
  return (
    <Page className="page" hideScrollbar={true}>
      <BottomNavigation
        fixed
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
      >
        <BottomNavigation.Item
          key="home"
          label="Trang chủ"
          icon={<Icon icon="zi-home" />}
          activeIcon={<Icon icon="zi-home" />}
        />
        <BottomNavigation.Item
          key="create_ticket"
          label=""
          style={{ height: "32px" }}
          icon={
            <Icon
              icon="zi-plus-circle-solid"
              size={32}
              style={{ color: "rgba(0, 106, 245, 1)" }}
            />
          }
          activeIcon={<Icon icon="zi-plus-circle-solid" size={32} />}
        />
        <BottomNavigation.Item
          label="Tài khoản"
          key="my_account"
          icon={<Icon icon="zi-user" />}
          activeIcon={<Icon icon="zi-user" />}
        />
      </BottomNavigation>
      {tabContents[activeTab]}
      <Modal
        visible={confirmModalVisible}
        title="CloudTICKET"
        description="Bạn có chắc muốn rời mini app không?"
        actions={[
          {
            text: "Ở lại Mini App",
            onClick: () => {
              setConfirmModalVisible(false);
            },
            highLight: true,
          },
          {
            text: "Rời khỏi",
            onClick: () => {
              closeApp();
            },
          },
        ]}
      />
    </Page>
  );
};

export default BottomNavigationPage;
