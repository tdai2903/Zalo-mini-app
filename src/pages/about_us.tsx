import React, { useEffect } from "react";
import { Box, Icon, Page, Text } from "zmp-ui";
import {
  configAppView,
  openWebview,
  setNavigationBarLeftButton,
} from "zmp-sdk/apis";
import { openPhone } from "zmp-sdk/apis";
const AboutUsPage: React.FunctionComponent = () => {
  const aboutCloudgo = async () => {
    try {
      await openWebview({
        url: "https://cloudgo.vn/",
        config: {
          style: "normal",
          leftButton: "back",
        },
      });
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  const fanpageFacebook = async () => {
    try {
      await openWebview({
        url: "https://www.facebook.com/cloudgovn",
        config: {
          style: "normal",
          leftButton: "back",
        },
      });
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  const openCallScreen = async () => {
    try {
      await openPhone({
        phoneNumber: "1900292990",
      });
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  const youtube = async () => {
    try {
      await openWebview({
        url: "https://www.youtube.com/@cloudgovn",
        config: {
          style: "normal",
          leftButton: "back",
        },
      });
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  const SpCloudGo = async () => {
    try {
      await openWebview({
        url: "https://docs.cloudgo.vn/",
        config: {
          style: "normal",
          leftButton: "back",
        },
      });
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  const SpCloudPro = async () => {
    try {
      await openWebview({
        url: "https://docs.cloudpro.vn/",
        config: {
          style: "normal",
          leftButton: "back",
        },
      });
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#006AF5",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "My CloudGO",
          leftButton: "none",
        },
      });
      // xử lý khi gọi api thành công
    } catch (error) {
      // xử lý khi gọi api thất bại
    }
  };

  const setLeftButton = async () => {
    try {
      await setNavigationBarLeftButton({
        type: "none",
      });
      console.log("Đã ẩn leftButton");
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  useEffect(() => {
    configView();
    setLeftButton();
  }, []);

  return (
    <Page
      hideScrollbar={true}
      className="section-container"
      resetScroll={false}
    >
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <img
          style={{ width: "300px" }}
          alt="Hình ảnh"
          src="https://tel4vn.edu.vn/uploads/2023/07/CloudGO-logo-vertical.png"
        />
      </Box>

      <Box>
        <Box
          flexDirection="row"
          alignItems="center"
          height={60}
          style={{
            borderRadius: "15px",
            border: "2px solid rgba(233, 235, 237, 1)",
          }}
        >
          <Box
            mr={2}
            ml={4}
            height={40}
            width={40}
            alignItems="center"
            justifyContent="center"
            style={{
              display: "flex",
              borderRadius: "50%",
              backgroundColor: "rgba(237, 242, 253, 1)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              height="20"
              width="20"
            >
              <path
                fill="rgba(0, 106, 245, 1)"
                d="M256 48C141.1 48 48 141.1 48 256v40c0 13.3-10.7 24-24 24s-24-10.7-24-24V256C0 114.6 114.6 0 256 0S512 114.6 512 256V400.1c0 48.6-39.4 88-88.1 88L313.6 488c-8.3 14.3-23.8 24-41.6 24H240c-26.5 0-48-21.5-48-48s21.5-48 48-48h32c17.8 0 33.3 9.7 41.6 24l110.4 .1c22.1 0 40-17.9 40-40V256c0-114.9-93.1-208-208-208zM144 208h16c17.7 0 32 14.3 32 32V352c0 17.7-14.3 32-32 32H144c-35.3 0-64-28.7-64-64V272c0-35.3 28.7-64 64-64zm224 0c35.3 0 64 28.7 64 64v48c0 35.3-28.7 64-64 64H352c-17.7 0-32-14.3-32-32V240c0-17.7 14.3-32 32-32h16z"
              />
            </svg>
          </Box>
          <Box flexDirection="column">
            <Text>Hotline</Text>
            <Text onClick={openCallScreen}>1900 29 29 90</Text>
          </Box>
        </Box>
        <Box
          mt={4}
          flexDirection="row"
          alignItems="center"
          height={60}
          style={{
            borderRadius: "15px",
            border: "2px solid rgba(233, 235, 237, 1)",
          }}
        >
          <Box
            mr={2}
            ml={4}
            height={40}
            width={40}
            alignItems="center"
            justifyContent="center"
            style={{
              display: "flex",
              borderRadius: "50%",
              backgroundColor: "rgba(237, 242, 253, 1)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              height="20"
              width="20"
            >
              <path
                fill="rgba(0, 106, 245, 1)"
                d="M256 464c7.4 0 27-7.2 47.6-48.4c8.8-17.7 16.4-39.2 22-63.6H186.4c5.6 24.4 13.2 45.9 22 63.6C229 456.8 248.6 464 256 464zM178.5 304h155c1.6-15.3 2.5-31.4 2.5-48s-.9-32.7-2.5-48h-155c-1.6 15.3-2.5 31.4-2.5 48s.9 32.7 2.5 48zm7.9-144H325.6c-5.6-24.4-13.2-45.9-22-63.6C283 55.2 263.4 48 256 48s-27 7.2-47.6 48.4c-8.8 17.7-16.4 39.2-22 63.6zm195.3 48c1.5 15.5 2.2 31.6 2.2 48s-.8 32.5-2.2 48h76.7c3.6-15.4 5.6-31.5 5.6-48s-1.9-32.6-5.6-48H381.8zm58.8-48c-21.4-41.1-56.1-74.1-98.4-93.4c14.1 25.6 25.3 57.5 32.6 93.4h65.9zm-303.3 0c7.3-35.9 18.5-67.7 32.6-93.4c-42.3 19.3-77 52.3-98.4 93.4h65.9zM53.6 208c-3.6 15.4-5.6 31.5-5.6 48s1.9 32.6 5.6 48h76.7c-1.5-15.5-2.2-31.6-2.2-48s.8-32.5 2.2-48H53.6zM342.1 445.4c42.3-19.3 77-52.3 98.4-93.4H374.7c-7.3 35.9-18.5 67.7-32.6 93.4zm-172.2 0c-14.1-25.6-25.3-57.5-32.6-93.4H71.4c21.4 41.1 56.1 74.1 98.4 93.4zM256 512A256 256 0 1 1 256 0a256 256 0 1 1 0 512z"
              />
            </svg>
          </Box>
          <Box flexDirection="column">
            <Text>Website</Text>
            <Text onClick={aboutCloudgo}>https://cloudgo.vn</Text>
          </Box>
        </Box>

        <Box
          mt={4}
          flexDirection="row"
          alignItems="center"
          height={60}
          style={{
            borderRadius: "15px",
            border: "2px solid rgba(233, 235, 237, 1)",
          }}
        >
          <Box
            mr={2}
            ml={4}
            height={40}
            width={40}
            alignItems="center"
            justifyContent="center"
            style={{
              display: "flex",
              borderRadius: "50%",
              backgroundColor: "rgba(237, 242, 253, 1)",
            }}
          >
            <Icon icon="zi-note" style={{ color: "rgba(0, 106, 245, 1)" }} />
          </Box>
          <Box flexDirection="column">
            <Text>Hướng dẫn sử dụng</Text>
            <Text onClick={SpCloudGo}>https://docs.cloudgo.vn</Text>
          </Box>
        </Box>

        <Box
          mt={4}
          flexDirection="row"
          alignItems="center"
          height={60}
          style={{
            borderRadius: "15px",
            border: "2px solid rgba(233, 235, 237, 1)",
          }}
        >
          <Box
            mr={2}
            ml={4}
            height={40}
            width={40}
            alignItems="center"
            justifyContent="center"
            style={{
              display: "flex",
              borderRadius: "50%",
              backgroundColor: "rgba(237, 242, 253, 1)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              height="20"
              width="20"
            >
              <path
                fill="rgba(24, 119, 242, 1)"
                d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V510.1C413.8 494.8 512 386.9 512 256h0z"
              />
            </svg>
          </Box>
          <Box flexDirection="column">
            <Text>Fanpage CloudGO</Text>
            <Text onClick={fanpageFacebook}>
              https://www.facebook.com/cloudgovn
            </Text>
          </Box>
        </Box>
        <Box
          mt={4}
          flexDirection="row"
          alignItems="center"
          height={60}
          style={{
            borderRadius: "15px",
            border: "2px solid rgba(233, 235, 237, 1)",
          }}
        >
          <Box
            mr={2}
            ml={4}
            height={40}
            width={40}
            alignItems="center"
            justifyContent="center"
            style={{
              display: "flex",
              borderRadius: "50%",
              backgroundColor: "rgba(237, 242, 253, 1)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              height="20"
              width="20"
            >
              <path
                fill="rgba(237, 29, 36, 1)"
                d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"
              />
            </svg>
          </Box>
          <Box flexDirection="column">
            <Text>Youtube CloudGO</Text>
            <Text onClick={youtube}>https://www.youtube.com/@cloudgovn</Text>
          </Box>
        </Box>
      </Box>
    </Page>
  );
};

export default AboutUsPage;
