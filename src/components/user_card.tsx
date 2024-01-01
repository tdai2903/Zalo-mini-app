// UserInformation.js
import React from "react";
import { Box, Text, Avatar, Icon } from "zmp-ui";
import iconavatar from "/assets-src/icon-cloudgo.png";
const DataUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

const UserInformation = ({
  userInfo,
  isGetData,
  navigate,
  setGetAccessTokenModal,
  resFont,
}) => {
  return (
    <Box className="detail-container">
      <Box flex flexDirection="row" alignContent="center">
        {userInfo.avatar ? (
          <Avatar size={40} src={userInfo.avatar} />
        ) : (
          <Box
            style={{
              backgroundColor: " rgba(255, 255, 255, 1)",
              border: "1px rgba(233, 235, 237, 1) solid ",
              borderRadius: "50%",
            }}
            p={1}
            width={42}
            height={42}
          >
            <img src={iconavatar} alt="iconavatar" />
          </Box>
        )}

        <div>
          <Box flexDirection="row" justifyContent="center">
            <Text
              style={{
                paddingLeft: "10px",
                fontSize: resFont(15),
                fontWeight: 400,
              }}
            >
              Xin chào,
            </Text>
            <Text
              style={{
                fontWeight: 500,
                paddingLeft: "8px",
                fontSize: resFont(15),
              }}
            >
              {userInfo.name}
            </Text>
          </Box>
          <Box
            flex
            flexDirection="row"
            onClick={() => {
              if (isGetData) {
                navigate(`/profiles/index`);
              } else {
                setGetAccessTokenModal(true);
              }
            }}
          >
            <Text
              style={{
                paddingLeft: "10px",
                fontSize: resFont(14),
                fontWeight: 400,
              }}
            >
              Tài khoản
            </Text>
            <Icon
              icon="zi-chevron-right"
              size={21}
              style={{ paddingTop: "1px" }}
            ></Icon>
          </Box>
        </div>
      </Box>
    </Box>
  );
};

export default UserInformation;
