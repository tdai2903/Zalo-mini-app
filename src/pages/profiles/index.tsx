import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Input,
  Page,
  Text,
  useSnackbar,
  Avatar,
  Icon,
} from "zmp-ui";
import { configAppView } from "zmp-sdk/apis";
import { ContactType } from "../type";
import url_api from "../service";
import { setNavigationBarLeftButton } from "zmp-sdk";

const DetailAccountPage = () => {
  const { openSnackbar } = useSnackbar();
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const token = localStorage.getItem("token");
  const [emailInput, setEmailInput] = useState("");
  const [errorText, setErrorText] = useState("");
  const [status, setStatus] = useState("");
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

  const setLeftButton = async () => {
    try {
      await setNavigationBarLeftButton({
        type: "back",
      });
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|vn)$/;
    if (email.trim() === "") {
      return true;
    }
    return emailRegex.test(email);
  };

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

  useEffect(() => {
    configView();
    setLeftButton();
    setNewContact((prevTicket) => ({
      ...prevTicket,
      email: contactData.data?.email || "",
    }));
    setEmailInput(contactData.data?.email || "");
  }, []);

  const editContact = async () => {
    const isEmailValid = validateEmail(emailInput);
    if (!isEmailValid) {
      setErrorText("Email không hợp lệ. Vui lòng kiểm tra lại.");
      setStatus("error");
      return;
    }

    setErrorText("");
    setStatus("");
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
            email: emailInput,
            zalo_id_miniapp: contactData.data?.zalo_id_miniapp,
          },
        },
        {
          headers: headers,
        }
      )
      .then((response) => {
        console.log("Đã chỉnh sửa contact:", response.data);
        setNewContact(initialTicketState);
        openSnackbar({
          text: "Chỉnh sửa contact thành công",
          type: "success",
          duration: 2000,
        });
      })
      .catch((error) => {
        console.error("Lỗi khi lưu contat:", error);
      });
  };

  return (
    <Page hideScrollbar={true} resetScroll={false}>
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

          <Box flexDirection="row" alignContent="center">
            <Box
              height={50}
              style={{
                backgroundColor: "rgba(244, 245, 246, 1)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "12px",
                width: "100%",
              }}
            >
              {contactData.data?.full_name}
            </Box>
          </Box>
        </Box>

        <Box mt={3}>
          <Text style={{ fontSize: "14px" }}>Di động</Text>
          <Input
            style={{
              backgroundColor: "rgba(244, 245, 246, 1)",
            }}
            type="text"
            disabled
            defaultValue={contactData.data?.mobile.replace(/^84/, "0") || ""}
          />
        </Box>

        <Box mt={3}>
          <Text style={{ fontSize: "14px" }}>Email</Text>
          <Input
            type="text"
            placeholder="Vui lòng nhập email"
            value={emailInput}
            onChange={(e) => {
              const newEmail = e.target.value;
              setEmailInput(newEmail);
              setErrorText("");
              setStatus("");
            }}
            onBlur={() => {
              // Validate email onBlur
              const isEmailValid = validateEmail(emailInput);
              if (!isEmailValid) {
                setErrorText("Email không hợp lệ. Vui lòng kiểm tra lại.");
                setStatus("error");
              }
            }}
            errorText={errorText}
            status={status}
          />
        </Box>

        <Box style={{ paddingTop: "16px" }}>
          <Text style={{ fontSize: "14px", paddingBottom: "4px" }}>
            Công ty
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
            {contactData.data?.account_name}
          </Box>
        </Box>
        <Button
          fullWidth
          style={{ marginTop: "64px", borderRadius: "8px" }}
          onClick={editContact}
        >
          Cập nhật
        </Button>
      </Box>
    </Page>
  );
};
export default DetailAccountPage;
