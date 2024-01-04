import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, Input, Page, Text, useSnackbar, Avatar } from "zmp-ui";
import { ContactType } from "../../type";
import { url_api } from "../../const";
import { useService } from "../../functions/common";

const DetailAccountPage = () => {
  const { configView, setLeftButton } = useService();
  const { openSnackbar } = useSnackbar(); // hiển thị alert từ zalo api
  const contactData = JSON.parse(localStorage.getItem("profile") || "{}"); // lấy contactData từ localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}"); // lấy userInfo từ localStorage
  const token = localStorage.getItem("token"); // lấy tokenapi pms-dev từ localStorage
  const [emailInput, setEmailInput] = useState(""); // state input email
  const [errorText, setErrorText] = useState(""); // state hiển thị error text
  const [status, setStatus] = useState(""); // state status ở input
  const initialContactState: ContactType = {
    firstname: "",
    lastname: "",
    mobile: "",
    email: "",
    zalo_id_miniapp: "",
  }; // state các field contact
  const [newContact, setNewContact] = React.useState<ContactType>({
    ...initialContactState,
  });

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|vn)$/;
    if (email.trim() === "") {
      return true;
    }
    return emailRegex.test(email);
  };

  useEffect(() => {
    configView("Thông tin tài khoản", "back");
    setLeftButton("back");
    setNewContact((prevTicket) => ({
      ...prevTicket,
      email: contactData.data?.email || "",
    }));
    setEmailInput(contactData.data?.email || "");
  }, []);

  /**
   * API UpdateContactZalo dùng để update contact trên module contact crm
   * @param email | zalo_id_miniapp
   * @param full_name : lấy từ userInfo zalo
   * @param phoneNumber : lấy từ api zalo getPhoneNumber
   */
  const editContact = async () => {
    // check validate email
    const isEmailValid = validateEmail(emailInput);
    if (!isEmailValid) {
      setErrorText("Email không hợp lệ. Vui lòng kiểm tra lại.");
      setStatus("error");
      return;
    }
    setErrorText("");
    setStatus("");

    // hiển thị alert khi edit contact
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
        setNewContact(initialContactState);

        // hiển thị alert khi edit thành công
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
