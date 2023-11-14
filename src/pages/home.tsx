import React, { useEffect, useState } from "react";
import {
  Page,
  Icon,
  useNavigate,
  Box,
  Text,
  Input,
  Tabs,
  Avatar,
  Button,
  List,
  Modal,
  useSnackbar,
  Spinner,
} from "zmp-ui";
import { NewsType, TicketType } from "../type";
import {
  followOA,
  getUserInfo,
  openWebview,
  setNavigationBarLeftButton,
  requestSendNotification,
  configAppView,
  onConfirmToExit,
  offConfirmToExit,
  closeApp,
} from "zmp-sdk/apis";
import url_api from "../service";
import axios from "axios";
import PullToRefresh from "react-simple-pull-to-refresh";
const HomePage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { Item } = List;
  const [res, setRes] = useState<TicketType[]>([]);
  const [news, setNews] = useState<NewsType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [allTickets, setAllTickets] = useState<TicketType[]>([]);
  const [visibleTicketsCount, setVisibleTicketsCount] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { openSnackbar } = useSnackbar();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const token = localStorage.getItem("token");
  const [sheetVisible, setSheetVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [apiCalled, setApiCalled] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [sortedAndFilteredTickets, setSortedAndFilteredTickets] = useState<
    TicketType[]
  >([]);
  const [currentSort, setCurrentSort] = useState<"newest" | "oldest">("newest");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [followOAModal, setFollowOAModal] = useState(false);
  const [closedTickets, setClosedTickets] = useState<TicketType[]>([]);
  const [followTickets, setFollowTickets] = useState<TicketType[]>([]);
  const [openTickets, setOpenTickets] = useState<TicketType[]>([]);
  const [cancelTickets, setCancelTickets] = useState<TicketType[]>([]);
  const [inProgressTickets, setInProgressTickets] = useState<TicketType[]>([]);
  const [totalAllTickets, setTotalAllTickets] = useState<number>(0);
  const [totalfollowTickets, setTotalFollowTickets] = useState<number>(0);
  const [totalOpenTickets, setTotalOpenTickets] = useState<number>(0);
  const [loadMore, setLoadMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allTicketsLoaded, setAllTicketsLoaded] = useState(false);
  const [totalInProgressTickets, setTotalInProgressTickets] =
    useState<number>(0);
  const [totalClosedTickets, setTotalClosedTickets] = useState<number>(0);
  const [totalCancelTickets, setTotalCancelTickets] = useState<number>(0);
  const [currentTab, setCurrentTab] = useState("tab1");
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
    avatar: "",
  });
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  const handleWindowResize = () => {
    setScreenWidth(window.innerWidth);
    setScreenHeight(window.innerHeight);
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

  // const follow = async () => {
  //   try {
  //     await followOA({
  //       id: "2197174064623873199",
  //     });
  //   } catch (error) {
  //     // xử lý khi gọi api thất bại
  //     console.log(error);
  //   }
  // };
  const sendNotification = async () => {
    requestSendNotification({
      success: () => {
        console.log("Cho phép gửi thông báo");
      },
      fail: (error) => {
        console.log(error);
      },
    });
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
    onConfirmToExit(() => setConfirmModalVisible(true));
    return () => offConfirmToExit();
  }, []);

  useEffect(() => {
    configView();
    sendNotification();
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const resFont = (value) => {
    let fontValue = (value / 360) * screenWidth;
    return `${fontValue}px`;
  };

  const resHeight = (value) => {
    let fontValue = (value / 800) * screenHeight;
    return `${fontValue}px`;
  };

  const resWidth = (value) => {
    let fontValue = (value / 360) * screenWidth;
    return `${fontValue}px`;
  };

  useEffect(() => {
    if (!apiCalled) {
      getUserInfo({
        success: (data) => {
          const Info = data;
          console.log("Get User Info Success", data);

          const [firstname, lastname] = Info.userInfo.name.split(" ");

          const updatedUserInfo = {
            ...Info.userInfo,
            firstname: firstname,
            lastname: lastname,
          };

          setUserInfo(updatedUserInfo);
          saveContact({ name: updatedUserInfo.name, id: updatedUserInfo.id });
          getContact(updatedUserInfo.id);
          localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
          setApiCalled(true);
        },
        fail: (error) => {
          console.log(error);
        },
      });
    }
  }, [apiCalled]);

  const saveContact = async ({ name, id }) => {
    const phoneNumber = localStorage.getItem("phoneNumber");
    console.log(phoneNumber);
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
        console.log("Đã lưu contact:", response.data.data);
      })
      .catch((error) => {
        console.error("Lỗi khi lưu contat:", error);
      });
  };

  const getContact = async (id) => {
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
          RequestAction: "GetContactByZaloId",
          Data: {
            zalo_id_miniapp: id,
          },
        },
        {
          headers: headers,
        }
      )
      .then((response) => {
        const contactData = response.data.data;
        console.log("Contact Data:", contactData);
        localStorage.setItem("contact", JSON.stringify(contactData));
      })
      .catch((error) => {
        console.error("Lỗi khi get contact:", error);
      });
  };

  const fetchTickets = async () => {
    try {
      setIsRefreshing(false);
      const headers = {
        "Content-Type": "application/json",
      };

      if (token !== null) {
        headers["token"] = token;
      }

      const storedTickets = localStorage.getItem("tickets");
      if (storedTickets) {
        console.log(
          "Đã có danh sách ticket từ localStorage:",
          JSON.parse(storedTickets)
        );
        const filteredTickets = JSON.parse(storedTickets).filter((ticket) => {
          return ticket.contact_id === contactData.data.id;
        });

        setRes(filteredTickets);
        return filteredTickets;
      }

      const response = await axios.post(
        url_api,
        JSON.stringify({
          RequestAction: "GetTicketList",
          Params: {
            cv_id: "",
            keyword: "",
            filters: {
              category: "",
            },
            paging: {
              order_by: "",
              offset: 0,
              max_results: 100,
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

      console.log("Danh sách ticket:", response.data.data.entry_list);
      const json = response.data.data.entry_list;

      const filteredTickets = json.filter((ticket) => {
        return ticket.contact_id === contactData.data.id;
      });

      setRes(filteredTickets);
      // Lưu danh sách tickets vào localStorage
      localStorage.setItem("tickets", JSON.stringify(json));

      return filteredTickets;
    } catch (error) {
      if (error === "SyntaxError: Unexpected token T in JSON at position 0") {
        navigate("/");
      } else {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (loadMore) {
      setIsLoading(true);
      setLoadMore(false);

      const newVisibleCount = visibleTicketsCount + 20;
      if (newVisibleCount >= sortedAndFilteredTickets.length) {
        setAllTicketsLoaded(true);
      }

      setVisibleTicketsCount(newVisibleCount);
      setIsLoading(false);
    }
  }, [loadMore, visibleTicketsCount, sortedAndFilteredTickets]);

  const fetchNews = async () => {
    try {
      const storedNews = localStorage.getItem("newsData");
      if (storedNews) {
        console.log("Đã có tin tức từ localStorage:", JSON.parse(storedNews));
        setNews(JSON.parse(storedNews));
        return JSON.parse(storedNews);
      }

      const response = await fetch(
        "https://cloudgo.vn/api/blogs?action=getNewPostsApp"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const json = await response.json();

      console.log("Tin tức:", json.data);
      setNews(json.data);

      localStorage.setItem("newsData", JSON.stringify(json.data));

      return json.data;
    } catch (error) {
      console.error("Error fetching news:", error);
      return [];
    }
  };

  const followTicket = (ticketid) => {
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
            starred: 1,
          },
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        console.log("Đã theo dõi:", response.data.data);
        setIsFollowing(true);
        openSnackbar({
          text: "Đã theo dõi ticket",
          type: "success",
        });
      })
      .catch((error) => {
        console.error("Lỗi khi follow:", error);
      });
  };

  const unfollowTicket = (ticketid) => {
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
            starred: 0,
          },
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        console.log("Hủy theo dõi:", response.data.data);
        setIsFollowing(false);
        openSnackbar({
          text: "Đã hủy theo dõi ticket",
          type: "success",
        });
      })
      .catch((error) => {
        console.error("Lỗi khi follow:", error);
      });
  };

  const Logout = () => {
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
          RequestAction: "Logout",
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        console.log("Đăng xuất thành công:", response.data.data);
        setIsFollowing(false);
      })
      .catch((error) => {
        console.error("Đăng xuất thất bại:", error);
      });
  };
  const handleBeforeUnload = () => {
    // Xóa dữ liệu từ localStorage
    localStorage.removeItem("tickets");
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    fetchNews();
    fetchTickets();
  }, []);

  const sortTickets = (sortBy) => {
    const filteredAndSorted = [...sortedAndFilteredTickets];
    if (sortBy == "newest") {
      filteredAndSorted.sort((a, b) => {
        const dateA = new Date(a.createdtime).getTime();
        const dateB = new Date(b.createdtime).getTime();
        return dateB - dateA;
      });
    } else if (sortBy == "oldest") {
      filteredAndSorted.sort((a, b) => {
        const dateA = new Date(a.createdtime).getTime();
        const dateB = new Date(b.createdtime).getTime();
        return dateA - dateB;
      });
    }

    setFollowTickets(filteredAndSorted);
    setOpenTickets(filteredAndSorted);
    setInProgressTickets(filteredAndSorted);
    setClosedTickets(filteredAndSorted);
    setCancelTickets(filteredAndSorted);
    setSortedAndFilteredTickets(filteredAndSorted);
    console.log(`Danh sách vé đã được sắp xếp theo: ${sortBy}`);
  };

  const updateTickets = () => {
    const filteredAndSorted = filterAndSortTickets(res, currentTab);
    setSortedAndFilteredTickets(filteredAndSorted);

    // Cập nhật các danh sách vé tương ứng
    if (currentTab === "tab2") {
      setFollowTickets(filteredAndSorted);
    } else if (currentTab === "tab3") {
      setOpenTickets(filteredAndSorted);
    } else if (currentTab === "tab4") {
      setInProgressTickets(filteredAndSorted);
    } else if (currentTab === "tab5") {
      setClosedTickets(filteredAndSorted);
    } else if (currentTab === "tab6") {
      setCancelTickets(filteredAndSorted);
    }
  };

  const filterAndSortTickets = (
    tickets: TicketType[],
    status: string
  ): TicketType[] => {
    let filtered = tickets.filter((ticket) => {
      if (status === "tab1") {
        return true;
      } else if (status === "tab2") {
        return ticket.starred === "1";
      } else if (status === "tab3") {
        return ["Open", "Reopen", "Wait For Verifying"].includes(ticket.status);
      } else if (status === "tab4") {
        return [
          "In Progress",
          "Wait Close",
          "Assigned",
          "Customer Confirmed",
          "Sent Confirm Email",
          "Testing",
          "Wait For Response",
          "Pending",
        ].includes(ticket.status);
      } else if (status === "tab5") {
        return ticket.status === "Closed";
      } else if (status === "tab6") {
        return ["Cancel", "Reject"].includes(ticket.status);
      }
      return false;
    });

    return filtered;
  };

  useEffect(() => {
    const followTickets = filterAndSortTickets(res, "tab2");
    const openTickets = filterAndSortTickets(res, "tab3");
    const inProgressTickets = filterAndSortTickets(res, "tab4");
    const closedTickets = filterAndSortTickets(res, "tab5");
    const cancelTickets = filterAndSortTickets(res, "tab6");
    setAllTickets(res);
    setTotalAllTickets(res.length);
    setTotalFollowTickets(followTickets.length);
    setTotalOpenTickets(openTickets.length);
    setTotalInProgressTickets(inProgressTickets.length);
    setTotalClosedTickets(closedTickets.length);
    setTotalCancelTickets(cancelTickets.length);

    setFollowTickets(followTickets);
    setOpenTickets(openTickets);
    setInProgressTickets(inProgressTickets);
    setClosedTickets(closedTickets);
    setCancelTickets(cancelTickets);
  }, [res]);

  useEffect(() => {
    updateTickets();
    setCurrentSort("newest");
  }, [currentTab, sortBy, res]);

  function formatCreatedTime(createdTime: string) {
    const date = new Date(createdTime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}-${month < 10 ? "0" : ""}${month}-${
      day < 10 ? "0" : ""
    }${day}`;
  }

  const sortByNewest = (arr: TicketType[] | NewsType[]) => {
    return arr.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  };

  const handleShowAllTickets = () => {
    if (!allTicketsLoaded) {
      setIsLoading(true);
      setLoadingMore(true);

      setTimeout(() => {
        const newVisibleCount = visibleTicketsCount + 10;

        if (newVisibleCount >= sortedAndFilteredTickets.length) {
          setAllTicketsLoaded(true);
        }

        // switch (currentTab) {
        //   case "tab1":
        //     break;
        //   case "tab2":
        //     break;
        //   case "tab3":
        //     break;
        //   case "tab4":
        //     break;
        //   case "tab5":
        //     break;
        //   case "tab6":
        //     break;
        //   default:
        //   // Hành vi mặc định hoặc không xác định
        // }

        setShowAllTickets(true);
        setVisibleTicketsCount(newVisibleCount);
        setIsLoading(false);
        setLoadingMore(false);
      }, 2000);
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      !loadingMore
    ) {
      handleShowAllTickets();
    }
  };

  const handleReload = () => {
    localStorage.removeItem("tickets");
    console.log("reload");

    setTimeout(() => {
      fetchTickets();
    }, 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    handleReload();
    setIsRefreshing(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [allTicketsLoaded, loadingMore]);

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
        // Xử lý khi không có URL hoặc URL là rỗng
        console.log("Không có URL hoặc URL rỗng.");
      }
    } catch (error) {
      // Xử lý khi gọi API thất bại
      console.log(error);
    }
  };

  const handleScrollAndReload = () => {
    handleScroll();
  };

  return (
    <PullToRefresh refreshing={isRefreshing} onRefresh={handleRefresh}>
      <Page
        hideScrollbar={true}
        // restoreScrollOnBack={false}
        className="section-page"
        onScroll={handleScrollAndReload}
      >
        <Box className="detail-container">
          <Box flex flexDirection="row" alignContent="center">
            <Avatar size={40} src={userInfo.avatar} />
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
          </Box>
        </Box>
        <Box mt={2} className="bgr-color">
          <Text
            style={{
              paddingTop: "12px",
              paddingLeft: "16px",
              fontWeight: 500,
              fontSize: resFont(16),
            }}
          >
            Tin tức
          </Text>

          <List
            divider={false}
            noSpacing
            style={{
              display: "flex",
              flexWrap: "nowrap",
              overflowX: "scroll",
              margin: 0,
              padding: 0,
            }}
          >
            {sortByNewest(news)
              .slice(0, 10)
              .map((tintuc) => (
                <Box mt={3} ml={4} mb={4} key={tintuc.id}>
                  <a onClick={() => openUrlInWebview(tintuc)}>
                    <Box
                      mr={1}
                      style={{
                        width: resWidth(246),
                        borderRadius: "4px",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <img
                        src={tintuc.thumbnail}
                        alt="Thumbnail"
                        style={{
                          borderTopLeftRadius: "4px",
                          borderTopRightRadius: "4px",
                          height: resHeight(110),
                          objectFit: "cover",
                        }}
                      />
                      <Box p={1} style={{ height: resHeight(75) }}>
                        <Text
                          style={{
                            color: "rgba(20, 20, 21, 1)",
                            fontWeight: 500,
                            fontSize: resFont(12),
                            whiteSpace: "normal",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                            flex: 1,
                          }}
                        >
                          {tintuc.title}
                        </Text>
                        <Text
                          style={{
                            color: "rgba(118, 122, 127, 1)",
                            fontSize: resFont(12),
                          }}
                        >
                          {formatCreatedTime(tintuc.created_at)}
                        </Text>
                      </Box>
                    </Box>
                  </a>
                </Box>
              ))}
          </List>
        </Box>
        <Box
          mt={2}
          flexDirection="row"
          justifyContent="space-between"
          className="detail-container"
        >
          <Box
            flexDirection="row"
            alignContent="center"
            justifyContent="space-between"
            style={{
              width: "100%",
            }}
          >
            <Input.Search
              size="small"
              style={{
                border: "1px rgba(185, 189, 193, 1) solid ",
                width: "98%",
                height: resHeight(40),
                borderRadius: "4px",
              }}
              type="text"
              placeholder="Tìm ticket theo tên, mã, trạng thái"
              value={searchText}
              onClick={() => {
                navigate(`/search_ticket?q=${searchText}`);
              }}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Box>

          <Box
            style={{
              width: "7%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => {
              setActionSheetVisible(true);
              setSheetVisible(true);
            }}
          >
            <Icon
              size={24}
              icon={"zi-filter"}
              style={{ color: "rgba(118, 122, 127, 1)" }}
            />
          </Box>

          <Modal
            visible={actionSheetVisible}
            onClose={() => {
              setActionSheetVisible(false);
            }}
          >
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignContent="center"
            >
              <Text></Text>
              <Text bold size="xLarge" style={{ paddingLeft: "20px" }}>
                Sắp Xếp
              </Text>
              <Box
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setActionSheetVisible(false);
                }}
              >
                <Icon icon="zi-close"></Icon>
              </Box>
            </Box>
            <Box mt={4}>
              <Button
                onClick={() => {
                  setLoadingFilter(true); // Hiển thị spinner
                  setActionSheetVisible(false);
                  setTimeout(() => {
                    sortTickets("newest");
                    setCurrentSort("newest");

                    setLoadingFilter(false); // Ẩn spinner sau khi cập nhật danh sách
                  }, 2000); // Đặt thời gian là 2 giây
                }}
                fullWidth
                variant="tertiary"
                type={currentSort === "newest" ? "blue" : "neutral"}
              >
                Mới nhất
              </Button>
            </Box>
            <Box mt={2}>
              <Button
                onClick={() => {
                  setLoadingFilter(true); // Hiển thị spinner
                  setActionSheetVisible(false);
                  setTimeout(() => {
                    sortTickets("oldest");
                    setCurrentSort("oldest");
                    setLoadingFilter(false); // Ẩn spinner sau khi cập nhật danh sách
                  }, 2000); // Đặt thời gian là 2 giây
                }}
                fullWidth
                variant="tertiary"
                type={currentSort === "oldest" ? "blue" : "neutral"}
              >
                Cũ nhất
              </Button>
            </Box>
          </Modal>
        </Box>

        <Tabs
          activeKey={currentTab}
          defaultActiveKey="tab1"
          onTabClick={(tabKey) => setCurrentTab(tabKey)}
          scrollable={true}
        >
          <Tabs.Tab
            key="tab1"
            label={
              <Box
                flexDirection="row"
                alignContent="center"
                justifyContent="center"
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: currentTab === "tab1" ? 500 : 400,
                    color:
                      currentTab === "tab1"
                        ? "rgba(18, 144, 255, 1)"
                        : "rgba(118, 122, 127, 1)",
                  }}
                >
                  {currentTab === "tab1" ? `Tất cả` : "Tất cả"}
                </Text>
                <Box
                  ml={2}
                  className="length-ticket"
                  style={{
                    width: "25px",
                    background:
                      currentTab === "tab1"
                        ? "rgba(220, 31, 24, 1)"
                        : "rgba(233, 235, 237, 1)",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color:
                        currentTab === "tab1"
                          ? "white"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {totalAllTickets > 99 ? "99+" : totalAllTickets}
                  </Text>
                </Box>
              </Box>
            }
            style={{ flex: 1 }}
          >
            {sortedAndFilteredTickets.length === 0 ? (
              <Box mt={5} style={{ textAlign: "center" }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
                  alt="iconticket"
                  style={{
                    height: "80px",
                    width: "80px",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
                <Text bold style={{ textAlign: "center", paddingTop: "10px" }}>
                  Không tìm thấy ticket nào
                </Text>
              </Box>
            ) : loadingFilter ? (
              <Box className="center-spinner">
                <Spinner />
              </Box>
            ) : (
              sortedAndFilteredTickets
                .slice(0, visibleTicketsCount)
                .map((ticket) => (
                  <Box key={ticket.ticketid}>
                    <Box
                      style={{
                        position: "relative",
                        flex: 1,
                      }}
                    >
                      {ticket.starred === "1" ? (
                        <div
                          style={{
                            color: "rgba(220, 31, 24, 1)",
                            cursor: "pointer",
                            position: "absolute",
                            top: 10,
                            right: 12,
                          }}
                          onClick={() => {
                            unfollowTicket(ticket.ticketid);
                            const updatedTicket = { ...ticket, starred: "0" };
                            setRes((prevRes) =>
                              prevRes.map((t) =>
                                t.ticketid === ticket.ticketid
                                  ? updatedTicket
                                  : t
                              )
                            );
                          }}
                        >
                          <Icon size={20} icon="zi-heart-solid">
                            {ticket.starred}
                          </Icon>
                        </div>
                      ) : (
                        <div
                          style={{
                            color: "rgba(118, 122, 127, 1)",
                            cursor: "pointer",
                            position: "absolute",
                            top: 10,
                            right: 12,
                          }}
                          onClick={() => {
                            followTicket(ticket.ticketid);
                            const updatedTicket = { ...ticket, starred: "1" };
                            setRes((prevRes) =>
                              prevRes.map((t) =>
                                t.ticketid === ticket.ticketid
                                  ? updatedTicket
                                  : t
                              )
                            );
                          }}
                        >
                          <Icon size={20} icon="zi-heart">
                            {ticket.starred}
                          </Icon>
                        </div>
                      )}
                    </Box>
                    <Box
                      className="title-detail-container"
                      key={ticket.ticketid}
                      style={{
                        cursor: "pointer",
                        flex: 2,
                      }}
                      onClick={() => {
                        navigate(`/detail_ticket/${ticket.ticketid}`, {
                          state: { ...ticket, images: selectedImages },
                        });
                      }}
                    >
                      <Text
                        style={{
                          width: "95%",
                          color: "rgba(20, 20, 21, 1)",
                          fontWeight: 500,
                          whiteSpace: "normal", // Đặt về "normal" để cho phép ngắt dòng tự động
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2, // Hiển thị tối đa 2 dòng
                          overflow: "hidden",
                        }}
                      >
                        [{translationStatus[ticket.category]}] {ticket.title}
                      </Text>

                      <Box
                        mt={1}
                        flexDirection="row"
                        alignContent="center"
                        justifyContent="space-between"
                      >
                        <Box
                          flexDirection="row"
                          alignContent="center"
                          alignItems="center"
                        >
                          <Icon
                            size={20}
                            icon="zi-more-grid"
                            style={{ color: "rgba(118, 122, 127, 1)" }}
                          ></Icon>
                          <Text
                            style={{
                              paddingLeft: "6px",
                              color: "rgba(118, 122, 127, 1)",
                            }}
                          >
                            {ticket.ticket_no}
                          </Text>
                        </Box>
                        <Text
                          style={{
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          {formatCreatedTime(ticket.createdtime)}
                        </Text>
                      </Box>

                      <Box
                        flexDirection="row"
                        alignContent="center"
                        justifyContent="space-between"
                      >
                        <Box mt={1} flexDirection="row" alignContent="center">
                          <Icon
                            size={20}
                            style={{ color: "rgba(118, 122, 127, 1)" }}
                            icon="zi-star"
                          />
                          <Text
                            style={{
                              paddingLeft: "6px",
                              color: "rgba(118, 122, 127, 1)",
                            }}
                          >
                            {ticket.helpdesk_rating || 0}
                          </Text>
                        </Box>
                        <Box
                          className="status"
                          mt={1}
                          flexDirection="row"
                          alignContent="center"
                          justifyContent="center"
                          style={{
                            backgroundColor: statusColors[ticket.status],
                            display: "inline-block",
                            minWidth: "20%",
                            height: "25px",
                            paddingLeft: "16px",
                            paddingRight: "16px",
                            textAlign: "center",
                            borderRadius: "16px",
                          }}
                        >
                          <Text
                            style={{
                              color: statusTextColors[ticket.status],
                              fontSize: resFont(14),
                              lineHeight: "25px",
                            }}
                          >
                            {translationStatus[ticket.status]}
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                    <Box className="list-container" height={4}></Box>
                  </Box>
                ))
            )}
            {isLoading && !allTicketsLoaded && (
              <Box className="center-spinner">
                <Spinner></Spinner>
              </Box>
            )}
            <Box height={120}></Box>
          </Tabs.Tab>
          <Tabs.Tab
            key="tab2"
            label={
              <Box
                flexDirection="row"
                alignContent="center"
                justifyContent="center"
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: currentTab === "tab2" ? 500 : 400,
                    color:
                      currentTab === "tab2"
                        ? "rgba(18, 144, 255, 1)"
                        : "rgba(118, 122, 127, 1)",
                  }}
                >
                  {currentTab === "tab2" ? `Theo dõi` : "Theo dõi"}
                </Text>
                <Box
                  ml={2}
                  className="length-ticket"
                  style={{
                    width: "25px",
                    background:
                      currentTab === "tab2"
                        ? "rgba(220, 31, 24, 1)"
                        : "rgba(233, 235, 237, 1)",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color:
                        currentTab === "tab2"
                          ? "white"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {totalfollowTickets > 99 ? "99+" : totalfollowTickets}
                  </Text>
                </Box>
              </Box>
            }
            style={{ flex: 1 }}
          >
            {followTickets.length === 0 ? (
              <Box m={4} style={{ textAlign: "center" }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
                  alt="iconticket"
                  style={{
                    height: "80px",
                    width: "80px",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
                <Text bold style={{ textAlign: "center", paddingTop: "10px" }}>
                  Không tìm thấy ticket nào
                </Text>
              </Box>
            ) : loadingFilter ? (
              <Box className="center-spinner">
                <Spinner />
              </Box>
            ) : (
              followTickets.slice(0, visibleTicketsCount).map((ticket) => (
                <Box key={ticket.ticketid}>
                  <Box
                    style={{
                      position: "relative",
                    }}
                  >
                    {ticket.starred === "1" ? (
                      <div
                        style={{
                          color: "rgba(220, 31, 24, 1)",
                          cursor: "pointer",
                          position: "absolute",
                          top: 10,
                          right: 12,
                        }}
                        onClick={() => {
                          unfollowTicket(ticket.ticketid);
                          const updatedTicket = { ...ticket, starred: "0" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon size={20} icon="zi-heart-solid">
                          {ticket.starred}
                        </Icon>
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "rgba(118, 122, 127, 1)",
                          cursor: "pointer",
                          position: "absolute",
                          top: 10,
                          right: 12,
                        }}
                        onClick={() => {
                          followTicket(ticket.ticketid);
                          const updatedTicket = { ...ticket, starred: "1" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon size={20} icon="zi-heart">
                          {ticket.starred}
                        </Icon>
                      </div>
                    )}
                  </Box>
                  <Box
                    className="title-detail-container"
                    key={ticket.ticketid}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigate(`/detail_ticket/${ticket.ticketid}`, {
                        state: { ...ticket, images: selectedImages },
                      });
                    }}
                  >
                    <Text
                      style={{
                        width: "95%",
                        color: "rgba(20, 20, 21, 1)",
                        fontWeight: 500,
                        whiteSpace: "normal",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                      }}
                    >
                      [{translationStatus[ticket.category]}] {ticket.title}
                    </Text>

                    <Box
                      mt={1}
                      flexDirection="row"
                      alignContent="center"
                      justifyContent="space-between"
                    >
                      <Box
                        flexDirection="row"
                        alignContent="center"
                        alignItems="center"
                      >
                        <Icon
                          size={20}
                          icon="zi-more-grid"
                          style={{ color: "rgba(118, 122, 127, 1)" }}
                        ></Icon>
                        <Text
                          style={{
                            paddingLeft: "6px",
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          {ticket.ticket_no}
                        </Text>
                      </Box>
                      <Text
                        style={{
                          color: "rgba(118, 122, 127, 1)",
                        }}
                      >
                        {formatCreatedTime(ticket.createdtime)}
                      </Text>
                    </Box>

                    <Box
                      flexDirection="row"
                      alignContent="center"
                      justifyContent="space-between"
                    >
                      <Box mt={1} flexDirection="row" alignContent="center">
                        <Icon
                          size={20}
                          style={{ color: "rgba(118, 122, 127, 1)" }}
                          icon="zi-star"
                        />
                        <Text
                          style={{
                            paddingLeft: "6px",
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          {ticket.helpdesk_rating || 0}
                        </Text>
                      </Box>
                      <Box
                        className="status"
                        mt={1}
                        flexDirection="row"
                        alignContent="center"
                        justifyContent="center"
                        style={{
                          backgroundColor: statusColors[ticket.status],
                          display: "inline-block",
                          minWidth: "20%",
                          height: "25px",
                          paddingLeft: "16px",
                          paddingRight: "16px",
                          textAlign: "center",
                          borderRadius: "16px",
                        }}
                      >
                        <Text
                          style={{
                            color: statusTextColors[ticket.status],
                            fontSize: resFont(14),
                            lineHeight: "25px",
                          }}
                        >
                          {translationStatus[ticket.status]}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                  <Box className="list-container" height={4}></Box>
                </Box>
              ))
            )}

            {isLoading && !allTicketsLoaded && (
              <Box className="center-spinner">
                <Spinner />
              </Box>
            )}
            <Box height={100}></Box>
          </Tabs.Tab>
          <Tabs.Tab
            key="tab3"
            label={
              <Box
                flexDirection="row"
                alignContent="center"
                justifyContent="center"
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: currentTab === "tab3" ? 500 : 400,
                    color:
                      currentTab === "tab3"
                        ? "rgba(18, 144, 255, 1)"
                        : "rgba(118, 122, 127, 1)",
                  }}
                >
                  {currentTab === "tab3" ? `Mới` : "Mới"}
                </Text>
                <Box
                  ml={2}
                  className="length-ticket"
                  style={{
                    width: "25px",
                    background:
                      currentTab === "tab3"
                        ? "rgba(220, 31, 24, 1)"
                        : "rgba(233, 235, 237, 1)",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color:
                        currentTab === "tab3"
                          ? "white"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {totalOpenTickets > 99 ? "99+" : totalOpenTickets}
                  </Text>
                </Box>
              </Box>
            }
            style={{ flex: 1 }}
          >
            {openTickets.length === 0 ? (
              <Box m={4} style={{ textAlign: "center" }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
                  alt="iconticket"
                  style={{
                    height: "80px",
                    width: "80px",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
                <Text bold style={{ textAlign: "center", paddingTop: "10px" }}>
                  Không tìm thấy ticket nào
                </Text>
              </Box>
            ) : loadingFilter ? (
              <Box className="center-spinner">
                <Spinner />
              </Box>
            ) : (
              openTickets.slice(0, visibleTicketsCount).map((ticket) => (
                <Box key={ticket.ticketid}>
                  <Box
                    style={{
                      position: "relative",
                    }}
                  >
                    {ticket.starred === "1" ? (
                      <div
                        style={{
                          color: "rgba(220, 31, 24, 1)",
                          cursor: "pointer",
                          position: "absolute",
                          top: 10,
                          right: 12,
                        }}
                        onClick={() => {
                          unfollowTicket(ticket.ticketid);
                          const updatedTicket = { ...ticket, starred: "0" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon size={20} icon="zi-heart-solid">
                          {ticket.starred}
                        </Icon>
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "rgba(118, 122, 127, 1)",
                          cursor: "pointer",
                          position: "absolute",
                          top: 10,
                          right: 12,
                        }}
                        onClick={() => {
                          followTicket(ticket.ticketid);
                          const updatedTicket = { ...ticket, starred: "1" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon size={20} icon="zi-heart">
                          {ticket.starred}
                        </Icon>
                      </div>
                    )}
                  </Box>
                  <Box
                    className="title-detail-container"
                    key={ticket.ticketid}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigate(`/detail_ticket/${ticket.ticketid}`, {
                        state: { ...ticket, images: selectedImages },
                      });
                    }}
                  >
                    <Text
                      style={{
                        width: "95%",
                        color: "rgba(20, 20, 21, 1)",
                        fontWeight: 500,
                        whiteSpace: "normal",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                      }}
                    >
                      [{translationStatus[ticket.category]}] {ticket.title}
                    </Text>

                    <Box
                      mt={1}
                      flexDirection="row"
                      alignContent="center"
                      justifyContent="space-between"
                    >
                      <Box
                        flexDirection="row"
                        alignContent="center"
                        alignItems="center"
                      >
                        <Icon
                          size={20}
                          icon="zi-more-grid"
                          style={{ color: "rgba(118, 122, 127, 1)" }}
                        ></Icon>
                        <Text
                          style={{
                            paddingLeft: "6px",
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          {ticket.ticket_no}
                        </Text>
                      </Box>
                      <Text
                        style={{
                          color: "rgba(118, 122, 127, 1)",
                        }}
                      >
                        {formatCreatedTime(ticket.createdtime)}
                      </Text>
                    </Box>

                    <Box
                      flexDirection="row"
                      alignContent="center"
                      justifyContent="space-between"
                    >
                      <Box mt={1} flexDirection="row" alignContent="center">
                        <Icon
                          size={20}
                          style={{ color: "rgba(118, 122, 127, 1)" }}
                          icon="zi-star"
                        />
                        <Text
                          style={{
                            paddingLeft: "6px",
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          {ticket.helpdesk_rating || 0}
                        </Text>
                      </Box>
                      <Box
                        className="status"
                        mt={1}
                        flexDirection="row"
                        alignContent="center"
                        justifyContent="center"
                        style={{
                          backgroundColor: statusColors[ticket.status],
                          display: "inline-block",
                          minWidth: "20%",
                          height: "25px",
                          paddingLeft: "16px",
                          paddingRight: "16px",
                          textAlign: "center",
                          borderRadius: "16px",
                        }}
                      >
                        <Text
                          style={{
                            color: statusTextColors[ticket.status],
                            fontSize: resFont(14),
                            lineHeight: "25px",
                          }}
                        >
                          {translationStatus[ticket.status]}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                  <Box className="list-container" height={4}></Box>
                </Box>
              ))
            )}

            {isLoading && !allTicketsLoaded && (
              <Box className="center-spinner">
                <Spinner />
              </Box>
            )}
            <Box height={100}></Box>
          </Tabs.Tab>
          <Tabs.Tab
            key="tab4"
            label={
              <Box
                flexDirection="row"
                alignContent="center"
                justifyContent="center"
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: currentTab === "tab4" ? 500 : 400,
                    color:
                      currentTab === "tab4"
                        ? "rgba(18, 144, 255, 1)"
                        : "rgba(118, 122, 127, 1)",
                  }}
                >
                  {currentTab === "tab4" ? `Đang xử lý` : "Đang xử lý"}
                </Text>
                <Box
                  ml={2}
                  className="length-ticket"
                  style={{
                    width: "25px",
                    background:
                      currentTab === "tab4"
                        ? "rgba(220, 31, 24, 1)"
                        : "rgba(233, 235, 237, 1)",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color:
                        currentTab === "tab4"
                          ? "white"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {totalInProgressTickets > 99
                      ? "99+"
                      : totalInProgressTickets}
                  </Text>
                </Box>
              </Box>
            }
            style={{ flex: 1 }}
          >
            {inProgressTickets.length === 0 ? (
              <Box m={4} style={{ textAlign: "center" }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
                  alt="iconticket"
                  style={{
                    height: "80px",
                    width: "80px",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
                <Text bold style={{ textAlign: "center", paddingTop: "10px" }}>
                  Không tìm thấy ticket nào
                </Text>
              </Box>
            ) : loadingFilter ? (
              <Box className="center-spinner">
                <Spinner />
              </Box>
            ) : (
              inProgressTickets.slice(0, visibleTicketsCount).map((ticket) => (
                <Box key={ticket.ticketid}>
                  <Box
                    style={{
                      position: "relative",
                    }}
                  >
                    {ticket.starred === "1" ? (
                      <div
                        style={{
                          color: "rgba(220, 31, 24, 1)",
                          cursor: "pointer",
                          position: "absolute",
                          top: 10,
                          right: 12,
                        }}
                        onClick={() => {
                          unfollowTicket(ticket.ticketid);
                          const updatedTicket = { ...ticket, starred: "0" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon size={20} icon="zi-heart-solid">
                          {ticket.starred}
                        </Icon>
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "rgba(118, 122, 127, 1)",
                          cursor: "pointer",
                          position: "absolute",
                          top: 10,
                          right: 12,
                        }}
                        onClick={() => {
                          followTicket(ticket.ticketid);
                          const updatedTicket = { ...ticket, starred: "1" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon size={20} icon="zi-heart">
                          {ticket.starred}
                        </Icon>
                      </div>
                    )}
                  </Box>
                  <Box
                    className="title-detail-container"
                    key={ticket.ticketid}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigate(`/detail_ticket/${ticket.ticketid}`, {
                        state: { ...ticket, images: selectedImages },
                      });
                    }}
                  >
                    <Text
                      style={{
                        width: "95%",
                        color: "rgba(20, 20, 21, 1)",
                        fontWeight: 500,
                        whiteSpace: "normal",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                      }}
                    >
                      [{translationStatus[ticket.category]}] {ticket.title}
                    </Text>

                    <Box
                      mt={1}
                      flexDirection="row"
                      alignContent="center"
                      justifyContent="space-between"
                    >
                      <Box
                        flexDirection="row"
                        alignContent="center"
                        alignItems="center"
                      >
                        <Icon
                          size={20}
                          icon="zi-more-grid"
                          style={{ color: "rgba(118, 122, 127, 1)" }}
                        ></Icon>
                        <Text
                          style={{
                            paddingLeft: "6px",
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          {ticket.ticket_no}
                        </Text>
                      </Box>
                      <Text
                        style={{
                          color: "rgba(118, 122, 127, 1)",
                        }}
                      >
                        {formatCreatedTime(ticket.createdtime)}
                      </Text>
                    </Box>

                    <Box
                      flexDirection="row"
                      alignContent="center"
                      justifyContent="space-between"
                    >
                      <Box mt={1} flexDirection="row" alignContent="center">
                        <Icon
                          size={20}
                          style={{ color: "rgba(118, 122, 127, 1)" }}
                          icon="zi-star"
                        />
                        <Text
                          style={{
                            paddingLeft: "6px",
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          {ticket.helpdesk_rating || 0}
                        </Text>
                      </Box>
                      <Box
                        className="status"
                        mt={1}
                        flexDirection="row"
                        alignContent="center"
                        justifyContent="center"
                        style={{
                          backgroundColor: statusColors[ticket.status],
                          display: "inline-block",
                          minWidth: "20%",
                          height: "25px",
                          paddingLeft: "16px",
                          paddingRight: "16px",
                          textAlign: "center",
                          borderRadius: "16px",
                        }}
                      >
                        <Text
                          style={{
                            color: statusTextColors[ticket.status],
                            fontSize: resFont(14),
                            lineHeight: "25px",
                          }}
                        >
                          {translationStatus[ticket.status]}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                  <Box className="list-container" height={4}></Box>
                </Box>
              ))
            )}

            {isLoading && !allTicketsLoaded && (
              <Box className="center-spinner">
                <Spinner />
              </Box>
            )}
            <Box height={100}></Box>
          </Tabs.Tab>
          <Tabs.Tab
            key="tab5"
            label={
              <Box
                flexDirection="row"
                alignContent="center"
                justifyContent="center"
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: currentTab === "tab5" ? 500 : 400,
                    color:
                      currentTab === "tab5"
                        ? "rgba(18, 144, 255, 1)"
                        : "rgba(118, 122, 127, 1)",
                  }}
                >
                  {currentTab === "tab5" ? `Hoàn thành` : "Hoàn thành"}
                </Text>
                <Box
                  ml={2}
                  className="length-ticket"
                  style={{
                    width: "25px",
                    background:
                      currentTab === "tab5"
                        ? "rgba(220, 31, 24, 1)"
                        : "rgba(233, 235, 237, 1)",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color:
                        currentTab === "tab5"
                          ? "white"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {totalClosedTickets > 99 ? "99+" : totalClosedTickets}
                  </Text>
                </Box>
              </Box>
            }
            style={{ flex: 1 }}
          >
            {closedTickets.length === 0 ? (
              <Box m={4} style={{ textAlign: "center" }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
                  alt="iconticket"
                  style={{
                    height: "80px",
                    width: "80px",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
                <Text bold style={{ textAlign: "center", paddingTop: "10px" }}>
                  Không tìm thấy ticket nào
                </Text>
              </Box>
            ) : loadingFilter ? (
              <Box className="center-spinner">
                <Spinner />
              </Box>
            ) : (
              closedTickets.slice(0, visibleTicketsCount).map((ticket) => (
                <Box key={ticket.ticketid}>
                  <Box
                    style={{
                      position: "relative",
                    }}
                  >
                    {ticket.starred === "1" ? (
                      <div
                        style={{
                          color: "rgba(220, 31, 24, 1)",
                          cursor: "pointer",
                          position: "absolute",
                          top: 10,
                          right: 12,
                        }}
                        onClick={() => {
                          unfollowTicket(ticket.ticketid);
                          const updatedTicket = { ...ticket, starred: "0" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon size={20} icon="zi-heart-solid">
                          {ticket.starred}
                        </Icon>
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "rgba(118, 122, 127, 1)",
                          cursor: "pointer",
                          position: "absolute",
                          top: 10,
                          right: 12,
                        }}
                        onClick={() => {
                          followTicket(ticket.ticketid);
                          const updatedTicket = { ...ticket, starred: "1" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon size={20} icon="zi-heart">
                          {ticket.starred}
                        </Icon>
                      </div>
                    )}
                  </Box>
                  <Box
                    className="title-detail-container"
                    key={ticket.ticketid}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigate(`/detail_ticket/${ticket.ticketid}`, {
                        state: { ...ticket, images: selectedImages },
                      });
                    }}
                  >
                    <Text
                      style={{
                        width: "95%",
                        color: "rgba(20, 20, 21, 1)",
                        fontWeight: 500,
                        whiteSpace: "normal", // Đặt về "normal" để cho phép ngắt dòng tự động
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2, // Hiển thị tối đa 2 dòng
                        overflow: "hidden",
                      }}
                    >
                      [{translationStatus[ticket.category]}] {ticket.title}
                    </Text>

                    <Box
                      mt={1}
                      flexDirection="row"
                      alignContent="center"
                      justifyContent="space-between"
                    >
                      <Box
                        flexDirection="row"
                        alignContent="center"
                        alignItems="center"
                      >
                        <Icon
                          size={20}
                          icon="zi-more-grid"
                          style={{ color: "rgba(118, 122, 127, 1)" }}
                        ></Icon>
                        <Text
                          style={{
                            paddingLeft: "6px",
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          {ticket.ticket_no}
                        </Text>
                      </Box>
                      <Text
                        style={{
                          color: "rgba(118, 122, 127, 1)",
                        }}
                      >
                        {formatCreatedTime(ticket.createdtime)}
                      </Text>
                    </Box>

                    <Box
                      flexDirection="row"
                      alignContent="center"
                      justifyContent="space-between"
                    >
                      <Box mt={1} flexDirection="row" alignContent="center">
                        <Icon
                          size={20}
                          style={{ color: "rgba(118, 122, 127, 1)" }}
                          icon="zi-star"
                        />
                        <Text
                          style={{
                            paddingLeft: "6px",
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          {ticket.helpdesk_rating || 0}
                        </Text>
                      </Box>
                      <Box
                        className="status"
                        mt={1}
                        flexDirection="row"
                        alignContent="center"
                        justifyContent="center"
                        style={{
                          backgroundColor: statusColors[ticket.status],
                          display: "inline-block",
                          minWidth: "20%",
                          height: "25px",
                          paddingLeft: "16px",
                          paddingRight: "16px",
                          textAlign: "center",
                          borderRadius: "16px",
                        }}
                      >
                        <Text
                          style={{
                            color: statusTextColors[ticket.status],
                            fontSize: resFont(14),
                            lineHeight: "25px",
                          }}
                        >
                          {translationStatus[ticket.status]}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                  <Box className="list-container" height={4}></Box>
                </Box>
              ))
            )}

            {isLoading && !allTicketsLoaded && (
              <Box className="center-spinner">
                <Spinner />
              </Box>
            )}
            <Box height={100}></Box>
          </Tabs.Tab>
          <Tabs.Tab
            key="tab6"
            label={
              <Box
                flexDirection="row"
                alignContent="center"
                justifyContent="center"
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: currentTab === "tab6" ? 500 : 400,
                    color:
                      currentTab === "tab6"
                        ? "rgba(18, 144, 255, 1)"
                        : "rgba(118, 122, 127, 1)",
                  }}
                >
                  {currentTab === "tab6" ? `Hủy` : "Hủy"}
                </Text>
                <Box
                  ml={2}
                  className="length-ticket"
                  style={{
                    width: "25px",
                    background:
                      currentTab === "tab6"
                        ? "rgba(220, 31, 24, 1)"
                        : "rgba(233, 235, 237, 1)",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color:
                        currentTab === "tab6"
                          ? "white"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {totalCancelTickets > 99 ? "99+" : totalCancelTickets}
                  </Text>
                </Box>
              </Box>
            }
            style={{ flex: 1 }}
          >
            {cancelTickets.length === 0 ? (
              <Box m={4} style={{ textAlign: "center" }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
                  alt="iconticket"
                  style={{
                    height: "80px",
                    width: "80px",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
                <Text bold style={{ textAlign: "center", paddingTop: "10px" }}>
                  Không tìm thấy ticket nào
                </Text>
              </Box>
            ) : loadingFilter ? (
              <Box className="center-spinner">
                <Spinner />
              </Box>
            ) : (
              cancelTickets.slice(0, visibleTicketsCount).map((ticket) => (
                <Box key={ticket.ticketid}>
                  <Box
                    style={{
                      position: "relative",
                    }}
                  >
                    {ticket.starred === "1" ? (
                      <div
                        style={{
                          color: "rgba(220, 31, 24, 1)",
                          cursor: "pointer",
                          position: "absolute",
                          top: 10,
                          right: 12,
                        }}
                        onClick={() => {
                          unfollowTicket(ticket.ticketid);
                          const updatedTicket = { ...ticket, starred: "0" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon size={20} icon="zi-heart-solid">
                          {ticket.starred}
                        </Icon>
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "rgba(118, 122, 127, 1)",
                          cursor: "pointer",
                          position: "absolute",
                          top: 10,
                          right: 12,
                        }}
                        onClick={() => {
                          followTicket(ticket.ticketid);
                          const updatedTicket = { ...ticket, starred: "1" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon size={20} icon="zi-heart">
                          {ticket.starred}
                        </Icon>
                      </div>
                    )}
                  </Box>
                  <Box
                    className="title-detail-container"
                    key={ticket.ticketid}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigate(`/detail_ticket/${ticket.ticketid}`, {
                        state: { ...ticket, images: selectedImages },
                      });
                    }}
                  >
                    <Text
                      style={{
                        width: "95%",
                        color: "rgba(20, 20, 21, 1)",
                        fontWeight: 500,
                        whiteSpace: "normal", // Đặt về "normal" để cho phép ngắt dòng tự động
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2, // Hiển thị tối đa 2 dòng
                        overflow: "hidden",
                      }}
                    >
                      [{translationStatus[ticket.category]}] {ticket.title}
                    </Text>

                    <Box
                      mt={1}
                      flexDirection="row"
                      alignContent="center"
                      justifyContent="space-between"
                    >
                      <Box
                        flexDirection="row"
                        alignContent="center"
                        alignItems="center"
                      >
                        <Icon
                          size={20}
                          icon="zi-more-grid"
                          style={{ color: "rgba(118, 122, 127, 1)" }}
                        ></Icon>
                        <Text
                          style={{
                            paddingLeft: "6px",
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          {ticket.ticket_no}
                        </Text>
                      </Box>
                      <Text
                        style={{
                          color: "rgba(118, 122, 127, 1)",
                        }}
                      >
                        {formatCreatedTime(ticket.createdtime)}
                      </Text>
                    </Box>

                    <Box
                      flexDirection="row"
                      alignContent="center"
                      justifyContent="space-between"
                    >
                      <Box mt={1} flexDirection="row" alignContent="center">
                        <Icon
                          size={20}
                          style={{ color: "rgba(118, 122, 127, 1)" }}
                          icon="zi-star"
                        />
                        <Text
                          style={{
                            paddingLeft: "6px",
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          {ticket.helpdesk_rating || 0}
                        </Text>
                      </Box>
                      <Box
                        className="status"
                        mt={1}
                        flexDirection="row"
                        alignContent="center"
                        justifyContent="center"
                        style={{
                          backgroundColor: statusColors[ticket.status],
                          display: "inline-block",
                          minWidth: "20%",
                          height: "25px",
                          paddingLeft: "16px",
                          paddingRight: "16px",
                          textAlign: "center",
                          borderRadius: "16px",
                        }}
                      >
                        <Text
                          style={{
                            color: statusTextColors[ticket.status],
                            fontSize: resFont(14),
                            lineHeight: "25px",
                          }}
                        >
                          {translationStatus[ticket.status]}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                  <Box className="list-container" height={4}></Box>
                </Box>
              ))
            )}

            {isLoading && !allTicketsLoaded && (
              <Box className="center-spinner">
                <Spinner />
              </Box>
            )}

            <Box height={100}></Box>
          </Tabs.Tab>
        </Tabs>
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
              fontSize: resFont(24),
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

        <Modal visible={followOAModal}>
          <img
            style={{
              width: "100px",
              height: "100px",
              display: "block",
              margin: "0 auto",
            }}
            src="./assets-src/CloudGO-symbol 3.png"
          />

          <Text
            style={{
              fontWeight: 500,
              fontSize: resFont(24),
              textAlign: "center",
              paddingTop: "24px",
              paddingBottom: "16px",
            }}
          >
            Quan tâm CloudGO
          </Text>
          <Text
            style={{
              fontWeight: 500,
              fontSize: resFont(14),
              color: "rgba(118, 122, 127, 1)",
              paddingBottom: "32px",
              textAlign: "center",
            }}
          >
            Hãy quan tâm My CloudGO để được cập nhật nhiều thông tin hơn nhé
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
                width: "50%",
                borderRadius: "8px",
                border: "1px rgba(0, 106, 245, 1) solid ",
              }}
              size="medium"
              onClick={() => {
                setFollowOAModal(false);
              }}
            >
              Bỏ qua
            </Button>
            <Box width={5} height={1}></Box>
            <Button
              style={{
                padding: "8px",
                width: "50%",
                borderRadius: "8px",
              }}
              size="medium"
              onClick={() => {
                setFollowOAModal(false);
                // follow();
              }}
            >
              Cho phép
            </Button>
          </Box>
        </Modal>
      </Page>
    </PullToRefresh>
  );
};

export default HomePage;

const statusColors = {
  Open: "rgba(235, 244, 255, 1)",
  Closed: "rgba(230, 250, 237, 1)",
  "Wait For Verifying": "rgba(235, 244, 255, 1)",
  "Wait For Response": "rgba(235, 244, 255, 1)",
  "Customer Confirmed": "rgba(235, 244, 255, 1)",
  Pending: "rgba(244, 245, 246, 1)",
  Testing: "rgba(230, 250, 237, 1)",
  "In Progress": "rgba(239, 234, 251, 1)",
  Assigned: "rgba(235, 244, 255, 1)",
  Reopen: "rgba(244,245,246, 1)",
  "Wait Close": "rgba(230, 250, 237, 1)",
  Cancel: "rgba(244, 245, 246, 1)",
  "Sent Confirm Email": "rgba(230, 250, 237, 1)",
  Reject: "rgba(244, 245, 246, 1)",
};

const statusTextColors = {
  Open: "rgba(0, 106, 245, 1)",
  Closed: "rgba(52, 183, 100, 1)",
  "In Progress": "rgba(106, 64, 191, 1)",
  "Wait For Verifying": "rgba(0, 106, 245, 1)",
  "Wait For Response": "rgba(0, 106, 245, 1)",
  Pending: "rgba(118, 122, 127, 1)",
  Testing: "rgba(52, 183, 100, 1)",
  "Customer Confirmed": "rgba(0, 106, 245, 1)",
  Assigned: "rgba(106, 64, 191, 1)",
  Reopen: "rgba(118, 122, 127, 1)",
  "Wait Close": "rgba(52, 183, 100, 1)",
  Cancel: "rgba(118, 122, 127, 1)",
  "Sent Confirm Email": "rgba(52, 183, 100, 1)",
  Reject: "rgba(118, 122, 127, 1)",
};

const translationStatus = {
  Open: "Mới",
  Closed: "Đã đóng",
  "Wait For Verifying": "Chờ xác minh",
  "Wait For Response": "Chờ phản hồi",
  Testing: "Testing",
  Pending: "Tạm hoãn",
  "In Progress": "Đang tiến hành",
  Assigned: "Đã phân công",
  Reopen: "Mở lại",
  "Wait Close": "Đã xong, chờ đóng",
  Cancel: "Hủy",
  "Customer Confirmed": "KH đã xác nhận",
  "Sent Confirm Email": " Đã gửi email xác nhận",
  Reject: "Từ chối",
  Feedback: "Góp ý",
  Bug: "Báo lỗi",
};
