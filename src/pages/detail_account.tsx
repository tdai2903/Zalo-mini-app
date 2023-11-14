import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Input,
  Page,
  Text,
  Modal,
  useSnackbar,
  Avatar,
  Icon,
} from "zmp-ui";
import {
  onConfirmToExit,
  offConfirmToExit,
  setNavigationBarLeftButton,
  closeApp,
  configAppView,
} from "zmp-sdk/apis";
import { ContactType } from "../type";
import url_api from "../service";
const DetailAccountPage: React.FunctionComponent = () => {
  const { openSnackbar } = useSnackbar();
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const token = localStorage.getItem("token");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const initialTicketState: ContactType = {
    firstname: "",
    lastname: "",
    mobile: "",
    email: "",
    zalo_id_miniapp: "",
  };
  const [newContact, setNewContact] = React.useState<ContactType>({
    ...initialTicketState,
  });
  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#006AF5",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "Thông tin tài khoản",
          leftButton: "back",
        },
      });
    } catch (error) {}
  };
  setNavigationBarLeftButton({
    type: "none",
    success: (res) => {
      // xử lý khi gọi api thành công
    },
    fail: (error) => {
      // xử lý khi gọi api thất bại
      console.log(error);
    },
  });

  useEffect(() => {
    configView();
    onConfirmToExit(() => setConfirmModalVisible(true));
    return () => offConfirmToExit();
  }, [confirmModalVisible]);

  const editContact = async () => {
    openSnackbar({
      text: "Đang chỉnh sửa contact...",
      type: "loading",
      duration: 10000,
    });
    const headers = {
      "Content-Type": "application/json",
    };

    if (token !== null) {
      headers["token"] = token;
    }
    axios
      .post(
        url_api,
        {
          RequestAction: "UpdateContactZalo",
          Data: {
            email: newContact.email,
            zalo_id_miniapp: contactData.data.zalo_id_miniapp,
          },
        },
        {
          headers: headers,
        }
      )
      .then((response) => {
        console.log("Đã chỉnh sửa contact:", response.data);
        openSnackbar({
          text: "Chỉnh sửa contact thành công",
          type: "success",
        });
        setNewContact(initialTicketState);
      })
      .catch((error) => {
        console.error("Lỗi khi lưu contat:", error);
      });
  };

  return (
    <Page hideScrollbar={true}>
      <Box className="section-container">
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Avatar size={96} src={userInfo.avatar} />
        </Box>

        <Box mt={3} style={{ paddingTop: "16px" }}>
          <Text style={{ fontSize: "14px", paddingBottom: "4px" }}>
            Họ và tên
          </Text>
          <Box
            height={50}
            style={{
              backgroundColor: "rgba(244, 245, 246, 1)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: "12px",
            }}
          >
            {contactData.data.full_name}
          </Box>
        </Box>

        <Box mt={3}>
          <Text style={{ fontSize: "14px" }}>Di động</Text>
          <Box mt={1} flexDirection="row" alignItems="center">
            <Box
              height={48}
              flexDirection="row"
              style={{
                borderTopLeftRadius: "8px",
                borderBottomLeftRadius: "8px",
                backgroundColor: "rgba(214, 217, 220, 1)",
                display: "flex",
                alignItems: "center",
                width: "20%",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "rgba(20, 20, 21, 1)",
                  paddingRight: "4px",
                }}
              >
                +84
              </Text>
              <Icon
                icon="zi-chevron-down"
                size={16}
                style={{ paddingTop: "2px", color: "rgba(185, 189, 193, 1)" }}
              ></Icon>
            </Box>
            <Box
              height={48}
              style={{
                backgroundColor: "rgba(244, 245, 246, 1)",
                borderTopRightRadius: "8px",
                borderBottomRightRadius: "8px",
                display: "flex",
                alignItems: "center",
                paddingLeft: "8px",
                width: "80%",
              }}
            >
              <Text style={{ color: "rgba(118, 122, 127, 1)" }}>
                {contactData.data.mobile.replace(/^84/, "")}
              </Text>
            </Box>
          </Box>
        </Box>

        <Box mt={3}>
          <Text style={{ fontSize: "14px" }}>Email</Text>
          <Input
            type="text"
            placeholder="Vui lòng nhập email"
            defaultValue={contactData.data.email || newContact.email}
            onChange={(e) => {
              setNewContact((prevTicket) => ({
                ...prevTicket,
                email: e.target.value,
              }));
            }}
          />
        </Box>

        <Button
          fullWidth
          style={{ marginTop: "64px", borderRadius: "8px" }}
          onClick={editContact}
        >
          Cập nhật
        </Button>
      </Box>

      <Modal visible={confirmModalVisible}>
        <img
          style={{
            width: "100px",
            height: "100px",
            display: "block",
            margin: "0 auto",
          }}
          src="https://clipart-library.com/images/gTe5bLznc.gif"
        />

        <Text
          style={{
            fontWeight: 500,
            fontSize: "24px",
            textAlign: "center",
            paddingTop: "24px",
            paddingBottom: "16px",
          }}
        >
          My CloudGO
        </Text>
        <Text
          style={{
            fontWeight: 500,
            color: "rgba(118, 122, 127, 1)",
            paddingBottom: "32px",
          }}
        >
          Bạn có chắc chắn rời khỏi Mini App không?
        </Text>
        <Box
          flex
          flexDirection="row"
          justifyContent="center"
          alignContent="center"
        >
          <Button
            variant="tertiary"
            style={{
              padding: "8px",
              width: "45%",
              borderRadius: "8px",
              border: "1px rgba(0, 106, 245, 1) solid ",
            }}
            size="medium"
            onClick={() => {
              closeApp();
            }}
          >
            Rời khỏi
          </Button>
          <Box width={5} height={1}></Box>
          <Button
            style={{
              padding: "8px",
              width: "45%",
              borderRadius: "8px",
            }}
            size="medium"
            onClick={() => {
              setConfirmModalVisible(false);
              offConfirmToExit();
            }}
          >
            Ở lại Mini App
          </Button>
        </Box>
      </Modal>
    </Page>
  );
};
export default DetailAccountPage;
