import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useRecoilState } from "recoil";
import {
  configAppView,
  getAccessToken,
  getPhoneNumber,
  getUserInfo,
  openWebview,
  setNavigationBarLeftButton,
} from "zmp-sdk";
import { useSnackbar } from "zmp-ui";
import url_api from "../const";
import secret_key from "../const";

import {
  resState,
  userInfoState,
  offsetState,
  getNewsState,
} from "../states_recoil/states_recoil";

export const useService = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [offset, setOffSet] = useRecoilState(offsetState);
  const [res, setRes] = useRecoilState<never[]>(resState);
  const { openSnackbar } = useSnackbar();
  const token = localStorage.getItem("token");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);

  /**
   * Lấy witdh, height theo màn hình
   */
  const handleWindowResize = () => {
    setScreenWidth(window.innerWidth);
    setScreenHeight(window.innerHeight);
  };

  /**
   * config header mini app
   */
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
    } catch (error) {}
  };

  /**
   * hide left button header
   */
  const setLeftButton = async () => {
    try {
      await setNavigationBarLeftButton({
        type: "none",
      });
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  /**
   * Get Access Token để truyền vào access_token khi convertPhone
   * @returns AccessToken
   */
  let accessToken: string | undefined;
  let tokenPhone: string | undefined;
  const getAccessTokenAndPhoneNumber = async () => {
    try {
      accessToken = await getAccessToken({});

      /* Gọi hàm get phone number khi lấy accessToken thành công */
      handleGetPhoneNumber(accessToken);
    } catch (error) {
      // Xử lý khi gọi API thất bại
      console.log(error);
    }
  };

  /**
   * Get token phoneNumber từ api zalo
   * @return tokenPhone
   */
  const handleGetPhoneNumber = (accessToken) => {
    getPhoneNumber({
      success: async (data) => {
        // token
        let { token } = data;
        tokenPhone = token;

        // others

        // convert phone
        convertPhone(accessToken);

        // get api user info from zalo api
        getUserInfo({
          success: (userInfoResponse) => {
            const { userInfo } = userInfoResponse;
            console.log("Get User Info Success", userInfo);

            const [firstname, ...lastnameArray] = userInfo.name.split(" ");
            const lastname = lastnameArray.join(" ");

            const updatedUserInfo = {
              ...userInfo,
              firstname: firstname,
              lastname: lastname,
            };
            // set state
            setUserInfo(updatedUserInfo);
            localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
            // save contact
            saveContact({ name: updatedUserInfo.name, id: updatedUserInfo.id });
          },
          fail: (error) => {
            //save log file ( npm logs )
            console.log("Lỗi khi gọi userInfo", error);
          },
        });
      },
      fail: (error) => {
        console.log("Lỗi khi getphonenumber", error);
      },
    });
  };

  /**
   * Convert tokenPhone thành phone number
   * @param access_token: lấy từ accessToken khi gọi api GetAccessToken ở trên
   * @param code: lấy từ tokenPhone khi gọi api GetPhoneNumber
   * @param secret_key: lấy trong phần quản lý ứng dụng zalo mini app
   * @returns phone number
   */
  const convertPhone = async (accessToken) => {
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
          RequestAction: "convertTokenToPhoneMiniApp",
          Data: {
            access_token: accessToken,
            code: tokenPhone,
            secret_key: secret_key,
          },
        },
        {
          headers: headers,
        }
      )
      .then((response) => {
        const phoneNumber = response.data.data.number;
        setPhoneNumber(phoneNumber);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy sdt:", error);
      });
  };

  /**
   * Get list ticket by conditions
   * @param tabKey, keyword, contactId, account_id, ticketStatus
   * @author Dai.tran
   * @returns array
   */
  const fetchTickets = async (
    tabKey,
    keyword,
    contactId,
    account_id,
    ticketStatus
  ) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token !== null) {
        headers["token"] = token;
      }

      const response = await axios.post(
        url_api,
        JSON.stringify({
          RequestAction: "GetTicketList",
          Params: {
            cv_id: "",
            keyword: keyword,
            filters: {
              category: "",
              contact_id: contactId,
              parent_id: account_id,
              ticketstatus: ticketStatus,
            },
            paging: {
              order_by: "",
              offset: offset,
              max_results: 10,
            },
            ordering: {
              createdtime: "DESC",
              priority: "DESC",
            },
            filter_by: "all",
          },
        }),
        {
          headers: headers,
        }
      );

      const offsetNumber = response.data.data.paging.next_offset;
      setOffSet(offsetNumber);
      console.log("Off set", offsetNumber);

      const json = response.data.data.entry_list as never[];
      console.log("Danh sách ticket", json);

      setRes(json);
      const updatedTicketList = [...res, ...json];
      setRes(updatedTicketList);
    } catch (error) {
      if (error === "SyntaxError: Unexpected token T in JSON at position 0") {
        navigate("/");
      } else {
        console.error(error);
      }
    }
  };

  /**
   * Lưu profile user từ contact module
   * check if exist phonenumber mapping else create new contact
   * @param name | firstname + lastname
   * @param id | id zalo
   * @param phonNumber | phoneNumber sau khi convert tokenPhone
   * @returns array
   */
  const saveContact = async ({ name, id }) => {
    const [firstname, lastname] = name.split(" ");

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
          RequestAction: "CheckIdZaloApp",
          Data: {
            firstname: lastname,
            lastname: firstname,
            mobile: phoneNumber,
            zalo_id_miniapp: id,
          },
        },
        {
          headers: headers,
        }
      )
      .then((response) => {
        //get profile user
        const profile = response.data.data;

        // save localStorage
        localStorage.setItem("profile", JSON.stringify(profile));

        //fetch danh sách ticket theo contact
        fetchTickets("", "", profile.data.id, "", ["Open", "Wait Close"]);
      })
      .catch((error) => {
        // add log to file
        console.error("Lỗi khi lưu contact:", error);
      });
  };

  /**
   * chuyển đổi px theo tỉ lệ screenWidth
   */
  const resFont = (value) => {
    let fontValue = (value / screenWidth) * screenWidth;
    return `${fontValue}px`;
  };

  /**
   * chuyển đổi px theo tỉ lệ screenHeight
   */
  const resHeight = (value) => {
    let fontValue = (value / screenHeight) * screenHeight;
    return `${fontValue}px`;
  };

  /**
   * chuyển đổi px theo tỉ lệ screenWidth
   */
  const resWidth = (value) => {
    let fontValue = (value / screenWidth) * screenWidth;
    return `${fontValue}px`;
  };

  /**
   * get list news from cloudgo
   * @param params
   * @returns array
   */
  const fetchNews = async (params = []) => {
    try {
      let listNews = [];

      const response = await fetch(
        "https://cloudgo.vn/api/blogs?action=getNewPostsApp"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const json = await response.json();

      console.log("Tin tức:", json.data);
      return json.data;
    } catch (error) {
      console.error("Error fetching news:", error);
      return [];
    }
  };

  /**
   * follow and unfollow ticket at listview
   * @param ticketid
   * @param 1 follow | 0 unfollow
   * @returns void
   */
  const followTicket = (ticketid, starred) => {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token !== null) {
      headers["token"] = token;
    }

    axios
      .post(
        url_api,
        JSON.stringify({
          RequestAction: "SaveStar",
          Params: {
            module: "Contacts",
            id: ticketid,
            starred: starred,
          },
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        //active icon
        //alert result
        if (starred == 1) {
          openSnackbar({
            text: "Đã theo dõi ticket",
            type: "success",
          });
        } else if (starred == 0) {
          openSnackbar({
            text: "Đã hủy theo dõi ticket",
            type: "success",
          });
        }
      })
      .catch((error) => {
        console.error("Lỗi khi follow:", error);
      });
  };

  /**
   * Format datetime
   * @param createdTime
   * @returns
   */
  function formatCreatedTime(createdTime) {
    const date = new Date(createdTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return createdTime.substring(0, 11);
  }

  /**
   * Open webview news
   * @param tintuc
   */
  const openUrlInWebview = async (tintuc) => {
    try {
      const url = tintuc.link || tintuc.link_override;
      if (url) {
        await openWebview({
          url: url,
          config: {
            style: "normal",
            leftButton: "back",
          },
        });
      } else {
      }
    } catch (error) {
      // Xử lý khi gọi API thất bại
      console.log(error);
    }
  };
  return {
    configView,
    setLeftButton,
    handleWindowResize,
    getAccessTokenAndPhoneNumber,
    getPhoneNumber,
    getAccessToken,
    getUserInfo,
    fetchTickets,
    saveContact,
    resFont,
    resHeight,
    resWidth,
    fetchNews,
    followTicket,
    formatCreatedTime,
    openUrlInWebview,
  };
};
